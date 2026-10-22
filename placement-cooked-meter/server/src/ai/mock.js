// Offline stand-in for Gemini: regex extraction + template roast, same interface as gemini.js.
import { normalizeFacts, normalizeRoast } from "./schemas.js";

const SKILLS = [
  "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift", "SQL", "HTML", "CSS",
  "React", "Next.js", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot",
  "MongoDB", "MySQL", "PostgreSQL", "Redis", "Firebase", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git",
  "Linux", "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "Machine Learning", "Deep Learning",
  "NLP", "OpenCV", "Tailwind", "Bootstrap", "Flutter", "React Native", "Android", "GraphQL", "REST",
];
const HEADINGS = /^(education|skills|technical skills|projects|experience|work experience|internships?|achievements|awards|certifications|extracurriculars?|summary|objective|profiles?|links|contact)\b\s*:?/i;
const BASIC = /calculator|to-?\s?do|weather|tic[\s-]?tac[\s-]?toe|clone|static|landing page|portfolio (site|website)|rock[\s-]?paper|stopwatch|digital clock/i;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function section(lines, name) {
  const start = lines.findIndex((l) => new RegExp(`^${name}\\b`, "i").test(l.trim()));
  if (start === -1) return [];
  const first = lines[start].trim().replace(new RegExp(`^${name}\\w*\\s*:?\\s*`, "i"), "");
  const out = first ? [first] : [];
  for (let i = start + 1; i < lines.length && !HEADINGS.test(lines[i].trim()); i++) out.push(lines[i]);
  return out.map((l) => l.replace(/^[\s•\-*–·]+/, "").trim()).filter(Boolean);
}

export function mockExtract(text) {
  const lines = text.split("\n");
  const sectionWords = (text.match(/\b(education|skills|projects?|experience|internships?|cgpa|b\.?\s?tech|b\.?e\.?|university|college|achievements|certifications?)\b/gi) ?? []).map((w) => w.toLowerCase());
  const looksLikeResume = new Set(sectionWords).size >= 2;

  let cgpa = null;
  const g = text.match(/\b(?:c?gpa|sgpa)\b\s*[:\-–]?\s*(\d{1,2}(?:\.\d{1,2})?)/i) ?? text.match(/(\d\.\d{1,2})\s*(?:\/\s*10|cgpa)/i);
  if (g) cgpa = parseFloat(g[1]);
  else {
    const p = text.match(/(\d{2}(?:\.\d+)?)\s*%/);
    if (p) cgpa = parseFloat(p[1]) / 9.5;
  }

  const skills = SKILLS.filter((s) => new RegExp(`(^|[^\\w+#.])${esc(s)}(?![\\w+#])`, "i").test(text));

  let projectLines = section(lines, "projects?");
  if (projectLines.length === 1) projectLines = projectLines[0].split(/,|;/);
  const projects = projectLines
    .map((l) => l.split(/\s[|:–—-]\s|:\s/)[0].trim())
    .filter((n) => n && n.length <= 80 && !/^(built|made|developed|used|tech)/i.test(n))
    .map((name) => ({ name, isBasic: BASIC.test(name) }));

  let internships = 0;
  const declared = text.match(/internships?\s*[:\-]\s*(\d+|none|nil|no)\b/i);
  if (declared) internships = parseInt(declared[1], 10) || 0;
  else if (!/\b(no|zero|none)\s+internships?\b/i.test(text))
    internships = lines.filter((l) => /\bintern(ship)?\b/i.test(l) && !HEADINGS.test(l.trim())).length;

  const achievements = lines
    .map((l) => l.replace(/^[\s•\-*–·]+/, "").replace(HEADINGS, "").trim())
    .filter((l) => l && /hackathon|award|winner|\bwon\b|\brank(ed)?\b|certif|scholarship|finalist|olympiad|1st|2nd|3rd/i.test(l))
    .filter((l) => !/^(none|no |nil)/i.test(l));

  const hasDsa = /leetcode|codeforces|codechef|hackerrank|\bdsa\b|data structures|competitive programming/i.test(text);

  return normalizeFacts({ looksLikeResume, cgpa, skills, projects, internships, achievements, hasDsa });
}

