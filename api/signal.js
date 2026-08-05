/* ── WebRTC Signaling API via MongoDB ──
   GET  /api/signal?room=<room>&since=<ts>   → fetch new signals
   POST /api/signal                          → push a signal
   DELETE /api/signal?room=<room>            → clear room
*/
const clientPromise = require("./_db");

async function getCol() {
  const client = await clientPromise;
  return client.db("dharya").collection("signals");
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const col = await getCol();

    if (req.method === "GET") {
      const { room, since } = req.query;
      if (!room) return res.status(400).json({ error: "room required" });
      const ts = since ? new Date(since) : new Date(0);
      const docs = await col
        .find({ room, createdAt: { $gt: ts } })
        .sort({ createdAt: 1 })
        .limit(50)
        .toArray();
      return res.status(200).json(docs);
    }

    if (req.method === "POST") {
      const { room, from, type, data } = req.body;
      if (!room || !from || !type) return res.status(400).json({ error: "room/from/type required" });
      const doc = { room, from, type, data, createdAt: new Date() };
      const result = await col.insertOne(doc);
      // Clean old signals (older than 2 min) to keep collection small
      col.deleteMany({ room, createdAt: { $lt: new Date(Date.now() - 120_000) } });
      return res.status(200).json({ ok: true, id: result.insertedId });
    }

    if (req.method === "DELETE") {
      const { room } = req.query;
      if (!room) return res.status(400).json({ error: "room required" });
      await col.deleteMany({ room });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
