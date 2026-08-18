import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

/* ── data ── */
const FLOWER_TYPES = ["🌸","🌺","🌻","🌹","🌷","🌼","🪷","💐","🌸","🌺"];
const GROWTH_STAGES = [
  { emoji:"🌱", label:"Seedling",  px:32 },
  { emoji:"🌿", label:"Sprouting", px:40 },
  { emoji:"🪴", label:"Growing",   px:50 },
  { emoji:"🌸", label:"Blooming",  px:58 },
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

/* ── minimal CSS (no cartoon keyframes) ── */
function injectCSS() {
  if (document.getElementById("fg5-css")) return;
  const s = document.createElement("style");
  s.id = "fg5-css";
  s.textContent = `
    @keyframes fg5-sway   { 0%,100%{transform:rotate(-3deg)translateY(0)} 50%{transform:rotate(3deg)translateY(-4px)} }
    @keyframes fg5-bloom  { 0%,100%{filter:drop-shadow(0 2px 8px rgba(236,72,153,.5))} 50%{filter:drop-shadow(0 4px 20px rgba(236,72,153,.95))drop-shadow(0 0 30px rgba(251,191,36,.4))} }
    @keyframes fg5-twink  { 0%,100%{opacity:.15} 50%{opacity:.9} }
    @keyframes fg5-shoot  { 0%{transform:translateX(0)translateY(0);opacity:1} 100%{transform:translateX(180px)translateY(80px);opacity:0} }
    @keyframes fg5-float  { 0%{transform:translateY(0)rotate(0);opacity:1} 100%{transform:translateY(-150px)rotate(360deg);opacity:0} }
    @keyframes fg5-petal  { 0%{transform:translateY(-10px)translateX(0)rotate(0);opacity:1}
                            50%{opacity:.85;transform:translateY(45vh)translateX(25px)rotate(200deg)}
                            100%{transform:translateY(105vh)translateX(-15px)rotate(400deg);opacity:0} }
    @keyframes fg5-drop   { 0%{transform:translateY(-50px);opacity:1} 100%{transform:translateY(100px);opacity:0} }
    @keyframes fg5-ripple { 0%{transform:scale(.2);opacity:.9} 100%{transform:scale(4);opacity:0} }
    @keyframes fg5-spin   { to{transform:rotate(360deg)} }
    @keyframes fg5-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,.5)} 50%{box-shadow:0 0 0 22px rgba(236,72,153,0)} }
    @keyframes fg5-shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes fg5-sunray { 0%,100%{opacity:.4;transform:rotate(0deg)scale(1)} 50%{opacity:.7;transform:rotate(5deg)scale(1.04)} }
    @keyframes fg5-badge  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
    @keyframes fg5-cloud  { 0%{transform:translateX(0)} 100%{transform:translateX(25px)} }
    @keyframes fg5-mist   { 0%,100%{opacity:.18} 50%{opacity:.28} }
    @keyframes fg5-wind   { 0%{transform:translateX(-100%)skewX(-12deg);opacity:0} 50%{opacity:.15} 100%{transform:translateX(130vw)skewX(-12deg);opacity:0} }
  `;
  document.head.appendChild(s);
}

/* ── star / shooting-star canvas (night sky only) ── */
function StarCanvas({ show }) {
  const cv = useRef(null), raf = useRef(null);
  useEffect(() => {
    if (!show) return;
    const el = cv.current; if (!el) return;
    const resize = () => { el.width = el.offsetWidth; el.height = el.offsetHeight; };
    resize(); const ro = new ResizeObserver(resize); ro.observe(el);
    const ctx = el.getContext("2d");
    const stars = Array.from({length:120}, () => ({
      x:Math.random(), y:Math.random(),
      r:.4+Math.random()*1.8, ph:Math.random()*Math.PI*2, sp:.3+Math.random()*1.3,
    }));
    const shots = [];
    const spawn = () => shots.push({
      x: Math.random()*el.width*.75, y: Math.random()*el.height*.4,
      vx:8+Math.random()*11, vy:3+Math.random()*6,
      len:90+Math.random()*160, life:1, decay:.016+Math.random()*.013,
    });
    spawn(); const timer = setInterval(spawn, 2000);
    const tick = () => {
      const {width:w,height:h}=el; ctx.clearRect(0,0,w,h);
      const t = Date.now()/1000;
      stars.forEach(s => {
        const a = .12+.88*Math.abs(Math.sin(t*s.sp+s.ph));
        ctx.beginPath(); ctx.arc(s.x*w, s.y*h, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; ctx.fill();
      });
      for (let i=shots.length-1; i>=0; i--) {
        const s=shots[i]; s.x+=s.vx; s.y+=s.vy; s.life-=s.decay;
        if (s.life<=0||s.x>w+250){shots.splice(i,1);continue;}
        const tx=s.x-s.vx*(s.len/Math.max(Math.abs(s.vx),1));
        const ty=s.y-s.vy*(s.len/Math.max(Math.abs(s.vx),1));
        const g=ctx.createLinearGradient(tx,ty,s.x,s.y);
        g.addColorStop(0,"transparent"); g.addColorStop(.6,"rgba(200,180,255,.55)"); g.addColorStop(1,"rgba(255,255,255,.95)");
        ctx.save(); ctx.globalAlpha=Math.max(0,s.life);
        ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.shadowColor="#c4b5fd"; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(s.x,s.y); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x,s.y,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowBlur=16; ctx.fill(); ctx.restore();
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); clearInterval(timer); ro.disconnect(); };
  }, [show]);
  if (!show) return null;
  return <canvas ref={cv} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

/* ── water drop overlay ── */
function WaterDrops({on}) {
  if (!on) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:60,overflow:"hidden"}}>
      {[...Array(20)].map((_,i)=>(
        <span key={i} style={{position:"absolute",top:"8%",left:`${2+i*5}%`,fontSize:`${10+(i%4)*5}px`,
          animation:`fg5-drop ${.45+i*.055}s ease-in ${i*.045}s both`}}>💧</span>
      ))}
      {[...Array(6)].map((_,i)=>(
        <div key={`r${i}`} style={{position:"absolute",bottom:"28%",left:`${8+i*15}%`,
          width:28,height:11,border:"1.5px solid rgba(147,197,253,.7)",borderRadius:"50%",
          animation:`fg5-ripple 1s ease-out ${.5+i*.1}s both`}}/>
      ))}
    </div>
  );
}

