export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="rise mt-4 flex items-start gap-3 rounded-2xl border border-chili/40 bg-chili/10 px-4 py-3 text-sm text-cream">
      <span className="text-xl leading-none">🧯</span>
      <p className="leading-snug">{message}</p>
    </div>
  );
}
