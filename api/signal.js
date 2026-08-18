/* ── WebRTC Signaling — ultra-fast in-memory relay ──
   Vercel serverless keeps a warm instance alive.
   Signals stored in module-level Map → sub-millisecond reads.
   MongoDB used only as fallback when memory is cold.

   GET    /api/signal?room=r&since=ts  → fetch new signals
   POST   /api/signal                  → push signal
   DELETE /api/signal?room=r           → clear room
*/
const clientPromise = require("./_db");

/* ── In-memory store (warm cache) ── */
if (!global._sigStore) {
  global._sigStore = new Map(); // room → [{id,from,type,data,ts}]
}
const store = global._sigStore;

const KEEP_MS   = 90_000;  // purge signals older than 90s
const MAX_ROOM  = 200;     // max signals per room

function roomSignals(room) {
  if (!store.has(room)) store.set(room, []);
  return store.get(room);
}

function purgeRoom(room) {
  const cutoff = Date.now() - KEEP_MS;
  const sigs = roomSignals(room);
  const next  = sigs.filter(s => s.ts > cutoff);
  store.set(room, next);
  return next;
}

let _idSeq = 0;
function nextId() { return `${Date.now()}_${++_idSeq}`; }

/* ── Async persist to MongoDB (fire-and-forget) ── */
async function persistSignal(doc) {
  try {
    const client = await clientPromise;
    await client.db("dharya").collection("signals").insertOne(doc);
  } catch (_) { /* non-critical */ }
}

async function loadFromDB(room, since) {
  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("signals");
    const docs   = await col
      .find({ room, createdAt: { $gt: new Date(since) } })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();
    return docs.map(d => ({
      id:   String(d._id),
      from: d.from,
      type: d.type,
      data: d.data,
      ts:   d.createdAt.getTime(),
      createdAt: d.createdAt.toISOString(),
    }));
  } catch (_) { return []; }
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { room, since } = req.query;

  try {
    /* ── GET ── */
    if (req.method === "GET") {
      if (!room) return res.status(400).json({ error: "room required" });

      const sinceMs = since ? new Date(since).getTime() : 0;
      let sigs = purgeRoom(room).filter(s => s.ts > sinceMs);

      /* If memory is empty, always try DB (cold serverless instance) */
      if (sigs.length === 0) {
        sigs = await loadFromDB(room, sinceMs);
        /* Warm the memory store with DB data */
        if (sigs.length > 0) {
          const existing = roomSignals(room);
          const ids = new Set(existing.map(s => s.id));
          for (const s of sigs) {
            if (!ids.has(s.id)) existing.push(s);
          }
        }
      }

      return res.status(200).json(sigs);
    }

    /* ── POST ── */
    if (req.method === "POST") {
      const { room: r, from, type, data } = req.body || {};
      if (!r || !from || !type) return res.status(400).json({ error: "room/from/type required" });

      const id  = nextId();
      const ts  = Date.now();
      const sig = { id, from, type, data: data ?? null, ts, createdAt: new Date(ts).toISOString() };

      /* Write to memory immediately — zero latency */
      const sigs = roomSignals(r);
      sigs.push(sig);
      /* Cap room size */
      if (sigs.length > MAX_ROOM) sigs.splice(0, sigs.length - MAX_ROOM);

      /* Persist to DB async — don't block response */
      persistSignal({ room: r, from, type, data: data ?? null, createdAt: new Date(ts) });

      return res.status(200).json({ ok: true, id });
    }

    /* ── DELETE ── */
    if (req.method === "DELETE") {
      if (!room) return res.status(400).json({ error: "room required" });
      store.set(room, []);
      /* Also clear DB async */
      (async () => {
        try {
          const client = await clientPromise;
          await client.db("dharya").collection("signals").deleteMany({ room });
        } catch (_) {}
      })();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("signal:", e.message);
    return res.status(500).json({ error: e.message });
  }
};