/* ── petal rain on new bloom ── */
function PetalRain({on}) {
  if (!on) return null;
  const p = ["🌸","🌺","🌷","🌼","🪷","💮","🌸","🌺","✨","💕","🌸","🌺","🌷","💗","🌸","🌺"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:55,overflow:"hidden"}}>
      {p.map((x,i)=>(
        <span key={i} style={{position:"absolute",top:"-12px",left:`${1+i*6.2}%`,
          fontSize:`${12+(i%5)*6}px`,
          animation:`fg5-petal ${2.6+i*.23}s ease-in-out ${i*.06}s forwards`}}>{x}</span>
      ))}
    </div>
  );
}

/* ── realistic single flower with proper stem+leaf ── */
function Flower({ flower, index, wind }) {
  const bloomed = flower.stage >= GROWTH_STAGES.length - 1;
  const st      = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length - 1)];
  const emoji   = bloomed ? flower.type : st.emoji;
  const sz      = st.px + (index % 4) * 4;
  const stemH   = 18 + flower.stage * 12;
  const sway    = wind
    ? `fg5-sway ${.9+(index%3)*.3}s ease-in-out ${index*.08}s infinite`
    : bloomed
      ? `fg5-sway ${2.2+(index%5)*.45}s ease-in-out ${index*.12}s infinite`
      : `fg5-sway ${3+(index%4)*.5}s ease-in-out ${index*.18}s infinite`;

  return (
    <motion.div layout
      initial={{scale:0,y:60,opacity:0}}
      animate={{scale:1,y:0,opacity:1}}
      exit={{scale:0,y:30,opacity:0}}
      transition={{type:"spring",stiffness:200,damping:18,delay:index*.05}}
      style={{display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:2}}
    >
      {/* flower head */}
      <span style={{
        fontSize:sz, lineHeight:1, display:"inline-block",
        transformOrigin:"bottom center",
        animation: bloomed ? `fg5-bloom 3s ease-in-out ${index*.3}s infinite` : sway,
      }}>
        <span style={{display:"inline-block",transformOrigin:"bottom center",animation:sway}}>
          {emoji}
        </span>
      </span>

      {/* realistic stem */}
      <div style={{
        width:3, height:stemH,
        background: bloomed
          ? `linear-gradient(180deg,#86efac 0%,#22c55e 40%,#15803d 100%)`
          : `linear-gradient(180deg,#4ade80 0%,#16a34a 60%,#166534 100%)`,
        borderRadius:"2px 2px 0 0",
        boxShadow: bloomed ? "1px 0 4px rgba(34,197,94,.35)" : "none",
      }}/>

      {/* leaf pair */}
      {flower.stage >= 1 && (
        <div style={{position:"absolute",bottom:stemH*0.4+4,left:"50%",transform:"translateX(-50%)",display:"flex",gap:2,pointerEvents:"none"}}>
          <span style={{fontSize:10,transform:"rotate(-40deg) translateX(-2px)",opacity:.85,display:"inline-block"}}>🍃</span>
          <span style={{fontSize:10,transform:"rotate(40deg) translateX(2px) scaleX(-1)",opacity:.85,display:"inline-block"}}>🍃</span>
        </div>
      )}

      {/* soil mound */}
      <div style={{
        width: bloomed ? 24 : 18, height:5, borderRadius:"50%",
        background:"radial-gradient(ellipse,rgba(101,67,33,.65) 0%,transparent 75%)",
        marginTop:1,
      }}/>
    </motion.div>
  );
}

