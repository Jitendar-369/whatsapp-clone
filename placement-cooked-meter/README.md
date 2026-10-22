# 🔥 Placement Cooked Meter

> Find out how cooked you are before placements cook you.

Upload a resume PDF (or paste the text) and get a **Cooked Score** (0–100, higher = more cooked), a roast, real strengths and weaknesses, a 4-week survival plan and an Instagram-story share card.

```
placement-cooked-meter/
├── server/   Express 5 API (Node 20+, ESM): parsing, PII stripping, scoring, Gemini
└── client/   Vite + React + Tailwind v4 single page
```

## How it works (and why the score is fair)

The AI **never decides the score**. `POST /api/roast` runs these steps:

1. Get text from the PDF (`pdf-parse`) or from the pasted JSON `{ text }`. Input under 40 chars gets a friendly 400.
2. Detect GitHub, LinkedIn and portfolio links in the raw text.
3. Strip emails, phone numbers (including +91 formats) and URLs, then truncate to 12k chars. **Contact details never reach the AI.**
4. Hash the cleaned text (sha256) and check an in-memory LRU of 500 entries. A hit returns `cached: true` with no AI call.
5. AI call 1 (temperature 0) extracts facts as JSON: CGPA, skills, projects, internships, achievements and DSA. The resume is wrapped in `<resume>` tags and treated as data, which defends against prompt injection. If it isn't a resume, the API returns 422.
6. `server/src/lib/score.js` computes the score with fixed rules and returns the reasons shown in the UI.
7. AI call 2 (temperature 0.9) writes the roast and the plan from the extracted facts and the score only, never the raw resume.

Scoring rules (base 10, clamped to 3–98):

| Signal | Points |
| --- | --- |
| 0 internships / 1 internship | +20 / +6 |
| no projects / all basic / only 1 non-basic | +25 / +18 / +8 |
| CGPA missing / <6 / <7 / <8 | +4 / +15 / +10 / +4 |
| fewer than 4 skills | +8 |
| no DSA / CP | +6 |
| no GitHub and no portfolio | +8 |
| no achievements | +8 |

## Local setup

Requires Node 20+.

```bash
# terminal 1
cd server
cp .env.example .env      # leave GEMINI_API_KEY empty for mock mode
npm install
npm run dev               # http://localhost:3001; logs "(MOCK AI)" without a key

# terminal 2
cd client
cp .env.example .env      # VITE_API_URL=http://localhost:3001
npm install
npm run dev               # http://localhost:5173
```

Run the server tests with `cd server && npm test`. They cover scoring, `stripPII`, the API flow, and a check that nothing PII-like is sent to Gemini.

Sample resumes live in `server/samples/`: `weak.*` scores 88 and `strong.*` scores 16. Regenerate the PDFs with `npm run samples`.

```bash
curl -F resume=@server/samples/weak.pdf http://localhost:3001/api/roast
curl -H 'content-type: application/json' -d '{"text":"..."}' http://localhost:3001/api/roast
curl http://localhost:3001/api/health   # { ok, mock }
curl http://localhost:3001/api/stats    # { totalRoasts }
```

### Mock mode

If `GEMINI_API_KEY` is empty **or** `MOCK_AI=true`, the server uses a regex extractor and a template roast (`server/src/ai/mock.js`). The whole app works offline. The scoring rules are the same in mock mode because they never depended on the AI. Only the facts come from the regex extractor instead of Gemini.

### Using Gemini

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and create an API key.
2. Put it in `server/.env` as `GEMINI_API_KEY=...`, and remove `MOCK_AI=true` if it's set.
3. Optionally set `GEMINI_MODEL` (default `gemini-3.5-flash`).
4. Restart the server. The startup log shows the model name instead of `(MOCK AI)`.

If an AI call fails or returns malformed JSON, the server retries once. If the retry also fails, the API returns 502 "The oven exploded. Try again."

## Environment variables

| Server | Default | |
| --- | --- | --- |
| `GEMINI_API_KEY` | – | empty = mock mode |
| `GEMINI_MODEL` | `gemini-3.5-flash` | |
| `PORT` | `3001` | |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS allow-list (comma-separated) |
| `RATE_LIMIT_PER_HOUR` | `10` | per IP, `/api/roast` only |
| `MOCK_AI` | – | `true` forces mock mode |

| Client | |
| --- | --- |
| `VITE_API_URL` | API base URL |
| `VITE_SITE_URL` | watermark on the share card (defaults to the current host) |

## Deploying

**Server → Render** (Web Service)
- Root directory: `placement-cooked-meter/server`. Build command `npm install`, start command `npm start`.
- Env: `GEMINI_API_KEY`, `GEMINI_MODEL`, `CLIENT_ORIGIN=https://<your-vercel-domain>`, `RATE_LIMIT_PER_HOUR`.
- `trust proxy` is already set, so rate limiting sees real client IPs behind Render's proxy.

**Client → Vercel**
- Root directory: `placement-cooked-meter/client`. Framework preset Vite (build `npm run build`, output `dist`).
- Env: `VITE_API_URL=https://<your-render-service>.onrender.com`, `VITE_SITE_URL=<your-domain>`.

**Cost safety:** in Google AI Studio or Google Cloud billing, set a budget alert and a spending cap on the project that owns the key. Each uncached roast is two small Gemini calls. The per-IP rate limit and the cache keep abuse in check.

## Privacy

- Uploads use memory storage only and are never written to disk.
- Resume text is never logged.
- Contact info is stripped before any AI call. The cache holds only a hash and the generated result, in memory, and it's lost on restart.

## Swapping in a database later

`server/src/lib/cache.js` and `server/src/lib/stats.js` expose small async interfaces (`get/set` and `increment/get`). You can replace them with MongoDB-backed versions without touching the route.
