// Visual palette per score level (labels/taglines come from the server).
export const LEVEL_COLORS = {
  green: { hex: "#3ddc84", glow: "rgba(61,220,132,0.45)" },
  blue: { hex: "#4cc3ff", glow: "rgba(76,195,255,0.45)" },
  yellow: { hex: "#ffd23f", glow: "rgba(255,210,63,0.45)" },
  orange: { hex: "#ff8a1f", glow: "rgba(255,138,31,0.5)" },
  red: { hex: "#ff3b30", glow: "rgba(255,59,48,0.55)" },
};

export const colorFor = (level) => LEVEL_COLORS[level?.color] ?? LEVEL_COLORS.orange;
