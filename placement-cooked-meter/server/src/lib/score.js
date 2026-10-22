// Deterministic scoring. The AI only extracts facts; this file decides the score.
// Higher score = more cooked.

const BASE = 10;
const MIN = 3;
const MAX = 98;

export const LEVELS = [
  { max: 20, label: "UNC COOKED", color: "green", tagline: "Bro is the danger." },
  { max: 40, label: "Slightly Toasted", color: "blue", tagline: "A little crispy, still edible." },
  { max: 60, label: "Medium Rare", color: "yellow", tagline: "Placement officer is watching." },
  { max: 80, label: "Well Done", color: "orange", tagline: "Start praying. Then start building." },
  { max: 100, label: "BURNT", color: "red", tagline: "Campus placements are approaching." },
];

export function levelFor(score) {
  return LEVELS.find((l) => score <= l.max) ?? LEVELS[LEVELS.length - 1];
}

/**
 * @param {object} facts extracted resume facts
 * @param {{hasGithub:boolean, hasLinkedin:boolean, hasPortfolio:boolean}} links
 */
export function scoreResume(facts, links = {}) {
  const reasons = [];
  const add = (points, reason) => reasons.push({ points, reason });

  const internships = Number.isInteger(facts.internships) ? facts.internships : 0;
  if (internships === 0) add(20, "No internships yet");
  else if (internships === 1) add(6, "Only one internship");

  const projects = Array.isArray(facts.projects) ? facts.projects : [];
  const solid = projects.filter((p) => !p.isBasic).length;
  if (projects.length === 0) add(25, "No projects listed");
  else if (solid === 0) add(18, "Every project is a tutorial classic (calculator/to-do/clone tier)");
  else if (solid === 1) add(8, "Only one project that isn't a tutorial classic");

  const cgpa = typeof facts.cgpa === "number" && Number.isFinite(facts.cgpa) ? facts.cgpa : null;
  if (cgpa === null) add(4, "No CGPA mentioned");
  else if (cgpa < 6) add(15, `CGPA ${cgpa} is below 6`);
  else if (cgpa < 7) add(10, `CGPA ${cgpa} is below 7`);
  else if (cgpa < 8) add(4, `CGPA ${cgpa} is below 8`);

  const skills = Array.isArray(facts.skills) ? facts.skills : [];
  if (skills.length < 4) add(8, `Only ${skills.length} skill${skills.length === 1 ? "" : "s"} listed`);
  if (!facts.hasDsa) add(6, "No DSA / competitive programming signal");

  if (!links.hasGithub && !links.hasPortfolio) add(8, "No GitHub or portfolio link");
  const achievements = Array.isArray(facts.achievements) ? facts.achievements : [];
  if (achievements.length === 0) add(8, "No hackathons, awards or certs");

  const raw = BASE + reasons.reduce((s, r) => s + r.points, 0);
  const score = Math.min(MAX, Math.max(MIN, raw));
  return { score, level: levelFor(score), reasons };
}
