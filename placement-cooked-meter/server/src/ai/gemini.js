import { GoogleGenAI } from "@google/genai";
import { extractionSchema, roastSchema, normalizeFacts, normalizeRoast } from "./schemas.js";
import { EXTRACT_SYSTEM, ROAST_SYSTEM, extractPrompt, roastPrompt } from "./prompts.js";

export function createGeminiProvider({ apiKey, model = "gemini-3.5-flash", client } = {}) {
  const ai = client ?? new GoogleGenAI({ apiKey });

  async function callJson({ system, prompt, schema, temperature, normalize }) {
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: system,
            temperature,
            responseMimeType: "application/json",
            responseJsonSchema: schema,
          },
        });
        return normalize(JSON.parse(res.text));
      } catch (err) {
        lastErr = err;
      }
    }
    const e = new Error("AI call failed");
    e.code = "AI_FAILED";
    e.cause = lastErr;
    throw e;
  }

  return {
    name: "gemini",
    extract: (cleanText) =>
      callJson({
        system: EXTRACT_SYSTEM,
        prompt: extractPrompt(cleanText),
        schema: extractionSchema,
        temperature: 0,
        normalize: normalizeFacts,
      }),
    roast: (input) =>
      callJson({
        system: ROAST_SYSTEM,
        prompt: roastPrompt(input),
        schema: roastSchema,
        temperature: 0.9,
        normalize: normalizeRoast,
      }),
  };
}
