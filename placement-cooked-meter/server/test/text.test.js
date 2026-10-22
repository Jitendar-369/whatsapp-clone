import { test } from "node:test";
import assert from "node:assert/strict";
import { stripPII, detectLinks, cleanText, MAX_CHARS } from "../src/lib/text.js";

test("stripPII removes emails", () => {
  const out = stripPII("Mail me at rahul.sharma+jobs@gmail.com or r_s@iitb.ac.in");
  assert.ok(!out.includes("@"));
  assert.equal((out.match(/\[EMAIL\]/g) ?? []).length, 2);
});

test("stripPII removes Indian and international phone formats", () => {
  const phones = [
    "+91 98765 43210",
    "+91-9876543210",
    "+919876543210",
    "(+91) 91234-56789",
    "09876543210",
    "9876543210",
    "98765-43210",
    "+1 (555) 123-4567",
  ];
  for (const p of phones) {
    const out = stripPII(`Phone: ${p} end`);
    assert.ok(!/\d{4}/.test(out.replace("Phone:", "")), `leaked "${p}" -> "${out}"`);
    assert.match(out, /\[PHONE\]/);
  }
});

test("stripPII removes URLs but keeps degrees, years and tech names", () => {
  const out = stripPII(
    "github.com/rahul https://rahul.dev/portfolio www.linkedin.com/in/rahul rahul.vercel.app B.Tech 2022 - 2026 CGPA 8.5 Node.js Next.js 450+ problems"
  );
  assert.ok(!/github\.com|rahul\.dev|linkedin|vercel/.test(out), out);
  for (const keep of ["B.Tech", "2022 - 2026", "8.5", "Node.js", "Next.js", "450+"]) assert.ok(out.includes(keep), `${keep} in ${out}`);
});

test("detectLinks runs on raw text", () => {
  assert.deepEqual(detectLinks("github.com/x | linkedin.com/in/y"), { hasGithub: true, hasLinkedin: true, hasPortfolio: false });
  assert.equal(detectLinks("see priya.dev").hasPortfolio, true);
  assert.equal(detectLinks("nothing here").hasGithub, false);
});

test("cleanText truncates", () => {
  assert.equal(cleanText("a ".repeat(20000)).length, MAX_CHARS);
});
