import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

/* ─── data ─── */
const FLOWER_TYPES  = ["🌸","🌺","🌻","🌹","🌷","🌼","🪷","💐","🌸","🌺"];
const GROWTH_STAGES = [
  { emoji:"🌱", label:"Seedling",  size:28 },
  { emoji:"🌿", label:"Sprouting", size:36 },
  { emoji:"🪴", label:"Growing",   size:44 },
  { emoji:"🌸", label:"Blooming",  size:52 },
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

/* ─── CSS ─── */
function injectCSS() {
  if (document.getElementById("fg4-css")) return;
  const s = document.createElement("style");
  s.id = "fg4-css";
  s.textContent = `
    @keyframes fg4-sway    { 0%,100%{transform:rotate(-7deg) translateY(0)} 50%{transform:rotate(7deg) translateY(-8px)} }
    @keyframes fg4-swayW   { 0%,100%{transform:rotate(-14deg)translateY(0)} 50%{transform:rotate(14deg)translateY(-12px)} }
    @keyframes fg4-float   { 0%{transform:translateY(0)rotate(0);opacity:1} 100%{transform:translateY(-170px)rotate(400deg);opacity:0} }
    @keyframes fg4-petal   { 0%{transform:translateY(-10px)translateX(0)rotate(0);opacity:1}
                             45%{opacity:.85;transform:translateY(42vh)translateX(28px)rotate(210deg)}
                             100%{transform:translateY(108vh)translateX(-18px)rotate(430deg);opacity:0} }
    @keyframes fg4-drop    { 0%{transform:translateY(-55px)scaleY(1.5);opacity:1} 100%{transform:translateY(110px)scaleY(.7);opacity:0} }
    @keyframes fg4-ripple  { 0%{transform:scale(.2);opacity:.9} 100%{transform:scale(4.5);opacity:0} }
    @keyframes fg4-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes fg4-spin    { to{transform:rotate(360deg)} }
    @keyframes fg4-sparkle { 0%,100%{transform:scale(0)rotate(0);opacity:0} 50%{transform:scale(1.5)rotate(180deg);opacity:1} }
    @keyframes fg4-twinkle { 0%,100%{opacity:.1;transform:scale(.6)} 50%{opacity:1;transform:scale(1.4)} }
    @keyframes fg4-cloud   { 0%{transform:translateX(0)} 100%{transform:translateX(32px)} }
    @keyframes fg4-fly     { 0%,100%{transform:translateY(0)translateX(0)rotate(-6deg)} 33%{transform:translateY(-20px)translateX(14px)rotate(6deg)} 66%{transform:translateY(-9px)translateX(-9px)rotate(-3deg)} }
    @keyframes fg4-firefly { 0%,100%{opacity:.08;transform:translate(0,0)scale(.6)} 50%{opacity:1;transform:translate(12px,-16px)scale(1.6)} }
    @keyframes fg4-sunGlow { 0%,100%{box-shadow:0 0 38px 16px rgba(251,191,36,.55),0 0 90px 40px rgba(251,191,36,.22)} 50%{box-shadow:0 0 60px 26px rgba(251,191,36,.8),0 0 130px 65px rgba(251,191,36,.35)} }
    @keyframes fg4-wind    { 0%{transform:translateX(-110%)skewX(-18deg);opacity:0} 45%{opacity:.24} 100%{transform:translateX(130vw)skewX(-18deg);opacity:0} }
    @keyframes fg4-pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,.55)} 50%{box-shadow:0 0 0 24px rgba(236,72,153,0)} }
    @keyframes fg4-rainbow { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
    @keyframes fg4-mist    { 0%,100%{transform:translateX(0)scaleY(1);opacity:.22} 50%{transform:translateX(14px)scaleY(1.1);opacity:.34} }
    @keyframes fg4-badge   { 0%,100%{transform:scale(1)rotate(-3deg)} 50%{transform:scale(1.25)rotate(3deg)} }
    @keyframes fg4-bloomG  { 0%,100%{filter:drop-shadow(0 0 6px rgba(236,72,153,.65))} 50%{filter:drop-shadow(0 0 22px rgba(236,72,153,1))drop-shadow(0 0 36px rgba(251,191,36,.6))} }
    @keyframes fg4-heartUp { 0%{transform:scale(0)translateY(0);opacity:1} 100%{transform:scale(1.4)translateY(-80px);opacity:0} }
    @keyframes fg4-grass   { 0%,100%{transform:rotate(-5deg)scaleY(1)} 50%{transform:rotate(6deg)scaleY(1.05)} }
    @keyframes fg4-hill    { 0%,100%{transform:scaleX(1)translateY(0)} 50%{transform:scaleX(1.008)translateY(-1px)} }
  `;
  document.head.appendChild(s);
}

/* ─── sky canvas (stars + shooting stars) ─── */
function SkyCanvas({ isDay }) {
  const cvRef = useRef(null); const rafRef = useRef(null);
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize(); const ro = new ResizeObserver(resize); ro.observe(cv);
    const ctx = cv.getContext("2d");
    const stars = Array.from({length:120}, () => ({
      x:Math.random(), y:Math.random(), r:.5+Math.random()*2,
      ph:Math.random()*Math.PI*2, sp:.25+Math.random()*1.4,
    }));
    const shots = []; let stimer;
    const spawn = () => shots.push({
      x:Math.random()*cv.width*.8, y:Math.random()*cv.height*.4,
      vx:9+Math.random()*13, vy:3+Math.random()*7,
      len:110+Math.random()*170, life:1, decay:.015+Math.random()*.014,
      gold:Math.random()<.32,
    });
    spawn(); stimer = setInterval(spawn, 1700);
    const tick = () => {
      const {width:cw,height:ch}=cv; ctx.clearRect(0,0,cw,ch);
      const t=Date.now()/1000;
      if (!isDay) {
        stars.forEach(s=>{
          const a=.18+.82*Math.abs(Math.sin(t*s.sp+s.ph));
          ctx.beginPath(); ctx.arc(s.x*cw,s.y*ch,s.r,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,255,255,${a.toFixed(2)})`; ctx.fill();
        });
        for (let i=shots.length-1;i>=0;i--) {
          const s=shots[i]; s.x+=s.vx; s.y+=s.vy; s.life-=s.decay;
          if (s.life<=0||s.x>cw+260){shots.splice(i,1);continue;}
          const tx=s.x-s.vx*(s.len/Math.max(Math.abs(s.vx),1));
          const ty=s.y-s.vy*(s.len/Math.max(Math.abs(s.vx),1));
          const g=ctx.createLinearGradient(tx,ty,s.x,s.y);
          g.addColorStop(0,"transparent");
          g.addColorStop(.55,s.gold?"rgba(255,200,80,.55)":"rgba(200,170,255,.55)");
          g.addColorStop(1,"rgba(255,255,255,.95)");
          ctx.save(); ctx.globalAlpha=Math.max(0,s.life);
          ctx.strokeStyle=g; ctx.lineWidth=s.gold?2.2:1.6;
          ctx.shadowColor=s.gold?"#fbbf24":"#a78bfa"; ctx.shadowBlur=s.gold?18:12;
          ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(s.x,s.y); ctx.stroke();
          ctx.beginPath(); ctx.arc(s.x,s.y,s.gold?4:2.5,0,Math.PI*2);
          ctx.fillStyle="#fff"; ctx.shadowBlur=s.gold?28:16; ctx.fill(); ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); clearInterval(stimer); ro.disconnect(); };
  }, [isDay]);
  return <canvas ref={cvRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
}

/* ─── water drops ─── */
function WaterDrops({active}) {
  if (!active) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:60,overflow:"hidden"}}>
      {[...Array(22)].map((_,i)=>(
        <span key={i} style={{position:"absolute",top:"8%",left:`${2+i*4.6}%`,fontSize:`${11+(i%4)*5}px`,
          animation:`fg4-drop ${.48+i*.055}s cubic-bezier(.25,.46,.45,.94) ${i*.048}s both`}}>💧</span>
      ))}
      {[...Array(7)].map((_,i)=>(
        <div key={`r${i}`} style={{position:"absolute",bottom:"26%",left:`${7+i*14}%`,width:30,height:13,
          border:"2px solid rgba(96,165,250,.65)",borderRadius:"50%",
          animation:`fg4-ripple 1.1s ease-out ${.52+i*.1}s both`}}/>
      ))}
    </div>
  );
}

/* ─── petal rain ─── */
function PetalBurst({active}) {
  if (!active) return null;
  const p=["🌸","🌺","🌷","🌼","🪷","💮","🌸","🌺","✨","💕","🌸","🌺","🌷","💗","🌸","🌺","🌷","✨"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:55,overflow:"hidden"}}>
      {p.map((x,i)=>(
        <span key={i} style={{position:"absolute",top:"-12px",left:`${1+i*5.6}%`,fontSize:`${12+(i%5)*6}px`,
          animation:`fg4-petal ${2.7+i*.24}s cubic-bezier(.25,.46,.45,.94) ${i*.065}s forwards`}}>{x}</span>
      ))}
    </div>
  );
}

/* ─── sparkle ring around bloomed flower ─── */
function Sparkles() {
  return (
    <>{[...Array(6)].map((_,i)=>{
      const a=(i/6)*360, r=30;
      return <div key={i} style={{position:"absolute",left:`calc(50% + ${Math.cos(a*Math.PI/180)*r}px)`,top:`calc(50% + ${Math.sin(a*Math.PI/180)*r}px)`,width:7,height:7,background:"#fde68a",borderRadius:"50%",boxShadow:"0 0 8px 4px rgba(251,191,36,.85)",animation:`fg4-sparkle ${1.4+i*.28}s ease-in-out ${i*.22}s infinite`,transform:"translate(-50%,-50%)"}}/>;
    })}</>
  );
}

/* ─── single flower with stem ─── */
function SceneFlower({flower, index, wind}) {
  const bloomed = flower.stage >= GROWTH_STAGES.length-1;
  const st      = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length-1)];
  const emoji   = bloomed ? flower.type : st.emoji;
  const sz      = st.size + (index%4)*5;
  const stemH   = 14 + flower.stage*10;
  const sway    = wind
    ? `fg4-swayW ${.9+(index%3)*.3}s ease-in-out ${index*.09}s infinite`
    : bloomed
      ? `fg4-sway ${2.1+(index%4)*.5}s ease-in-out ${index*.14}s infinite`
      : `fg4-grass ${2.6+(index%3)*.4}s ease-in-out ${index*.18}s infinite`;

  return (
    <motion.div layout
      initial={{scale:0,y:50,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:0,y:20,opacity:0}}
      transition={{type:"spring",stiffness:220,damping:15,delay:index*.06}}
      style={{display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:3}}>
      {bloomed && <Sparkles/>}
      <span style={{fontSize:sz,display:"inline-block",transformOrigin:"bottom center",
        animation:sway,
        filter:bloomed?"drop-shadow(0 0 14px rgba(236,72,153,.85)) drop-shadow(0 0 28px rgba(251,191,36,.4))":"drop-shadow(0 2px 4px rgba(0,0,0,.5))",
      }}>{emoji}</span>
      {/* stem */}
      <div style={{width:4,height:stemH,borderRadius:2,
        background:bloomed?"linear-gradient(180deg,#86efac,#4ade80,#15803d)":"linear-gradient(180deg,#4ade80,#15803d)",
        boxShadow:bloomed?"0 0 8px rgba(74,222,128,.6)":"none",opacity:.95}}/>
      {/* ground circle */}
      <div style={{width:bloomed?20:14,height:4,borderRadius:"50%",
        background:"rgba(0,0,0,.3)",marginTop:1,filter:"blur(2px)"}}/>
    </motion.div>
  );
}

/* ─── flower collection card ─── */
function FlowerCard({flower, index, isNew}) {
  const st      = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length-1)];
  const bloomed = flower.stage >= GROWTH_STAGES.length-1;
  const emoji   = bloomed ? flower.type : st.emoji;
  return (
    <motion.div layout
      initial={{scale:0,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0,opacity:0}}
      transition={{type:"spring",stiffness:280,damping:20,delay:index*.03}}
      whileHover={{scale:1.08,y:-5}}
      style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"14px 10px 12px",
        background:bloomed?"linear-gradient(135deg,rgba(236,72,153,.18),rgba(139,92,246,.11))":"rgba(255,255,255,.05)",
        border:`1.5px solid ${bloomed?"rgba(236,72,153,.5)":"rgba(255,255,255,.09)"}`,
        borderRadius:18,backdropFilter:"blur(10px)",position:"relative",overflow:"hidden",
        boxShadow:bloomed?"0 8px 32px rgba(236,72,153,.28)":"0 4px 14px rgba(0,0,0,.2)"}}>
      {bloomed&&<div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.09) 50%,transparent 64%)",backgroundSize:"200% 100%",animation:"fg4-shimmer 3s linear infinite",borderRadius:18,pointerEvents:"none"}}/>}
      {isNew&&<span style={{position:"absolute",top:5,right:5,fontSize:".47rem",fontWeight:800,background:"linear-gradient(90deg,#ec4899,#8b5cf6)",color:"#fff",padding:"2px 7px",borderRadius:50,textTransform:"uppercase",animation:"fg4-badge 1s ease-in-out infinite"}}>NEW</span>}
      <span style={{fontSize:bloomed?"2.5rem":"2rem",lineHeight:1,display:"inline-block",
        animation:bloomed?`fg4-sway ${2+(index%3)*.6}s ease-in-out infinite`:"none",
        transformOrigin:"bottom center",
        filter:bloomed?"drop-shadow(0 0 12px rgba(236,72,153,.75))":"none"}}>{emoji}</span>
      <span style={{fontSize:".58rem",fontWeight:700,fontFamily:"'Inter',sans-serif",
        color:bloomed?"#ec4899":"#10b981",
        background:bloomed?"rgba(236,72,153,.15)":"rgba(16,185,129,.15)",
        padding:"2px 8px",borderRadius:50,
        border:`1px solid ${bloomed?"rgba(236,72,153,.35)":"rgba(16,185,129,.3)"}`}}>{st.label}</span>
      <span style={{fontSize:".56rem",color:"rgba(255,255,255,.28)",fontFamily:"'Inter',sans-serif"}}>{flower.date}</span>
    </motion.div>
  );
}

/* ════════════════════ MAIN ════════════════════ */
export default function FlowerGarden({user}) {
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
  const [tod,       setTod]       = useState("night"); // time of day
  const confRef = useRef(null);
  injectCSS();

  /* time of day */
  useEffect(()=>{
    const c=()=>{
      const h=new Date().getHours();
      setTod(h>=6&&h<12?"morning":h>=12&&h<17?"day":h>=17&&h<20?"evening":"night");
    }; c(); const id=setInterval(c,60000); return()=>clearInterval(id);
  },[]);

  /* wind gusts */
  useEffect(()=>{
    const g=()=>{setWind(true);setTimeout(()=>setWind(false),2600);};
    g(); const id=setInterval(()=>{g();},5000+Math.random()*5000); return()=>clearInterval(id);
  },[]);

  /* message rotation */
  useEffect(()=>{
    const id=setInterval(()=>setMsgIdx(i=>(i+1)%LOVE_MSGS.length),4200); return()=>clearInterval(id);
  },[]);

  const today  = new Date().toDateString();
  const alreadyWatered = lastVisit===today;
  const bloomed = garden.filter(f=>f.stage>=GROWTH_STAGES.length-1).length;
  const pct     = garden.length ? Math.round((bloomed/garden.length)*100) : 0;
  const isDay   = tod==="morning"||tod==="day";

  /* stable random refs */
  const skyStars  = useRef([...Array(70)].map(()=>({top:`${2+Math.random()*74}%`,left:`${Math.random()*98}%`,sz:1+Math.random()*2.5,dur:1.5+Math.random()*4,del:Math.random()*8}))).current;
  const fireflies = useRef([...Array(16)].map(()=>({top:`${28+Math.random()*56}%`,left:`${4+Math.random()*90}%`,dur:2.4+Math.random()*5,del:Math.random()*5}))).current;
  const butterflies=[{l:"12%",t:"58%",d:0},{l:"62%",t:"46%",d:1.8},{l:"38%",t:"66%",d:.9}];
  const clouds=[{l:"3%",t:"8%",s:1.1,dur:11},{l:"30%",t:"4%",s:.72,dur:14},{l:"57%",t:"12%",s:.62,dur:9},{l:"76%",t:"7%",s:.88,dur:16}];
  const grassBlades=useRef([...Array(36)].map((_,i)=>({
    l:`${(i/35)*95+2}%`, h:14+Math.floor(Math.random()*24),
    c:["#86efac","#4ade80","#22c55e","#16a34a","#bbf7d0","#a7f3d0"][i%6],
    del:(i%9)*.24,
  }))).current;

  const skyGrad = {
    morning:"linear-gradient(180deg,#2d0a4e 0%,#7c3aed 26%,#ea580c 60%,#fbbf24 100%)",
    day:    "linear-gradient(180deg,#0c4a6e 0%,#0369a1 25%,#0ea5e9 60%,#bae6fd 100%)",
    evening:"linear-gradient(180deg,#0c0a1e 0%,#5b21b6 26%,#db2777 58%,#f97316 100%)",
    night:  "linear-gradient(180deg,#020614 0%,#060d2e 35%,#0e1545 65%,#1a1260 100%)",
  };

  /* load data */
  useEffect(()=>{
    Promise.all([dbGet("fg_garden",[]),dbGet("fg_lastvisit",""),dbGet("fg_streak",0)])
      .then(([g,v,s])=>{
        if(Array.isArray(g))setGarden(g);
        if(v)setLastVisit(v);
        if(typeof s==="number")setStreak(s);
        setLoading(false);
      });
  },[]); // eslint-disable-line

  /* confetti */
  const confetti=useCallback(()=>{
    if(!confRef.current)return;
    const cs=["🌸","🌺","🌷","🌼","💕","✨","🌻","💗","🪷","💫","🌸","🌺","🌷","💖"];
    for(let i=0;i<34;i++){
      const el=document.createElement("div");
      el.style.cssText=`position:fixed;top:-26px;left:${Math.random()*100}%;font-size:${10+Math.random()*22}px;pointer-events:none;z-index:99;animation:fg4-float ${1.7+Math.random()*3}s ${Math.random()*.8}s ease-out forwards;`;
      el.textContent=cs[Math.floor(Math.random()*cs.length)];
      confRef.current.appendChild(el);
      setTimeout(()=>el.remove(),5800);
    }
  },[]);

  /* water */
  const water=async()=>{
    if(alreadyWatered||watered)return;
    setDrops(true); setTimeout(()=>setDrops(false),1600);
    await new Promise(r=>setTimeout(r,740));
    const fl={id:Date.now(),type:FLOWER_TYPES[Math.floor(Math.random()*FLOWER_TYPES.length)],stage:0,date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short"})};
    const grown=garden.map(f=>({...f,stage:Math.min(f.stage+1,GROWTH_STAGES.length-1)}));
    const updated=[...grown,fl]; const ns=streak+1;
    const newBlooms=grown.filter(f=>f.stage===GROWTH_STAGES.length-1&&garden.find(g=>g.id===f.id&&g.stage===GROWTH_STAGES.length-2));
    setGarden(updated);setNewId(fl.id);setWatered(true);setLastVisit(today);setStreak(ns);
    if(newBlooms.length>0){setPetals(true);setTimeout(()=>setPetals(false),4000);}
    confetti();
    await Promise.all([dbSet("fg_garden",updated),dbSet("fg_lastvisit",today),dbSet("fg_streak",ns)]);
    setTimeout(()=>setNewId(null),3600);
  };

  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"0 4px 110px",position:"relative"}}>
      <div ref={confRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:98,overflow:"hidden"}}/>
      <WaterDrops active={drops}/> <PetalBurst active={petals}/>

      {/* ══════ SCENE CARD ══════ */}
      <motion.div initial={{opacity:0,y:-22}} animate={{opacity:1,y:0}} transition={{duration:.75}}
        style={{borderRadius:28,overflow:"hidden",marginBottom:24,
          boxShadow:"0 28px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.09)"}}>

        {/* ── SKY ── */}
        <div style={{background:skyGrad[tod],position:"relative",minHeight:280,overflow:"hidden",transition:"background 3s ease",padding:"28px 22px 0"}}>
          <SkyCanvas isDay={isDay}/>

          {/* stars */}
          {!isDay&&skyStars.map((st,i)=>(
            <div key={i} style={{position:"absolute",top:st.top,left:st.left,width:st.sz,height:st.sz,background:"#fff",borderRadius:"50%",animation:`fg4-twinkle ${st.dur}s ease-in-out ${st.del}s infinite`,pointerEvents:"none"}}/>
          ))}

          {/* distant mountains */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:90,pointerEvents:"none"}}>
            {/* far mountains */}
            <svg viewBox="0 0 800 90" preserveAspectRatio="none" style={{position:"absolute",bottom:0,width:"100%",height:"100%"}}>
              <polygon points="0,90 80,20 160,60 240,10 320,50 400,5 480,45 560,15 640,55 720,18 800,50 800,90" fill={isDay?"rgba(14,116,144,.55)":"rgba(30,27,75,.7)"}/>
              <polygon points="0,90 60,40 130,70 200,30 280,65 360,22 430,58 510,28 590,62 660,32 730,58 800,38 800,90" fill={isDay?"rgba(8,145,178,.4)":"rgba(49,46,129,.5)"}/>
            </svg>
          </div>

          {/* hills */}
          <div style={{position:"absolute",bottom:-2,left:0,right:0,height:55,pointerEvents:"none"}}>
            <svg viewBox="0 0 800 55" preserveAspectRatio="none" style={{position:"absolute",bottom:0,width:"100%",height:"100%"}}>
              <ellipse cx="150" cy="55" rx="200" ry="55" fill={isDay?"rgba(21,128,61,.65)":"rgba(15,60,25,.75)"}/>
              <ellipse cx="500" cy="55" rx="240" ry="50" fill={isDay?"rgba(22,163,74,.55)":"rgba(20,55,30,.65)"}/>
              <ellipse cx="750" cy="55" rx="150" ry="48" fill={isDay?"rgba(21,128,61,.5)":"rgba(14,50,22,.6)"}/>
            </svg>
          </div>

          {/* sun */}
          {isDay&&(
            <div style={{position:"absolute",top:18,right:32,width:64,height:64,borderRadius:"50%",
              background:"radial-gradient(circle,#fff9c4 0%,#fde68a 42%,#fbbf24 100%)",
              animation:"fg4-sunGlow 3.5s ease-in-out infinite",zIndex:2}}>
              <div style={{position:"absolute",inset:-20,background:"radial-gradient(circle,rgba(251,191,36,.28) 0%,transparent 65%)",borderRadius:"50%"}}/>
              {[...Array(10)].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:3,height:20+i%2*6,
                  background:"rgba(251,191,36,.45)",borderRadius:2,transformOrigin:"top center",
                  transform:`translate(-50%,-50%) rotate(${i*36}deg) translateY(-44px)`}}/>
              ))}
            </div>
          )}

          {/* moon */}
          {tod==="night"&&(
            <div style={{position:"absolute",top:16,right:32,width:60,height:60,borderRadius:"50%",
              background:"linear-gradient(135deg,#fffde0,#ffe87a,#f5c518)",
              boxShadow:"0 0 36px 14px rgba(255,215,0,.28),0 0 80px 35px rgba(255,200,0,.12)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.7rem",zIndex:2}}>🌙</div>
          )}

          {/* evening aurora */}
          {tod==="evening"&&<div style={{position:"absolute",top:0,left:0,right:0,height:"62%",background:"linear-gradient(180deg,rgba(109,40,217,.32),rgba(219,39,119,.2),transparent)",pointerEvents:"none",animation:"fg4-mist 4s ease-in-out infinite"}}/>}
          {tod==="morning"&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"linear-gradient(0deg,rgba(234,88,12,.3),rgba(251,191,36,.18),transparent)",pointerEvents:"none",animation:"fg4-mist 5s ease-in-out infinite"}}/>}

          {/* clouds */}
          {clouds.map((c,i)=>(
            <div key={i} style={{position:"absolute",top:c.t,left:c.l,fontSize:`${32*c.s}px`,opacity:isDay?.85:.14,
              animation:`fg4-cloud ${c.dur}s ease-in-out ${i*2.2}s infinite alternate`,filter:"blur(.5px)",transition:"opacity 3s"}}>☁️</div>
          ))}

          {/* fireflies */}
          {!isDay&&fireflies.map((f,i)=>(
            <div key={i} style={{position:"absolute",top:f.top,left:f.left,width:5,height:5,borderRadius:"50%",
              background:"#ffe066",boxShadow:"0 0 10px 5px rgba(255,215,0,.7)",
              animation:`fg4-firefly ${f.dur}s ease-in-out ${f.del}s infinite`}}/>
          ))}

          {/* butterflies */}
          {butterflies.map((b,i)=>(
            <div key={i} style={{position:"absolute",top:b.t,left:b.l,fontSize:"22px",opacity:.85,
              animation:`fg4-fly ${3.4+i*.9}s ease-in-out ${b.d}s infinite`,zIndex:2}}>🦋</div>
          ))}

          {/* wind */}
          {wind&&(
            <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:3}}>
              {[...Array(9)].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:`${12+i*9}%`,left:0,
                  width:`${90+i*55}px`,height:`${1+(i%2)}px`,
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent)",
                  animation:`fg4-wind ${1.1+i*.28}s linear ${i*.13}s infinite`}}/>
              ))}
            </div>
          )}

          {/* HEADER TEXT */}
          <div style={{textAlign:"center",paddingBottom:28,position:"relative",zIndex:4}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 18px",
              background:"linear-gradient(90deg,rgba(236,72,153,.22),rgba(139,92,246,.22),rgba(236,72,153,.22))",
              backgroundSize:"200% 100%",animation:"fg4-rainbow 4s linear infinite",
              border:"1px solid rgba(236,72,153,.38)",borderRadius:50,marginBottom:12,
              fontFamily:"'Inter',sans-serif",fontSize:".66rem",fontWeight:700,
              color:"#f9a8d4",letterSpacing:"1.5px",textTransform:"uppercase"}}>🌸 Our Love Garden</div>

            <motion.h1 initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:.2}}
              style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.6rem",fontWeight:600,fontStyle:"italic",
                color:"#fff",margin:"0 0 10px",
                textShadow:"0 0 60px rgba(236,72,153,.55),0 2px 14px rgba(0,0,0,.65)"}}>
              Flower Garden 🌺
            </motion.h1>

            <AnimatePresence mode="wait">
              <motion.p key={msgIdx} initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-7}} transition={{duration:.38}}
                style={{fontFamily:"'Inter',sans-serif",fontSize:".85rem",color:"rgba(255,255,255,.52)",margin:"0 0 8px",fontStyle:"italic"}}>
                "{LOVE_MSGS[msgIdx]}"
              </motion.p>
            </AnimatePresence>

            <div style={{fontSize:".65rem",color:"rgba(255,255,255,.35)",fontFamily:"'Inter',sans-serif"}}>
              {tod==="morning"&&"🌅 Good morning"}{tod==="day"&&"☀️ Afternoon"}{tod==="evening"&&"🌆 Evening"}{tod==="night"&&"🌙 Night time"}
              {wind&&<span style={{marginLeft:10,color:"rgba(255,255,255,.48)"}}>💨 Breeze</span>}
            </div>
          </div>
        </div>

        {/* ── GROUND SCENE ── */}
        <div style={{position:"relative",background:"linear-gradient(180deg,#0d2a0a 0%,#091e06 48%,#061402 100%)",minHeight:220,overflow:"hidden"}}>

          {/* sky-ground transition */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:14,background:"linear-gradient(180deg,rgba(34,197,94,.55),transparent)"}}/>

          {/* 36 grass blades */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:42,overflow:"hidden"}}>
            {grassBlades.map((b,i)=>(
              <div key={i} style={{position:"absolute",bottom:0,left:b.l,width:4,height:b.h,
                background:`linear-gradient(180deg,${b.c},#15803d)`,borderRadius:"4px 4px 0 0",
                transformOrigin:"bottom center",
                animation:`${wind?"fg4-swayW":"fg4-grass"} ${wind?1.1:2.4}s ease-in-out ${b.del}s infinite`}}/>
            ))}
          </div>

          {/* mid-ground shrubs */}
          {[8,22,38,55,70,85].map((l,i)=>(
            <div key={i} style={{position:"absolute",top:18,left:`${l}%`,fontSize:`${16+(i%3)*6}px`,opacity:.75,
              animation:`fg4-grass ${2+i*.4}s ease-in-out ${i*.3}s infinite`,transformOrigin:"bottom center"}}>🌿</div>
          ))}

          {/* ground mist */}
          <div style={{position:"absolute",bottom:44,left:0,right:0,height:44,
            background:"radial-gradient(ellipse at 50% 100%,rgba(134,239,172,.16) 0%,transparent 68%)",
            animation:"fg4-mist 7s ease-in-out infinite"}}/>

          {/* main flower bed */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",
            gap:14,padding:"32px 28px 100px",flexWrap:"wrap",position:"relative",zIndex:4,minHeight:160}}>
            <AnimatePresence>
              {(garden.length===0?[{id:0,type:"🌱",stage:0,date:""}]:garden)
                .slice().reverse().slice(0,26).map((f,i)=>(
                  <SceneFlower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>

          {/* wooden fence */}
          <div style={{position:"absolute",bottom:28,left:0,right:0,height:62,zIndex:5,pointerEvents:"none"}}>
            {/* rails */}
            <div style={{position:"absolute",top:10,left:0,right:0,height:8,
              background:"linear-gradient(90deg,#7c3b12,#a0522d,#6b3310,#a0522d,#7c3b12)",
              borderRadius:3,boxShadow:"0 3px 8px rgba(0,0,0,.55)",
              backgroundSize:"200px 100%"}}/>
            <div style={{position:"absolute",top:33,left:0,right:0,height:6,
              background:"linear-gradient(90deg,#6b3310,#8b4513,#6b3310,#8b4513,#6b3310)",
              borderRadius:3,boxShadow:"0 2px 6px rgba(0,0,0,.45)"}}/>
            {/* posts */}
            {[...Array(10)].map((_,i)=>(
              <div key={i} style={{position:"absolute",bottom:0,left:`${i*10.5+2}%`,
                width:11,height:56,transform:"translateX(-50%)",
                background:"linear-gradient(180deg,#a0522d,#7c3b12,#5a2d0c)",
                borderRadius:"4px 4px 0 0",boxShadow:"2px 0 6px rgba(0,0,0,.45)"}}>
                <div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",
                  width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"11px solid #a0522d"}}/>
                <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(180deg,rgba(255,255,255,.04) 0px,rgba(255,255,255,.04) 1px,transparent 1px,transparent 7px)",borderRadius:"4px 4px 0 0"}}/>
              </div>
            ))}
            {/* vines on fence */}
            {[16,42,68].map((l,i)=>(
              <div key={i} style={{position:"absolute",top:-6,left:`${l}%`,fontSize:"15px",opacity:.78,
                animation:`fg4-grass ${3+i*.7}s ease-in-out ${i*.4}s infinite`,transformOrigin:"bottom center"}}>🌿</div>
            ))}
          </div>

          {/* soil */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:32,
            background:"linear-gradient(180deg,#4a2000,#2d1100,#1a0a00)"}}/>

          {/* soil texture */}
          <div style={{position:"absolute",bottom:28,left:0,right:0,height:6,
            background:"linear-gradient(90deg,#6b3310,#9a4e1e,#6b3310,#9a4e1e,#6b3310)",opacity:.55}}/>

          {/* stats pills */}
          <div style={{position:"absolute",top:6,left:0,right:0,display:"flex",justifyContent:"center",gap:10,zIndex:6}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"#86efac",
              background:"rgba(0,0,0,.62)",padding:"4px 15px",borderRadius:50,
              backdropFilter:"blur(6px)",border:"1px solid rgba(134,239,172,.25)"}}>🌸 {bloomed} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.52)",
              background:"rgba(0,0,0,.62)",padding:"4px 15px",borderRadius:50,
              backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,.12)"}}>🌱 {garden.length-bloomed} growing</span>
          </div>
        </div>
      </motion.div>

      {/* ══ STATS ══ */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.12}}
        style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Planted", value:garden.length,         color:"#ec4899",icon:"🌱",bg:"rgba(236,72,153,.09)"},
          {label:"Bloomed", value:bloomed,               color:"#8b5cf6",icon:"🌸",bg:"rgba(139,92,246,.09)"},
          {label:"Growing", value:garden.length-bloomed, color:"#10b981",icon:"🌿",bg:"rgba(16,185,129,.09)"},
          {label:"Streak",  value:`${streak}d`,          color:"#f59e0b",icon:"🔥",bg:"rgba(245,158,11,.09)"},
        ].map((s,i)=>(
          <motion.div key={i} initial={{opacity:0,scale:.75}} animate={{opacity:1,scale:1}}
            transition={{delay:.16+i*.07,type:"spring",stiffness:230}} whileHover={{scale:1.06,y:-3}}
            style={{padding:"14px 6px",textAlign:"center",background:s.bg,
              border:`1.5px solid ${s.color}30`,borderRadius:16,backdropFilter:"blur(8px)",
              boxShadow:`0 4px 18px ${s.color}1a`}}>
            <motion.div animate={{scale:[1,1.2,1]}} transition={{duration:2.6,repeat:Infinity,delay:i*.55}}
              style={{fontSize:"1.3rem",marginBottom:4}}>{s.icon}</motion.div>
            <div style={{fontFamily:"'Manrope',sans-serif",fontSize:"1.4rem",fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:".54rem",color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".5px"}}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ══ PROGRESS ══ */}
      {garden.length>0&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.22}}
          style={{marginBottom:20,padding:"18px 20px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.36)",textTransform:"uppercase",letterSpacing:"1px"}}>Bloom Progress</span>
            <span style={{fontFamily:"'Manrope',sans-serif",fontSize:".78rem",fontWeight:800,color:"#ec4899"}}>{pct}%</span>
          </div>
          <div style={{height:10,background:"rgba(255,255,255,.07)",borderRadius:5,overflow:"hidden"}}>
            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.4,ease:"easeOut",delay:.35}}
              style={{height:"100%",background:"linear-gradient(90deg,#ec4899,#8b5cf6,#06b6d4,#10b981)",borderRadius:5,
                backgroundSize:"200% 100%",animation:"fg4-rainbow 3s linear infinite",
                boxShadow:"0 0 16px rgba(236,72,153,.65)"}}/>
          </div>
          <div style={{display:"flex",gap:3,marginTop:10,justifyContent:"center"}}>
            {[...Array(10)].map((_,i)=>(
              <motion.span key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:.4+i*.05}}
                style={{fontSize:".9rem",opacity:pct>=(i+1)*10?1:.14,transition:"opacity .5s"}}>
                {pct>=(i+1)*10?"❤️":"🤍"}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══ WATER BUTTON ══ */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <AnimatePresence mode="wait">
          {alreadyWatered||watered ? (
            <motion.div key="done" initial={{opacity:0,scale:.88}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              style={{display:"inline-flex",alignItems:"center",gap:10,padding:"16px 32px",
                background:"rgba(16,185,129,.12)",border:"1.5px solid rgba(16,185,129,.35)",
                borderRadius:50,color:"#10b981",fontFamily:"'Inter',sans-serif",fontSize:".9rem",fontWeight:600}}>
              ✅ {watered?"Garden watered! New flower planted 🌸":"Come back tomorrow 💕"}
            </motion.div>
          ):(
            <motion.button key="btn" whileHover={{scale:1.08,y:-6}} whileTap={{scale:.94}} onClick={water}
              style={{display:"inline-flex",alignItems:"center",gap:12,padding:"19px 54px",
                background:"linear-gradient(135deg,#3b82f6,#06b6d4,#10b981,#3b82f6)",
                backgroundSize:"300% 100%",animation:"fg4-rainbow 3s linear infinite, fg4-pulse 2.5s ease-in-out 1s infinite",
                border:"none",borderRadius:50,color:"#fff",fontFamily:"'Manrope',sans-serif",
                fontSize:"1.06rem",fontWeight:800,cursor:"pointer",
                boxShadow:"0 16px 48px rgba(59,130,246,.55)",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,borderRadius:50,background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,.28) 50%,transparent 70%)",backgroundSize:"200% 100%",animation:"fg4-shimmer 2s linear infinite"}}/>
              <span style={{position:"relative"}}>💧 Water the Garden Today</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ══ VIEW TOGGLE ══ */}
      {garden.length>0&&(
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {["garden","collection"].map(v=>(
            <motion.button key={v} whileHover={{scale:1.05}} whileTap={{scale:.95}} onClick={()=>setView(v)}
              style={{padding:"9px 24px",borderRadius:50,background:view===v?"rgba(236,72,153,.24)":"rgba(255,255,255,.05)",
                border:`1.5px solid ${view===v?"rgba(236,72,153,.52)":"rgba(255,255,255,.1)"}`,
                color:view===v?"#ec4899":"rgba(255,255,255,.45)",fontFamily:"'Inter',sans-serif",fontSize:".78rem",fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
              {v==="garden"?"🌿 Garden Scene":"🌸 Collection"}
            </motion.button>
          ))}
        </div>
      )}

      {/* ══ CONTENT ══ */}
      {loading ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,.38)"}}>
          <motion.div animate={{rotate:360}} transition={{duration:1.4,repeat:Infinity,ease:"linear"}} style={{fontSize:"2.8rem",display:"inline-block"}}>🌸</motion.div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".9rem",marginTop:14}}>Loading your garden…</p>
        </div>
      ) : garden.length===0 ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{textAlign:"center",padding:"52px 24px",background:"rgba(255,255,255,.03)",border:"1.5px dashed rgba(236,72,153,.26)",borderRadius:24}}>
          <motion.span animate={{scale:[1,1.15,1]}} transition={{duration:2,repeat:Infinity}} style={{fontSize:"3.5rem"}}>🌱</motion.span>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.3rem",fontStyle:"italic",color:"rgba(255,255,255,.48)",margin:"16px 0 10px"}}>Press the button to plant your first flower!</p>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".82rem",color:"rgba(255,255,255,.28)",margin:0}}>Visit every day to grow a beautiful garden 🌸</p>
        </motion.div>
      ) : view==="garden" ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}}
          style={{margin:"0 0 20px",padding:"20px 16px 14px",background:"linear-gradient(180deg,rgba(34,197,94,.08),rgba(21,128,61,.14))",border:"1px solid rgba(34,197,94,.18)",borderRadius:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:22,background:"linear-gradient(180deg,#3d1c02,#261000)",borderRadius:"0 0 20px 20px"}}/>
          <div style={{position:"absolute",bottom:20,left:0,right:0,height:8,background:"linear-gradient(180deg,#16a34a,#15803d)",opacity:.65}}/>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",textAlign:"center",margin:"0 0 12px"}}>🌿 Garden Bed</p>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:10,paddingBottom:30}}>
            <AnimatePresence>
              {garden.slice().reverse().slice(0,26).map((f,i)=>(
                <SceneFlower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:18}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"#86efac"}}>🌸 {bloomed} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"rgba(255,255,255,.32)"}}>🌱 {garden.length-bloomed} growing</span>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",textAlign:"center",marginBottom:14}}>{garden.length} flower{garden.length!==1?"s":""} planted</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))",gap:10}}>
            <AnimatePresence>{[...garden].reverse().map((f,i)=><FlowerCard key={f.id} flower={f} index={i} isNew={newId===f.id}/>)}</AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ══ MILESTONES ══ */}
      {garden.length>0&&(
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.38}} style={{marginTop:28}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",textAlign:"center",marginBottom:14}}>Milestones</p>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
            {MILESTONES.map((m,i)=>{
              const done=garden.length>=m.n;
              return (
                <motion.div key={i} initial={{opacity:0,scale:.78}} animate={{opacity:done?1:.36,scale:1}}
                  transition={{delay:.42+i*.07,type:"spring"}} whileHover={done?{scale:1.08,y:-4}:{}}
                  style={{flexShrink:0,minWidth:82,padding:"12px 8px",textAlign:"center",
                    background:done?"rgba(236,72,153,.15)":"rgba(255,255,255,.03)",
                    border:`1.5px solid ${done?"rgba(236,72,153,.45)":"rgba(255,255,255,.07)"}`,
                    borderRadius:14,boxShadow:done?"0 4px 22px rgba(236,72,153,.22)":"none"}}>
                  <div style={{fontSize:"1.5rem",marginBottom:5,filter:done?"none":"grayscale(1)",display:"inline-block",
                    animation:done?`fg4-sway ${3.5+i*.4}s ease-in-out ${i*.38}s infinite`:"none",transformOrigin:"bottom center"}}>{m.e}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:".57rem",fontWeight:700,color:done?"#ec4899":"rgba(255,255,255,.28)",lineHeight:1.3}}>{m.label}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:".52rem",color:"rgba(255,255,255,.18)",marginTop:3}}>{m.n} flowers</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ══ FOOTER ══ */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.52}}
        style={{marginTop:28,textAlign:"center",padding:"28px 24px",
          background:"linear-gradient(135deg,rgba(236,72,153,.1),rgba(139,92,246,.07))",
          border:"1px solid rgba(236,72,153,.18)",borderRadius:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.05) 50%,transparent 64%)",backgroundSize:"200% 100%",animation:"fg4-shimmer 5s linear infinite",pointerEvents:"none"}}/>
        <motion.div animate={{scale:[1,1.1,1]}} transition={{duration:3,repeat:Infinity}} style={{fontSize:"1.9rem",marginBottom:10}}>💍</motion.div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.08rem",fontStyle:"italic",color:"rgba(255,255,255,.55)",margin:"0 0 8px",lineHeight:1.7}}>
          "Every day you water this garden, you're telling me you choose us 💙"
        </p>
        <p style={{fontFamily:"'Manrope',sans-serif",fontSize:".88rem",fontWeight:700,color:"rgba(255,255,255,.68)",margin:0}}>
          — Surya &amp; Sadhana 💍
        </p>
      </motion.div>
    </div>
  );
}
