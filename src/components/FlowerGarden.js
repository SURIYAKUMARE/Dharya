import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

/* ── constants ── */
const FLOWER_TYPES  = ["🌸","🌺","🌻","🌹","🌷","🌼","🪷","💐","🌸","🌺"];
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
  { n:1,   e:"🌱", label:"First Flower" },
  { n:7,   e:"🌿", label:"One Week"     },
  { n:14,  e:"🪴", label:"Fortnight"    },
  { n:30,  e:"🌸", label:"One Month"    },
  { n:50,  e:"🌺", label:"50 Flowers"   },
  { n:100, e:"💐", label:"100 Days"     },
];

/* ── inject CSS keyframes ── */
function injectStyles() {
  if (document.getElementById("fg2-styles")) return;
  const s = document.createElement("style");
  s.id = "fg2-styles";
  s.textContent = `
    @keyframes fg2-sway      { 0%,100%{transform:rotate(-5deg) translateY(0)} 50%{transform:rotate(5deg) translateY(-6px)} }
    @keyframes fg2-swayFast  { 0%,100%{transform:rotate(-8deg) translateY(0)} 50%{transform:rotate(8deg) translateY(-8px)} }
    @keyframes fg2-float     { 0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1} 100%{transform:translateY(-140px) rotate(360deg) scale(0.1);opacity:0} }
    @keyframes fg2-petalDrift{ 0%{transform:translateY(-20px) rotate(0deg) translateX(0);opacity:0.9}
                                50%{transform:translateY(50vh) rotate(180deg) translateX(30px);opacity:0.7}
                                100%{transform:translateY(100vh) rotate(360deg) translateX(-20px);opacity:0} }
    @keyframes fg2-drop      { 0%{transform:translateY(-40px) scaleY(1.3);opacity:1} 100%{transform:translateY(90px) scaleY(0.8);opacity:0} }
    @keyframes fg2-shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes fg2-spin      { to{transform:rotate(360deg)} }
    @keyframes fg2-pop       { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.25) rotate(6deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
    @keyframes fg2-twinkle   { 0%,100%{opacity:0.15;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
    @keyframes fg2-cloud     { 0%{transform:translateX(0)} 100%{transform:translateX(22px)} }
    @keyframes fg2-fly       { 0%,100%{transform:translateY(0) rotate(-8deg) scaleX(1)} 50%{transform:translateY(-12px) rotate(8deg) scaleX(-1)} }
    @keyframes fg2-firefly   { 0%,100%{opacity:0.2;transform:translate(0,0) scale(0.8)} 50%{opacity:1;transform:translate(8px,-10px) scale(1.3)} }
    @keyframes fg2-sunRays   { 0%,100%{opacity:0.35;transform:rotate(0deg) scale(1)} 50%{opacity:0.65;transform:rotate(8deg) scale(1.06)} }
    @keyframes fg2-windLine  { 0%{transform:translateX(-120%) skewX(-15deg);opacity:0} 40%{opacity:0.18} 100%{transform:translateX(120vw) skewX(-15deg);opacity:0} }
    @keyframes fg2-bloomPop  { 0%{transform:scale(0.1) rotate(-30deg);opacity:0;filter:blur(6px)} 70%{transform:scale(1.3) rotate(5deg);opacity:1;filter:blur(0)} 100%{transform:scale(1) rotate(0deg);opacity:1;filter:blur(0)} }
    @keyframes fg2-pulse     { 0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,0.4)} 50%{box-shadow:0 0 0 18px rgba(236,72,153,0)} }
    @keyframes fg2-soilWave  { 0%,100%{transform:scaleX(1) translateY(0)} 50%{transform:scaleX(1.02) translateY(-3px)} }
    @keyframes fg2-newBadge  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    @keyframes fg2-ripple    { 0%{transform:scale(0.3);opacity:1} 100%{transform:scale(3.5);opacity:0} }
    @keyframes fg2-dawnGlow  { 0%,100%{opacity:0.4} 50%{opacity:0.75} }
    @keyframes fg2-waveGrass { 0%,100%{transform:skewX(-2deg) scaleY(1)} 50%{transform:skewX(3deg) scaleY(1.04)} }
  `;
  document.head.appendChild(s);
}