/* ── collection card ── */
function FlowerCard({ flower, index, isNew }) {
  const st      = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length-1)];
  const bloomed = flower.stage >= GROWTH_STAGES.length-1;
  const emoji   = bloomed ? flower.type : st.emoji;
  return (
    <motion.div layout
      initial={{scale:0,opacity:0,y:18}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0,opacity:0}}
      transition={{type:"spring",stiffness:280,damping:22,delay:index*.03}}
      whileHover={{scale:1.06,y:-4}}
      style={{
        display:"flex",flexDirection:"column",alignItems:"center",gap:5,
        padding:"14px 10px 12px",
        background: bloomed
          ? "linear-gradient(135deg,rgba(236,72,153,.16),rgba(139,92,246,.1))"
          : "rgba(255,255,255,.05)",
        border:`1.5px solid ${bloomed?"rgba(236,72,153,.48)":"rgba(255,255,255,.09)"}`,
        borderRadius:18, backdropFilter:"blur(10px)", position:"relative", overflow:"hidden",
        boxShadow: bloomed ? "0 8px 30px rgba(236,72,153,.25)" : "0 4px 14px rgba(0,0,0,.2)",
      }}>
      {bloomed && <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.08) 50%,transparent 64%)",backgroundSize:"200% 100%",animation:"fg5-shimmer 3.2s linear infinite",borderRadius:18,pointerEvents:"none"}}/>}
      {isNew  && <span style={{position:"absolute",top:5,right:5,fontSize:".47rem",fontWeight:800,background:"linear-gradient(90deg,#ec4899,#8b5cf6)",color:"#fff",padding:"2px 7px",borderRadius:50,textTransform:"uppercase",animation:"fg5-badge .9s ease-in-out infinite"}}>NEW</span>}
      <span style={{fontSize:bloomed?"2.4rem":"2rem",lineHeight:1,display:"inline-block",
        animation:bloomed?`fg5-sway ${2+(index%3)*.6}s ease-in-out infinite`:"none",transformOrigin:"bottom center",
        filter:bloomed?"drop-shadow(0 2px 12px rgba(236,72,153,.7))":"none"}}>{emoji}</span>
      <span style={{fontSize:".58rem",fontWeight:700,fontFamily:"'Inter',sans-serif",
        color:bloomed?"#ec4899":"#10b981",
        background:bloomed?"rgba(236,72,153,.15)":"rgba(16,185,129,.15)",
        padding:"2px 8px",borderRadius:50,
        border:`1px solid ${bloomed?"rgba(236,72,153,.35)":"rgba(16,185,129,.3)"}`}}>{st.label}</span>
      <span style={{fontSize:".56rem",color:"rgba(255,255,255,.3)",fontFamily:"'Inter',sans-serif"}}>{flower.date}</span>
    </motion.div>
  );
}

