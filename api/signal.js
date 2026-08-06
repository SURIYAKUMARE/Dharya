/* ── WebRTC Signaling API — optimised for low latency ──
   GET    /api/signal?room=<r>&since=<ts>  → fetch new signals
   POST   /api/signal                      → push a signal
   DELETE /api/signal?room=<r>             → clear room
*/
const clientPromise = require("./_db");

async function getCol() {
  const client = await clientPromise;
  return client.db("dharya").collection("signals");
}

module.exports = async (req, res) => {
  /* CORS */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const col = await getCol();

    /* ── GET: fetch signals since timestamp ── */
    if (req.method === "GET") {
      const { room, since } = req.query;
      if (!room) return res.status(400).json({ error: "room required" });
      const ts = since ? new Date(since) : new Date(0);
      const docs = await col
        .find({ room, createdAt: { $gt: ts } })
        .sort({ createdAt: 1 })
        .limit(100)
        .toArray();
      return res.status(200).json(docs);
    }

    /* ── POST: insert signal (fire-and-forget cleanup) ── */
    if (req.method === "POST") {
      const { room, from, type, data } = req.body || {};
      if (!room || !from || !type) return res.status(400).json({ error: "room/from/type required" });
      const doc = { room, from, type, data: data ?? null, createdAt: new Date() };
      const result = await col.insertOne(doc);
      /* async cleanup — don't await, keeps response fast */
      col.deleteMany({ room, createdAt: { $lt: new Date(Date.now() - 90_000) } })
         .catch(() => {});
      return res.status(200).json({ ok: true, id: result.insertedId });
    }

    /* ── DELETE: clear a room ── */
    if (req.method === "DELETE") {
      const { room } = req.query;
      if (!room) return res.status(400).json({ error: "room required" });
      await col.deleteMany({ room });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("signal error:", e);
    return res.status(500).json({ error: e.message });
  }
};
