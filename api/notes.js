// GET    /api/notes          — list all notes
// POST   /api/notes          — create note
// PATCH  /api/notes?id=      — update note
// DELETE /api/notes?id=      — delete note
const clientPromise = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("studynotes");
    const { ObjectId } = require("mongodb");

    if (req.method === "GET") {
      const notes = await col.find({}).sort({ pinned:-1, updatedAt:-1 }).limit(200).toArray();
      return res.status(200).json(notes);
    }

    if (req.method === "POST") {
      const { title, content, subject, color, author } = req.body;
      if (!title) return res.status(400).json({ error:"title required" });
      const note = {
        title:     title.trim(),
        content:   content || "",
        subject:   subject || "General",
        color:     color   || "#fff9c4",
        author:    author  || "unknown",
        pinned:    false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await col.insertOne(note);
      return res.status(200).json({ ok:true, note:{ ...note, _id:result.insertedId } });
    }

    if (req.method === "PATCH") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error:"id required" });
      const { title, content, subject, color, pinned } = req.body;
      const update = { updatedAt: new Date() };
      if (title   !== undefined) update.title   = title.trim();
      if (content !== undefined) update.content = content;
      if (subject !== undefined) update.subject = subject;
      if (color   !== undefined) update.color   = color;
      if (pinned  !== undefined) update.pinned  = pinned;
      await col.updateOne({ _id:new ObjectId(id) }, { $set:update });
      return res.status(200).json({ ok:true });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error:"id required" });
      await col.deleteOne({ _id:new ObjectId(id) });
      return res.status(200).json({ ok:true });
    }

    return res.status(405).json({ error:"Method not allowed" });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error:err.message });
  }
};
