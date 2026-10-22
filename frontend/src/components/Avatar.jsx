const COLORS = ['#00a884', '#53bdeb', '#ff7d6b', '#a77bf3', '#f7b500', '#25d366', '#e26ab6', '#4e8cff'];

const colorFor = (text) => {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
};

export default function Avatar({ name = '?', size = 40, group = false, online = false }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4, background: colorFor(name) }}
      aria-hidden="true"
    >
      {group ? (
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ) : (
        initials || '?'
      )}
      {online && <span className="avatar-online" />}
    </div>
  );
}
