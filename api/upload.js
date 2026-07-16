// POST /api/upload — store a base64 image for a timeline moment
// Body: { key, base64 }  e.g. key = "timeline_img_0"
const clientPromise = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("uploads");

    if (req.method === "GET") {
      const { key } = req.query;
      if (!key) return res.status(400).json({ error: "key required" });
      const doc = await col.findOne({ _id: key });
      return res.status(200).json(doc ? doc.base64 : null);
    }

    if (req.method === "POST") {
      const { key, base64 } = req.body;
      if (!key || !base64) return res.status(400).json({ error: "key and base64 required" });
      // Limit: ~2MB per image
      if (base64.length > 2.5 * 1024 * 1024) {
        return res.status(413).json({ error: "Image too large. Max 2MB." });
      }
      await col.updateOne({ _id: key }, { $set: { base64 } }, { upsert: true });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { key } = req.query;
      if (!key) return res.status(400).json({ error: "key required" });
      await col.deleteOne({ _id: key });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
