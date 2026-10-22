import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import ShareCard, { SITE_URL } from "./ShareCard.jsx";

async function renderCard(node) {
  await document.fonts?.ready;
  const opts = { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true, backgroundColor: "#0c0907" };
  // First pass warms up font/image embedding (notably flaky on mobile WebKit); second pass is the keeper.
  await toBlob(node, opts).catch(() => null);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error("empty image");
  return blob;
}

export default function ShareSection({ result }) {
  const cardRef = useRef(null);
  const blobRef = useRef(null);
  const [status, setStatus] = useState("preparing"); // preparing | ready | error
  const [msg, setMsg] = useState("");
  const [canShareFiles, setCanShareFiles] = useState(false);

  // Pre-render the PNG once so the Share tap stays within the browser's user-activation window.
  useEffect(() => {
    let alive = true;
    setStatus("preparing");
    const t = setTimeout(async () => {
      try {
        const blob = await renderCard(cardRef.current);
        if (!alive) return;
        blobRef.current = blob;
        const file = new File([blob], "cooked-report.png", { type: "image/png" });
        setCanShareFiles(Boolean(navigator.canShare?.({ files: [file] })));
        setStatus("ready");
      } catch {
        if (alive) setStatus("error");
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [result]);

  async function getBlob() {
    if (blobRef.current) return blobRef.current;
    blobRef.current = await renderCard(cardRef.current);
    return blobRef.current;
  }

  async function download() {
    setMsg("");
    try {
      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placement-cooked-${result.score}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setMsg("Saved! Now go post it on your story 📸");
    } catch {
      setMsg("Couldn't bake the image. Screenshot this page instead 🙏");
    }
  }

  async function share() {
    setMsg("");
    try {
      const blob = await getBlob();
      const file = new File([blob], "cooked-report.png", { type: "image/png" });
      await navigator.share({ files: [file], title: "Placement Cooked Meter", text: `${result.shareLine} ${SITE_URL}` });
    } catch (e) {
      if (e?.name !== "AbortError") setMsg("Sharing failed. Download the card and post it manually.");
    }
  }

  return (
    <section className="rise rounded-3xl border border-ash bg-soot/80 p-5" style={{ animationDelay: "450ms" }}>
      <h2 className="font-display text-lg tracking-wide">Flex (or confess) on your story</h2>
      <p className="mt-1 text-sm text-smoke">“{result.shareLine}”</p>
      <div className={`mt-4 grid gap-2 ${canShareFiles ? "grid-cols-2" : "grid-cols-1"}`}>
        <button
          type="button"
          onClick={download}
          disabled={status === "preparing"}
          className="rounded-2xl bg-cream px-4 py-3.5 font-semibold text-char transition active:scale-[0.98] disabled:opacity-60"
        >
          {status === "preparing" ? "Plating card…" : "⬇️ Download card"}
        </button>
        {canShareFiles && (
          <button
            type="button"
            onClick={share}
            className="rounded-2xl bg-gradient-to-b from-flame to-ember px-4 py-3.5 font-semibold text-char transition active:scale-[0.98]"
          >
            📤 Share
          </button>
        )}
      </div>
      {(msg || status === "error") && <p className="mt-3 text-center text-sm text-smoke">{msg || "Card preview failed; Download will retry."}</p>}

      {/* Off-screen wrapper: the card itself stays unpositioned so html-to-image captures it correctly. */}
      <div aria-hidden="true" style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
        <ShareCard ref={cardRef} score={result.score} level={result.level} shareLine={result.shareLine} />
      </div>
    </section>
  );
}
