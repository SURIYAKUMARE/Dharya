// GET    /api/chat?since=  — fetch messages
// POST   /api/chat         — send message
// PATCH  /api/chat         — edit message OR mark read
// DELETE /api/chat?id=     — delete message
const clientPromise = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("chat");
    const { ObjectId } = require("mongodb");

    if (req.method === "GET") {
      const since = req.query.since ? new Date(req.query.since) : new Date(0);
      const msgs  = await col.find({ createdAt:{ $gt:since } }).sort({ createdAt:1 }).limit(300).toArray();
      return res.status(200).json(msgs);
    }

    if (req.method === "POST") {
      const { text, sender, senderName, image } = req.body;
      if (!sender) return res.status(400).json({ error:"sender required" });
      if (!text && !image) return res.status(400).json({ error:"text or image required" });
      const msg = {
        text:       text ? text.trim() : "",
        image:      image || null,
        sender,
        senderName: senderName || sender,
        createdAt:  new Date(),
        read:       false,
        edited:     false,
        deleted:    false,
      };
      const result = await col.insertOne(msg);
      return res.status(200).json({ ok:true, msg:{ ...msg, _id:result.insertedId } });
    }

    if (req.method === "PATCH") {
      const { id, text, reader } = req.body;
      // Mark as read
      if (reader && !id) {
        await col.updateMany({ sender:{ $ne:reader }, read:false }, { $set:{ read:true } });
        return res.status(200).json({ ok:true });
      }
      // Edit message
      if (id && text !== undefined) {
        await col.updateOne({ _id:new ObjectId(id) }, { $set:{ text:text.trim(), edited:true } });
        return res.status(200).json({ ok:true });
      }
      return res.status(400).json({ error:"id+text or reader required" });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error:"id required" });
      // Soft delete — replace with "This message was deleted"
      await col.updateOne({ _id:new ObjectId(id) }, { $set:{ text:"", image:null, deleted:true } });
      return res.status(200).json({ ok:true });
    }

    return res.status(405).json({ error:"Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error:err.message });
  }
};
