import { createHash } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { pdfToText, detectLinks, cleanText, MIN_CHARS } from "../lib/text.js";
import { scoreResume } from "../lib/score.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname)
      ? cb(null, true)
      : cb(new HttpError(400, "PDFs only, chief. Or just paste the text 📄")),
});

function uploadResume(req, res, next) {
  if (!req.is("multipart/form-data")) return next();
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE")
      return next(new HttpError(413, "That PDF is thicc. Keep it under 2 MB 🙏"));
    if (err instanceof multer.MulterError) return next(new HttpError(400, "Upload one PDF in the 'resume' field."));
    next(err);
  });
}

export function createRoastRouter({ provider, cache, stats, ratePerHour = 10 }) {
  const router = Router();

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: ratePerHour,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({
        error: "Bro the oven needs to cool down 🥵 You've hit the hourly roast limit. Go build something and come back in an hour.",
      }),
  });

  router.get("/health", (_req, res) => res.json({ ok: true, mock: provider.name === "mock" }));
  router.get("/stats", async (_req, res) => res.json(await stats.get()));

  router.post("/roast", limiter, uploadResume, async (req, res, next) => {
    try {
      // 1. Get text
      let raw = "";
      if (req.file) {
        if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-")
          throw new HttpError(400, "That file isn't a real PDF 🤨");
        try {
          raw = await pdfToText(req.file.buffer);
        } catch {
          throw new HttpError(400, "Couldn't read that PDF. Scanned or locked? Paste the text instead.");
        }
      } else if (typeof req.body?.text === "string") {
        raw = req.body.text;
      }
      if (raw.trim().length < MIN_CHARS)
        throw new HttpError(400, "Not enough text to cook 🫗 Scanned PDF? Paste the text instead.");

      // 2. Detect links before stripping. 3. Strip PII + truncate.
      const links = detectLinks(raw);
      const clean = cleanText(raw);

      // 4. Cache
      const key = createHash("sha256").update(clean).digest("hex");
      const hit = await cache.get(key);
      if (hit) return res.json({ ...hit, cached: true });

      // 5. Extraction
      const facts = await provider.extract(clean);
      if (!facts.looksLikeResume) throw new HttpError(422, "That doesn't look like a resume, bro 💀");

      // 6. Deterministic score
      const { score, level, reasons } = scoreResume(facts, links);

      // 7. Roast from facts only
      const roast = await provider.roast({ facts, links, score, level, reasons });

      const result = { score, level, reasons, ...roast };
      await cache.set(key, result);
      await stats.increment();
      res.json({ ...result, cached: false });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err?.code === "AI_FAILED") {
    console.error("AI failure:", err.cause?.message ?? err.message);
    return res.status(502).json({ error: "The oven exploded. Try again." });
  }
  if (err?.type === "entity.too.large") return res.status(413).json({ error: "That's a novel, not a resume 📚" });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "Malformed JSON body." });
  console.error("Unhandled error:", err?.message);
  res.status(500).json({ error: "Something burned in the kitchen. Try again." });
}