export function mockRoast({ facts, score, level, reasons }) {
  const proj = facts.projects[0]?.name;
  const skill = facts.skills[0];
  const top = [...reasons].sort((a, b) => b.points - a.points);
  let roast;
  if (score <= 20) roast = `Bro really said "placements? I'm the placement" 😤 ${proj ? `${proj} is giving senior dev energy.` : ""} Only jab: stop flexing on your batchmates, leave some offers for them.`;
  else if (score <= 40) roast = `Lowkey solid ngl. ${proj ? `${proj} carries this resume like a group project topper.` : ""} A couple more reps and you're out of the oven 🔥`;
  else if (score <= 60) roast = `Medium rare and sweating 🥩 ${skill ? `${skill} on the resume is nice, but` : "The resume is"} ${top[0]?.reason.toLowerCase() ?? "the vibes are mid"}. The placement officer has entered the chat.`;
  else roast = `${proj ? `${proj} in ${new Date().getFullYear()}? ` : ""}The recruiter's ATS just filed a noise complaint 💀 ${top[0] ? `${top[0].reason}, and` : ""} the oven is set to "campus drive". Good news: it's fixable — start today.`;

  const strengths = [];
  if (facts.cgpa !== null && facts.cgpa >= 8) strengths.push(`Strong CGPA of ${facts.cgpa}`);
  if (facts.internships > 0) strengths.push(`${facts.internships} internship${facts.internships > 1 ? "s" : ""} of real-world experience`);
  const solid = facts.projects.filter((p) => !p.isBasic);
  if (solid.length) strengths.push(`Real projects like ${solid.slice(0, 2).map((p) => p.name).join(" and ")}`);
  if (facts.hasDsa) strengths.push("Shows DSA / competitive programming practice");
  if (facts.achievements.length) strengths.push(facts.achievements[0]);
  if (!strengths.length && facts.skills.length) strengths.push(`Knows ${facts.skills.slice(0, 3).join(", ")}`);

  const weaknesses = top.slice(0, 3).map((r) => r.reason);

  const tasks = {
    "No internships yet": "Apply to 30 internships/off-campus roles on LinkedIn, Internshala and Wellfound; DM 5 alumni for referrals.",
    "Only one internship": "Turn your internship into 3 impact bullets with numbers, and line up one more freelance or open-source gig.",
    "No projects listed": "Build and deploy one full-stack project (auth + DB + real users) and put the live link on your resume.",
    "Every project is a tutorial classic (calculator/to-do/clone tier)": "Retire the calculator. Build one project that solves a real campus problem, deploy it, and write a solid README.",
    "Only one project that isn't a tutorial classic": "Ship a second serious project in a different area (backend, ML, or mobile) and deploy it.",
    "No DSA / competitive programming signal": "Solve 40 LeetCode easy/medium problems on arrays, strings and hashing; add your profile link.",
    "No GitHub or portfolio link": "Push every project to GitHub with READMEs and screenshots, and add the link to your resume header.",
    "No hackathons, awards or certs": "Register for the next hackathon on Devfolio/Unstop, or finish one credible cert (AWS/Google) this week.",
  };
  const plan = [];
  for (const r of top) {
    const t = tasks[r.reason] ?? (r.reason.startsWith("CGPA") || r.reason === "No CGPA mentioned" ? "Protect your CGPA this semester and add it clearly to your resume; target zero backlogs." : r.reason.startsWith("Only") ? "Add 4–6 relevant skills you can actually defend in an interview, grouped by category." : null);
    if (t && !plan.includes(t)) plan.push(t);
  }
  const fillers = [
    "Do 3 mock interviews (peers or Pramp) and fix the answers you fumbled.",
    "Rewrite every resume bullet as action + tech + measurable impact; keep it to one page.",
    "Solve 5 LeetCode mediums a week and revise OOP, DBMS, OS and CN basics.",
    "Contribute one PR to an open-source repo you actually use.",
  ];
  for (const f of fillers) if (plan.length < 4) plan.push(f);

  const shareLine = score <= 40 ? `Only ${score}% cooked. Placements, I'm ready 😤🔥` : `${score}% cooked for placements (${level.label}) 💀 Send help.`;
  return normalizeRoast({
    roast: roast.replace(/\s+/g, " ").trim(),
    shareLine,
    strengths: strengths.slice(0, 3),
    weaknesses,
    actionPlan: plan.slice(0, 4).map((task, i) => ({ week: i + 1, task })),
  });
}

export function createMockProvider() {
  return {
    name: "mock",
    extract: async (cleanText) => mockExtract(cleanText),
    roast: async (input) => mockRoast(input),
  };
}
