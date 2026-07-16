// GET  /api/gallery          — list all gallery items
// POST /api/gallery          — add a new photo (base64)
// DELETE /api/gallery?id=xxx — remove a photo
const clientPromise = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("gallery");

    if (req.method === "GET") {
      const items = await col.find({}).sort({ createdAt: 1 }).toArray();
      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const { base64, caption, addedBy } = req.body;
      if (!base64) return res.status(400).json({ error: "base64 required" });
      if (base64.length > 3 * 1024 * 1024)
        return res.status(413).json({ error: "Image too large. Max ~2MB." });
      const doc = {
        base64,
        caption:   caption || "A beautiful memory 💕",
        addedBy:   addedBy || "unknown",
        createdAt: new Date(),
      };
      const result = await col.insertOne(doc);
      return res.status(200).json({ ok: true, id: result.insertedId });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "id required" });
      const { ObjectId } = require("mongodb");
      await col.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
