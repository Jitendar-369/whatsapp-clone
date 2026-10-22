import { useEffect, useState } from "react";
import { roastResume, getStats } from "./api.js";
import Hero from "./components/Hero.jsx";
import Loading from "./components/Loading.jsx";
import Results from "./components/Results.jsx";
import Embers from "./components/Embers.jsx";

export default function App() {
  const [stage, setStage] = useState("input"); // input | loading | results
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [totalRoasts, setTotalRoasts] = useState(0);

  useEffect(() => {
    getStats()
      .then((s) => setTotalRoasts(s.totalRoasts ?? 0))
      .catch(() => {});
  }, [result]);

  async function cook(input) {
    setError("");
    setStage("loading");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const data = await roastResume(input);
      setResult(data);
      setStage("results");
    } catch (e) {
      setError(e.message);
      setStage("input");
    }
  }

  function reset() {
    setResult(null);
    setError("");
    setStage("input");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <Embers />
      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6">
        {stage === "input" && <Hero onCook={cook} error={error} totalRoasts={totalRoasts} />}
        {stage === "loading" && <Loading />}
        {stage === "results" && result && <Results result={result} onReset={reset} />}
      </main>
      <footer className="relative z-10 pb-8 text-center text-xs text-smoke/70">
        Made with 🔥 for every student staring at a placement drive. Not affiliated with any college.
      </footer>
    </div>
  );
}