/* ════ MAIN ════ */
export default function FlowerGarden({ user }) {
  const [garden,    setGarden]    = useState([]);
  const [watered,   setWatered]   = useState(false);
  const [newId,     setNewId]     = useState(null);
  const [lastVisit, setLastVisit] = useState("");
  const [streak,    setStreak]    = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [drops,     setDrops]     = useState(false);
  const [petals,    setPetals]    = useState(false);
  const [msgIdx,    setMsgIdx]    = useState(0);
  const [view,      setView]      = useState("garden");
  const [wind,      setWind]      = useState(false);
  const [tod,       setTod]       = useState("night");
  const confRef = useRef(null);
  injectCSS();

  /* time of day */
  useEffect(() => {
    const c = () => {
      const h = new Date().getHours();
      setTod(h>=6&&h<12?"morning":h>=12&&h<17?"day":h>=17&&h<20?"evening":"night");
    };
    c(); const id = setInterval(c, 60000); return () => clearInterval(id);
  }, []);

  /* subtle wind */
  useEffect(() => {
    const g = () => { setWind(true); setTimeout(()=>setWind(false), 2400); };
    g();
    const id = setInterval(g, 7000+Math.random()*6000); return () => clearInterval(id);
  }, []);

  /* message rotation */
  useEffect(() => {
    const id = setInterval(()=>setMsgIdx(i=>(i+1)%LOVE_MSGS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const today        = new Date().toDateString();
  const alreadyW     = lastVisit === today;
  const bloomedCount = garden.filter(f=>f.stage>=GROWTH_STAGES.length-1).length;
  const pct          = garden.length ? Math.round((bloomedCount/garden.length)*100) : 0;
  const isDay        = tod==="morning"||tod==="day";

  /* sky palette — realistic colours */
  const SKY = {
    morning: { bg:"linear-gradient(180deg,#0f0624 0%,#4a1d96 30%,#c2410c 65%,#f59e0b 100%)",  horizon:"rgba(249,115,22,.35)" },
    day:     { bg:"linear-gradient(180deg,#0c4a6e 0%,#0369a1 30%,#0ea5e9 65%,#e0f2fe 100%)", horizon:"rgba(125,211,252,.22)" },
    evening: { bg:"linear-gradient(180deg,#0c0a1e 0%,#4c1d95 28%,#be185d 62%,#ea580c 100%)",  horizon:"rgba(249,115,22,.3)"  },
    night:   { bg:"linear-gradient(180deg,#020410 0%,#060c28 35%,#0d1340 65%,#111827 100%)",   horizon:"rgba(30,58,138,.3)"   },
  };

  /* stable element pools */
  const skyStars  = useRef([...Array(80)].map(()=>({ t:`${2+Math.random()*74}%`, l:`${Math.random()*98}%`, sz:1+Math.random()*2.5, dur:1.6+Math.random()*4, del:Math.random()*8 }))).current;
  const clouds    = useRef([{l:"3%",t:"9%",s:1,d:12},{l:"29%",t:"4%",s:.7,d:15},{l:"55%",t:"13%",s:.62,d:10},{l:"76%",t:"6%",s:.88,d:17}]).current;

  /* load */
  useEffect(() => {
    Promise.all([dbGet("fg_garden",[]),dbGet("fg_lastvisit",""),dbGet("fg_streak",0)])
      .then(([g,v,s])=>{
        if(Array.isArray(g)) setGarden(g);
        if(v) setLastVisit(v);
        if(typeof s==="number") setStreak(s);
        setLoading(false);
      });
  }, []); // eslint-disable-line

  /* confetti */
  const confetti = useCallback(()=>{
    if(!confRef.current) return;
    const cs=["🌸","🌺","🌷","🌼","💕","✨","🌻","💗","🪷","💫","🌸","🌺"];
    for(let i=0;i<30;i++){
      const el=document.createElement("div");
      el.style.cssText=`position:fixed;top:-22px;left:${Math.random()*100}%;font-size:${10+Math.random()*20}px;pointer-events:none;z-index:99;animation:fg5-float ${1.8+Math.random()*2.8}s ${Math.random()*.8}s ease-out forwards;`;
      el.textContent=cs[Math.floor(Math.random()*cs.length)];
      confRef.current.appendChild(el);
      setTimeout(()=>el.remove(),5500);
    }
  },[]);

  /* water / plant */
  const water = async () => {
    if (alreadyW||watered) return;
    setDrops(true); setTimeout(()=>setDrops(false),1600);
    await new Promise(r=>setTimeout(r,750));
    const fl = { id:Date.now(), type:FLOWER_TYPES[Math.floor(Math.random()*FLOWER_TYPES.length)], stage:0, date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) };
    const grown   = garden.map(f=>({...f,stage:Math.min(f.stage+1,GROWTH_STAGES.length-1)}));
    const updated = [...grown, fl];
    const ns      = streak+1;
    const newBlooms = grown.filter(f=>f.stage===GROWTH_STAGES.length-1&&garden.find(g=>g.id===f.id&&g.stage===GROWTH_STAGES.length-2));
    setGarden(updated); setNewId(fl.id); setWatered(true); setLastVisit(today); setStreak(ns);
    if(newBlooms.length>0){setPetals(true);setTimeout(()=>setPetals(false),4000);}
    confetti();
    await Promise.all([dbSet("fg_garden",updated),dbSet("fg_lastvisit",today),dbSet("fg_streak",ns)]);
    setTimeout(()=>setNewId(null),3500);
  };

  const sky = SKY[tod];

  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"0 4px 110px",position:"relative"}}>
      <div ref={confRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:98,overflow:"hidden"}}/>
      <WaterDrops on={drops}/> <PetalRain on={petals}/>

      {/* ══ SCENE ══ */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:.7}}
        style={{borderRadius:24,overflow:"hidden",marginBottom:22,
          boxShadow:"0 24px 72px rgba(0,0,0,.72),0 0 0 1px rgba(255,255,255,.07)"}}>

        {/* ─ SKY ─ */}
        <div style={{background:sky.bg,position:"relative",minHeight:260,overflow:"hidden",transition:"background 4s ease",padding:"26px 20px 0"}}>
          <StarCanvas show={!isDay}/>

          {/* twinkling stars overlay */}
          {!isDay && skyStars.map((st,i)=>(
            <div key={i} style={{position:"absolute",top:st.t,left:st.l,width:st.sz,height:st.sz,
              background:"#fff",borderRadius:"50%",pointerEvents:"none",zIndex:1,
              animation:`fg5-twink ${st.dur}s ease-in-out ${st.del}s infinite`}}/>
          ))}

          {/* sun — day/morning */}
          {isDay && (
            <div style={{position:"absolute",top:16,right:28,width:58,height:58,zIndex:2}}>
              {/* rays */}
              {[...Array(12)].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:2,height:22+(i%2)*6,
                  background:"rgba(253,224,71,.5)",borderRadius:2,transformOrigin:"top center",
                  transform:`translate(-50%,-100%) rotate(${i*30}deg) translateY(-36px)`,
                  animation:`fg5-sunray ${3+i*.2}s ease-in-out ${i*.15}s infinite`}}/>
              ))}
              <div style={{position:"absolute",inset:0,borderRadius:"50%",
                background:"radial-gradient(circle,#fefce8 0%,#fde047 45%,#f59e0b 100%)",
                boxShadow:"0 0 40px 18px rgba(253,224,71,.6),0 0 90px 40px rgba(251,191,36,.3)",
                animation:"fg5-sunray 4s ease-in-out infinite"}}/>
            </div>
          )}

          {/* moon — night */}
          {tod==="night" && (
            <div style={{position:"absolute",top:14,right:28,width:58,height:58,borderRadius:"50%",zIndex:2,
              background:"linear-gradient(135deg,#fefce8,#fde68a,#f5c518)",
              boxShadow:"0 0 36px 14px rgba(253,224,71,.28),0 0 80px 36px rgba(251,191,36,.14)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem"}}>🌙</div>
          )}

          {/* horizon glow */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:"35%",
            background:`linear-gradient(0deg,${sky.horizon},transparent)`,pointerEvents:"none",
            animation:"fg5-mist 6s ease-in-out infinite"}}/>

          {/* clouds */}
          {clouds.map((c,i)=>(
            <div key={i} style={{position:"absolute",top:c.t,left:c.l,zIndex:2,
              width:`${180*c.s}px`,height:`${55*c.s}px`,
              background:"rgba(255,255,255,.14)",borderRadius:"50%",
              filter:`blur(${8*c.s}px)`,opacity:isDay?.75:.2,
              transition:"opacity 3s ease",
              animation:`fg5-cloud ${c.d}s ease-in-out ${i*2.5}s infinite alternate`}}/>
          ))}

          {/* subtle wind streaks */}
          {wind && (
            <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:3}}>
              {[...Array(6)].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:`${14+i*11}%`,left:0,
                  width:`${80+i*50}px`,height:"1px",
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)",
                  animation:`fg5-wind ${1+i*.25}s linear ${i*.12}s infinite`}}/>
              ))}
            </div>
          )}

          {/* header */}
          <div style={{textAlign:"center",paddingBottom:26,position:"relative",zIndex:4}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 16px",
              background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,.18)",borderRadius:50,marginBottom:12,
              fontFamily:"'Inter',sans-serif",fontSize:".64rem",fontWeight:700,
              color:"rgba(255,255,255,.75)",letterSpacing:"1.8px",textTransform:"uppercase"}}>
              🌸 Our Love Garden
            </div>

            <motion.h1 initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} transition={{delay:.2}}
              style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.6rem",fontWeight:600,
                fontStyle:"italic",color:"#fff",margin:"0 0 10px",
                textShadow:"0 2px 20px rgba(0,0,0,.7),0 0 40px rgba(236,72,153,.3)"}}>
              Flower Garden 🌺
            </motion.h1>

            <AnimatePresence mode="wait">
              <motion.p key={msgIdx}
                initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
                transition={{duration:.4}}
                style={{fontFamily:"'Inter',sans-serif",fontSize:".84rem",
                  color:"rgba(255,255,255,.55)",margin:"0 0 8px",fontStyle:"italic"}}>
                "{LOVE_MSGS[msgIdx]}"
              </motion.p>
            </AnimatePresence>

            <div style={{fontSize:".64rem",color:"rgba(255,255,255,.38)",fontFamily:"'Inter',sans-serif"}}>
              {tod==="morning"&&"🌅 Good morning"}{tod==="day"&&"☀️ Afternoon"}
              {tod==="evening"&&"🌆 Evening"}{tod==="night"&&"🌙 Night time"}
              {wind&&<span style={{marginLeft:10,opacity:.6}}>· gentle breeze</span>}
            </div>
          </div>
        </div>

        {/* ─ GROUND ─ */}
        <div style={{position:"relative",overflow:"hidden",minHeight:240}}>

          {/* layered ground – realistic soil + grass */}
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(180deg,#1a3a0f 0%,#143009 22%,#0f2407 45%,#1c3d08 58%,#3d1c02 78%,#2a1100 100%)"}}/>

          {/* grass top edge */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:20,
            background:"linear-gradient(180deg,#2d6a1a,#1f5213,transparent)",opacity:.9}}/>

          {/* subtle soil texture stripes */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:55,
            background:"repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0px,rgba(0,0,0,.08) 2px,transparent 2px,transparent 24px),linear-gradient(180deg,#4a2005,#2d1100)"}}/>

          {/* ground mist */}
          <div style={{position:"absolute",top:12,left:0,right:0,height:40,
            background:"radial-gradient(ellipse 80% 100% at 50% 0%,rgba(34,197,94,.1) 0%,transparent 100%)",
            animation:"fg5-mist 8s ease-in-out infinite"}}/>

          {/* flowers */}
          <div style={{
            display:"flex",justifyContent:"center",alignItems:"flex-end",
            flexWrap:"wrap",gap:18,
            padding:"28px 24px 100px",
            position:"relative",zIndex:3,
            minHeight:200,
          }}>
            <AnimatePresence>
              {(garden.length===0
                ? [{id:0,type:"🌱",stage:0,date:""}]
                : garden
              ).slice().reverse().slice(0,28).map((f,i)=>(
                <Flower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>

          {/* wooden path stones */}
          <div style={{position:"absolute",bottom:62,left:0,right:0,
            display:"flex",justifyContent:"center",gap:12,pointerEvents:"none",zIndex:2}}>
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{width:32,height:10,borderRadius:6,
                background:"linear-gradient(180deg,rgba(180,140,90,.55),rgba(120,80,40,.4))",
                border:"1px solid rgba(255,255,255,.07)"}}/>
            ))}
          </div>

          {/* realistic low fence — horizontal planks + posts */}
          <div style={{position:"absolute",bottom:22,left:0,right:0,height:46,zIndex:4,pointerEvents:"none"}}>
            {/* planks */}
            <div style={{position:"absolute",top:8,left:0,right:0,height:7,
              background:"linear-gradient(180deg,#92530a,#7c3f08,#6b3207)",
              boxShadow:"0 2px 8px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)",
              backgroundImage:"repeating-linear-gradient(90deg,rgba(0,0,0,.06) 0px,rgba(0,0,0,.06) 1px,transparent 1px,transparent 18px)"}}/>
            <div style={{position:"absolute",top:24,left:0,right:0,height:5,
              background:"linear-gradient(180deg,#7c3f08,#6b3207,#5a2a06)",
              boxShadow:"0 1px 5px rgba(0,0,0,.45)"}}/>
            {/* posts */}
            {[...Array(11)].map((_,i)=>(
              <div key={i} style={{position:"absolute",bottom:0,
                left:`${i*9.8+1}%`,width:9,height:44,transform:"translateX(-50%)",
                background:"linear-gradient(180deg,#a0541a,#7c3f08,#5a2a06)",
                borderRadius:"3px 3px 0 0",
                boxShadow:"1px 0 4px rgba(0,0,0,.5),inset 1px 0 2px rgba(255,200,100,.1)",
                backgroundImage:"repeating-linear-gradient(180deg,rgba(255,255,255,.04) 0px,rgba(255,255,255,.04) 1px,transparent 1px,transparent 8px)"}}>
                <div style={{position:"absolute",top:-7,left:"50%",transform:"translateX(-50%)",
                  width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderBottom:"8px solid #a0541a"}}/>
              </div>
            ))}
          </div>

          {/* soil base */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:24,
            background:"linear-gradient(180deg,#4a2005,#2d1100,#1a0a00)"}}/>

          {/* stats pills */}
          <div style={{position:"absolute",top:8,left:0,right:0,display:"flex",justifyContent:"center",gap:10,zIndex:6}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,
              color:"#86efac",background:"rgba(0,0,0,.6)",padding:"4px 14px",borderRadius:50,
              backdropFilter:"blur(6px)",border:"1px solid rgba(134,239,172,.22)"}}>🌸 {bloomedCount} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,
              color:"rgba(255,255,255,.5)",background:"rgba(0,0,0,.6)",padding:"4px 14px",borderRadius:50,
              backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,.12)"}}>🌱 {garden.length-bloomedCount} growing</span>
          </div>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.12}}
        style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Planted", value:garden.length,           color:"#ec4899",icon:"🌱",bg:"rgba(236,72,153,.08)"},
          {label:"Bloomed", value:bloomedCount,            color:"#8b5cf6",icon:"🌸",bg:"rgba(139,92,246,.08)"},
          {label:"Growing", value:garden.length-bloomedCount,color:"#10b981",icon:"🌿",bg:"rgba(16,185,129,.08)"},
          {label:"Streak",  value:`${streak}d`,            color:"#f59e0b",icon:"🔥",bg:"rgba(245,158,11,.08)"},
        ].map((s,i)=>(
          <motion.div key={i}
            initial={{opacity:0,scale:.75}} animate={{opacity:1,scale:1}}
            transition={{delay:.16+i*.07,type:"spring",stiffness:230}}
            whileHover={{scale:1.05,y:-3}}
            style={{padding:"14px 6px",textAlign:"center",background:s.bg,
              border:`1.5px solid ${s.color}28`,borderRadius:16,backdropFilter:"blur(8px)",
              boxShadow:`0 4px 18px ${s.color}18`}}>
            <motion.div animate={{scale:[1,1.18,1]}} transition={{duration:2.8,repeat:Infinity,delay:i*.6}}
              style={{fontSize:"1.3rem",marginBottom:4}}>{s.icon}</motion.div>
            <div style={{fontFamily:"'Manrope',sans-serif",fontSize:"1.38rem",fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:".54rem",color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".5px"}}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── PROGRESS ── */}
      {garden.length>0&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.22}}
          style={{marginBottom:20,padding:"18px 20px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.36)",textTransform:"uppercase",letterSpacing:"1px"}}>Bloom Progress</span>
            <span style={{fontFamily:"'Manrope',sans-serif",fontSize:".78rem",fontWeight:800,color:"#ec4899"}}>{pct}%</span>
          </div>
          <div style={{height:9,background:"rgba(255,255,255,.07)",borderRadius:5,overflow:"hidden"}}>
            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.4,ease:"easeOut",delay:.35}}
              style={{height:"100%",background:"linear-gradient(90deg,#ec4899,#8b5cf6,#06b6d4)",borderRadius:5,
                boxShadow:"0 0 14px rgba(236,72,153,.6)"}}/>
          </div>
          <div style={{display:"flex",gap:3,marginTop:10,justifyContent:"center"}}>
            {[...Array(10)].map((_,i)=>(
              <motion.span key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:.4+i*.05}}
                style={{fontSize:".88rem",opacity:pct>=(i+1)*10?1:.14,transition:"opacity .5s"}}>
                {pct>=(i+1)*10?"❤️":"🤍"}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── WATER BUTTON ── */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <AnimatePresence mode="wait">
          {alreadyW||watered ? (
            <motion.div key="done"
              initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              style={{display:"inline-flex",alignItems:"center",gap:10,padding:"16px 30px",
                background:"rgba(16,185,129,.1)",border:"1.5px solid rgba(16,185,129,.32)",
                borderRadius:50,color:"#10b981",fontFamily:"'Inter',sans-serif",fontSize:".9rem",fontWeight:600}}>
              ✅ {watered?"Garden watered! New flower planted 🌸":"Come back tomorrow 💕"}
            </motion.div>
          ):(
            <motion.button key="btn"
              whileHover={{scale:1.07,y:-5}} whileTap={{scale:.95}} onClick={water}
              style={{display:"inline-flex",alignItems:"center",gap:12,padding:"19px 52px",
                background:"linear-gradient(135deg,#1d4ed8,#0891b2,#059669)",
                border:"none",borderRadius:50,color:"#fff",
                fontFamily:"'Manrope',sans-serif",fontSize:"1.05rem",fontWeight:800,cursor:"pointer",
                boxShadow:"0 14px 44px rgba(29,78,216,.45),0 4px 16px rgba(0,0,0,.3)",
                position:"relative",overflow:"hidden",animation:"fg5-pulse 2.8s ease-in-out 1.2s infinite"}}>
              <div style={{position:"absolute",inset:0,borderRadius:50,
                background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%)",
                backgroundSize:"200% 100%",animation:"fg5-shimmer 2.2s linear infinite"}}/>
              <span style={{position:"relative"}}>💧 Water the Garden Today</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── VIEW TOGGLE ── */}
      {garden.length>0&&(
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {["garden","collection"].map(v=>(
            <motion.button key={v} whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>setView(v)}
              style={{padding:"9px 24px",borderRadius:50,
                background:v===view?"rgba(236,72,153,.22)":"rgba(255,255,255,.05)",
                border:`1.5px solid ${v===view?"rgba(236,72,153,.5)":"rgba(255,255,255,.1)"}`,
                color:v===view?"#ec4899":"rgba(255,255,255,.45)",
                fontFamily:"'Inter',sans-serif",fontSize:".78rem",fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
              {v==="garden"?"🌿 Garden Scene":"🌸 Collection"}
            </motion.button>
          ))}
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,.38)"}}>
          <motion.div animate={{rotate:360}} transition={{duration:1.4,repeat:Infinity,ease:"linear"}}
            style={{fontSize:"2.6rem",display:"inline-block"}}>🌸</motion.div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".9rem",marginTop:14}}>Loading your garden…</p>
        </div>
      ):garden.length===0?(
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{textAlign:"center",padding:"52px 24px",background:"rgba(255,255,255,.03)",
            border:"1.5px dashed rgba(236,72,153,.24)",borderRadius:24}}>
          <motion.span animate={{scale:[1,1.14,1]}} transition={{duration:2,repeat:Infinity}}
            style={{fontSize:"3.4rem"}}>🌱</motion.span>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.28rem",fontStyle:"italic",
            color:"rgba(255,255,255,.48)",margin:"16px 0 10px"}}>Press the button to plant your first flower!</p>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".82rem",color:"rgba(255,255,255,.28)",margin:0}}>
            Visit every day to grow a beautiful garden 🌸</p>
        </motion.div>
      ):view==="garden"?(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}}
          style={{margin:"0 0 20px",padding:"20px 16px 14px",
            background:"linear-gradient(180deg,rgba(34,197,94,.07),rgba(21,128,61,.12))",
            border:"1px solid rgba(34,197,94,.16)",borderRadius:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:20,
            background:"linear-gradient(180deg,#3d1c02,#261000)",borderRadius:"0 0 20px 20px"}}/>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,
            color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",
            textAlign:"center",margin:"0 0 12px"}}>🌿 Garden Bed</p>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:14,paddingBottom:26}}>
            <AnimatePresence>
              {garden.slice().reverse().slice(0,28).map((f,i)=>(
                <Flower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:18}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"#86efac"}}>🌸 {bloomedCount} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"rgba(255,255,255,.32)"}}>🌱 {garden.length-bloomedCount} growing</span>
          </div>
        </motion.div>
      ):(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,
            color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",
            textAlign:"center",marginBottom:14}}>
            {garden.length} flower{garden.length!==1?"s":""} planted
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))",gap:10}}>
            <AnimatePresence>
              {[...garden].reverse().map((f,i)=><FlowerCard key={f.id} flower={f} index={i} isNew={newId===f.id}/>)}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ── MILESTONES ── */}
      {garden.length>0&&(
        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.38}} style={{marginTop:28}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,
            color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",
            textAlign:"center",marginBottom:14}}>Milestones</p>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
            {MILESTONES.map((m,i)=>{
              const done=garden.length>=m.n;
              return(
                <motion.div key={i}
                  initial={{opacity:0,scale:.78}} animate={{opacity:done?1:.35,scale:1}}
                  transition={{delay:.42+i*.07,type:"spring"}}
                  whileHover={done?{scale:1.07,y:-4}:{}}
                  style={{flexShrink:0,minWidth:82,padding:"12px 8px",textAlign:"center",
                    background:done?"rgba(236,72,153,.13)":"rgba(255,255,255,.03)",
                    border:`1.5px solid ${done?"rgba(236,72,153,.42)":"rgba(255,255,255,.07)"}`,
                    borderRadius:14,boxShadow:done?"0 4px 20px rgba(236,72,153,.2)":"none"}}>
                  <div style={{fontSize:"1.5rem",marginBottom:5,filter:done?"none":"grayscale(1)",
                    display:"inline-block",
                    animation:done?`fg5-sway ${3.5+i*.4}s ease-in-out ${i*.38}s infinite`:"none",
                    transformOrigin:"bottom center"}}>{m.e}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:".57rem",fontWeight:700,
                    color:done?"#ec4899":"rgba(255,255,255,.28)",lineHeight:1.3}}>{m.label}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:".52rem",
                    color:"rgba(255,255,255,.18)",marginTop:3}}>{m.n} flowers</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── FOOTER ── */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}
        style={{marginTop:28,textAlign:"center",padding:"28px 24px",
          background:"linear-gradient(135deg,rgba(236,72,153,.09),rgba(139,92,246,.06))",
          border:"1px solid rgba(236,72,153,.16)",borderRadius:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.04) 50%,transparent 64%)",
          backgroundSize:"200% 100%",animation:"fg5-shimmer 5s linear infinite",pointerEvents:"none"}}/>
        <motion.div animate={{scale:[1,1.08,1]}} transition={{duration:3,repeat:Infinity}}
          style={{fontSize:"1.8rem",marginBottom:10}}>💍</motion.div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.06rem",fontStyle:"italic",
          color:"rgba(255,255,255,.55)",margin:"0 0 8px",lineHeight:1.7}}>
          "Every day you water this garden, you're telling me you choose us 💙"
        </p>
        <p style={{fontFamily:"'Manrope',sans-serif",fontSize:".88rem",fontWeight:700,
          color:"rgba(255,255,255,.65)",margin:0}}>— Surya &amp; Sadhana 💍</p>
      </motion.div>
    </div>
  );
}
