// Tiny key-value API for the live team features. Storage: Upstash Redis (Vercel Marketplace).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const HOST_KEY = process.env.HOST_KEY || "";
const HASH = "smg";

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (!URL_ || !TOKEN) return res.status(500).json({ error: "Database not connected" });
    const isHost = !!HOST_KEY && req.headers["x-host-key"] === HOST_KEY;

    if (req.method === "GET") {
      const flat = (await redis(["HGETALL", HASH])) || [];
      const out = {};
      for (let i = 0; i < flat.length; i += 2) {
        try { out[flat[i]] = JSON.parse(flat[i + 1]); } catch (e) {}
      }
      return res.status(200).json({ docs: out, owner: isHost });
    }

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const path = String(b.path || "");
    const isTeam = /^teams\/t\d{1,2}$/.test(path);
    if (b.op === "set") {
      if (!isTeam && !isHost) return res.status(403).json({ error: "Host only" });
      const s = JSON.stringify(b.data || {});
      if (s.length > 20000) return res.status(413).json({ error: "Too large" });
      await redis(["HSET", HASH, path, s]);
      return res.status(200).json({ ok: true });
    }
    if (b.op === "delete") {
      if (!isHost) return res.status(403).json({ error: "Host only" });
      await redis(["HDEL", HASH, path]);
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: "Bad request" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
