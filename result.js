// Vercel serverless function: same-origin proxy to the upstream API.
// Used by the page automatically if the browser blocks the direct call (CORS).
const UPSTREAM = process.env.UPSTREAM_API || "https://eduboardapi.vercel.app/fetch";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ error: "Method not allowed" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const payload = {
      exam: String(body.exam || ""),
      year: String(body.year || ""),
      board: String(body.board || ""),
      roll: String(body.roll || ""),
      reg: String(body.reg || ""),
    };
    const r = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    res.statusCode = r.status;
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json");
    res.end(text);
  } catch (e) {
    res.statusCode = 502;
    res.json({ error: "Upstream API unreachable" });
  }
};
