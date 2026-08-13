import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

/* ─── constants ─── */
const FLOWER_TYPES = ["🌸","🌺","🌻","🌹","🌷","🌼","🪷","💐","🌸","🌺"];
const GROWTH_STAGES = [
  { emoji:"🌱", label:"Seedling",  days:0 },
  { emoji:"🌿", label:"Sprouting", days:1 },
  { emoji:"🪴", label:"Growing",   days:2 },
  { emoji:"🌸", label:"Blooming",  days:3 },
];
const LOVE_MSGS = [
  "Every day you visit, our love grows 💙",
  "Like a garden, love needs daily care 🌱",
  "You are the sunshine that makes everything bloom ☀️",
  "Our love story — one flower at a time 🌸",
  "Each bloom is a day we chose each other 💍",
  "This garden grows as long as you keep coming back 🌿",
];
const MILESTONES = [
  { n:1,  e:"🌱", label:"First Flower" },
  { n:7,  e:"🌿", label:"One Week"     },
  { n:14, e:"🪴", label:"Fortnight"    },
  { n:30, e:"🌸", label:"One Month"    },
  { n:50, e:"🌺", label:"50 Flowers"   },
  { n:100,e:"💐", label:"100 Days"     },
];

/* ─── inject CSS once ─── */
function injectStyles() {
  if (document.getElementById("fg-styles")) return;
  const s = document.createElement("style");
  s.id = "fg-styles";
  s.textContent = `
    @keyframes fg-sway    { 0%,100%{transform:rotate(-4deg) translateY(0)} 50%{transform:rotate(4deg) translateY(-5px)} }
    @keyframes fg-pop     { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.3) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
    @keyframes fg-float   { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-130px) scale(0.2);opacity:0} }
    @keyframes fg-drop    { 0%{transform:translateY(-30px) scale(1);opacity:1} 100%{transform:translateY(70px) scale(0.1);opacity:0} }
    @keyframes fg-pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,0.4)} 50%{box-shadow:0 0 0 14px rgba(236,72,153,0)} }
    @keyframes fg-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes fg-spin    { to{transform:rotate(360deg)} }
    @keyframes fg-newBadge{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
    @keyframes fg-soilWave{ 0%,100%{transform:scaleX(1) translateY(0)} 50%{transform:scaleX(1.02) translateY(-2px)} }
  `;
  document.head.appendChild(s);
}

/* ─── Water drops overlay ─── */
function WaterDrops({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:60, overflow:"hidden" }}>
      {[...Array(14)].map((_,i) => (
        <span key={i} style={{
          position:"absolute", top:"20%",
          left:`${5 + i * 7}%`,
          fontSize:`${14 + (i%3)*5}px`,
          animation:`fg-drop ${0.7 + i*0.08}s ease-in ${i*0.06}s both`,
        }}>💧</span>
      ))}
    </div>
  );
}

/* ─── Petal burst ─── */
function PetalBurst({ active }) {
  if (!active) return null;
  const items = ["🌸","🌺","🌷","🌼","🪷","💮","🌸","🌺","✨","💕"];
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:55, overflow:"hidden" }}>
      {items.map((p,i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-20px",
          left:`${4 + i*10}%`,
          fontSize:`${16 + (i%3)*8}px`,
          animation:`fg-float ${2.2 + i*0.3}s ease-out ${i*0.1}s forwards`,
        }}>{p}</span>
      ))}
    </div>
  );
}