/* ── animated water drops ── */
function WaterDrops({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:60, overflow:"hidden" }}>
      {[...Array(18)].map((_,i) => (
        <span key={i} style={{
          position:"absolute", top:"12%",
          left:`${3 + i * 5.5}%`,
          fontSize:`${13 + (i % 3) * 6}px`,
          animation:`fg2-drop ${0.55 + i * 0.07}s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.055}s both`,
        }}>💧</span>
      ))}
      {/* ripple rings on ground */}
      {[...Array(5)].map((_,i) => (
        <div key={`r${i}`} style={{
          position:"absolute", bottom:"22%",
          left:`${12 + i * 18}%`,
          width:28, height:12,
          border:"1.5px solid rgba(96,165,250,0.55)",
          borderRadius:"50%",
          animation:`fg2-ripple 1s ease-out ${0.6 + i * 0.12}s both`,
        }}/>
      ))}
    </div>
  );
}

/* ── petal burst on new bloom ── */
function PetalBurst({ active }) {
  if (!active) return null;
  const petals = ["🌸","🌺","🌷","🌼","🪷","💮","🌸","🌺","✨","💕","🌸","🌺","🌷","💗"];
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:55, overflow:"hidden" }}>
      {petals.map((p, i) => (
        <span key={i} style={{
          position:"absolute", top:"-10px",
          left:`${3 + i * 7}%`,
          fontSize:`${14 + (i % 4) * 7}px`,
          animation:`fg2-petalDrift ${3 + i * 0.28}s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.08}s forwards`,
        }}>{p}</span>
      ))}
    </div>
  );
}

/* ── animated sky canvas: stars + shooting stars + aurora ── */
function SkyCanvas({ isDay }) {
  const cvRef  = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const ctx = cv.getContext("2d");
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.4 + Math.random() * 1.6,
      ph: Math.random() * Math.PI * 2,
      sp: 0.3 + Math.random() * 1.2,
    }));
    const shots = [];
    const spawnShot = () => shots.push({
      x: Math.random() * cv.width * 0.7,
      y: Math.random() * cv.height * 0.4,
      vx: 8 + Math.random() * 10,
      vy: 3 + Math.random() * 5,
      len: 100 + Math.random() * 140,
      life: 1, decay: 0.018 + Math.random() * 0.012,
    });
    spawnShot();
    const timer = setInterval(spawnShot, 2200);

    const tick = () => {
      const { width: cw, height: ch } = cv;
      ctx.clearRect(0, 0, cw, ch);
      const t = Date.now() / 1000;
      const starAlpha = isDay ? 0.0 : 1.0;

      stars.forEach(s => {
        const a = starAlpha * (0.2 + 0.8 * Math.abs(Math.sin(t * s.sp + s.ph)));
        if (a < 0.01) return;
        ctx.beginPath();
        ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
        ctx.fill();
      });

      if (!isDay) {
        for (let i = shots.length - 1; i >= 0; i--) {
          const s = shots[i];
          s.x += s.vx; s.y += s.vy; s.life -= s.decay;
          if (s.life <= 0 || s.x > cw + 200) { shots.splice(i, 1); continue; }
          const tx = s.x - s.vx * (s.len / Math.max(Math.abs(s.vx), 1));
          const ty = s.y - s.vy * (s.len / Math.max(Math.abs(s.vx), 1));
          const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
          g.addColorStop(0, "transparent");
          g.addColorStop(0.6, "rgba(255,200,255,0.5)");
          g.addColorStop(1, "rgba(255,255,255,0.9)");
          ctx.save();
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.strokeStyle = g; ctx.lineWidth = 1.5;
          ctx.shadowColor = "#ff99cc"; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y); ctx.stroke();
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#fff"; ctx.fill();
          ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(timer); ro.disconnect(); };
  }, [isDay]);

  return (
    <canvas ref={cvRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />
  );
}

