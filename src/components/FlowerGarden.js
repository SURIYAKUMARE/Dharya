import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

/* ─── constants ─── */
const FLOWER_TYPES  = ["🌸","🌺","🌻","🌹","🌷","🌼","🪷","💐","🌸","🌺"];
const GROWTH_STAGES = [
  { emoji:"🌱", label:"Seedling",  size:22 },
  { emoji:"🌿", label:"Sprouting", size:28 },
  { emoji:"🪴", label:"Growing",   size:34 },
  { emoji:"🌸", label:"Blooming",  size:42 },
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

/* ─── CSS injection ─── */
function injectStyles() {
  if (document.getElementById("fg3-styles")) return;
  const s = document.createElement("style");
  s.id = "fg3-styles";
  s.textContent = `
    @keyframes fg3-sway       { 0%,100%{transform:rotate(-6deg) translateY(0)} 50%{transform:rotate(6deg) translateY(-7px)} }
    @keyframes fg3-swayFast   { 0%,100%{transform:rotate(-12deg) translateY(0)} 50%{transform:rotate(12deg) translateY(-10px)} }
    @keyframes fg3-grassBlade { 0%,100%{transform:rotate(-4deg) scaleY(1)} 50%{transform:rotate(5deg) scaleY(1.04)} }
    @keyframes fg3-float      { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(-160px) rotate(400deg);opacity:0} }
    @keyframes fg3-petalDrift { 0%{transform:translateY(-10px) translateX(0) rotate(0deg);opacity:1}
                                 40%{opacity:0.85;transform:translateY(40vh) translateX(25px) rotate(200deg)}
                                 100%{transform:translateY(105vh) translateX(-15px) rotate(420deg);opacity:0} }
    @keyframes fg3-drop       { 0%{transform:translateY(-50px) scaleY(1.4);opacity:1} 100%{transform:translateY(100px) scaleY(0.7);opacity:0} }
    @keyframes fg3-shimmer    { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes fg3-spin       { to{transform:rotate(360deg)} }
    @keyframes fg3-sparkle    { 0%,100%{transform:scale(0) rotate(0deg);opacity:0} 50%{transform:scale(1.4) rotate(180deg);opacity:1} }
    @keyframes fg3-twinkle    { 0%,100%{opacity:0.12;transform:scale(0.7)} 50%{opacity:1;transform:scale(1.3)} }
    @keyframes fg3-cloud      { 0%{transform:translateX(0)} 100%{transform:translateX(28px)} }
    @keyframes fg3-butterfly  { 0%,100%{transform:translateY(0) translateX(0) rotate(-5deg)} 33%{transform:translateY(-18px) translateX(12px) rotate(5deg)} 66%{transform:translateY(-8px) translateX(-8px) rotate(-3deg)} }
    @keyframes fg3-firefly    { 0%,100%{opacity:0.1;transform:translate(0,0) scale(0.7)} 50%{opacity:1;transform:translate(10px,-14px) scale(1.5)} }
    @keyframes fg3-sunGlow    { 0%,100%{box-shadow:0 0 35px 14px rgba(251,191,36,0.5),0 0 80px 36px rgba(251,191,36,0.2)} 50%{box-shadow:0 0 55px 22px rgba(251,191,36,0.7),0 0 110px 55px rgba(251,191,36,0.3)} }
    @keyframes fg3-windLine   { 0%{transform:translateX(-100%) skewX(-18deg);opacity:0} 45%{opacity:0.22} 100%{transform:translateX(120vw) skewX(-18deg);opacity:0} }
    @keyframes fg3-pulse      { 0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,0.5)} 50%{box-shadow:0 0 0 22px rgba(236,72,153,0)} }
    @keyframes fg3-ripple     { 0%{transform:scale(0.2);opacity:0.9} 100%{transform:scale(4);opacity:0} }
    @keyframes fg3-soilWave   { 0%,100%{transform:scaleX(1) translateY(0)} 50%{transform:scaleX(1.015) translateY(-2px)} }
    @keyframes fg3-newBadge   { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.22) rotate(3deg)} }
    @keyframes fg3-bloomGlow  { 0%,100%{filter:drop-shadow(0 0 6px rgba(236,72,153,0.6))} 50%{filter:drop-shadow(0 0 18px rgba(236,72,153,1)) drop-shadow(0 0 30px rgba(251,191,36,0.5))} }
    @keyframes fg3-dawnGlow   { 0%,100%{opacity:0.35} 50%{opacity:0.7} }
    @keyframes fg3-vineGrow   { 0%{stroke-dashoffset:500} 100%{stroke-dashoffset:0} }
    @keyframes fg3-rainbowBar { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
    @keyframes fg3-heartPop   { 0%{transform:scale(0) translateY(0);opacity:1} 100%{transform:scale(1.5) translateY(-60px);opacity:0} }
    @keyframes fg3-groundMist { 0%,100%{transform:translateX(0) scaleY(1);opacity:0.18} 50%{transform:translateX(12px) scaleY(1.08);opacity:0.28} }
  `;
  document.head.appendChild(s);
}

/* ─── water drops overlay ─── */
function WaterDrops({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:60, overflow:"hidden" }}>
      {[...Array(20)].map((_,i) => (
        <span key={i} style={{
          position:"absolute", top:"8%", left:`${2+i*5}%`,
          fontSize:`${12+(i%4)*5}px`,
          animation:`fg3-drop ${0.5+i*0.06}s cubic-bezier(0.25,0.46,0.45,0.94) ${i*0.05}s both`,
        }}>💧</span>
      ))}
      {[...Array(6)].map((_,i) => (
        <div key={`rip${i}`} style={{
          position:"absolute", bottom:"28%", left:`${8+i*16}%`,
          width:32, height:14, border:"2px solid rgba(96,165,250,0.6)",
          borderRadius:"50%",
          animation:`fg3-ripple 1.1s ease-out ${0.55+i*0.1}s both`,
        }}/>
      ))}
    </div>
  );
}

