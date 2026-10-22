import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreResume, levelFor } from "../src/lib/score.js";

const weak = {
  cgpa: 6.5,
  skills: ["HTML", "CSS"],
  projects: [{ name: "Calculator", isBasic: true }, { name: "ToDo App", isBasic: true }],
  internships: 0,
  achievements: [],
  hasDsa: false,
};
const strong = {
  cgpa: 8.9,
  skills: ["Python", "React", "Node.js", "MongoDB", "PyTorch", "AWS"],
  projects: [{ name: "CampusConnect", isBasic: false }, { name: "CropDoc", isBasic: false }],
  internships: 1,
  achievements: ["Winner, Smart India Hackathon 2024"],
  hasDsa: true,
};

test("weak resume scores high", () => {
  const r = scoreResume(weak, { hasGithub: false, hasPortfolio: false });
  assert.ok(r.score >= 60, `got ${r.score}`);
  assert.equal(r.score, 88);
  assert.equal(r.level.label, "BURNT");
});

test("strong resume scores low", () => {
  const r = scoreResume(strong, { hasGithub: true });
  assert.ok(r.score < 30, `got ${r.score}`);
  assert.equal(r.level.label, "UNC COOKED");
});

test("same input always gives the same score", () => {
  const a = scoreResume(weak, {});
  for (let i = 0; i < 20; i++) assert.deepEqual(scoreResume(structuredClone(weak), {}), a);
});

test("reasons add up to score minus base", () => {
  const r = scoreResume(weak, {});
  assert.equal(10 + r.reasons.reduce((s, x) => s + x.points, 0), r.score);
});

test("score is clamped to 3..98", () => {
  const worst = scoreResume({ cgpa: 4, skills: [], projects: [], internships: 0, achievements: [], hasDsa: false }, {});
  assert.equal(worst.score, 98);
  const best = scoreResume({ ...strong, internships: 3 }, { hasGithub: true });
  assert.ok(best.score >= 3);
});

test("rule boundaries", () => {
  const base = { ...strong, internships: 2 };
  assert.equal(scoreResume(base, { hasGithub: true }).score, 10);
  assert.equal(scoreResume({ ...base, cgpa: null }, { hasGithub: true }).score, 14);
  assert.equal(scoreResume({ ...base, cgpa: 5.9 }, { hasGithub: true }).score, 25);
  assert.equal(scoreResume({ ...base, cgpa: 7.99 }, { hasGithub: true }).score, 14);
  assert.equal(scoreResume({ ...base, projects: [] }, { hasGithub: true }).score, 35);
  assert.equal(scoreResume({ ...base, projects: [{ name: "X", isBasic: false }] }, { hasPortfolio: true }).score, 18);
  assert.equal(scoreResume(base, {}).score, 18);
});

test("level thresholds", () => {
  assert.equal(levelFor(20).label, "UNC COOKED");
  assert.equal(levelFor(21).label, "Slightly Toasted");
  assert.equal(levelFor(60).label, "Medium Rare");
  assert.equal(levelFor(80).label, "Well Done");
  assert.equal(levelFor(81).label, "BURNT");
});
