import { forwardRef } from "react";
import { colorFor } from "../levels.js";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.host).replace(/^https?:\/\//, "");

// Fixed 1080×1920 (9:16) Instagram-story canvas. Rendered off-screen and captured with html-to-image.
const ShareCard = forwardRef(function ShareCard({ score, level, shareLine }, ref) {
  const { hex, glow } = colorFor(level);
  const R = 300;
  const C = 2 * Math.PI * R;
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1920,
        background: `radial-gradient(90% 55% at 50% 105%, rgba(255,90,20,0.55), transparent 65%), radial-gradient(70% 40% at 50% 38%, ${glow}, transparent 70%), #0c0907`,
        color: "#fff4e6",
        fontFamily: '"Space Grotesk Variable", system-ui, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "140px 90px 110px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 34, letterSpacing: "0.35em", color: "#ffb31a", fontWeight: 700 }}>🔥 PLACEMENT COOKED REPORT 🔥</div>
      <div style={{ position: "relative", width: 700, height: 700, marginTop: 80 }}>
        <svg width="700" height="700" viewBox="0 0 700 700" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="350" cy="350" r={R} fill="none" stroke="#2a201a" strokeWidth="44" />
          <circle cx="350" cy="350" r={R} fill="none" stroke={hex} strokeWidth="44" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: '"Bowlby One", Impact, sans-serif', fontSize: 260, lineHeight: 1, color: hex }}>{score}</div>
          <div style={{ fontSize: 40, letterSpacing: "0.3em", color: "#a8998c", fontWeight: 700, marginTop: 10 }}>% COOKED</div>
        </div>
      </div>
      <div style={{ fontFamily: '"Bowlby One", Impact, sans-serif', fontSize: 104, color: hex, marginTop: 50, textAlign: "center", lineHeight: 1.05 }}>{level.label}</div>
      <div style={{ fontSize: 40, color: "#a8998c", marginTop: 20, textAlign: "center" }}>{level.tagline}</div>
      <div
        style={{
          marginTop: 70,
          padding: "44px 56px",
          borderRadius: 48,
          background: "rgba(255,106,26,0.12)",
          border: "3px solid rgba(255,106,26,0.45)",
          fontSize: 54,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        “{shareLine}”
      </div>
      <div style={{ marginTop: "auto", textAlign: "center" }}>
        <div style={{ fontSize: 38, color: "#a8998c" }}>How cooked are you?</div>
        <div style={{ fontFamily: '"Bowlby One", Impact, sans-serif', fontSize: 52, color: "#ffb31a", marginTop: 12 }}>{SITE_URL}</div>
      </div>
    </div>
  );
});

export default ShareCard;
