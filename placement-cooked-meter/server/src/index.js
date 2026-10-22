import "dotenv/config";
import { createApp } from "./app.js";
import { createProvider, isMockMode } from "./ai/index.js";

const port = Number(process.env.PORT) || 3001;
const app = createApp({
  provider: createProvider(),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  ratePerHour: Number(process.env.RATE_LIMIT_PER_HOUR) || 10,
});

app.listen(port, () => {
  const mode = isMockMode() ? "(MOCK AI)" : `(Gemini: ${process.env.GEMINI_MODEL || "gemini-3.5-flash"})`;
  console.log(`🔥 Placement Cooked Meter API on http://localhost:${port} ${mode}`);
});
