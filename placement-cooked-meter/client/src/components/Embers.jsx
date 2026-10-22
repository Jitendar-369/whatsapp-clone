const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  duration: `${7 + ((i * 13) % 9)}s`,
  delay: `${-((i * 7) % 11)}s`,
  drift: `${((i % 5) - 2) * 25}px`,
  size: 2 + (i % 3),
}));

export default function Embers() {
  return (
    <div aria-hidden="true">
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={{ left: e.left, animationDuration: e.duration, animationDelay: e.delay, "--drift": e.drift, width: e.size, height: e.size }}
        />
      ))}
    </div>
  );
}