/* ─── Single Flower Card ─── */
function FlowerCard({ flower, index, isNew }) {
  const stage    = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length - 1)];
  const bloomed  = flower.stage >= GROWTH_STAGES.length - 1;
  const emoji    = bloomed ? flower.type : stage.emoji;

  return (
    <motion.div
      layout
      initial={{ scale:0, opacity:0, y:20 }}
      animate={{ scale:1, opacity:1, y:0 }}
      exit={{ scale:0, opacity:0 }}
      transition={{ type:"spring", stiffness:280, damping:20, delay: index * 0.03 }}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        gap:6, padding:"14px 10px 12px",
        background: bloomed
          ? "linear-gradient(135deg,rgba(236,72,153,0.14),rgba(139,92,246,0.08))"
          : "rgba(255,255,255,0.05)",
        border:`1.5px solid ${bloomed?"rgba(236,72,153,0.4)":"rgba(255,255,255,0.09)"}`,
        borderRadius:18,
        backdropFilter:"blur(10px)",
        position:"relative", overflow:"hidden",
        boxShadow: bloomed
          ? "0 6px 24px rgba(236,72,153,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {/* shimmer stripe on bloomed */}
      {bloomed && (
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%)",
          backgroundSize:"200% 100%",
          animation:"fg-shimmer 3s linear infinite",
          borderRadius:18,
          pointerEvents:"none",
        }}/>
      )}

      {isNew && (
        <span style={{
          position:"absolute", top:5, right:5,
          fontSize:"0.5rem", fontWeight:800,
          background:"#ec4899", color:"#fff",
          padding:"2px 6px", borderRadius:50,
          textTransform:"uppercase", letterSpacing:"0.5px",
          animation:"fg-newBadge 1.2s ease-in-out infinite",
        }}>NEW</span>
      )}

      <span style={{
        fontSize: bloomed ? "2.3rem" : "1.9rem",
        lineHeight:1, display:"inline-block",
        animation: bloomed ? `fg-sway ${2.2 + (index%3)*0.6}s ease-in-out infinite` : "none",
        transformOrigin:"bottom center",
        filter: bloomed ? "drop-shadow(0 2px 8px rgba(236,72,153,0.5))" : "none",
      }}>{emoji}</span>

      <span style={{
        fontSize:"0.58rem", fontWeight:700,
        fontFamily:"'Inter',sans-serif",
        color: bloomed ? "#ec4899" : "#10B981",
        background: bloomed ? "rgba(236,72,153,0.15)" : "rgba(16,185,129,0.15)",
        padding:"2px 8px", borderRadius:50,
        border:`1px solid ${bloomed?"rgba(236,72,153,0.3)":"rgba(16,185,129,0.3)"}`,
        letterSpacing:"0.3px",
      }}>{stage.label}</span>

      <span style={{
        fontSize:"0.58rem", color:"rgba(255,255,255,0.3)",
        fontFamily:"'Inter',sans-serif",
      }}>{flower.date}</span>
    </motion.div>
  );
}

