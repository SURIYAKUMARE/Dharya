/* ── POST /api/seed-garden
   Seeds the flower garden with July + August (up to yesterday) data.
   Only runs if the garden is currently empty — safe to call multiple times.
   Also accepts ?force=1 to overwrite even if data exists.
*/
const clientPromise = require("./_db");

const FLOWER_TYPES = ["🌸","🌺","🌻","🌹","🌷","🌼","🪷","💐","🌸","🌺"];

/* Build one flower entry per calendar day */
function buildGardenData() {
  const flowers = [];
  const now     = new Date(); // Aug 18 2026
  let   seq     = 0;

  // July 1 – July 31, 2026
  for (let d = 1; d <= 31; d++) {
    const date    = new Date(2026, 6, d); // month is 0-indexed, 6 = July
    const daysAgo = Math.floor((now - date) / 86400000);
    // Flowers planted 18–49 days ago: all fully bloomed (stage 3)
    const stage   = 3;
    const type    = FLOWER_TYPES[seq % FLOWER_TYPES.length];
    flowers.push({
      id:    date.getTime() + seq,
      type,
      stage,
      date:  `${String(d).padStart(2,"0")} Jul`,
      plantedAt: date.toISOString(),
      daysAgo,
    });
    seq++;
  }

  // Aug 1 – Aug 17, 2026 (yesterday and before — all bloomed)
  for (let d = 1; d <= 17; d++) {
    const date    = new Date(2026, 7, d); // month 7 = August
    const daysAgo = Math.floor((now - date) / 86400000);
    // 1–17 days ago: stage based on age
    const stage   = daysAgo >= 3 ? 3 : daysAgo >= 2 ? 2 : daysAgo >= 1 ? 1 : 0;
    const type    = FLOWER_TYPES[seq % FLOWER_TYPES.length];
    flowers.push({
      id:    date.getTime() + seq,
      type,
      stage,
      date:  `${String(d).padStart(2,"0")} Aug`,
      plantedAt: date.toISOString(),
      daysAgo,
    });
    seq++;
  }

  return flowers;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const force = req.query.force === "1";

  try {
    const client = await clientPromise;
    const col    = client.db("dharya").collection("appdata");

    // Check if garden already has enough data (48+ flowers)
    if (!force) {
      const existing = await col.findOne({ _id: "fg_garden" });
      if (existing && Array.isArray(existing.value) && existing.value.length >= 48) {
        return res.status(200).json({
          ok: true,
          seeded: false,
          message: "Garden already fully seeded.",
          count: existing.value.length,
        });
      }
    }

    const flowers   = buildGardenData();
    const streak    = flowers.length; // one per day = streak equal to count
    const lastVisit = new Date(2026, 7, 17).toDateString(); // Aug 17 was last watered

    // Write all three keys
    await Promise.all([
      col.updateOne({ _id: "fg_garden"    }, { $set: { value: flowers    } }, { upsert: true }),
      col.updateOne({ _id: "fg_lastvisit" }, { $set: { value: lastVisit  } }, { upsert: true }),
      col.updateOne({ _id: "fg_streak"    }, { $set: { value: streak     } }, { upsert: true }),
    ]);

    return res.status(200).json({
      ok: true,
      seeded: true,
      count: flowers.length,
      streak,
      lastVisit,
      preview: flowers.slice(0, 3).map(f => ({ date: f.date, stage: f.stage, type: f.type })),
    });
  } catch (e) {
    console.error("seed-garden:", e.message);
    return res.status(500).json({ error: e.message });
  }
};
