import Gauge from "./Gauge.jsx";
import ShareSection from "./ShareSection.jsx";
import { colorFor } from "../levels.js";

function Card({ title, children, className = "", delay = 0 }) {
  return (
    <section className={`rise rounded-3xl border border-ash bg-soot/80 p-5 backdrop-blur ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {title && <h2 className="mb-3 font-display text-lg tracking-wide text-cream">{title}</h2>}
      {children}
    </section>
  );
}

export default function Results({ result, onReset }) {
  const { score, level, reasons, roast, strengths, weaknesses, actionPlan, cached } = result;
  const { hex } = colorFor(level);

  return (
    <div className="space-y-4 pt-4">
      <div className="rise text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-smoke">Your placement cooked report</p>
        <div className="mt-4">
          <Gauge score={score} level={level} />
        </div>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl" style={{ color: hex }}>
          {level.label}
        </h1>
        <p className="mt-1 text-smoke">{level.tagline}</p>
        {cached && <p className="mt-2 text-[11px] text-smoke/70">♻️ Same resume, same score. Served from the warmer.</p>}
      </div>

      <Card delay={150} className="relative overflow-hidden border-ember/40 bg-gradient-to-br from-ember/15 via-soot/90 to-soot">
        <span className="absolute -right-2 -top-4 text-7xl opacity-15" aria-hidden="true">🌶️</span>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-flame">The roast</p>
        <p className="relative whitespace-pre-line text-lg font-medium leading-relaxed text-cream sm:text-xl">{roast}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="What's actually good" delay={250}>
          <ul className="space-y-2">
            {strengths.length ? (
              strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-[15px] leading-snug">
                  <span>✅</span>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-smoke">The oven is still searching. Build something and come back 👀</li>
            )}
          </ul>
        </Card>
        <Card title="What's burning" delay={300}>
          <ul className="space-y-2">
            {weaknesses.map((s, i) => (
              <li key={i} className="flex gap-2 text-[15px] leading-snug">
                <span>❌</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Why this score" delay={350}>
        <p className="mb-3 text-xs text-smoke">Fixed rules, not vibes. Everyone starts at 10, then:</p>
        {reasons.length ? (
          <ul className="divide-y divide-ash">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2 text-[15px]">
                <span>{r.reason}</span>
                <span className="shrink-0 rounded-full bg-chili/15 px-2.5 py-0.5 font-mono text-sm font-bold text-chili">+{r.points}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px]">Nothing added. You're basically raw. 🥶</p>
        )}
      </Card>

      <Card title="🗓️ 4-week survival guide" delay={400}>
        <ol className="relative ml-3 border-l-2 border-dashed border-ember/40">
          {actionPlan.map((step) => (
            <li key={step.week} className="relative pb-5 pl-6 last:pb-0">
              <span className="absolute -left-[13px] top-0 grid h-6 w-6 place-items-center rounded-full bg-ember font-display text-xs text-char">
                {step.week}
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-flame">Week {step.week}</p>
              <p className="mt-0.5 text-[15px] leading-snug">{step.task}</p>
            </li>
          ))}
        </ol>
      </Card>

      <ShareSection result={result} />

      <button
        type="button"
        onClick={onReset}
        className="rise w-full rounded-2xl border border-ash bg-soot px-6 py-4 font-display text-lg tracking-wide text-cream transition hover:border-ember/50 active:scale-[0.98]"
        style={{ animationDelay: "500ms" }}
      >
        Roast another 🔁
      </button>
    </div>
  );
}