/* ─── Garden Bed Visual ─── */
function GardenBed({ flowers }) {
  const bloomed = flowers.filter(f => f.stage >= GROWTH_STAGES.length - 1);
  const total   = flowers.length;

  if (total === 0) return null;

  return (
    <div style={{
      margin:"0 0 20px",
      padding:"20px 16px 14px",
      background:"linear-gradient(180deg,rgba(34,197,94,0.06) 0%,rgba(21,128,61,0.1) 100%)",
      border:"1px solid rgba(34,197,94,0.15)",
      borderRadius:20,
      position:"relative", overflow:"hidden",
    }}>
      {/* soil strip */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:22,
        background:"linear-gradient(180deg,#3d1c02,#2a1000)",
        animation:"fg-soilWave 4s ease-in-out infinite",
        borderRadius:"0 0 20px 20px",
      }}/>
      {/* grass */}
      <div style={{
        position:"absolute", bottom:20, left:0, right:0, height:8,
        background:"linear-gradient(180deg,#16a34a,#15803d)",
        opacity:0.7,
      }}/>

      <p style={{
        fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700,
        color:"rgba(255,255,255,0.35)", textTransform:"uppercase",
        letterSpacing:"1.5px", textAlign:"center", margin:"0 0 12px",
      }}>🌿 Garden Bed</p>

      {/* flower row in bed */}
      <div style={{
        display:"flex", flexWrap:"wrap", justifyContent:"center",
        gap:6, paddingBottom:28,
      }}>
        {flowers.slice().reverse().slice(0,20).map((f,i) => {
          const s = GROWTH_STAGES[Math.min(f.stage, GROWTH_STAGES.length-1)];
          const e = f.stage >= GROWTH_STAGES.length-1 ? f.type : s.emoji;
          return (
            <motion.span key={f.id}
              initial={{ scale:0, y:20 }}
              animate={{ scale:1, y:0 }}
              transition={{ delay: i*0.04, type:"spring" }}
              style={{
                fontSize:`${18 + (i%3)*6}px`,
                display:"inline-block",
                animation: f.stage >= GROWTH_STAGES.length-1
                  ? `fg-sway ${2+i*0.2}s ease-in-out ${i*0.15}s infinite` : "none",
                transformOrigin:"bottom center",
                filter: f.stage >= GROWTH_STAGES.length-1
                  ? "drop-shadow(0 2px 6px rgba(236,72,153,0.4))" : "none",
                cursor:"default",
              }}
            >{e}</motion.span>
          );
        })}
      </div>

      {/* stats inside bed */}
      <div style={{
        display:"flex", justifyContent:"center", gap:16,
        marginTop:4,
      }}>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"#4ade80" }}>
          🌸 {bloomed.length} bloomed
        </span>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"rgba(255,255,255,0.35)" }}>
          🌱 {total - bloomed.length} growing
        </span>
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function FlowerGarden({ user }) {
  const [garden,     setGarden]     = useState([]);
  const [watered,    setWatered]    = useState(false);
  const [newId,      setNewId]      = useState(null);
  const [lastVisit,  setLastVisit]  = useState("");
  const [streak,     setStreak]     = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [showDrops,  setShowDrops]  = useState(false);
  const [showPetals, setShowPetals] = useState(false);
  const [msgIdx,     setMsgIdx]     = useState(0);
  const [view,       setView]       = useState("garden"); // garden | collection
  const confRef = useRef(null);

  injectStyles();

  const todayKey       = new Date().toDateString();
  const alreadyWatered = lastVisit === todayKey;
  const bloomed        = garden.filter(f => f.stage >= GROWTH_STAGES.length - 1).length;
  const pct            = garden.length ? Math.round((bloomed / garden.length) * 100) : 0;

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
    const id = setInterval(() => setMsgIdx(i => (i+1) % LOVE_MSGS.length), 4200);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const water = async () => {
    if (alreadyWatered || watered) return;

    setShowDrops(true);
    setTimeout(() => setShowDrops(false), 1300);
    await new Promise(r => setTimeout(r, 650));

    const flower = {
      id:    Date.now(),
      type:  FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)],
      stage: 0,
      date:  new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short" }),
    };

    const grown   = garden.map(f => ({ ...f, stage: Math.min(f.stage+1, GROWTH_STAGES.length-1) }));
    const updated = [...grown, flower];
    const newStreak = streak + 1;

    setGarden(updated);
    setNewId(flower.id);
    setWatered(true);
    setLastVisit(todayKey);
    setStreak(newStreak);

    const newBlooms = grown.filter(f =>
      f.stage === GROWTH_STAGES.length - 1 &&
      garden.find(g => g.id === f.id && g.stage === GROWTH_STAGES.length - 2)
    );
    if (newBlooms.length > 0) {
      setShowPetals(true);
      setTimeout(() => setShowPetals(false), 3200);
    }

    spawnConfetti();

    await Promise.all([
      dbSet("fg_garden",    updated),
      dbSet("fg_lastvisit", todayKey),
      dbSet("fg_streak",    newStreak),
    ]);

    setTimeout(() => setNewId(null), 3500);
  };

  const spawnConfetti = () => {
    if (!confRef.current) return;
    const cs = ["🌸","🌺","🌷","🌼","💕","✨","🌻","💗"];
    for (let i = 0; i < 22; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position:fixed;top:-20px;left:${Math.random()*100}%;
        font-size:${14+Math.random()*16}px;pointer-events:none;z-index:99;
        animation:fg-float ${2+Math.random()*2}s ${Math.random()*0.5}s ease-out forwards;
      `;
      el.textContent = cs[Math.floor(Math.random()*cs.length)];
      confRef.current.appendChild(el);
      setTimeout(() => el.remove(), 4800);
    }
  };

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"8px 4px 100px", position:"relative" }}>
      <div ref={confRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:98, overflow:"hidden" }}/>
      <WaterDrops  active={showDrops}  />
      <PetalBurst  active={showPetals} />

      {/* ── Header ── */}
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        style={{ textAlign:"center", marginBottom:24 }}>

        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"5px 18px",
          background:"rgba(236,72,153,0.08)",
          border:"1px solid rgba(236,72,153,0.2)",
          borderRadius:50, marginBottom:12,
          fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700,
          color:"#ec4899", letterSpacing:"1.5px", textTransform:"uppercase",
        }}>
          🌸 Our Love Garden
        </div>

        <h1 style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:"2.5rem", fontWeight:600, fontStyle:"italic",
          color:"#fff", margin:"0 0 8px",
          textShadow:"0 0 40px rgba(236,72,153,0.25)",
        }}>
          Flower Garden 🌺
        </h1>

        <AnimatePresence mode="wait">
          <motion.p key={msgIdx}
            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration:0.35 }}
            style={{
              fontFamily:"'Inter',sans-serif", fontSize:"0.86rem",
              color:"rgba(255,255,255,0.42)", margin:0, fontStyle:"italic",
            }}>
            "{LOVE_MSGS[msgIdx]}"
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {[
          { label:"Planted",  value:garden.length,         color:"#ec4899", icon:"🌱" },
          { label:"Bloomed",  value:bloomed,               color:"#8B5CF6", icon:"🌸" },
          { label:"Growing",  value:garden.length-bloomed, color:"#10B981", icon:"🌿" },
          { label:"Streak",   value:`${streak}d`,          color:"#f59e0b", icon:"🔥" },
        ].map((s,i) => (
          <motion.div key={i}
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.15+i*0.06, type:"spring" }}
            style={{
              padding:"14px 6px", textAlign:"center",
              background:"rgba(255,255,255,0.05)",
              border:`1.5px solid ${s.color}22`,
              borderRadius:16, backdropFilter:"blur(8px)",
            }}>
            <div style={{ fontSize:"1.2rem", marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.35rem", fontWeight:800, color:s.color }}>
              {s.value}
            </div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.56rem", color:"rgba(255,255,255,0.32)", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Progress bar ── */}
      {garden.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          style={{
            marginBottom:20, padding:"16px 20px",
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:16,
          }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"1px" }}>
              Bloom Progress
            </span>
            <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.78rem", fontWeight:800, color:"#ec4899" }}>
              {pct}%
            </span>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden" }}>
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${pct}%` }}
              transition={{ duration:1.2, ease:"easeOut", delay:0.3 }}
              style={{
                height:"100%",
                background:"linear-gradient(90deg,#ec4899,#8B5CF6,#f59e0b)",
                borderRadius:4,
                boxShadow:"0 0 10px rgba(236,72,153,0.5)",
              }}
            />
          </div>
          <div style={{ display:"flex", gap:3, marginTop:10, justifyContent:"center" }}>
            {[...Array(10)].map((_,i) => (
              <motion.span key={i}
                initial={{ scale:0 }} animate={{ scale:1 }}
                transition={{ delay:0.4+i*0.05 }}
                style={{ fontSize:"0.9rem", opacity:pct>=(i+1)*10?1:0.15, transition:"opacity 0.4s" }}>
                {pct>=(i+1)*10?"❤️":"🤍"}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Water Button ── */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <AnimatePresence mode="wait">
          {alreadyWatered || watered ? (
            <motion.div key="done"
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:10,
                padding:"16px 28px",
                background:"rgba(16,185,129,0.1)",
                border:"1.5px solid rgba(16,185,129,0.3)",
                borderRadius:50, color:"#10B981",
                fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:600,
              }}>
              ✅ {watered ? "Garden watered! New flower planted 🌸" : "Come back tomorrow 💕"}
            </motion.div>
          ) : (
            <motion.button key="btn"
              whileHover={{ scale:1.05, y:-4 }}
              whileTap={{ scale:0.96 }}
              onClick={water}
              style={{
                display:"inline-flex", alignItems:"center", gap:12,
                padding:"18px 44px",
                background:"linear-gradient(135deg,#3b82f6,#10B981)",
                border:"none", borderRadius:50, color:"#fff",
                fontFamily:"'Manrope',sans-serif", fontSize:"1.05rem", fontWeight:800,
                cursor:"pointer",
                boxShadow:"0 12px 36px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
                letterSpacing:"-0.2px",
              }}>
              💧 Water the Garden Today
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── View toggle ── */}
      {garden.length > 0 && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:20 }}>
          {["garden","collection"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding:"8px 20px", borderRadius:50, border:"none",
                background: view===v ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${view===v?"rgba(236,72,153,0.4)":"rgba(255,255,255,0.1)"}`,
                color: view===v ? "#ec4899" : "rgba(255,255,255,0.5)",
                fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", fontWeight:600,
                cursor:"pointer", transition:"all 0.2s",
              }}>
              {v === "garden" ? "🌿 Garden Bed" : "🌸 Collection"}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:14, animation:"fg-spin 1.5s linear infinite", display:"inline-block" }}>🌸</div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading your garden…</p>
        </div>
      ) : garden.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{
            textAlign:"center", padding:"52px 24px",
            background:"rgba(255,255,255,0.03)",
            border:"1.5px dashed rgba(236,72,153,0.2)",
            borderRadius:24,
          }}>
          <div style={{ fontSize:"3.5rem", marginBottom:16 }}>🌱</div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", fontStyle:"italic", color:"rgba(255,255,255,0.5)", margin:"0 0 10px" }}>
            Press the button to plant your first flower!
          </p>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.3)", margin:0 }}>
            Visit every day to grow a beautiful garden 🌸
          </p>
        </motion.div>
      ) : view === "garden" ? (
        <GardenBed flowers={garden} />
      ) : (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
          <p style={{
            fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700,
            color:"rgba(255,255,255,0.32)", textTransform:"uppercase",
            letterSpacing:"1.5px", textAlign:"center", marginBottom:14,
          }}>
            {garden.length} flower{garden.length!==1?"s":""} planted
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))", gap:10 }}>
            <AnimatePresence>
              {[...garden].reverse().map((f,i) => (
                <FlowerCard key={f.id} flower={f} index={i} isNew={newId===f.id} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ── Milestones ── */}
      {garden.length > 0 && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          style={{ marginTop:28 }}>
          <p style={{
            fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700,
            color:"rgba(255,255,255,0.32)", textTransform:"uppercase",
            letterSpacing:"1.5px", textAlign:"center", marginBottom:14,
          }}>
            Milestones
          </p>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6 }}>
            {MILESTONES.map((m,i) => {
              const done = garden.length >= m.n;
              return (
                <motion.div key={i}
                  initial={{ opacity:0, scale:0.8 }}
                  animate={{ opacity: done?1:0.38, scale:1 }}
                  transition={{ delay:0.4+i*0.06 }}
                  style={{
                    flexShrink:0, minWidth:80, padding:"12px 8px",
                    textAlign:"center",
                    background: done?"rgba(236,72,153,0.1)":"rgba(255,255,255,0.03)",
                    border:`1.5px solid ${done?"rgba(236,72,153,0.35)":"rgba(255,255,255,0.07)"}`,
                    borderRadius:14, transition:"all 0.4s",
                  }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:5, filter:done?"none":"grayscale(1)" }}>{m.e}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.57rem", fontWeight:700, color:done?"#ec4899":"rgba(255,255,255,0.3)", lineHeight:1.3 }}>{m.label}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.53rem", color:"rgba(255,255,255,0.2)", marginTop:3 }}>{m.n} flowers</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Footer quote ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
        style={{
          marginTop:28, textAlign:"center", padding:"24px",
          background:"linear-gradient(135deg,rgba(236,72,153,0.07),rgba(139,92,246,0.05))",
          border:"1px solid rgba(236,72,153,0.12)",
          borderRadius:20,
        }}>
        <p style={{
          fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem",
          fontStyle:"italic", color:"rgba(255,255,255,0.52)",
          margin:"0 0 8px", lineHeight:1.6,
        }}>
          "Every day you water this garden, you're telling me you choose us 💙"
        </p>
        <p style={{
          fontFamily:"'Manrope',sans-serif", fontSize:"0.88rem",
          fontWeight:700, color:"rgba(255,255,255,0.68)", margin:0,
        }}>
          — Surya &amp; Sadhana 💍
        </p>
      </motion.div>
    </div>
  );
}
