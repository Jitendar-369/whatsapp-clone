import { createGeminiProvider } from "./gemini.js";
import { createMockProvider } from "./mock.js";

export function isMockMode(env = process.env) {
  return !env.GEMINI_API_KEY || env.MOCK_AI === "true";
}

export function createProvider(env = process.env) {
  if (isMockMode(env)) return createMockProvider();
  return createGeminiProvider({ apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL || "gemini-3.5-flash" });
}
