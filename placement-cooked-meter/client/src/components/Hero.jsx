import { useRef, useState } from "react";
import ErrorBanner from "./ErrorBanner.jsx";

const PLACEHOLDER = `B.Tech CSE, 2026 batch — CGPA: 7.2

Skills: C++, Python, React, Node.js, MongoDB

Projects:
- Weather App — fetches weather using an API
- Campus Lost & Found — MERN app with auth, 200 users

Internships: none yet
Achievements: 150 LeetCode problems, SIH internal round`;

const MAX_BYTES = 2 * 1024 * 1024;

export default function Hero({ onCook, error, totalRoasts }) {
  const [tab, setTab] = useState("pdf");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const inputRef = useRef(null);

  function pick(f) {
    setLocalError("");
    if (!f) return;
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) return setLocalError("PDFs only, chief. Or switch to “Paste text” 📄");
    if (f.size > MAX_BYTES) return setLocalError("That PDF is thicc. Keep it under 2 MB 🙏");
    setFile(f);
  }

  const ready = tab === "pdf" ? Boolean(file) : text.trim().length >= 40;

  function submit(e) {
    e.preventDefault();
    if (!ready) {
      setLocalError(tab === "pdf" ? "Drop a PDF first, bro." : "Give me at least a few lines to cook (40+ characters).");
      return;
    }
    onCook(tab === "pdf" ? { file } : { text });
  }

  return (
    <section className="rise">
      <header className="pt-6 text-center sm:pt-12">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-flame">
          Placement season edition
        </p>
        <h1 className="font-display text-[2.6rem] leading-[0.95] tracking-tight sm:text-7xl">
          <span className="block text-cream">Placement</span>
          <span className="fire-text block">Cooked Meter</span>
          <span className="flicker mt-1 text-5xl sm:text-6xl" aria-hidden="true">🔥</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-smoke sm:text-lg">
          Find out how cooked you are <span className="text-cream">before placements cook you.</span>
        </p>
      </header>

      <form onSubmit={submit} className="mx-auto mt-8 max-w-xl rounded-3xl border border-ash bg-soot/80 p-3 shadow-2xl shadow-black/60 backdrop-blur sm:p-4">
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-char p-1">
          {[
            ["pdf", "📄 Upload PDF"],
            ["text", "✍️ Paste text"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setLocalError("");
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${tab === id ? "bg-ash text-cream shadow" : "text-smoke hover:text-cream"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {tab === "pdf" ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                dragging ? "border-flame bg-ember/10" : file ? "border-ember/60 bg-ember/5" : "border-ash hover:border-ember/50"
              }`}
            >
              <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
              {file ? (
                <>
                  <span className="text-4xl">🍳</span>
                  <p className="mt-2 max-w-full truncate font-semibold text-cream">{file.name}</p>
                  <p className="text-xs text-smoke">{(file.size / 1024).toFixed(0)} KB · tap to change</p>
                </>
              ) : (
                <>
                  <span className="text-4xl">📥</span>
                  <p className="mt-2 font-semibold text-cream">Drop your resume PDF here</p>
                  <p className="text-xs text-smoke">or tap to choose · max 2 MB</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={10}
              maxLength={20000}
              className="block min-h-48 w-full resize-y rounded-2xl border border-ash bg-char px-4 py-3 text-[15px] leading-relaxed text-cream placeholder:text-smoke/50 focus:border-ember/60 focus:outline-none"
            />
          )}
        </div>

        <button
          type="submit"
          className="btn-heat mt-4 w-full rounded-2xl bg-gradient-to-b from-flame via-ember to-chili px-6 py-4 font-display text-xl tracking-wide text-char transition active:scale-[0.98] disabled:opacity-60"
        >
          Cook Me 🔥
        </button>
        <p className="mt-3 text-center text-xs text-smoke">🔒 We strip your contact info and don't store your resume.</p>
        <ErrorBanner message={localError || error} />
      </form>

      {totalRoasts > 50 && (
        <p className="mt-6 text-center text-sm text-smoke">
          <span className="font-semibold text-flame">{totalRoasts.toLocaleString("en-IN")}</span> resumes cooked so far
        </p>
      )}

      <div className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-2 text-center text-xs text-smoke">
        {[
          ["🎯", "Cooked Score", "0–100, transparent rules"],
          ["🌶️", "Honest roast", "savage but kind"],
          ["🗓️", "4-week plan", "to get uncooked"],
        ].map(([icon, title, sub]) => (
          <div key={title} className="rounded-2xl border border-ash/70 bg-soot/50 px-2 py-3">
            <div className="text-xl">{icon}</div>
            <div className="mt-1 font-semibold text-cream">{title}</div>
            <div className="text-[11px] leading-tight">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
