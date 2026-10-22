import { useEffect, useState } from "react";

const MESSAGES = [
  "Preheating the oven…",
  "Checking if your calculator app is still alive…",
  "Counting your to-do apps… 📝",
  "Asking the placement cell about you…",
  "Googling what 'proficient in MS Office' means…",
  "Measuring the heat on your CGPA… 🌡️",
  "Looking for your GitHub. Still looking…",
  "Seasoning the roast with extra masala 🌶️",
  "Comparing you with Sharma ji's son…",
  "Plating your results…",
];

export default function Loading() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="flex min-h-[70dvh] flex-col items-center justify-center text-center" aria-live="polite">
      <div className="relative h-36 w-36">
        <div className="absolute inset-0 rounded-full border-4 border-ash" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-flame border-r-ember"
          style={{ animation: "spin-slow 1s linear infinite" }}
        />
        <div className="absolute inset-0 grid place-items-center text-6xl">
          <span className="flicker">🍳</span>
        </div>
      </div>
      <p key={i} className="rise mt-8 min-h-[3rem] max-w-xs font-display text-lg leading-snug text-cream sm:text-xl">
        {MESSAGES[i]}
      </p>
      <p className="mt-2 text-xs text-smoke">Usually takes 5–15 seconds</p>
    </section>
  );
}
