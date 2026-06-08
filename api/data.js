// Generic GET/POST for any key-value data document
// GET  /api/data?key=garden
// POST /api/data        body: { key, value }
import clientPromise from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = await clientPromise;
    const db     = client.db("dharya");
    const col    = db.collection("appdata");

    if (req.method === "GET") {
      const key = req.query.key;
      if (!key) return res.status(400).json({ error: "key required" });
      const doc = await col.findOne({ _id: key });
      return res.status(200).json(doc ? doc.value : null);
    }

    if (req.method === "POST") {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: "key required" });
      await col.updateOne(
        { _id: key },
        { $set: { value } },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