/* ─── petal rain on bloom ─── */
function PetalBurst({ active }) {
  if (!active) return null;
  const petals = ["🌸","🌺","🌷","🌼","🪷","💮","🌸","🌺","✨","💕","🌸","🌺","🌷","💗","🌸","🌺"];
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:55, overflow:"hidden" }}>
      {petals.map((p,i) => (
        <span key={i} style={{
          position:"absolute", top:"-10px", left:`${2+i*6.2}%`,
          fontSize:`${13+(i%5)*6}px`,
          animation:`fg3-petalDrift ${2.8+i*0.25}s cubic-bezier(0.25,0.46,0.45,0.94) ${i*0.07}s forwards`,
        }}>{p}</span>
      ))}
    </div>
  );
}

/* ─── animated sky canvas ─── */
function SkyCanvas({ isDay }) {
  const cvRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);
    const ctx = cv.getContext("2d");
    const stars = Array.from({ length:110 }, () => ({
      x:Math.random(), y:Math.random(),
      r:0.5+Math.random()*1.8,
      ph:Math.random()*Math.PI*2,
      sp:0.25+Math.random()*1.3,
    }));
    const shots = [];
    const spawnShot = () => shots.push({
      x:Math.random()*cv.width*0.8, y:Math.random()*cv.height*0.35,
      vx:9+Math.random()*12, vy:3+Math.random()*6,
      len:110+Math.random()*160,
      life:1, decay:0.016+Math.random()*0.014,
      gold: Math.random() < 0.3,
    });
    spawnShot();
    const timer = setInterval(spawnShot, 1800);
    const tick = () => {
      const { width:cw, height:ch } = cv;
      ctx.clearRect(0,0,cw,ch);
      const t = Date.now()/1000;
      if (!isDay) {
        stars.forEach(s => {
          const a = 0.18 + 0.82*Math.abs(Math.sin(t*s.sp+s.ph));
          ctx.beginPath();
          ctx.arc(s.x*cw, s.y*ch, s.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; ctx.fill();
        });
        for (let i = shots.length-1; i>=0; i--) {
          const s = shots[i];
          s.x+=s.vx; s.y+=s.vy; s.life-=s.decay;
          if (s.life<=0||s.x>cw+250) { shots.splice(i,1); continue; }
          const tx = s.x - s.vx*(s.len/Math.max(Math.abs(s.vx),1));
          const ty = s.y - s.vy*(s.len/Math.max(Math.abs(s.vx),1));
          const g = ctx.createLinearGradient(tx,ty,s.x,s.y);
          g.addColorStop(0,"transparent");
          g.addColorStop(0.55, s.gold?"rgba(255,200,80,0.5)":"rgba(200,180,255,0.5)");
          g.addColorStop(1,"rgba(255,255,255,0.95)");
          ctx.save(); ctx.globalAlpha=Math.max(0,s.life);
          ctx.strokeStyle=g; ctx.lineWidth=s.gold?2:1.5;
          ctx.shadowColor=s.gold?"#fbbf24":"#a78bfa"; ctx.shadowBlur=s.gold?16:10;
          ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(s.x,s.y); ctx.stroke();
          ctx.beginPath(); ctx.arc(s.x,s.y,s.gold?3.5:2.2,0,Math.PI*2);
          ctx.fillStyle="#fff"; ctx.shadowBlur=s.gold?24:14; ctx.fill();
          ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(timer); ro.disconnect(); };
  }, [isDay]);
  return <canvas ref={cvRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}/>;
}

/* ─── animated grass blades ─── */
function GrassBlade({ left, height, color, delay, wind }) {
  return (
    <div style={{
      position:"absolute", bottom:0, left,
      width:4, height,
      background:`linear-gradient(180deg,${color},#15803d)`,
      borderRadius:"4px 4px 0 0",
      transformOrigin:"bottom center",
      animation:`fg3-grassBlade ${wind?1.1:2.2}s ease-in-out ${delay}s infinite`,
    }}/>
  );
}

