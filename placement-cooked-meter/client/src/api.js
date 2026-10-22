const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

async function handle(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok) throw new Error(body?.error || `Something burned (HTTP ${res.status}). Try again.`);
  return body;
}

export async function roastResume({ file, text }) {
  let res;
  try {
    if (file) {
      const fd = new FormData();
      fd.append("resume", file);
      res = await fetch(`${API_URL}/api/roast`, { method: "POST", body: fd });
    } else {
      res = await fetch(`${API_URL}/api/roast`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
    }
  } catch {
    throw new Error("Can't reach the kitchen. Check your internet and try again 📡");
  }
  return handle(res);
}

export async function getStats() {
  const res = await fetch(`${API_URL}/api/stats`);
  return handle(res);
}