/* ── animated wind streaks ── */
function WindLines({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:3 }}>
      {[...Array(6)].map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          top:`${18 + i * 12}%`,
          left:0,
          width:`${120 + i * 40}px`,
          height:`${1 + (i % 2)}px`,
          background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)",
          borderRadius:2,
          animation:`fg2-windLine ${1.4 + i * 0.35}s linear ${i * 0.18}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ── single animated flower in the scene ── */
function SceneFlower({ flower, index, windSpeed }) {
  const bloomed  = flower.stage >= GROWTH_STAGES.length - 1;
  const stage    = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length - 1)];
  const emoji    = bloomed ? flower.type : stage.emoji;
  const size     = 18 + (index % 4) * 7 + flower.stage * 5;
  const swayAnim = windSpeed > 1
    ? `fg2-swayFast ${1.4 + (index % 3) * 0.4}s ease-in-out ${index * 0.12}s infinite`
    : bloomed
      ? `fg2-sway ${2.2 + (index % 3) * 0.55}s ease-in-out ${index * 0.18}s infinite`
      : "none";
  const stemH = 8 + flower.stage * 6;

  return (
    <motion.div
      layout
      initial={{ scale:0, y:30, opacity:0 }}
      animate={{ scale:1, y:0, opacity:1 }}
      exit={{ scale:0, opacity:0 }}
      transition={{ type:"spring", stiffness:260, damping:18, delay: index * 0.04 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", cursor:"default" }}
    >
      <span style={{
        fontSize: size,
        display: "inline-block",
        transformOrigin: "bottom center",
        animation: swayAnim,
        filter: bloomed ? "drop-shadow(0 2px 10px rgba(236,72,153,0.7))" : "none",
        transition: "font-size 0.5s ease",
      }}>{emoji}</span>
      <div style={{
        width: 2,
        height: stemH,
        background: "linear-gradient(180deg,#4ade80,#16a34a,#15803d)",
        borderRadius: 2,
        opacity: 0.85,
      }}/>
    </motion.div>
  );
}

/* ── collection card view ── */
function FlowerCard({ flower, index, isNew }) {
  const stage   = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length - 1)];
  const bloomed = flower.stage >= GROWTH_STAGES.length - 1;
  const emoji   = bloomed ? flower.type : stage.emoji;
  return (
    <motion.div layout
      initial={{ scale:0, opacity:0, y:20 }}
      animate={{ scale:1, opacity:1, y:0 }}
      exit={{ scale:0, opacity:0 }}
      transition={{ type:"spring", stiffness:280, damping:20, delay: index * 0.03 }}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:6,
        padding:"14px 10px 12px",
        background: bloomed
          ? "linear-gradient(135deg,rgba(236,72,153,0.15),rgba(139,92,246,0.09))"
          : "rgba(255,255,255,0.05)",
        border:`1.5px solid ${bloomed?"rgba(236,72,153,0.45)":"rgba(255,255,255,0.09)"}`,
        borderRadius:18, backdropFilter:"blur(10px)", position:"relative", overflow:"hidden",
        boxShadow: bloomed ? "0 6px 28px rgba(236,72,153,0.22)" : "0 4px 12px rgba(0,0,0,0.15)",
      }}>
      {bloomed && (
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.07) 50%,transparent 62%)", backgroundSize:"200% 100%", animation:"fg2-shimmer 3.5s linear infinite", borderRadius:18, pointerEvents:"none" }}/>
      )}
      {isNew && (
        <span style={{ position:"absolute", top:5, right:5, fontSize:"0.48rem", fontWeight:800, background:"#ec4899", color:"#fff", padding:"2px 6px", borderRadius:50, textTransform:"uppercase", animation:"fg2-newBadge 1s ease-in-out infinite" }}>NEW</span>
      )}
      <span style={{
        fontSize: bloomed ? "2.3rem" : "1.9rem", lineHeight:1, display:"inline-block",
        animation: bloomed ? `fg2-sway ${2.2+(index%3)*0.6}s ease-in-out infinite` : "none",
        transformOrigin:"bottom center",
        filter: bloomed ? "drop-shadow(0 2px 10px rgba(236,72,153,0.55))" : "none",
      }}>{emoji}</span>
      <span style={{ fontSize:"0.58rem", fontWeight:700, fontFamily:"'Inter',sans-serif", color:bloomed?"#ec4899":"#10B981", background:bloomed?"rgba(236,72,153,0.15)":"rgba(16,185,129,0.15)", padding:"2px 8px", borderRadius:50, border:`1px solid ${bloomed?"rgba(236,72,153,0.3)":"rgba(16,185,129,0.3)"}` }}>{stage.label}</span>
      <span style={{ fontSize:"0.57rem", color:"rgba(255,255,255,0.28)", fontFamily:"'Inter',sans-serif" }}>{flower.date}</span>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
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
  const [view,       setView]       = useState("garden");
  const [windActive, setWindActive] = useState(false);
  const [bloomingId, setBloomingId] = useState(null);
  const [timeOfDay,  setTimeOfDay]  = useState("night");
  const confRef = useRef(null);

  injectStyles();

  /* determine time of day for sky */
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      if (h >= 6  && h < 12) setTimeOfDay("morning");
      else if (h >= 12 && h < 17) setTimeOfDay("day");
      else if (h >= 17 && h < 20) setTimeOfDay("evening");
      else setTimeOfDay("night");
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  /* random wind gusts */
  useEffect(() => {
    const gust = () => {
      setWindActive(true);
      setTimeout(() => setWindActive(false), 2200);
    };
    const id = setInterval(gust, 7000 + Math.random() * 5000);
    return () => clearInterval(id);
  }, []);

  const todayKey       = new Date().toDateString();
  const alreadyWatered = lastVisit === todayKey;
  const bloomed        = garden.filter(f => f.stage >= GROWTH_STAGES.length - 1).length;
  const pct            = garden.length ? Math.round((bloomed / garden.length) * 100) : 0;

  const isDay = timeOfDay === "morning" || timeOfDay === "day";

  const skyGradient = {
    morning: "linear-gradient(180deg,#1a0533 0%,#6b2d8b 30%,#f97316 65%,#fbbf24 100%)",
    day:     "linear-gradient(180deg,#0369a1 0%,#0ea5e9 40%,#38bdf8 75%,#7dd3fc 100%)",
    evening: "linear-gradient(180deg,#0c0a1e 0%,#7c3aed 30%,#ec4899 65%,#f97316 100%)",
    night:   "linear-gradient(180deg,#020614 0%,#060d2e 35%,#0e1545 65%,#1a1260 100%)",
  };

  useEffect(() => {
    Promise.all([dbGet("fg_garden",[]), dbGet("fg_lastvisit",""), dbGet("fg_streak",0)])
      .then(([g, v, s]) => {
        if (Array.isArray(g)) setGarden(g);
        if (v) setLastVisit(v);
        if (typeof s === "number") setStreak(s);
        setLoading(false);
      });
    const id = setInterval(() => setMsgIdx(i => (i + 1) % LOVE_MSGS.length), 4200);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  /* stable randomised sky elements */
  const skyStars  = useRef([...Array(60)].map(() => ({
    top: `${2  + Math.random()*72}%`, left:`${Math.random()*98}%`,
    size: 1.2 + Math.random()*2.2,
    dur:  1.6 + Math.random()*3.5, delay: Math.random()*6,
  }))).current;

  const fireflies = useRef([...Array(14)].map(() => ({
    top:  `${30 + Math.random()*52}%`, left:`${5 + Math.random()*88}%`,
    dur:  2.8 + Math.random()*4, delay: Math.random()*4,
  }))).current;

  const clouds = useRef([
    { l:"4%",  t:"12%", s:1.05, dur:9  },
    { l:"36%", t:"6%",  s:0.72, dur:12 },
    { l:"62%", t:"18%", s:0.58, dur:8  },
    { l:"80%", t:"9%",  s:0.85, dur:14 },
  ]).current;

  /* confetti burst */
  const spawnConfetti = useCallback(() => {
    if (!confRef.current) return;
    const cs = ["🌸","🌺","🌷","🌼","💕","✨","🌻","💗","🪷","🌸"];
    for (let i = 0; i < 28; i++) {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:-20px;left:${Math.random()*100}%;font-size:${12+Math.random()*18}px;pointer-events:none;z-index:99;animation:fg2-float ${2+Math.random()*2.5}s ${Math.random()*0.6}s ease-out forwards;`;
      el.textContent = cs[Math.floor(Math.random() * cs.length)];
      confRef.current.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  }, []);

  /* water / plant */
  const water = async () => {
    if (alreadyWatered || watered) return;
    setShowDrops(true);
    setTimeout(() => setShowDrops(false), 1400);
    await new Promise(r => setTimeout(r, 700));

    const flower = {
      id:    Date.now(),
      type:  FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)],
      stage: 0,
      date:  new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short" }),
    };

    const grown   = garden.map(f => ({ ...f, stage: Math.min(f.stage + 1, GROWTH_STAGES.length - 1) }));
    const updated = [...grown, flower];
    const newStreak = streak + 1;

    /* find newly bloomed flowers for petal burst */
    const newBlooms = grown.filter(f =>
      f.stage === GROWTH_STAGES.length - 1 &&
      garden.find(g => g.id === f.id && g.stage === GROWTH_STAGES.length - 2)
    );

    setGarden(updated);
    setNewId(flower.id);
    setWatered(true);
    setLastVisit(todayKey);
    setStreak(newStreak);

    if (newBlooms.length > 0) {
      setBloomingId(newBlooms[0].id);
      setShowPetals(true);
      setTimeout(() => { setShowPetals(false); setBloomingId(null); }, 3500);
    }

    spawnConfetti();

    await Promise.all([
      dbSet("fg_garden",    updated),
      dbSet("fg_lastvisit", todayKey),
      dbSet("fg_streak",    newStreak),
    ]);
    setTimeout(() => setNewId(null), 3500);
  };

  /* ── RENDER ── */
  return (
    <div style={{ maxWidth:740, margin:"0 auto", padding:"0 4px 100px", position:"relative" }}>
      <div ref={confRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:98, overflow:"hidden" }}/>
      <WaterDrops  active={showDrops}  />
      <PetalBurst  active={showPetals} />

      {/* ════════════════ GARDEN SCENE ════════════════ */}
      <motion.div
        initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.75 }}
        style={{ borderRadius:28, overflow:"hidden", marginBottom:24,
          boxShadow:"0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)" }}
      >

        {/* ── SKY ── */}
        <div style={{
          background: skyGradient[timeOfDay],
          padding:"28px 22px 0",
          position:"relative", minHeight:230, overflow:"hidden",
          transition:"background 3s ease",
        }}>
          <SkyCanvas isDay={isDay}/>

          {/* twinkling stars (night/evening only) */}
          {!isDay && skyStars.map((st,i) => (
            <div key={i} style={{
              position:"absolute", top:st.top, left:st.left,
              width:st.size, height:st.size,
              background:"#fff", borderRadius:"50%",
              animation:`fg2-twinkle ${st.dur}s ease-in-out ${st.delay}s infinite`,
              pointerEvents:"none",
            }}/>
          ))}

          {/* sun (day/morning) */}
          {isDay && (
            <div style={{
              position:"absolute", top:14, right:32,
              width:54, height:54, borderRadius:"50%",
              background:"linear-gradient(135deg,#fff7a1,#fde68a,#fbbf24)",
              boxShadow:"0 0 30px 12px rgba(251,191,36,0.45), 0 0 70px 32px rgba(251,191,36,0.18)",
              animation:"fg2-sunRays 4s ease-in-out infinite",
            }}>
              <div style={{
                position:"absolute", inset:-16,
                background:"radial-gradient(circle,rgba(251,191,36,0.25) 0%,transparent 68%)",
                borderRadius:"50%",
              }}/>
            </div>
          )}

          {/* moon (night) */}
          {timeOfDay === "night" && (
            <div style={{
              position:"absolute", top:14, right:32,
              width:52, height:52, borderRadius:"50%",
              background:"linear-gradient(135deg,#fffde0,#ffe87a,#f5c518)",
              boxShadow:"0 0 28px 10px rgba(255,215,0,0.22), 0 0 60px 28px rgba(255,200,0,0.09)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem",
            }}>🌙</div>
          )}

          {/* aurora glow (evening) */}
          {timeOfDay === "evening" && (
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:"60%",
              background:"linear-gradient(180deg,rgba(139,92,246,0.25),rgba(236,72,153,0.15),transparent)",
              pointerEvents:"none", animation:"fg2-dawnGlow 4s ease-in-out infinite",
            }}/>
          )}

          {/* clouds */}
          {clouds.map((c,i) => (
            <div key={i} style={{
              position:"absolute", top:c.t, left:c.l,
              fontSize:`${28*c.s}px`, opacity: isDay ? 0.75 : 0.14,
              animation:`fg2-cloud ${c.dur}s ease-in-out ${i*1.8}s infinite alternate`,
              filter:"blur(0.5px)", transition:"opacity 3s ease",
            }}>☁️</div>
          ))}

          {/* fireflies (night/evening) */}
          {!isDay && fireflies.map((f,i) => (
            <div key={i} style={{
              position:"absolute", top:f.top, left:f.left,
              width:5, height:5, borderRadius:"50%",
              background:"#ffe066",
              boxShadow:"0 0 8px 4px rgba(255,215,0,0.6)",
              animation:`fg2-firefly ${f.dur}s ease-in-out ${f.delay}s infinite`,
            }}/>
          ))}

          {/* butterflies */}
          {[{l:"18%",t:"62%",d:0},{l:"68%",t:"52%",d:1.4}].map((b,i) => (
            <div key={i} style={{
              position:"absolute", top:b.t, left:b.l,
              fontSize:"19px", opacity:0.75,
              animation:`fg2-fly ${3+i}s ease-in-out ${b.d}s infinite`,
            }}>🦋</div>
          ))}

          {/* wind lines */}
          <WindLines active={windActive}/>

          {/* header */}
          <div style={{ textAlign:"center", paddingBottom:22, position:"relative", zIndex:4 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"4px 16px",
              background:"rgba(236,72,153,0.14)",
              border:"1px solid rgba(236,72,153,0.28)",
              borderRadius:50, marginBottom:10,
              fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700,
              color:"#ec4899", letterSpacing:"1.5px", textTransform:"uppercase",
            }}>🌸 Our Love Garden</div>

            <h1 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"2.4rem", fontWeight:600, fontStyle:"italic",
              color:"#fff", margin:"0 0 8px",
              textShadow:"0 0 40px rgba(236,72,153,0.4), 0 2px 12px rgba(0,0,0,0.5)",
            }}>Flower Garden 🌺</h1>

            <AnimatePresence mode="wait">
              <motion.p key={msgIdx}
                initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}
                transition={{ duration:0.35 }}
                style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.83rem", color:"rgba(255,255,255,0.48)", margin:0, fontStyle:"italic" }}>
                "{LOVE_MSGS[msgIdx]}"
              </motion.p>
            </AnimatePresence>

            {/* time-of-day badge */}
            <div style={{ marginTop:10, fontSize:"0.65rem", color:"rgba(255,255,255,0.3)", fontFamily:"'Inter',sans-serif" }}>
              {timeOfDay === "morning" && "🌅 Good morning"}
              {timeOfDay === "day"     && "☀️ Afternoon"}
              {timeOfDay === "evening" && "🌆 Evening"}
              {timeOfDay === "night"   && "🌙 Night time"}
            </div>
          </div>
        </div>

        {/* ── GARDEN FLOOR ── */}
        <div style={{
          position:"relative",
          background:"linear-gradient(180deg,#0d2209 0%,#0b1a06 55%,#071202 100%)",
          minHeight:180, overflow:"hidden",
        }}>
          {/* grass strip */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:22,
            background:"linear-gradient(180deg,#22c55e,#15803d)",
            opacity:0.7, animation:"fg2-waveGrass 4s ease-in-out infinite",
          }}/>

          {/* soil */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:32,
            background:"linear-gradient(180deg,#3d1c02,#261000)",
            animation:"fg2-soilWave 5s ease-in-out infinite",
          }}/>

          {/* pebbles */}
          {[12,28,44,60,76].map((l,i) => (
            <div key={i} style={{
              position:"absolute", bottom:26, left:`${l}%`,
              width:28+i%2*10, height:10, borderRadius:50,
              background:"rgba(210,190,160,0.2)",
              border:"1px solid rgba(255,255,255,0.06)",
            }}/>
          ))}

          {/* flowers */}
          <div style={{
            display:"flex", justifyContent:"center", alignItems:"flex-end",
            gap:8, padding:"20px 20px 46px", flexWrap:"wrap",
          }}>
            <AnimatePresence>
              {(garden.length === 0
                ? [{ id:0, type:"🌱", stage:0, date:"" }]
                : garden
              ).slice().reverse().slice(0,20).map((f, i) => (
                <SceneFlower
                  key={f.id}
                  flower={f}
                  index={i}
                  windSpeed={windActive ? 2 : 0}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* stats overlay */}
          <div style={{ position:"absolute", top:8, left:0, right:0, display:"flex", justifyContent:"center", gap:12 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.67rem", fontWeight:700, color:"#4ade80", background:"rgba(0,0,0,0.5)", padding:"3px 12px", borderRadius:50 }}>
              🌸 {bloomed} bloomed
            </span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.67rem", fontWeight:700, color:"rgba(255,255,255,0.45)", background:"rgba(0,0,0,0.5)", padding:"3px 12px", borderRadius:50 }}>
              🌱 {garden.length - bloomed} growing
            </span>
          </div>
        </div>
      </motion.div>

      {/* ════ STATS GRID ════ */}
      <motion.div
        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
        style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}
      >
        {[
          { label:"Planted",  value:garden.length,         color:"#ec4899", icon:"🌱" },
          { label:"Bloomed",  value:bloomed,               color:"#8B5CF6", icon:"🌸" },
          { label:"Growing",  value:garden.length-bloomed, color:"#10B981", icon:"🌿" },
          { label:"Streak",   value:`${streak}d`,          color:"#f59e0b", icon:"🔥" },
        ].map((s,i) => (
          <motion.div key={i}
            initial={{ opacity:0, scale:0.75 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.16+i*0.07, type:"spring", stiffness:220 }}
            style={{
              padding:"14px 6px", textAlign:"center",
              background:"rgba(255,255,255,0.05)",
              border:`1.5px solid ${s.color}25`,
              borderRadius:16, backdropFilter:"blur(8px)",
            }}
          >
            <div style={{ fontSize:"1.25rem", marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.35rem", fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.55rem", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ════ BLOOM PROGRESS ════ */}
      {garden.length > 0 && (
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }}
          style={{ marginBottom:20, padding:"16px 20px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16 }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.38)", textTransform:"uppercase", letterSpacing:"1px" }}>Bloom Progress</span>
            <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.78rem", fontWeight:800, color:"#ec4899" }}>{pct}%</span>
          </div>
          <div style={{ height:9, background:"rgba(255,255,255,0.07)", borderRadius:5, overflow:"hidden" }}>
            <motion.div
              initial={{ width:0 }} animate={{ width:`${pct}%` }}
              transition={{ duration:1.3, ease:"easeOut", delay:0.35 }}
              style={{ height:"100%", background:"linear-gradient(90deg,#ec4899,#8B5CF6,#f59e0b)", borderRadius:5, boxShadow:"0 0 12px rgba(236,72,153,0.55)" }}
            />
          </div>
          <div style={{ display:"flex", gap:3, marginTop:10, justifyContent:"center" }}>
            {[...Array(10)].map((_,i) => (
              <motion.span key={i}
                initial={{ scale:0 }} animate={{ scale:1 }}
                transition={{ delay:0.42+i*0.05 }}
                style={{ fontSize:"0.88rem", opacity: pct>=(i+1)*10 ? 1 : 0.14 }}
              >
                {pct >= (i+1)*10 ? "❤️" : "🤍"}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ════ WATER BUTTON ════ */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <AnimatePresence mode="wait">
          {alreadyWatered || watered ? (
            <motion.div key="done"
              initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:10,
                padding:"16px 30px",
                background:"rgba(16,185,129,0.1)",
                border:"1.5px solid rgba(16,185,129,0.32)",
                borderRadius:50, color:"#10B981",
                fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:600,
              }}
            >
              ✅ {watered ? "Garden watered! New flower planted 🌸" : "Come back tomorrow 💕"}
            </motion.div>
          ) : (
            <motion.button key="btn"
              whileHover={{ scale:1.06, y:-5 }}
              whileTap={{ scale:0.95 }}
              onClick={water}
              style={{
                display:"inline-flex", alignItems:"center", gap:12,
                padding:"18px 48px",
                background:"linear-gradient(135deg,#3b82f6,#10B981)",
                border:"none", borderRadius:50, color:"#fff",
                fontFamily:"'Manrope',sans-serif", fontSize:"1.05rem", fontWeight:800,
                cursor:"pointer",
                boxShadow:"0 12px 38px rgba(59,130,246,0.42)",
                animation:"fg2-pulse 2.5s ease-in-out 1s infinite",
                position:"relative", overflow:"hidden",
              }}
            >
              {/* shimmer sweep */}
              <div style={{
                position:"absolute", inset:0, borderRadius:50,
                background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.22) 50%,transparent 65%)",
                backgroundSize:"200% 100%",
                animation:"fg2-shimmer 2.2s linear infinite",
              }}/>
              <span style={{ position:"relative" }}>💧 Water the Garden Today</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ════ VIEW TOGGLE ════ */}
      {garden.length > 0 && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:20 }}>
          {["garden","collection"].map(v => (
            <motion.button key={v}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              onClick={() => setView(v)}
              style={{
                padding:"8px 22px", borderRadius:50,
                background: view===v ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.05)",
                border:`1.5px solid ${view===v?"rgba(236,72,153,0.45)":"rgba(255,255,255,0.1)"}`,
                color: view===v ? "#ec4899" : "rgba(255,255,255,0.45)",
                fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", fontWeight:600,
                cursor:"pointer", transition:"all 0.2s",
              }}
            >
              {v === "garden" ? "🌿 Garden Scene" : "🌸 Collection"}
            </motion.button>
          ))}
        </div>
      )}

      {/* ════ CONTENT AREA ════ */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.38)" }}>
          <div style={{ fontSize:"2.8rem", marginBottom:14, display:"inline-block", animation:"fg2-spin 1.4s linear infinite" }}>🌸</div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading your garden…</p>
        </div>

      ) : garden.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{
            textAlign:"center", padding:"52px 24px",
            background:"rgba(255,255,255,0.03)",
            border:"1.5px dashed rgba(236,72,153,0.22)",
            borderRadius:24,
          }}
        >
          <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:2, repeat:Infinity }}>
            <span style={{ fontSize:"3.5rem" }}>🌱</span>
          </motion.div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", fontStyle:"italic", color:"rgba(255,255,255,0.48)", margin:"16px 0 10px" }}>
            Press the button to plant your first flower!
          </p>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.28)", margin:0 }}>
            Visit every day to grow a beautiful garden 🌸
          </p>
        </motion.div>

      ) : view === "garden" ? (
        /* ── garden bed view ── */
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          style={{
            margin:"0 0 20px", padding:"20px 16px 14px",
            background:"linear-gradient(180deg,rgba(34,197,94,0.07),rgba(21,128,61,0.12))",
            border:"1px solid rgba(34,197,94,0.16)",
            borderRadius:20, position:"relative", overflow:"hidden",
          }}
        >
          {/* soil strip */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:22,
            background:"linear-gradient(180deg,#3d1c02,#2a1000)",
            animation:"fg2-soilWave 4.5s ease-in-out infinite",
            borderRadius:"0 0 20px 20px",
          }}/>
          <div style={{ position:"absolute", bottom:20, left:0, right:0, height:8, background:"linear-gradient(180deg,#16a34a,#15803d)", opacity:0.65 }}/>

          <p style={{
            fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700,
            color:"rgba(255,255,255,0.32)", textTransform:"uppercase", letterSpacing:"1.5px",
            textAlign:"center", margin:"0 0 12px",
          }}>🌿 Garden Bed</p>

          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:8, paddingBottom:30 }}>
            <AnimatePresence>
              {garden.slice().reverse().slice(0,22).map((f,i) => (
                <SceneFlower key={f.id} flower={f} index={i} windSpeed={windActive ? 2 : 0}/>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:18, marginTop:4 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"#4ade80" }}>🌸 {bloomed} bloomed</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"rgba(255,255,255,0.32)" }}>🌱 {garden.length-bloomed} growing</span>
          </div>
        </motion.div>

      ) : (
        /* ── collection grid view ── */
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
          <p style={{
            fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700,
            color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px",
            textAlign:"center", marginBottom:14,
          }}>
            {garden.length} flower{garden.length !== 1 ? "s" : ""} planted
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))", gap:10 }}>
            <AnimatePresence>
              {[...garden].reverse().map((f,i) => (
                <FlowerCard key={f.id} flower={f} index={i} isNew={newId === f.id}/>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ════ MILESTONES ════ */}
      {garden.length > 0 && (
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }}
          style={{ marginTop:28 }}
        >
          <p style={{
            fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700,
            color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px",
            textAlign:"center", marginBottom:14,
          }}>Milestones</p>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8 }}>
            {MILESTONES.map((m,i) => {
              const done = garden.length >= m.n;
              return (
                <motion.div key={i}
                  initial={{ opacity:0, scale:0.78 }}
                  animate={{ opacity: done ? 1 : 0.36, scale:1 }}
                  transition={{ delay:0.42+i*0.07, type:"spring" }}
                  style={{
                    flexShrink:0, minWidth:82, padding:"12px 8px",
                    textAlign:"center",
                    background: done ? "rgba(236,72,153,0.12)" : "rgba(255,255,255,0.03)",
                    border:`1.5px solid ${done?"rgba(236,72,153,0.38)":"rgba(255,255,255,0.07)"}`,
                    borderRadius:14,
                    boxShadow: done ? "0 4px 18px rgba(236,72,153,0.18)" : "none",
                  }}
                >
                  <div style={{
                    fontSize:"1.5rem", marginBottom:5,
                    filter: done ? "none" : "grayscale(1)",
                    animation: done ? "fg2-sway 3s ease-in-out infinite" : "none",
                    transformOrigin:"bottom center", display:"inline-block",
                  }}>{m.e}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.57rem", fontWeight:700, color: done ? "#ec4899" : "rgba(255,255,255,0.28)", lineHeight:1.3 }}>{m.label}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.52rem", color:"rgba(255,255,255,0.18)", marginTop:3 }}>{m.n} flowers</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ════ FOOTER QUOTE ════ */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.52 }}
        style={{
          marginTop:28, textAlign:"center", padding:"26px",
          background:"linear-gradient(135deg,rgba(236,72,153,0.08),rgba(139,92,246,0.05))",
          border:"1px solid rgba(236,72,153,0.14)",
          borderRadius:20, position:"relative", overflow:"hidden",
        }}
      >
        {/* shimmer */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.04) 50%,transparent 62%)",
          backgroundSize:"200% 100%",
          animation:"fg2-shimmer 5s linear infinite",
          pointerEvents:"none",
        }}/>
        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:"1.05rem", fontStyle:"italic",
          color:"rgba(255,255,255,0.5)", margin:"0 0 8px", lineHeight:1.7,
        }}>
          "Every day you water this garden, you're telling me you choose us 💙"
        </p>
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"rgba(255,255,255,0.65)", margin:0 }}>
          — Surya &amp; Sadhana 💍
        </p>
      </motion.div>

    </div>
  );
}