/* ─── decorative wooden fence ─── */
function WoodenFence() {
  const posts = 9;
  return (
    <div style={{ position:"absolute", bottom:26, left:0, right:0, height:52, pointerEvents:"none" }}>
      {/* horizontal rails */}
      <div style={{ position:"absolute", top:8, left:0, right:0, height:7, background:"linear-gradient(90deg,#7c3b12,#a0522d,#6b3310,#a0522d,#7c3b12)", borderRadius:3, boxShadow:"0 2px 6px rgba(0,0,0,0.5)", opacity:0.95 }}/>
      <div style={{ position:"absolute", top:30, left:0, right:0, height:6, background:"linear-gradient(90deg,#6b3310,#92461f,#6b3310,#92461f,#6b3310)", borderRadius:3, boxShadow:"0 2px 5px rgba(0,0,0,0.4)", opacity:0.9 }}/>
      {/* vertical posts */}
      {Array.from({ length:posts }, (_,i) => (
        <div key={i} style={{
          position:"absolute", bottom:0,
          left:`${(i/(posts-1))*94+3}%`,
          width:10, height:48,
          background:"linear-gradient(180deg,#a0522d,#7c3b12,#5a2d0c)",
          borderRadius:"4px 4px 0 0",
          boxShadow:"2px 0 5px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,200,150,0.15)",
          transform:"translateX(-50%)",
        }}>
          {/* post top spike */}
          <div style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderBottom:"10px solid #a0522d" }}/>
          {/* wood grain lines */}
          <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(180deg,rgba(255,255,255,0.04) 0px,rgba(255,255,255,0.04) 1px,transparent 1px,transparent 6px)", borderRadius:"4px 4px 0 0" }}/>
        </div>
      ))}
      {/* vine decoration on fence */}
      {[15,45,75].map((l,i) => (
        <div key={i} style={{ position:"absolute", top:-4, left:`${l}%`, fontSize:"14px", opacity:0.7, animation:`fg3-sway ${3+i*0.8}s ease-in-out ${i*0.5}s infinite`, transformOrigin:"bottom center" }}>🌿</div>
      ))}
    </div>
  );
}

