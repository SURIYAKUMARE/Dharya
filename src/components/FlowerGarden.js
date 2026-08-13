import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

/* ─── DATA ─── */
const FLOWER_TYPES = ["🌸","🌺","🌻","🌹","🌷","🌼","🪷","💐"];
const GROWTH = [
  { emoji:"🌱", label:"Seedling",  days:0 },
  { emoji:"🌿", label:"Sprouting", days:1 },
  { emoji:"🪴", label:"Growing",   days:2 },
  { emoji:"🌸", label:"Blooming",  days:3 },
];

const MESSAGES = [
  "Every day you visit, our love grows 💙",
  "Like a garden, love needs daily care 🌱",
  "You are the sunshine that makes everything bloom ☀️",
  "Our love story — one flower at a time 🌸",
  "Each bloom is a day we chose each other 💍",
];

/* ─── CSS-in-JS animations injected once ─── */
const GARDEN_STYLE = `
@keyframes bloomIn {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
  60%  { transform: scale(1.3) rotate(5deg); opacity: 1; }
  80%  { transform: scale(0.9) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes sway {
  0%,100% { transform: rotate(-4deg) translateY(0); }
  50%      { transform: rotate(4deg) translateY(-4px); }
}
@keyframes floatUp2 {
  0%   { transform: translateY(0) scale(1); opacity: 0.85; }
  100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
}
@keyframes pulse2 {
  0%,100% { box-shadow: 0 0 0 0 rgba(236,72,153,0.4); }
  50%     { box-shadow: 0 0 0 12px rgba(236,72,153,0); }
}
@keyframes waterDrop {
  0%  { transform: translateY(-30px) scale(1); opacity: 1; }
  100%{ transform: translateY(60px) scale(0.2); opacity: 0; }
}
`;

function injectStyles() {
  if (document.getElementById("garden-keyframes")) return;
  const s = document.createElement("style");
  s.id = "garden-keyframes";
  s.textContent = GARDEN_STYLE;
  document.head.appendChild(s);
}

/* ─── FLOWER COMPONENT ─── */
function Flower({ flower, isNew, index }) {
  const stage     = GROWTH[Math.min(flower.stage, GROWTH.length - 1)];
  const isBloomed = flower.stage >= GROWTH.length - 1;
  const emoji     = isBloomed ? flower.type : stage.emoji;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18, delay: index * 0.04 }}
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:            "6px",
        padding:        "14px 10px 12px",
        background:     isBloomed
          ? "linear-gradient(135deg,rgba(236,72,153,0.12),rgba(139,92,246,0.08))"
          : "rgba(255,255,255,0.06)",
        border:         `1.5px solid ${isBloomed ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.1)"}`,
        borderRadius:   "18px",
        backdropFilter: "blur(10px)",
        position:       "relative",
        overflow:       "hidden",
        boxShadow:      isBloomed
          ? "0 6px 24px rgba(236,72,153,0.2), 0 0 0 1px rgba(255,255,255,0.06) inset"
          : "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {isNew && (
        <span style={{
          position:      "absolute", top: 5, right: 5,
          fontSize:      "0.52rem", fontWeight: 800,
          background:    "#ec4899", color: "#fff",
          padding:       "2px 6px", borderRadius: "50px",
          textTransform: "uppercase", letterSpacing: "0.5px",
          animation:     "pulse2 1.5s ease-in-out infinite",
        }}>NEW</span>
      )}

      {/* Animated emoji */}
      <span style={{
        fontSize:  isBloomed ? "2.4rem" : "2rem",
        lineHeight: 1,
        display:   "inline-block",
        animation: isBloomed
          ? `sway ${2.5 + (index % 3) * 0.5}s ease-in-out infinite`
          : "none",
        transformOrigin: "bottom center",
        filter:    isBloomed ? "drop-shadow(0 2px 6px rgba(236,72,153,0.5))" : "none",
      }}>
        {emoji}
      </span>

      {/* Stage badge */}
      <span style={{
        fontSize:      "0.58rem",
        fontWeight:    700,
        fontFamily:    "'Inter',sans-serif",
        color:         isBloomed ? "#ec4899" : "#10B981",
        background:    isBloomed ? "rgba(236,72,153,0.15)" : "rgba(16,185,129,0.15)",
        padding:       "2px 8px",
        borderRadius:  "50px",
        border:        `1px solid ${isBloomed ? "rgba(236,72,153,0.3)" : "rgba(16,185,129,0.3)"}`,
        letterSpacing: "0.3px",
      }}>
        {stage.label}
      </span>

      {/* Date */}
      <span style={{
        fontSize:   "0.6rem",
        color:      "rgba(255,255,255,0.35)",
        fontFamily: "'Inter',sans-serif",
      }}>
        {flower.date}
      </span>
    </motion.div>
  );
}

