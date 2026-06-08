// GET  /api/dreams — fetch saved dreams
// POST /api/dreams — save dreams
const clientPromise = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("dreams");

    if (req.method === "GET") {
      const doc = await col.findOne({ _id: "sadhana" });
      return res.status(200).json(doc || {});
    }

    if (req.method === "POST") {
      const { inputs, cats, prog, savedAt } = req.body;
      await col.updateOne(
        { _id: "sadhana" },
        { $set: { inputs, cats, prog, savedAt } },
        { upsert: true }
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