/* ─── wind streaks ─── */
function WindLines({ active }) {
  if (!active) return null;
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:3 }}>
      {[...Array(8)].map((_,i) => (
        <div key={i} style={{
          position:"absolute", top:`${15+i*10}%`, left:0,
          width:`${100+i*50}px`, height:`${1+(i%2)}px`,
          background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",
          borderRadius:2,
          animation:`fg3-windLine ${1.2+i*0.3}s linear ${i*0.14}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─── sparkle dots around a bloomed flower ─── */
function Sparkles({ count = 5 }) {
  return (
    <>
      {[...Array(count)].map((_,i) => {
        const angle = (i/count)*360;
        const r = 26;
        const x = Math.cos((angle*Math.PI)/180)*r;
        const y = Math.sin((angle*Math.PI)/180)*r;
        return (
          <div key={i} style={{
            position:"absolute",
            left:`calc(50% + ${x}px)`, top:`calc(50% + ${y}px)`,
            width:6, height:6,
            background:"#fde68a",
            borderRadius:"50%",
            boxShadow:"0 0 6px 3px rgba(251,191,36,0.8)",
            animation:`fg3-sparkle ${1.5+i*0.3}s ease-in-out ${i*0.25}s infinite`,
          }}/>
        );
      })}
    </>
  );
}

/* ─── single flower in scene ─── */
function SceneFlower({ flower, index, wind }) {
  const bloomed = flower.stage >= GROWTH_STAGES.length - 1;
  const stage   = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length - 1)];
  const emoji   = bloomed ? flower.type : stage.emoji;
  const size    = stage.size + (index % 3) * 4;
  const stemH   = 10 + flower.stage * 8;
  const sway    = wind
    ? `fg3-swayFast ${1.0+(index%3)*0.35}s ease-in-out ${index*0.1}s infinite`
    : bloomed
      ? `fg3-sway ${2+index*0.2}s ease-in-out ${index*0.15}s infinite`
      : `fg3-grassBlade ${2.8+index*0.3}s ease-in-out ${index*0.2}s infinite`;

  return (
    <motion.div layout
      initial={{ scale:0, y:40, opacity:0 }}
      animate={{ scale:1, y:0, opacity:1 }}
      exit={{ scale:0, y:20, opacity:0 }}
      transition={{ type:"spring", stiffness:240, damping:16, delay:index*0.05 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}
    >
      {bloomed && <Sparkles count={4}/>}
      <span style={{
        fontSize:size, display:"inline-block",
        transformOrigin:"bottom center",
        animation: bloomed ? `fg3-bloomGlow 2.5s ease-in-out ${index*0.3}s infinite` : "none",
        ...(bloomed ? {} : { animation: sway }),
      }}>
        {/* apply sway via inline style for non-bloomed, bloomGlow for bloomed */}
        <span style={{
          display:"inline-block",
          transformOrigin:"bottom center",
          animation: sway,
        }}>{emoji}</span>
      </span>
      {/* stem */}
      <div style={{
        width:3, height:stemH,
        background:`linear-gradient(180deg,${bloomed?"#86efac":"#4ade80"},#15803d)`,
        borderRadius:2, opacity:0.9,
        boxShadow: bloomed ? "0 0 6px rgba(134,239,172,0.5)" : "none",
      }}/>
    </motion.div>
  );
}

/* ─── collection card ─── */
function FlowerCard({ flower, index, isNew }) {
  const stage   = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length-1)];
  const bloomed = flower.stage >= GROWTH_STAGES.length-1;
  const emoji   = bloomed ? flower.type : stage.emoji;
  return (
    <motion.div layout
      initial={{ scale:0, opacity:0, y:20 }}
      animate={{ scale:1, opacity:1, y:0 }}
      exit={{ scale:0, opacity:0 }}
      transition={{ type:"spring", stiffness:280, damping:20, delay:index*0.03 }}
      whileHover={{ scale:1.07, y:-4 }}
      style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:6,
        padding:"14px 10px 12px",
        background: bloomed
          ? "linear-gradient(135deg,rgba(236,72,153,0.18),rgba(139,92,246,0.1))"
          : "rgba(255,255,255,0.05)",
        border:`1.5px solid ${bloomed?"rgba(236,72,153,0.5)":"rgba(255,255,255,0.09)"}`,
        borderRadius:18, backdropFilter:"blur(10px)", position:"relative", overflow:"hidden",
        boxShadow: bloomed ? "0 8px 32px rgba(236,72,153,0.25)" : "0 4px 12px rgba(0,0,0,0.2)",
      }}>
      {bloomed && <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,0.08) 50%,transparent 64%)", backgroundSize:"200% 100%", animation:"fg3-shimmer 3s linear infinite", borderRadius:18, pointerEvents:"none" }}/>}
      {isNew && <span style={{ position:"absolute", top:5, right:5, fontSize:"0.47rem", fontWeight:800, background:"linear-gradient(90deg,#ec4899,#8b5cf6)", color:"#fff", padding:"2px 7px", borderRadius:50, textTransform:"uppercase", animation:"fg3-newBadge 1s ease-in-out infinite" }}>NEW</span>}
      <span style={{ fontSize:bloomed?"2.4rem":"1.9rem", lineHeight:1, display:"inline-block", animation:bloomed?`fg3-sway ${2+(index%3)*0.6}s ease-in-out infinite`:"none", transformOrigin:"bottom center", filter:bloomed?"drop-shadow(0 0 10px rgba(236,72,153,0.7))":"none" }}>{emoji}</span>
      <span style={{ fontSize:"0.58rem", fontWeight:700, fontFamily:"'Inter',sans-serif", color:bloomed?"#ec4899":"#10B981", background:bloomed?"rgba(236,72,153,0.15)":"rgba(16,185,129,0.15)", padding:"2px 8px", borderRadius:50, border:`1px solid ${bloomed?"rgba(236,72,153,0.35)":"rgba(16,185,129,0.3)"}` }}>{stage.label}</span>
      <span style={{ fontSize:"0.56rem", color:"rgba(255,255,255,0.28)", fontFamily:"'Inter',sans-serif" }}>{flower.date}</span>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
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
  const [wind,       setWind]       = useState(false);
  const [timeOfDay,  setTimeOfDay]  = useState("night");
  const confRef = useRef(null);
  injectStyles();

  /* sky time */
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      if      (h>=6  && h<12) setTimeOfDay("morning");
      else if (h>=12 && h<17) setTimeOfDay("day");
      else if (h>=17 && h<20) setTimeOfDay("evening");
      else                    setTimeOfDay("night");
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  /* random wind gusts */
  useEffect(() => {
    const gust = () => { setWind(true); setTimeout(()=>setWind(false), 2400); };
    gust(); // first gust on mount
    const id = setInterval(gust, 6000 + Math.random()*5000);
    return () => clearInterval(id);
  }, []);

  const todayKey       = new Date().toDateString();
  const alreadyWatered = lastVisit === todayKey;
  const bloomed        = garden.filter(f=>f.stage>=GROWTH_STAGES.length-1).length;
  const pct            = garden.length ? Math.round((bloomed/garden.length)*100) : 0;
  const isDay          = timeOfDay==="morning" || timeOfDay==="day";

  const skyGradient = {
    morning: "linear-gradient(180deg,#2d0a4e 0%,#7c3aed 28%,#f97316 62%,#fbbf24 100%)",
    day:     "linear-gradient(180deg,#075985 0%,#0ea5e9 38%,#38bdf8 72%,#bae6fd 100%)",
    evening: "linear-gradient(180deg,#0c0a1e 0%,#6d28d9 28%,#ec4899 60%,#fb923c 100%)",
    night:   "linear-gradient(180deg,#020614 0%,#060d2e 35%,#0e1545 65%,#1a1260 100%)",
  };

  /* stable sky elements */
  const skyStars  = useRef([...Array(70)].map(()=>({ top:`${2+Math.random()*74}%`, left:`${Math.random()*98}%`, size:1+Math.random()*2.4, dur:1.5+Math.random()*4, delay:Math.random()*7 }))).current;
  const fireflies = useRef([...Array(16)].map(()=>({ top:`${28+Math.random()*55}%`, left:`${5+Math.random()*88}%`, dur:2.5+Math.random()*4.5, delay:Math.random()*5 }))).current;
  const clouds    = useRef([{ l:"3%",t:"10%",s:1,dur:10 },{ l:"34%",t:"5%",s:0.7,dur:13 },{ l:"60%",t:"15%",s:0.6,dur:8 },{ l:"78%",t:"8%",s:0.85,dur:15 }]).current;

  /* grass blades pool */
  const grassBlades = useRef([...Array(30)].map((_,i)=>({
    left:`${(i/29)*96+2}%`,
    height: 16+Math.floor(Math.random()*22),
    color: ["#86efac","#4ade80","#22c55e","#16a34a","#bbf7d0"][i%5],
    delay: (i%8)*0.28,
  }))).current;

  useEffect(() => {
    Promise.all([dbGet("fg_garden",[]), dbGet("fg_lastvisit",""), dbGet("fg_streak",0)])
      .then(([g,v,s]) => {
        if (Array.isArray(g)) setGarden(g);
        if (v) setLastVisit(v);
        if (typeof s==="number") setStreak(s);
        setLoading(false);
      });
    const id = setInterval(()=>setMsgIdx(i=>(i+1)%LOVE_MSGS.length), 4000);
    return ()=>clearInterval(id);
  }, []); // eslint-disable-line

  const spawnConfetti = useCallback(() => {
    if (!confRef.current) return;
    const cs = ["🌸","🌺","🌷","🌼","💕","✨","🌻","💗","🪷","💫","🌸","🌺"];
    for (let i=0; i<32; i++) {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:-24px;left:${Math.random()*100}%;font-size:${11+Math.random()*20}px;pointer-events:none;z-index:99;animation:fg3-float ${1.8+Math.random()*2.8}s ${Math.random()*0.7}s ease-out forwards;`;
      el.textContent = cs[Math.floor(Math.random()*cs.length)];
      confRef.current.appendChild(el);
      setTimeout(()=>el.remove(), 5500);
    }
  }, []);

  const water = async () => {
    if (alreadyWatered || watered) return;
    setShowDrops(true); setTimeout(()=>setShowDrops(false), 1500);
    await new Promise(r=>setTimeout(r, 720));
    const flower = {
      id:   Date.now(),
      type: FLOWER_TYPES[Math.floor(Math.random()*FLOWER_TYPES.length)],
      stage:0,
      date: new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short"}),
    };
    const grown   = garden.map(f=>({...f, stage:Math.min(f.stage+1, GROWTH_STAGES.length-1)}));
    const updated = [...grown, flower];
    const ns      = streak+1;
    const newBlooms = grown.filter(f=>f.stage===GROWTH_STAGES.length-1 && garden.find(g=>g.id===f.id&&g.stage===GROWTH_STAGES.length-2));
    setGarden(updated); setNewId(flower.id); setWatered(true); setLastVisit(todayKey); setStreak(ns);
    if (newBlooms.length>0) { setShowPetals(true); setTimeout(()=>setShowPetals(false), 3800); }
    spawnConfetti();
    await Promise.all([dbSet("fg_garden",updated), dbSet("fg_lastvisit",todayKey), dbSet("fg_streak",ns)]);
    setTimeout(()=>setNewId(null), 3500);
  };

  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"0 4px 110px", position:"relative" }}>
      <div ref={confRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:98, overflow:"hidden" }}/>
      <WaterDrops active={showDrops}/>
      <PetalBurst active={showPetals}/>

      {/* ═══ MAIN SCENE CARD ═══ */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}
        style={{ borderRadius:28, overflow:"hidden", marginBottom:24,
          boxShadow:"0 24px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)" }}>

        {/* ── SKY ── */}
        <div style={{
          background: skyGradient[timeOfDay], position:"relative",
          minHeight:240, overflow:"hidden", transition:"background 3s ease",
          padding:"26px 22px 0",
        }}>
          <SkyCanvas isDay={isDay}/>

          {/* stars */}
          {!isDay && skyStars.map((st,i)=>(
            <div key={i} style={{ position:"absolute", top:st.top, left:st.left, width:st.size, height:st.size, background:"#fff", borderRadius:"50%", animation:`fg3-twinkle ${st.dur}s ease-in-out ${st.delay}s infinite`, pointerEvents:"none" }}/>
          ))}

          {/* sun */}
          {isDay && (
            <div style={{ position:"absolute", top:16, right:30, width:60, height:60, borderRadius:"50%",
              background:"radial-gradient(circle,#fff9c4 0%,#fde68a 45%,#fbbf24 100%)",
              animation:"fg3-sunGlow 3.5s ease-in-out infinite" }}>
              <div style={{ position:"absolute", inset:-18, background:"radial-gradient(circle,rgba(251,191,36,0.22) 0%,transparent 65%)", borderRadius:"50%" }}/>
              {/* sun rays */}
              {[...Array(8)].map((_,i)=>(
                <div key={i} style={{ position:"absolute", top:"50%", left:"50%", width:3, height:22, background:"rgba(251,191,36,0.5)", borderRadius:2, transformOrigin:"top center", transform:`translate(-50%,-50%) rotate(${i*45}deg) translateY(-38px)` }}/>
              ))}
            </div>
          )}

          {/* moon */}
          {timeOfDay==="night" && (
            <div style={{ position:"absolute", top:14, right:30, width:56, height:56, borderRadius:"50%",
              background:"linear-gradient(135deg,#fffde0,#ffe87a,#f5c518)",
              boxShadow:"0 0 32px 12px rgba(255,215,0,0.25), 0 0 70px 30px rgba(255,200,0,0.1)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem" }}>🌙</div>
          )}

          {/* evening aurora */}
          {timeOfDay==="evening" && (
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"65%",
              background:"linear-gradient(180deg,rgba(109,40,217,0.3),rgba(236,72,153,0.18),transparent)",
              animation:"fg3-dawnGlow 4s ease-in-out infinite", pointerEvents:"none" }}/>
          )}

          {/* morning pink glow */}
          {timeOfDay==="morning" && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%",
              background:"linear-gradient(0deg,rgba(249,115,22,0.35),rgba(251,191,36,0.2),transparent)",
              animation:"fg3-dawnGlow 5s ease-in-out infinite", pointerEvents:"none" }}/>
          )}

          {/* clouds */}
          {clouds.map((c,i)=>(
            <div key={i} style={{ position:"absolute", top:c.t, left:c.l,
              fontSize:`${30*c.s}px`, opacity:isDay?0.82:0.13,
              animation:`fg3-cloud ${c.dur}s ease-in-out ${i*2}s infinite alternate`,
              filter:"blur(0.5px)", transition:"opacity 3s ease" }}>☁️</div>
          ))}

          {/* fireflies */}
          {!isDay && fireflies.map((f,i)=>(
            <div key={i} style={{ position:"absolute", top:f.top, left:f.left, width:5, height:5, borderRadius:"50%",
              background:"#ffe066", boxShadow:"0 0 9px 5px rgba(255,215,0,0.65)",
              animation:`fg3-firefly ${f.dur}s ease-in-out ${f.delay}s infinite` }}/>
          ))}

          {/* butterflies — 3 with different paths */}
          {[{l:"14%",t:"60%",d:0,s:"🦋"},{l:"65%",t:"48%",d:1.6,s:"🦋"},{l:"40%",t:"68%",d:0.8,s:"🦋"}].map((b,i)=>(
            <div key={i} style={{ position:"absolute", top:b.t, left:b.l, fontSize:"20px", opacity:0.8,
              animation:`fg3-butterfly ${3.5+i*0.8}s ease-in-out ${b.d}s infinite` }}>{b.s}</div>
          ))}

          {/* wind lines */}
          <WindLines active={wind}/>

          {/* title block */}
          <div style={{ textAlign:"center", paddingBottom:24, position:"relative", zIndex:4 }}>
            {/* rainbow title bar */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 18px",
              background:"linear-gradient(90deg,rgba(236,72,153,0.2),rgba(139,92,246,0.2),rgba(236,72,153,0.2))",
              backgroundSize:"200% 100%", animation:"fg3-rainbowBar 4s linear infinite",
              border:"1px solid rgba(236,72,153,0.35)", borderRadius:50, marginBottom:10,
              fontFamily:"'Inter',sans-serif", fontSize:"0.66rem", fontWeight:700,
              color:"#f9a8d4", letterSpacing:"1.5px", textTransform:"uppercase" }}>🌸 Our Love Garden</div>

            <motion.h1
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2 }}
              style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem", fontWeight:600,
                fontStyle:"italic", color:"#fff", margin:"0 0 8px",
                textShadow:"0 0 50px rgba(236,72,153,0.5), 0 2px 12px rgba(0,0,0,0.6)" }}>
              Flower Garden 🌺
            </motion.h1>

            <AnimatePresence mode="wait">
              <motion.p key={msgIdx} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:0.4 }}
                style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.84rem", color:"rgba(255,255,255,0.5)", margin:"0 0 8px", fontStyle:"italic" }}>
                "{LOVE_MSGS[msgIdx]}"
              </motion.p>
            </AnimatePresence>

            <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.32)", fontFamily:"'Inter',sans-serif" }}>
              {timeOfDay==="morning"&&"🌅 Good morning"}{timeOfDay==="day"&&"☀️ Afternoon"}
              {timeOfDay==="evening"&&"🌆 Evening"}{timeOfDay==="night"&&"🌙 Night time"}
              {wind && <span style={{ marginLeft:8, color:"rgba(255,255,255,0.45)" }}>💨 Breeze</span>}
            </div>
          </div>
        </div>

        {/* ── GARDEN FLOOR ── */}
        <div style={{ position:"relative", background:"linear-gradient(180deg,#0d2a0a 0%,#091f06 50%,#061504 100%)", minHeight:200, overflow:"hidden" }}>

          {/* ground mist */}
          <div style={{ position:"absolute", bottom:32, left:0, right:0, height:40,
            background:"radial-gradient(ellipse at 50% 100%,rgba(134,239,172,0.12) 0%,transparent 70%)",
            animation:"fg3-groundMist 6s ease-in-out infinite" }}/>

          {/* grass blades layer */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:38, overflow:"hidden" }}>
            {grassBlades.map((b,i)=>(
              <GrassBlade key={i} left={b.left} height={b.height} color={b.color} delay={b.delay} wind={wind}/>
            ))}
          </div>

          {/* dirt layers */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:42, background:"linear-gradient(180deg,#4a2000,#2d1100,#1a0a00)", animation:"fg3-soilWave 5s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", bottom:38, left:0, right:0, height:6, background:"linear-gradient(90deg,#6b3310,#9a4e1e,#6b3310,#9a4e1e,#6b3310)", opacity:0.6 }}/>

          {/* wooden fence */}
          <WoodenFence/>

          {/* flowers */}
          <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:10, padding:"30px 24px 85px", flexWrap:"wrap", position:"relative", zIndex:2 }}>
            <AnimatePresence>
              {(garden.length===0
                ? [{ id:0, type:"🌱", stage:0, date:"" }]
                : garden
              ).slice().reverse().slice(0,24).map((f,i)=>(
                <SceneFlower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>

          {/* stats overlay */}
          <div style={{ position:"absolute", top:8, left:0, right:0, display:"flex", justifyContent:"center", gap:10, zIndex:5 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#86efac", background:"rgba(0,0,0,0.55)", padding:"4px 14px", borderRadius:50, backdropFilter:"blur(4px)", border:"1px solid rgba(134,239,172,0.2)" }}>🌸 {bloomed} bloomed</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.5)", background:"rgba(0,0,0,0.55)", padding:"4px 14px", borderRadius:50, backdropFilter:"blur(4px)", border:"1px solid rgba(255,255,255,0.1)" }}>🌱 {garden.length-bloomed} growing</span>
          </div>
        </div>
      </motion.div>

      {/* ═══ STATS ═══ */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
        style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {[
          { label:"Planted", value:garden.length,         color:"#ec4899", icon:"🌱", bg:"rgba(236,72,153,0.08)"  },
          { label:"Bloomed", value:bloomed,               color:"#8b5cf6", icon:"🌸", bg:"rgba(139,92,246,0.08)"  },
          { label:"Growing", value:garden.length-bloomed, color:"#10b981", icon:"🌿", bg:"rgba(16,185,129,0.08)"  },
          { label:"Streak",  value:`${streak}d`,          color:"#f59e0b", icon:"🔥", bg:"rgba(245,158,11,0.08)"  },
        ].map((s,i)=>(
          <motion.div key={i}
            initial={{ opacity:0, scale:0.75 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.16+i*0.07, type:"spring", stiffness:230 }}
            whileHover={{ scale:1.06, y:-3 }}
            style={{ padding:"14px 6px", textAlign:"center", background:s.bg,
              border:`1.5px solid ${s.color}30`, borderRadius:16, backdropFilter:"blur(8px)",
              boxShadow:`0 4px 16px ${s.color}18` }}>
            <motion.div animate={{ scale:[1,1.18,1] }} transition={{ duration:2.5, repeat:Infinity, delay:i*0.5 }}
              style={{ fontSize:"1.3rem", marginBottom:4 }}>{s.icon}</motion.div>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.4rem", fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.54rem", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ PROGRESS BAR ═══ */}
      {garden.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }}
          style={{ marginBottom:20, padding:"18px 20px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1px" }}>Bloom Progress</span>
            <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.78rem", fontWeight:800, color:"#ec4899" }}>{pct}%</span>
          </div>
          <div style={{ height:10, background:"rgba(255,255,255,0.07)", borderRadius:5, overflow:"hidden" }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1.4, ease:"easeOut", delay:0.35 }}
              style={{ height:"100%", background:"linear-gradient(90deg,#ec4899,#8b5cf6,#06b6d4,#f59e0b)", borderRadius:5,
                backgroundSize:"200% 100%", animation:"fg3-rainbowBar 3s linear infinite",
                boxShadow:"0 0 14px rgba(236,72,153,0.6)" }}/>
          </div>
          <div style={{ display:"flex", gap:3, marginTop:10, justifyContent:"center" }}>
            {[...Array(10)].map((_,i)=>(
              <motion.span key={i} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.4+i*0.05 }}
                style={{ fontSize:"0.9rem", opacity:pct>=(i+1)*10?1:0.14, transition:"opacity 0.5s" }}>
                {pct>=(i+1)*10?"❤️":"🤍"}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ WATER BUTTON ═══ */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <AnimatePresence mode="wait">
          {alreadyWatered || watered ? (
            <motion.div key="done" initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"16px 30px", background:"rgba(16,185,129,0.1)", border:"1.5px solid rgba(16,185,129,0.35)", borderRadius:50, color:"#10b981", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:600 }}>
              ✅ {watered ? "Garden watered! New flower planted 🌸" : "Come back tomorrow 💕"}
            </motion.div>
          ) : (
            <motion.button key="btn" whileHover={{ scale:1.07, y:-6 }} whileTap={{ scale:0.94 }} onClick={water}
              style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"18px 52px",
                background:"linear-gradient(135deg,#3b82f6,#06b6d4,#10b981)",
                backgroundSize:"200% 100%", animation:"fg3-rainbowBar 3s linear infinite, fg3-pulse 2.5s ease-in-out 1s infinite",
                border:"none", borderRadius:50, color:"#fff", fontFamily:"'Manrope',sans-serif",
                fontSize:"1.05rem", fontWeight:800, cursor:"pointer",
                boxShadow:"0 14px 42px rgba(59,130,246,0.5)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, borderRadius:50, background:"linear-gradient(105deg,transparent 32%,rgba(255,255,255,0.25) 50%,transparent 68%)", backgroundSize:"200% 100%", animation:"fg3-shimmer 2s linear infinite" }}/>
              <span style={{ position:"relative" }}>💧 Water the Garden Today</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ VIEW TOGGLE ═══ */}
      {garden.length > 0 && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:20 }}>
          {["garden","collection"].map(v=>(
            <motion.button key={v} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={()=>setView(v)}
              style={{ padding:"9px 24px", borderRadius:50, background:view===v?"rgba(236,72,153,0.22)":"rgba(255,255,255,0.05)", border:`1.5px solid ${view===v?"rgba(236,72,153,0.5)":"rgba(255,255,255,0.1)"}`, color:view===v?"#ec4899":"rgba(255,255,255,0.45)", fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>
              {v==="garden"?"🌿 Garden Scene":"🌸 Collection"}
            </motion.button>
          ))}
        </div>
      )}

      {/* ═══ CONTENT ═══ */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.38)" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1.4, repeat:Infinity, ease:"linear" }} style={{ fontSize:"2.8rem", display:"inline-block" }}>🌸</motion.div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", marginTop:14 }}>Loading your garden…</p>
        </div>
      ) : garden.length===0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ textAlign:"center", padding:"52px 24px", background:"rgba(255,255,255,0.03)", border:"1.5px dashed rgba(236,72,153,0.25)", borderRadius:24 }}>
          <motion.span animate={{ scale:[1,1.15,1] }} transition={{ duration:2, repeat:Infinity }} style={{ fontSize:"3.5rem" }}>🌱</motion.span>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", fontStyle:"italic", color:"rgba(255,255,255,0.48)", margin:"16px 0 10px" }}>Press the button to plant your first flower!</p>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.28)", margin:0 }}>Visit every day to grow a beautiful garden 🌸</p>
        </motion.div>
      ) : view==="garden" ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          style={{ margin:"0 0 20px", padding:"20px 16px 14px", background:"linear-gradient(180deg,rgba(34,197,94,0.08),rgba(21,128,61,0.14))", border:"1px solid rgba(34,197,94,0.18)", borderRadius:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:24, background:"linear-gradient(180deg,#3d1c02,#261000)", animation:"fg3-soilWave 4.5s ease-in-out infinite", borderRadius:"0 0 20px 20px" }}/>
          <div style={{ position:"absolute", bottom:22, left:0, right:0, height:8, background:"linear-gradient(180deg,#16a34a,#15803d)", opacity:0.65 }}/>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", textAlign:"center", margin:"0 0 12px" }}>🌿 Garden Bed</p>
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:8, paddingBottom:32 }}>
            <AnimatePresence>
              {garden.slice().reverse().slice(0,24).map((f,i)=>(
                <SceneFlower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:18 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"#86efac" }}>🌸 {bloomed} bloomed</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"rgba(255,255,255,0.32)" }}>🌱 {garden.length-bloomed} growing</span>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", textAlign:"center", marginBottom:14 }}>{garden.length} flower{garden.length!==1?"s":""} planted</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))", gap:10 }}>
            <AnimatePresence>{[...garden].reverse().map((f,i)=><FlowerCard key={f.id} flower={f} index={i} isNew={newId===f.id}/>)}</AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ═══ MILESTONES ═══ */}
      {garden.length > 0 && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }} style={{ marginTop:28 }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", textAlign:"center", marginBottom:14 }}>Milestones</p>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8 }}>
            {MILESTONES.map((m,i)=>{
              const done = garden.length>=m.n;
              return (
                <motion.div key={i}
                  initial={{ opacity:0, scale:0.78 }} animate={{ opacity:done?1:0.35, scale:1 }}
                  transition={{ delay:0.42+i*0.07, type:"spring" }}
                  whileHover={done?{ scale:1.08, y:-4 }:{}}
                  style={{ flexShrink:0, minWidth:82, padding:"12px 8px", textAlign:"center",
                    background:done?"rgba(236,72,153,0.14)":"rgba(255,255,255,0.03)",
                    border:`1.5px solid ${done?"rgba(236,72,153,0.42)":"rgba(255,255,255,0.07)"}`,
                    borderRadius:14, boxShadow:done?"0 4px 20px rgba(236,72,153,0.2)":"none" }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:5, filter:done?"none":"grayscale(1)", display:"inline-block", animation:done?`fg3-sway 3.5s ease-in-out ${i*0.4}s infinite`:"none", transformOrigin:"bottom center" }}>{m.e}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.57rem", fontWeight:700, color:done?"#ec4899":"rgba(255,255,255,0.28)", lineHeight:1.3 }}>{m.label}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.52rem", color:"rgba(255,255,255,0.18)", marginTop:3 }}>{m.n} flowers</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ FOOTER ═══ */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.52 }}
        style={{ marginTop:28, textAlign:"center", padding:"28px 24px",
          background:"linear-gradient(135deg,rgba(236,72,153,0.09),rgba(139,92,246,0.06))",
          border:"1px solid rgba(236,72,153,0.16)", borderRadius:22, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,0.04) 50%,transparent 64%)", backgroundSize:"200% 100%", animation:"fg3-shimmer 5s linear infinite", pointerEvents:"none" }}/>
        <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:3, repeat:Infinity }} style={{ fontSize:"1.8rem", marginBottom:10 }}>💍</motion.div>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.08rem", fontStyle:"italic", color:"rgba(255,255,255,0.52)", margin:"0 0 8px", lineHeight:1.7 }}>
          "Every day you water this garden, you're telling me you choose us 💙"
        </p>
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"rgba(255,255,255,0.65)", margin:0 }}>— Surya &amp; Sadhana 💍</p>
      </motion.div>

    </div>
  );
}
