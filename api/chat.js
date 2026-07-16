// GET  /api/chat?since=<timestamp>  — fetch messages newer than timestamp
// POST /api/chat                    — send a message
const clientPromise = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("chat");

    if (req.method === "GET") {
      const since = req.query.since ? new Date(req.query.since) : new Date(0);
      const msgs  = await col
        .find({ createdAt: { $gt: since } })
        .sort({ createdAt: 1 })
        .limit(200)
        .toArray();
      return res.status(200).json(msgs);
    }

    if (req.method === "POST") {
      const { text, sender, senderName } = req.body;
      if (!text || !sender) return res.status(400).json({ error: "text and sender required" });
      const msg = {
        text:       text.trim(),
        sender,                   // "surya" | "sadhana"
        senderName: senderName || sender,
        createdAt:  new Date(),
        read:       false,
      };
      await col.insertOne(msg);
      return res.status(200).json({ ok: true, msg });
    }

    // PATCH — mark all messages as read for a user
    if (req.method === "PATCH") {
      const { reader } = req.body;
      await col.updateMany(
        { sender: { $ne: reader }, read: false },
        { $set: { read: true } }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
