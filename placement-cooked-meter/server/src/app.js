import express from "express";
import cors from "cors";
import { createRoastRouter, errorHandler } from "./routes/roast.js";
import { createCache } from "./lib/cache.js";
import { createStats } from "./lib/stats.js";

export function createApp({ provider, clientOrigin = "http://localhost:5173", ratePerHour = 10, cache, stats } = {}) {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(cors({ origin: clientOrigin.split(",").map((s) => s.trim()) }));
  app.use(express.json({ limit: "100kb" }));
  app.use(
    "/api",
    createRoastRouter({
      provider,
      cache: cache ?? createCache({ max: 500 }),
      stats: stats ?? createStats(),
      ratePerHour,
    })
  );
  app.use((_req, res) => res.status(404).json({ error: "Nothing cooking here." }));
  app.use(errorHandler);
  return app;
}