/* ─── WATER DROPS ANIMATION ─── */
function WaterDrops({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:60, overflow:"hidden" }}>
      {[...Array(10)].map((_,i) => (
        <span key={i} style={{
          position:    "absolute",
          top:         "30%",
          left:        `${10 + i * 9}%`,
          fontSize:    `${12 + (i % 3) * 6}px`,
          animation:   `waterDrop ${0.8 + i * 0.1}s ease-in ${i * 0.07}s both`,
        }}>💧</span>
      ))}
    </div>
  );
}

/* ─── PETAL BURST ─── */
function PetalBurst({ active }) {
  const petals = ["🌸","🌺","🌷","🌼","🪷","💮","🌸"];
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:55, overflow:"hidden" }}>
      {petals.map((p, i) => (
        <span key={i} style={{
          position:  "absolute",
          bottom:    "-20px",
          left:      `${5 + i * 14}%`,
          fontSize:  `${16 + (i % 3) * 8}px`,
          animation: `floatUp2 ${2.5 + i * 0.3}s ease-out ${i * 0.12}s forwards`,
          opacity:   0.9,
        }}>{p}</span>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function FlowerGarden({ user }) {
  const [garden,      setGarden]      = useState([]);
  const [watered,     setWatered]     = useState(false);
  const [newId,       setNewId]       = useState(null);
  const [lastVisit,   setLastVisit]   = useState("");
  const [streak,      setStreak]      = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [showDrops,   setShowDrops]   = useState(false);
  const [showPetals,  setShowPetals]  = useState(false);
  const [msgIdx,      setMsgIdx]      = useState(0);
  const confRef = useRef(null);

  injectStyles();

  const todayKey       = new Date().toDateString();
  const alreadyWatered = lastVisit === todayKey;

  useEffect(() => {
    Promise.all([
      dbGet("fg_garden",    []),
      dbGet("fg_lastvisit", ""),
      dbGet("fg_streak",    0),
    ]).then(([g, v, s]) => {
      if (Array.isArray(g)) setGarden(g);
      if (v) setLastVisit(v);
      if (typeof s === "number") setStreak(s);
      setLoading(false);
    });
    // rotate message every 4s
    const id = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 4000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const water = async () => {
    if (alreadyWatered || watered) return;

    // trigger water drops
    setShowDrops(true);
    setTimeout(() => setShowDrops(false), 1200);

    await new Promise(r => setTimeout(r, 600));

    const flower = {
      id:    Date.now(),
      type:  FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)],
      stage: 0,
      date:  new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short" }),
    };
    const grown   = garden.map(f => ({ ...f, stage: Math.min(f.stage + 1, GROWTH.length - 1) }));
    const updated = [...grown, flower];
    const newStreak = streak + 1;

    setGarden(updated);
    setNewId(flower.id);
    setWatered(true);
    setLastVisit(todayKey);
    setStreak(newStreak);

    // petal burst for new blooms
    const newlyBloomed = grown.filter(f => f.stage === GROWTH.length - 1 && garden.find(g => g.id === f.id && g.stage === GROWTH.length - 2));
    if (newlyBloomed.length > 0 || updated.some(f => f.stage >= 2)) {
      setShowPetals(true);
      setTimeout(() => setShowPetals(false), 3000);
    }

    spawnConfetti();

    await Promise.all([
      dbSet("fg_garden",    updated),
      dbSet("fg_lastvisit", todayKey),
      dbSet("fg_streak",    newStreak),
    ]);

    setTimeout(() => setNewId(null), 3000);
  };

  const spawnConfetti = () => {
    if (!confRef.current) return;
    const cs = ["🌸","🌺","🌷","🌼","💕","✨","🌻"];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position:fixed;top:-20px;left:${Math.random()*100}%;
        font-size:${14+Math.random()*16}px;pointer-events:none;z-index:99;
        animation:floatUp2 ${2+Math.random()*2}s ${Math.random()*0.5}s ease-out forwards;
      `;
      el.textContent = cs[Math.floor(Math.random()*cs.length)];
      confRef.current.appendChild(el);
      setTimeout(() => el.remove(), 4500);
    }
  };

  const bloomed  = garden.filter(f => f.stage >= GROWTH.length - 1).length;
  const growing  = garden.length - bloomed;
  const pct      = garden.length ? Math.round((bloomed / garden.length) * 100) : 0;

  return (
    <div style={{ maxWidth:"680px", margin:"0 auto", padding:"8px 4px 80px", position:"relative" }}>
      <div ref={confRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:98, overflow:"hidden" }}/>
      <WaterDrops  active={showDrops}  />
      <PetalBurst  active={showPetals} />

      {/* ── Header ── */}
      <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
        style={{ textAlign:"center", marginBottom:"28px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"5px 16px", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(236,72,153,0.2)", borderRadius:"50px", marginBottom:"12px", fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#ec4899", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          🌸 Our Garden
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.6rem", fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 8px", textShadow:"0 0 40px rgba(236,72,153,0.25)" }}>
          Flower Garden 🌺
        </h1>
        {/* Rotating love message */}
        <AnimatePresence mode="wait">
          <motion.p key={msgIdx}
            initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            transition={{duration:0.35}}
            style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", color:"rgba(255,255,255,0.45)", margin:0, fontStyle:"italic" }}>
            "{MESSAGES[msgIdx]}"
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"20px" }}>
        {[
          { label:"Planted",  value:garden.length, color:"#ec4899", icon:"🌱" },
          { label:"Bloomed",  value:bloomed,        color:"#8B5CF6", icon:"🌸" },
          { label:"Growing",  value:growing,        color:"#10B981", icon:"🌿" },
          { label:"🔥 Streak",value:`${streak}d`,   color:"#f59e0b", icon:"🔥" },
        ].map((s,i) => (
          <motion.div key={i} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.15+i*0.06,type:"spring"}}
            style={{ padding:"14px 6px", textAlign:"center", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${s.color}25`, borderRadius:"16px", backdropFilter:"blur(8px)" }}>
            <div style={{ fontSize:"1.3rem", marginBottom:"4px" }}>{s.icon}</div>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.4rem", fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.58rem", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Progress bar ── */}
      {garden.length > 0 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}
          style={{ marginBottom:"20px", padding:"16px 20px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px" }}>Bloom Progress</span>
            <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.8rem", fontWeight:800, color:"#ec4899" }}>{pct}%</span>
          </div>
          <div style={{ height:"8px", background:"rgba(255,255,255,0.08)", borderRadius:"4px", overflow:"hidden" }}>
            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.2,ease:"easeOut",delay:0.3}}
              style={{ height:"100%", background:"linear-gradient(90deg,#ec4899,#8B5CF6,#f59e0b)", borderRadius:"4px", boxShadow:"0 0 10px rgba(236,72,153,0.6)" }}/>
          </div>
          {/* Heart row */}
          <div style={{ display:"flex", gap:"3px", marginTop:"10px", justifyContent:"center" }}>
            {[...Array(10)].map((_,i) => (
              <motion.span key={i}
                initial={{scale:0}} animate={{scale:1}} transition={{delay:0.4+i*0.05}}
                style={{ fontSize:"0.95rem", opacity:pct>=(i+1)*10?1:0.18, transition:"opacity 0.4s" }}>
                {pct>=(i+1)*10?"❤️":"🤍"}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Water button ── */}
      <div style={{ textAlign:"center", marginBottom:"28px" }}>
        <AnimatePresence mode="wait">
          {alreadyWatered || watered ? (
            <motion.div key="done" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              style={{ display:"inline-flex", alignItems:"center", gap:"10px", padding:"16px 28px", background:"rgba(16,185,129,0.1)", border:"1.5px solid rgba(16,185,129,0.3)", borderRadius:"50px", color:"#10B981", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:600 }}>
              ✅ {watered ? "Garden watered! New flower planted 🌸" : "Come back tomorrow! 💕"}
            </motion.div>
          ) : (
            <motion.button key="btn"
              whileHover={{ scale:1.04, y:-4 }}
              whileTap={{ scale:0.96 }}
              onClick={water}
              style={{ display:"inline-flex", alignItems:"center", gap:"12px", padding:"18px 44px", background:"linear-gradient(135deg,#3b82f6,#10B981)", border:"none", borderRadius:"50px", color:"#fff", fontFamily:"'Manrope',sans-serif", fontSize:"1.05rem", fontWeight:800, cursor:"pointer", boxShadow:"0 12px 36px rgba(59,130,246,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset", letterSpacing:"-0.2px" }}>
              💧 Water the Garden Today
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Garden bed ── */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"14px" }}>🌱</div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading your garden…</p>
        </div>
      ) : garden.length === 0 ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{ textAlign:"center", padding:"48px 24px", background:"rgba(255,255,255,0.03)", border:"1.5px dashed rgba(236,72,153,0.2)", borderRadius:"24px" }}>
          <div style={{ fontSize:"3.5rem", marginBottom:"14px" }}>🌱</div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", fontStyle:"italic", color:"rgba(255,255,255,0.5)", margin:0 }}>
            Press the button to plant your first flower!
          </p>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.3)", marginTop:"8px" }}>
            Visit every day to grow a beautiful garden 🌸
          </p>
        </motion.div>
      ) : (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.25}}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1.5px", textAlign:"center", marginBottom:"14px" }}>
            {garden.length} flower{garden.length!==1?"s":""} in your garden
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(96px,1fr))", gap:"10px" }}>
            <AnimatePresence>
              {[...garden].reverse().map((f, i) => (
                <Flower key={f.id} flower={f} index={i} isNew={newId === f.id} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ── Milestones ── */}
      {garden.length > 0 && (
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
          style={{ marginTop:"28px" }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1.5px", textAlign:"center", marginBottom:"14px" }}>
            Milestones
          </p>
          <div style={{ display:"flex", gap:"8px", overflowX:"auto", paddingBottom:"6px" }}>
            {[
              {n:1, e:"🌱",label:"First Flower"},
              {n:7, e:"🌿",label:"One Week"},
              {n:14,e:"🪴",label:"Fortnight"},
              {n:30,e:"🌸",label:"Month"},
              {n:50,e:"🌺",label:"50 Flowers"},
              {n:100,e:"💐",label:"100 Days"},
            ].map((m, i) => {
              const done = garden.length >= m.n;
              return (
                <div key={i} style={{ flexShrink:0, minWidth:"78px", padding:"12px 8px", textAlign:"center", background:done?"rgba(236,72,153,0.1)":"rgba(255,255,255,0.03)", border:`1.5px solid ${done?"rgba(236,72,153,0.35)":"rgba(255,255,255,0.07)"}`, borderRadius:"14px", opacity:done?1:0.4, transition:"all 0.4s" }}>
                  <div style={{ fontSize:"1.6rem", filter:done?"none":"grayscale(1)", marginBottom:"5px" }}>{m.e}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.58rem", fontWeight:700, color:done?"#ec4899":"rgba(255,255,255,0.3)", textAlign:"center", lineHeight:1.3 }}>{m.label}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.55rem", color:"rgba(255,255,255,0.25)", marginTop:"3px" }}>{m.n} flowers</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Footer note ── */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
        style={{ marginTop:"28px", textAlign:"center", padding:"24px", background:"linear-gradient(135deg,rgba(236,72,153,0.07),rgba(139,92,246,0.05))", border:"1px solid rgba(236,72,153,0.12)", borderRadius:"20px" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", fontStyle:"italic", color:"rgba(255,255,255,0.55)", margin:"0 0 8px" }}>
          "Every day you water this garden, you're telling me you choose us 💙"
        </p>
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"rgba(255,255,255,0.7)", margin:0 }}>
          — Surya &amp; Sadhana 💍
        </p>
      </motion.div>
    </div>
  );
}
