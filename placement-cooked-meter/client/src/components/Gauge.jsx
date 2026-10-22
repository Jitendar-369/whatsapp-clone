import { useEffect, useState } from "react";
import { colorFor } from "../levels.js";

const R = 88;
const C = 2 * Math.PI * R;

export default function Gauge({ score, level }) {
  const [shown, setShown] = useState(0);
  const { hex, glow } = colorFor(level);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setShown(score);
    let raf;
    const start = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative mx-auto aspect-square w-64 sm:w-72" role="img" aria-label={`Cooked score ${score} out of 100: ${level.label}`}>
      <div className="absolute inset-6 rounded-full blur-2xl" style={{ background: glow }} />
      <svg viewBox="0 0 200 200" className="relative h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={R} fill="none" stroke="#2a201a" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke={hex}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - shown / 100)}
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-7xl leading-none tabular-nums" style={{ color: hex }}>
          {shown}
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-smoke">% cooked</span>
      </div>
    </div>
  );
}
