export const extractionSchema = {
  type: "object",
  properties: {
    looksLikeResume: { type: "boolean" },
    cgpa: { type: ["number", "null"], description: "On a 10-point scale. Convert percentage by dividing by 9.5. null if absent." },
    skills: { type: "array", items: { type: "string" } },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, isBasic: { type: "boolean" } },
        required: ["name", "isBasic"],
      },
    },
    internships: { type: "integer", minimum: 0 },
    achievements: { type: "array", items: { type: "string" } },
    hasDsa: { type: "boolean" },
  },
  required: ["looksLikeResume", "cgpa", "skills", "projects", "internships", "achievements", "hasDsa"],
};

export const roastSchema = {
  type: "object",
  properties: {
    roast: { type: "string", description: "2-3 punchy lines" },
    shareLine: { type: "string", maxLength: 90 },
    strengths: { type: "array", items: { type: "string" }, maxItems: 3 },
    weaknesses: { type: "array", items: { type: "string" }, maxItems: 3 },
    actionPlan: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: { week: { type: "integer" }, task: { type: "string" } },
        required: ["week", "task"],
      },
    },
  },
  required: ["roast", "shareLine", "strengths", "weaknesses", "actionPlan"],
};

// Validate/normalise model output so a slightly-off response doesn't leak into scoring.
export function normalizeFacts(f) {
  if (!f || typeof f !== "object" || typeof f.looksLikeResume !== "boolean") throw new Error("bad extraction");
  const strs = (a) => (Array.isArray(a) ? a.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim()) : []);
  let cgpa = typeof f.cgpa === "number" && Number.isFinite(f.cgpa) ? f.cgpa : null;
  if (cgpa !== null && cgpa > 10 && cgpa <= 100) cgpa = cgpa / 9.5;
  if (cgpa !== null && (cgpa < 0 || cgpa > 10)) cgpa = null;
  if (cgpa !== null) cgpa = Math.round(cgpa * 100) / 100;
  return {
    looksLikeResume: f.looksLikeResume,
    cgpa,
    skills: strs(f.skills),
    projects: (Array.isArray(f.projects) ? f.projects : [])
      .filter((p) => p && typeof p.name === "string" && p.name.trim())
      .map((p) => ({ name: p.name.trim(), isBasic: Boolean(p.isBasic) })),
    internships: Number.isInteger(f.internships) && f.internships >= 0 ? f.internships : 0,
    achievements: strs(f.achievements),
    hasDsa: Boolean(f.hasDsa),
  };
}

export function normalizeRoast(r) {
  if (!r || typeof r.roast !== "string" || typeof r.shareLine !== "string") throw new Error("bad roast");
  const strs = (a) => (Array.isArray(a) ? a.filter((s) => typeof s === "string").slice(0, 3) : []);
  const plan = Array.isArray(r.actionPlan) ? r.actionPlan.filter((s) => s && typeof s.task === "string") : [];
  if (plan.length < 4) throw new Error("bad action plan");
  let shareLine = r.shareLine.trim();
  if (shareLine.length > 90) shareLine = shareLine.slice(0, 87).trimEnd() + "…";
  return {
    roast: r.roast.trim(),
    shareLine,
    strengths: strs(r.strengths),
    weaknesses: strs(r.weaknesses),
    actionPlan: plan.slice(0, 4).map((s, i) => ({ week: i + 1, task: s.task.trim() })),
  };
}
