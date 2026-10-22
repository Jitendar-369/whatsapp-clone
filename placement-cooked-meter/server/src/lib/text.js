import { PDFParse } from "pdf-parse";

export const MIN_CHARS = 40;
export const MAX_CHARS = 12000;

export async function pdfToText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const { text } = await parser.getText();
    return text ?? "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}

export function detectLinks(text) {
  return {
    hasGithub: /github\.com\/[\w-]+/i.test(text) || /\bgithub\b/i.test(text),
    hasLinkedin: /linkedin\.com\/(in|pub)\//i.test(text) || /\blinkedin\b/i.test(text),
    hasPortfolio:
      /\bportfolio\b/i.test(text) ||
      /\b[\w-]+\.(dev|me|io|vercel\.app|netlify\.app|github\.io)\b/i.test(text),
  };
}

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_RE =
  /\b(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]{2,}\.)+(?:com|in|org|net|io|dev|me|app|co|ai|xyz|tech)\b(?:\/\S*)?/gi;
// +91 98765 43210, 098765-43210, (+91) 9876543210, 9876543210, +1 (555) 123-4567, landlines like 011-23456789
const PHONE = /(?:\(?\+?\d{1,3}\)?[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{4,5}\b/g;

export function stripPII(text) {
  return text
    .replace(EMAIL, "[EMAIL]")
    .replace(URL_RE, "[URL]")
    .replace(PHONE, (m) => (m.replace(/\D/g, "").length >= 10 ? "[PHONE]" : m));
}

export function cleanText(text) {
  return stripPII(text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()).slice(
    0,
    MAX_CHARS
  );
}
