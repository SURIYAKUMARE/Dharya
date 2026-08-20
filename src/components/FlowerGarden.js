import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

/* â”€â”€ data â”€â”€ */
const FLOWER_TYPES = ["ðŸŒ¸","ðŸŒº","ðŸŒ»","ðŸŒ¹","ðŸŒ·","ðŸŒ¼","ðŸª·","ðŸ’","ðŸŒ¸","ðŸŒº"];
const GROWTH_STAGES = [
  { emoji:"ðŸŒ±", label:"Seedling",  px:32 },
  { emoji:"ðŸŒ¿", label:"Sprouting", px:40 },
  { emoji:"ðŸª´", label:"Growing",   px:50 },
  { emoji:"ðŸŒ¸", label:"Blooming",  px:58 },
];
const LOVE_MSGS = [
  "Every day you visit, our love grows ðŸ’™",
  "Like a garden, love needs daily care ðŸŒ±",
  "You are the sunshine that makes everything bloom â˜€ï¸",
  "Our love story â€” one flower at a time ðŸŒ¸",
  "Each bloom is a day we chose each other ðŸ’",
  "This garden grows as long as you keep coming back ðŸŒ¿",
];
const MILESTONES = [
  { n:1,  e:"ðŸŒ±", label:"First Flower" },
  { n:7,  e:"ðŸŒ¿", label:"One Week"     },
  { n:14, e:"ðŸª´", label:"Fortnight"    },
  { n:30, e:"ðŸŒ¸", label:"One Month"    },
  { n:50, e:"ðŸŒº", label:"50 Flowers"   },
  { n:100,e:"ðŸ’", label:"100 Days"     },
];

/* â”€â”€ CSS â€“ purge all old garden style tags first â”€â”€ */
function injectCSS() {
  ["fg2-styles","fg3-styles","fg4-css","fg5-css","fg7-css","fg7-css"].forEach(id=>{
    const old = document.getElementById(id); if(old) old.remove();
  });
  if (document.getElementById("fg7-css")) return;
  const s = document.createElement("style");
  s.id = "fg7-css";
  s.textContent = `
    @keyframes fg7-sway   { 0%,100%{transform-origin:bottom center;transform:rotate(-2.5deg)} 50%{transform-origin:bottom center;transform:rotate(2.5deg) translateY(-3px)} }
    @keyframes fg7-swayW  { 0%,100%{transform-origin:bottom center;transform:rotate(-6deg)} 50%{transform-origin:bottom center;transform:rotate(6deg) translateY(-6px)} }
    @keyframes fg7-bloom  { 0%,100%{filter:drop-shadow(0 2px 6px rgba(236,72,153,.45))} 50%{filter:drop-shadow(0 4px 18px rgba(236,72,153,.9)) drop-shadow(0 0 26px rgba(251,191,36,.4))} }
    @keyframes fg7-twink  { 0%,100%{opacity:.1} 50%{opacity:.95} }
    @keyframes fg7-float  { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-160px) rotate(360deg);opacity:0} }
    @keyframes fg7-petal  { 0%{transform:translateY(-12px) translateX(0) rotate(0);opacity:1} 50%{opacity:.8;transform:translateY(44vh) translateX(28px) rotate(210deg)} 100%{transform:translateY(108vh) translateX(-16px) rotate(420deg);opacity:0} }
    @keyframes fg7-drop   { 0%{transform:translateY(-52px);opacity:1} 100%{transform:translateY(105px);opacity:0} }
    @keyframes fg7-ripple { 0%{transform:scale(.2);opacity:.9} 100%{transform:scale(4.2);opacity:0} }
    @keyframes fg7-spin   { to{transform:rotate(360deg)} }
    @keyframes fg7-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,.5)} 50%{box-shadow:0 0 0 24px rgba(236,72,153,0)} }
    @keyframes fg7-shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes fg7-sunray { 0%,100%{opacity:.35} 50%{opacity:.65} }
    @keyframes fg7-badge  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
    @keyframes fg7-cloud  { 0%{transform:translateX(0)} 100%{transform:translateX(28px)} }
    @keyframes fg7-mist   { 0%,100%{opacity:.16} 50%{opacity:.26} }
    @keyframes fg7-wind   { 0%{transform:translateX(-110%) skewX(-12deg);opacity:0} 50%{opacity:.14} 100%{transform:translateX(130vw) skewX(-12deg);opacity:0} }
    /* love tree heart leaf blink */
    @keyframes fg7-heartBlink {
      0%,100%{ opacity:1; transform:scale(1); filter:drop-shadow(0 0 3px rgba(236,72,153,.6)); }
      40%    { opacity:.55; transform:scale(.88); filter:drop-shadow(0 0 1px rgba(236,72,153,.2)); }
      70%    { opacity:.9;  transform:scale(1.08); filter:drop-shadow(0 0 6px rgba(236,72,153,.9)); }
    }
    @keyframes fg7-heartBlinkGreen {
      0%,100%{ opacity:1; transform:scale(1); filter:drop-shadow(0 0 3px rgba(74,222,128,.6)); }
      40%    { opacity:.5; transform:scale(.85); filter:drop-shadow(0 0 1px rgba(74,222,128,.2)); }
      70%    { opacity:.9; transform:scale(1.1); filter:drop-shadow(0 0 7px rgba(74,222,128,.9)); }
    }
    @keyframes fg7-treeSway { 0%,100%{transform-origin:bottom center;transform:rotate(-1.5deg)} 50%{transform-origin:bottom center;transform:rotate(1.5deg)} }
    @keyframes fg7-branchSway { 0%,100%{transform-origin:left bottom;transform:rotate(-2deg)} 50%{transform-origin:left bottom;transform:rotate(2deg)} }
  `;
  document.head.appendChild(s);
}

/* â”€â”€ star / shooting-star canvas (night sky only) â”€â”€ */
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

/* â”€â”€ water drop overlay â”€â”€ */
function WaterDrops({on}) {
  if (!on) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:60,overflow:"hidden"}}>
      {[...Array(20)].map((_,i)=>(
        <span key={i} style={{position:"absolute",top:"8%",left:`${2+i*5}%`,fontSize:`${10+(i%4)*5}px`,
          animation:`fg7-drop ${.45+i*.055}s ease-in ${i*.045}s both`}}>ðŸ’§</span>
      ))}
      {[...Array(6)].map((_,i)=>(
        <div key={`r${i}`} style={{position:"absolute",bottom:"28%",left:`${8+i*15}%`,
          width:28,height:11,border:"1.5px solid rgba(147,197,253,.7)",borderRadius:"50%",
          animation:`fg7-ripple 1s ease-out ${.5+i*.1}s both`}}/>
      ))}
    </div>
  );
}

/* â”€â”€ petal rain on new bloom â”€â”€ */
function PetalRain({on}) {
  if (!on) return null;
  const p = ["ðŸŒ¸","ðŸŒº","ðŸŒ·","ðŸŒ¼","ðŸª·","ðŸ’®","ðŸŒ¸","ðŸŒº","âœ¨","ðŸ’•","ðŸŒ¸","ðŸŒº","ðŸŒ·","ðŸ’—","ðŸŒ¸","ðŸŒº"];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:55,overflow:"hidden"}}>
      {p.map((x,i)=>(
        <span key={i} style={{position:"absolute",top:"-12px",left:`${1+i*6.2}%`,
          fontSize:`${12+(i%5)*6}px`,
          animation:`fg7-petal ${2.6+i*.23}s ease-in-out ${i*.06}s forwards`}}>{x}</span>
      ))}
    </div>
  );
}

/* ══ REALISTIC FLOWER SVGs ══ */
function SoilMound({ cx = 38 }) {
  return (<><ellipse cx={cx} cy="91" rx="20" ry="6.5" fill="#3d1f0a" opacity=".7"/><ellipse cx={cx} cy="89" rx="13" ry="4" fill="#5c3010" opacity=".5"/></>);
}
function PlantSeedling({ sway }) {
  return (<g style={{animation:sway,transformOrigin:"36px 90px"}}><SoilMound cx={36}/><path d="M36,88 C36,80 35,72 36,64" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M35,74 C28,68 24,60 28,56 C32,52 36,58 35,66 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/><path d="M37,70 C44,64 48,56 44,52 C40,48 36,54 37,62 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/><ellipse cx="36" cy="63" rx="4" ry="5.5" fill="#a3e635" stroke="#4ade80" strokeWidth=".8"/></g>);
}
function PlantSprouting({ sway }) {
  return (<g style={{animation:sway,transformOrigin:"36px 90px"}}><SoilMound cx={36}/><path d="M36,88 C35,76 37,62 35,48" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M35,76 C25,70 18,62 22,55 C26,48 34,56 35,68 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.2"/><path d="M37,72 C47,66 54,58 50,51 C46,44 38,52 37,64 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.2"/><path d="M34,60 C26,53 22,44 27,39 C32,34 36,42 35,54 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/><path d="M36,57 C44,50 48,41 43,36 C38,31 35,39 36,51 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/><ellipse cx="35" cy="47" rx="5" ry="6" fill="#bbf7d0" stroke="#4ade80" strokeWidth=".9"/></g>);
}
function PlantGrowing({ sway }) {
  return (<g style={{animation:sway,transformOrigin:"38px 90px"}}><SoilMound cx={38}/><path d="M38,89 C37,74 39,58 37,40" stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round"/><path d="M38,65 C42,58 46,52 48,44" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M37,82 C24,74 16,64 20,55 C24,46 36,56 37,72 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.3"/><path d="M39,78 C52,70 60,60 56,51 C52,42 40,52 39,68 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.3"/><path d="M37,66 C26,58 20,48 25,42 C30,36 37,46 37,58 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.1"/><path d="M39,62 C50,54 56,44 51,38 C46,32 39,42 39,54 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.1"/><ellipse cx="37" cy="39" rx="5.5" ry="7" fill="#bbf7d0" stroke="#4ade80" strokeWidth="1"/></g>);
}
function RoseFlower({ cx=38, cy=28, sway }) {
  return (<g style={{animation:sway,transformOrigin:`${cx}px 90px`}}><SoilMound cx={cx}/><path d={`M${cx},89 C${cx-2},74 ${cx+1},56 ${cx},${cy+34}`} stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/><path d={`M${cx-1},72 C${cx-8},68 ${cx-9},62 ${cx-3},65`} stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d={`M${cx+1},60 C${cx+7},56 ${cx+8},50 ${cx+3},53`} stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d={`M${cx-1},78 C${cx-14},70 ${cx-20},60 ${cx-14},52 C${cx-8},44 ${cx-1},54 ${cx-1},68 Z`} fill="#22c55e" stroke="#15803d" strokeWidth="1.2"/><path d={`M${cx+1},74 C${cx+14},66 ${cx+19},56 ${cx+13},48 C${cx+8},40 ${cx+1},50 ${cx+1},64 Z`} fill="#22c55e" stroke="#15803d" strokeWidth="1.2"/>{[0,45,90,135,180,225,270,315].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*18,ty=cy+Math.sin(r)*14,mx=cx+Math.cos(r)*9,my=cy+Math.sin(r)*9;return <path key={i} d={`M${cx},${cy} Q${mx-Math.sin(r)*6},${my+Math.cos(r)*6} ${tx},${ty} Q${tx+Math.sin(r)*5},${ty-Math.cos(r)*5} ${cx},${cy}`} fill={i%2===0?"#e11d48":"#be123c"} stroke="#9f1239" strokeWidth=".5" opacity=".9"/>;})}{[22,67,112,157,202,247,292,337].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*12,ty=cy+Math.sin(r)*10;return <path key={i} d={`M${cx},${cy} C${cx+Math.cos(r-0.4)*8},${cy+Math.sin(r-0.4)*8} ${tx},${ty} C${tx},${ty} ${cx+Math.cos(r+0.4)*8},${cy+Math.sin(r+0.4)*8} ${cx},${cy}`} fill="#f43f5e" stroke="#e11d48" strokeWidth=".4" opacity=".95"/>;})}<circle cx={cx} cy={cy} r="6" fill="#fb7185" stroke="#e11d48" strokeWidth=".6"/><circle cx={cx} cy={cy} r="3.5" fill="#fecdd3" stroke="#f43f5e" strokeWidth=".5"/><circle cx={cx-1} cy={cy-1} r="1.5" fill="rgba(255,255,255,.6)"/></g>);
}
function LotusFlower({ cx=38, cy=28, sway }) {
  return (<g style={{animation:sway,transformOrigin:`${cx}px 90px`}}><SoilMound cx={cx}/><ellipse cx={cx} cy={cy+52} rx="22" ry="6" fill="#166534" opacity=".7"/><ellipse cx={cx} cy={cy+51} rx="19" ry="5" fill="#15803d" opacity=".5"/><path d={`M${cx},${cy+50} C${cx-1},${cy+38} ${cx+1},${cy+22} ${cx},${cy+12}`} stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round"/>{[0,36,72,108,144,180,216,252,288,324].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*20,ty=cy+Math.sin(r)*16,c1x=cx+Math.cos(r-0.5)*12,c1y=cy+Math.sin(r-0.5)*12,c2x=cx+Math.cos(r+0.5)*12,c2y=cy+Math.sin(r+0.5)*12;return <path key={i} d={`M${cx},${cy+4} C${c1x},${c1y} ${tx-Math.sin(r)*4},${ty+Math.cos(r)*4} ${tx},${ty} C${tx+Math.sin(r)*4},${ty-Math.cos(r)*4} ${c2x},${c2y} Z`} fill={i%2===0?"#fce7f3":"#fdf2f8"} stroke="#fbcfe8" strokeWidth=".6" opacity=".92"/>;})}{[0,60,120,180,240,300].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*12,ty=cy+Math.sin(r)*10;return <path key={i} d={`M${cx},${cy+2} C${cx+Math.cos(r-0.5)*7},${cy+Math.sin(r-0.5)*7} ${tx},${ty} C${cx+Math.cos(r+0.5)*7},${cy+Math.sin(r+0.5)*7} ${cx},${cy+2}`} fill="#f9a8d4" stroke="#ec4899" strokeWidth=".5" opacity=".95"/>;})}<circle cx={cx} cy={cy} r="5.5" fill="#fde68a" stroke="#f59e0b" strokeWidth=".7"/>{[0,51,103,154,205,257,308].map((a,i)=>{const r=a*Math.PI/180;return <circle key={i} cx={cx+Math.cos(r)*3.5} cy={cy+Math.sin(r)*3.5} r=".9" fill="#92400e" opacity=".8"/>;})}<circle cx={cx-1} cy={cy-1} r="2" fill="rgba(255,255,255,.5)"/></g>);
}
function HibiscusFlower({ cx=38, cy=28, sway }) {
  return (<g style={{animation:sway,transformOrigin:`${cx}px 90px`}}><SoilMound cx={cx}/><path d={`M${cx},89 C${cx-2},75 ${cx+2},58 ${cx},${cy+34}`} stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/><path d={`M${cx-1},80 C${cx-16},72 ${cx-22},60 ${cx-14},52 C${cx-7},44 ${cx-1},56 ${cx-1},70 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.2"/><path d={`M${cx+1},75 C${cx+16},67 ${cx+20},55 ${cx+13},48 C${cx+6},41 ${cx+1},52 ${cx+1},65 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.2"/>{[0,72,144,216,288].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*22,ty=cy+Math.sin(r)*20,c1x=cx+Math.cos(r-0.6)*14,c1y=cy+Math.sin(r-0.6)*14,c2x=cx+Math.cos(r+0.6)*14,c2y=cy+Math.sin(r+0.6)*14;const cols=["#fb7185","#f43f5e","#e11d48","#f43f5e","#fb7185"];return (<g key={i}><path d={`M${cx},${cy} C${c1x},${c1y} ${tx},${ty} ${tx},${ty} C${tx},${ty} ${c2x},${c2y} ${cx},${cy}`} fill={cols[i]} stroke="#be123c" strokeWidth=".5" opacity=".92"/><line x1={cx} y1={cy} x2={tx} y2={ty} stroke="rgba(255,255,255,.22)" strokeWidth=".8"/></g>);})}<line x1={cx} y1={cy} x2={cx} y2={cy-14} stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>{[0,51,103,154,205,257,308].map((a,i)=>{const r=a*Math.PI/180;return <circle key={i} cx={cx+Math.cos(r)*4} cy={cy-14+Math.sin(r)*3} r="1.2" fill="#fde68a" stroke="#f59e0b" strokeWidth=".4"/>;})}<circle cx={cx} cy={cy} r="5" fill="#fbbf24" stroke="#d97706" strokeWidth=".7"/><circle cx={cx-1} cy={cy-1} r="2" fill="rgba(255,255,255,.5)"/></g>);
}
function TulipFlower({ cx=38, cy=28, sway, color="#ec4899" }) {
  const dark=color==="#ec4899"?"#be185d":color==="#ef4444"?"#b91c1c":"#d97706";
  const light=color==="#ec4899"?"#fbcfe8":color==="#ef4444"?"#fecaca":"#fde68a";
  return (<g style={{animation:sway,transformOrigin:`${cx}px 90px`}}><SoilMound cx={cx}/><path d={`M${cx},89 C${cx-1},75 ${cx+1},58 ${cx},${cy+28}`} stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round"/><path d={`M${cx},70 C${cx-14},64 ${cx-18},56 ${cx-10},52 C${cx-3},48 ${cx},56 ${cx},66 Z`} fill="#22c55e" stroke="#16a34a" strokeWidth="1"/><path d={`M${cx},${cy+28} C${cx-18},${cy+22} ${cx-20},${cy+8} ${cx-14},${cy-2} C${cx-8},${cy-10} ${cx},${cy+4} ${cx},${cy+28}`} fill={color} stroke={dark} strokeWidth=".6"/><path d={`M${cx},${cy+28} C${cx-6},${cy+18} ${cx-4},${cy+2} ${cx},${cy-8} C${cx+4},${cy+2} ${cx+6},${cy+18} ${cx},${cy+28}`} fill={light} stroke={color} strokeWidth=".5"/><path d={`M${cx},${cy+28} C${cx+18},${cy+22} ${cx+20},${cy+8} ${cx+14},${cy-2} C${cx+8},${cy-10} ${cx},${cy+4} ${cx},${cy+28}`} fill={color} stroke={dark} strokeWidth=".6"/><path d={`M${cx-3},${cy+20} C${cx-4},${cy+12} ${cx-3},${cy+4} ${cx},${cy}`} stroke="rgba(255,255,255,.4)" strokeWidth="1" fill="none" strokeLinecap="round"/><ellipse cx={cx} cy={cy-4} rx="7" ry="4" fill="rgba(255,255,255,.12)"/></g>);
}
function SunflowerPlant({ cx=38, cy=26, sway }) {
  return (<g style={{animation:sway,transformOrigin:`${cx}px 90px`}}><SoilMound cx={cx}/><path d={`M${cx},89 C${cx-3},72 ${cx+2},52 ${cx},${cy+28}`} stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round"/><path d={`M${cx-1},80 C${cx-22},70 ${cx-26},56 ${cx-14},46 C${cx-4},38 ${cx-1},55 ${cx-1},70 Z`} fill="#15803d" stroke="#14532d" strokeWidth="1.3"/><path d={`M${cx+1},72 C${cx+22},62 ${cx+24},48 ${cx+12},38 C${cx+2},30 ${cx+1},46 ${cx+1},62 Z`} fill="#15803d" stroke="#14532d" strokeWidth="1.3"/>{[...Array(16)].map((_,i)=>{const a=(i/16)*Math.PI*2,tx=cx+Math.cos(a)*22,ty=cy+Math.sin(a)*20,c1x=cx+Math.cos(a-0.22)*14,c1y=cy+Math.sin(a-0.22)*14,c2x=cx+Math.cos(a+0.22)*14,c2y=cy+Math.sin(a+0.22)*14;return <path key={i} d={`M${cx},${cy} C${c1x},${c1y} ${tx},${ty} ${tx},${ty} C${tx},${ty} ${c2x},${c2y} ${cx},${cy}`} fill={i%2===0?"#fbbf24":"#f59e0b"} stroke="#d97706" strokeWidth=".5" opacity=".95"/>;})}<circle cx={cx} cy={cy} r="10" fill="#78350f"/><circle cx={cx} cy={cy} r="9" fill="#92400e"/>{[...Array(12)].map((_,i)=>{const a=(i/12)*Math.PI*2;return <circle key={i} cx={cx+Math.cos(a)*5.5} cy={cy+Math.sin(a)*5.5} r="1.4" fill="#1c0a00" opacity=".8"/>;})}{[...Array(6)].map((_,i)=>{const a=(i/6)*Math.PI*2;return <circle key={i} cx={cx+Math.cos(a)*2.5} cy={cy+Math.sin(a)*2.5} r=".9" fill="#1c0a00" opacity=".7"/>;})}<circle cx={cx-2} cy={cy-2} r="2" fill="rgba(255,255,255,.25)"/></g>);
}
function MarigoldFlower({ cx=38, cy=28, sway }) {
  return (<g style={{animation:sway,transformOrigin:`${cx}px 90px`}}><SoilMound cx={cx}/><path d={`M${cx},89 C${cx-1},75 ${cx+1},58 ${cx},${cy+32}`} stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/><path d={`M${cx-1},78 C${cx-14},70 ${cx-18},60 ${cx-10},52 C${cx-3},44 ${cx-1},56 ${cx-1},68 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.1"/><path d={`M${cx+1},73 C${cx+14},65 ${cx+17},55 ${cx+9},47 C${cx+2},40 ${cx+1},51 ${cx+1},63 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.1"/>{[...Array(14)].map((_,i)=>{const a=(i/14)*Math.PI*2,r=20,tx=cx+Math.cos(a)*r,ty=cy+Math.sin(a)*r*0.85,c1x=cx+Math.cos(a-0.3)*12,c1y=cy+Math.sin(a-0.3)*10,c2x=cx+Math.cos(a+0.3)*12,c2y=cy+Math.sin(a+0.3)*10;return <path key={i} d={`M${cx},${cy} C${c1x},${c1y} ${tx},${ty} ${tx},${ty} C${tx},${ty} ${c2x},${c2y} ${cx},${cy}`} fill={i%2===0?"#f97316":"#ea580c"} stroke="#c2410c" strokeWidth=".5" opacity=".92"/>;})}{[...Array(10)].map((_,i)=>{const a=(i/10)*Math.PI*2+(Math.PI/10),r=12,tx=cx+Math.cos(a)*r,ty=cy+Math.sin(a)*r*0.85;return <path key={i} d={`M${cx},${cy} C${cx+Math.cos(a-0.3)*7},${cy+Math.sin(a-0.3)*6} ${tx},${ty} C${cx+Math.cos(a+0.3)*7},${cy+Math.sin(a+0.3)*6} ${cx},${cy}`} fill="#fbbf24" stroke="#f59e0b" strokeWidth=".4" opacity=".95"/>;})}<circle cx={cx} cy={cy} r="5.5" fill="#fde68a" stroke="#f59e0b" strokeWidth=".7"/><circle cx={cx} cy={cy} r="3" fill="#fef9c3"/><circle cx={cx-1} cy={cy-1} r="1.5" fill="rgba(255,255,255,.6)"/></g>);
}
function PlantBloomed({ flowerColor, sway, index }) {
  const cx=38,cy=28;
  const map={"🌹":<RoseFlower cx={cx} cy={cy} sway={sway}/>,"🪷":<LotusFlower cx={cx} cy={cy} sway={sway}/>,"🌺":<HibiscusFlower cx={cx} cy={cy} sway={sway}/>,"🌷":<TulipFlower cx={cx} cy={cy} sway={sway} color="#ec4899"/>,"🌸":<TulipFlower cx={cx} cy={cy} sway={sway} color="#f9a8d4"/>,"🌻":<SunflowerPlant cx={cx} cy={cy} sway={sway}/>,"🌼":<MarigoldFlower cx={cx} cy={cy} sway={sway}/>,"💐":<RoseFlower cx={cx} cy={cy} sway={sway}/>};
  return map[flowerColor]||<RoseFlower cx={cx} cy={cy} sway={sway}/>;
}

/* ── master Flower component with sway + sizing per stage ── */
function Flower({ flower, index, wind }) {
  const bloomed = flower.stage >= GROWTH_STAGES.length - 1;
  const sizes   = [{ w:70, h:100 }, { w:82, h:115 }, { w:92, h:130 }, { w:104, h:148 }];
  const { w: W, h: H } = sizes[Math.min(flower.stage, 3)];
  const sway = wind
    ? `fg7-swayW ${.9+(index%3)*.3}s ease-in-out ${index*.07}s infinite`
    : bloomed
      ? `fg7-sway ${2.5+(index%6)*.4}s ease-in-out ${index*.14}s infinite`
      : `fg7-sway ${3+(index%4)*.5}s ease-in-out ${index*.18}s infinite`;

  return (
    <motion.div layout
      initial={{ scale:0, y:55, opacity:0 }}
      animate={{ scale:1, y:0, opacity:1 }}
      exit={{ scale:0, y:25, opacity:0 }}
      transition={{ type:"spring", stiffness:175, damping:17, delay:index*.055 }}
      style={{ flexShrink:0, position:"relative",
        filter: bloomed
          ? "drop-shadow(0 4px 16px rgba(236,72,153,.5)) drop-shadow(0 0 8px rgba(251,191,36,.25))"
          : "drop-shadow(0 2px 8px rgba(0,0,0,.45))" }}
    >
      <svg width={W} height={H} viewBox="0 0 78 110" style={{ overflow:"visible", display:"block" }}>
        {flower.stage===0 && <PlantSeedling  sway={sway}/>}
        {flower.stage===1 && <PlantSprouting sway={sway}/>}
        {flower.stage===2 && <PlantGrowing   sway={sway}/>}
        {flower.stage===3 && <PlantBloomed   flowerColor={flower.type} sway={sway} index={index}/>}
      </svg>
    </motion.div>
  );
}
/* ══ LOVE TREE — grows with streak, heart leaves blink ══ */
function LoveTree({ streak=0, leafCount=0 }) {
  const treeLevel=Math.min(5,Math.floor(leafCount/6)+1);
  const W=130,H=200;
  const heartPath="M0,-6 C-6,-12 -14,-8 -14,-2 C-14,4 -6,10 0,16 C6,10 14,4 14,-2 C14,-8 6,-12 0,-6 Z";
  const leafSets=[
    [{x:65,y:110,rot:-20,color:"#f9a8d4",dur:1.8,del:0},{x:75,y:100,rot:15,color:"#86efac",dur:2.2,del:0.3},{x:58,y:95,rot:-30,color:"#f9a8d4",dur:1.5,del:0.6},{x:72,y:88,rot:10,color:"#86efac",dur:2.0,del:0.9}],
    [{x:48,y:82,rot:-25,color:"#f9a8d4",dur:1.7,del:0.2},{x:80,y:78,rot:20,color:"#86efac",dur:2.1,del:0.4},{x:60,y:72,rot:-15,color:"#f9a8d4",dur:1.9,del:0.7},{x:74,y:66,rot:30,color:"#86efac",dur:1.6,del:1.0},{x:52,y:68,rot:-35,color:"#ec4899",dur:2.3,del:0.1},{x:82,y:62,rot:12,color:"#4ade80",dur:1.8,del:0.5}],
    [{x:42,y:60,rot:-20,color:"#f9a8d4",dur:2.0,del:0.3},{x:86,y:56,rot:25,color:"#86efac",dur:1.7,del:0.6},{x:62,y:52,rot:-10,color:"#ec4899",dur:2.2,del:0.2},{x:76,y:48,rot:18,color:"#4ade80",dur:1.5,del:0.8},{x:50,y:50,rot:-28,color:"#f9a8d4",dur:1.9,del:0.4},{x:88,y:44,rot:8,color:"#86efac",dur:2.1,del:0.9}],
    [{x:38,y:44,rot:-22,color:"#ec4899",dur:2.0,del:0.1},{x:90,y:40,rot:28,color:"#4ade80",dur:1.8,del:0.4},{x:56,y:36,rot:-12,color:"#f9a8d4",dur:2.3,del:0.6},{x:78,y:32,rot:20,color:"#86efac",dur:1.6,del:0.8},{x:46,y:34,rot:-32,color:"#ec4899",dur:1.9,del:0.2},{x:92,y:30,rot:15,color:"#4ade80",dur:2.1,del:0.5},{x:65,y:26,rot:-5,color:"#f9a8d4",dur:1.7,del:0.7}],
    [{x:36,y:28,rot:-18,color:"#f9a8d4",dur:2.2,del:0.0},{x:94,y:24,rot:22,color:"#86efac",dur:1.8,del:0.3},{x:52,y:22,rot:-28,color:"#ec4899",dur:2.0,del:0.5},{x:80,y:18,rot:16,color:"#4ade80",dur:1.6,del:0.7},{x:65,y:14,rot:-8,color:"#f9a8d4",dur:2.3,del:0.9},{x:44,y:18,rot:-35,color:"#86efac",dur:1.9,del:0.2},{x:85,y:14,rot:30,color:"#ec4899",dur:1.7,del:0.6}],
  ];
  const visibleLeaves=leafSets.slice(0,treeLevel).flat();
  return (
    <div style={{position:"absolute",right:0,bottom:68,width:W,height:H,pointerEvents:"none",zIndex:4}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <defs>
          <linearGradient id="treeGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5c2d0e"/><stop offset="50%" stopColor="#92400e"/><stop offset="100%" stopColor="#5c2d0e"/></linearGradient>
        </defs>
        <path d="M60,195 C58,175 55,155 57,130 C59,105 62,95 65,75 C68,95 71,105 73,130 C75,155 72,175 70,195 Z" fill="url(#treeGrad)" stroke="#451a0a" strokeWidth="1"/>
        <path d="M64,190 C63,172 62,152 63,128 C64,108 65,98 66,82" stroke="rgba(255,220,150,.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {treeLevel>=1&&<><path d="M65,130 C55,118 45,108 40,96" stroke="#7c3a0e" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M65,125 C75,113 85,103 90,91" stroke="#7c3a0e" strokeWidth="5" fill="none" strokeLinecap="round"/></>}
        {treeLevel>=2&&<><path d="M65,110 C57,98 50,88 46,76" stroke="#92400e" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M65,108 C73,96 80,86 84,74" stroke="#92400e" strokeWidth="4" fill="none" strokeLinecap="round"/></>}
        {treeLevel>=3&&<><path d="M65,90 C58,78 52,68 49,56" stroke="#a35010" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M65,88 C72,76 78,66 81,54" stroke="#a35010" strokeWidth="3" fill="none" strokeLinecap="round"/></>}
        {treeLevel>=4&&<><path d="M65,72 C59,60 54,50 51,40" stroke="#b46020" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M65,70 C71,58 76,48 79,38" stroke="#b46020" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>}
        {treeLevel>=5&&<><path d="M65,56 C61,44 57,34 54,24" stroke="#c47028" strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M65,54 C69,42 73,32 76,22" stroke="#c47028" strokeWidth="2" fill="none" strokeLinecap="round"/></>}
        {visibleLeaves.map((leaf,i)=>{
          const isPink=leaf.color==="#ec4899"||leaf.color==="#f9a8d4";
          const anim=isPink?"fg7-heartBlink":"fg7-heartBlinkGreen";
          return (<g key={i} transform={`translate(${leaf.x},${leaf.y}) rotate(${leaf.rot})`} style={{animation:`${anim} ${leaf.dur}s ease-in-out ${leaf.del}s infinite`}}><path d={heartPath} fill={leaf.color} stroke={isPink?"#be185d":"#15803d"} strokeWidth=".8" opacity=".95"/><path d="M0,-6 C-3,-9 -7,-7 -7,-4" stroke="rgba(255,255,255,.35)" strokeWidth=".6" fill="none" strokeLinecap="round"/></g>);
        })}
        <path d="M58,195 C50,198 44,196 42,200" stroke="#451a0a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M72,195 C80,198 86,196 88,200" stroke="#451a0a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      {leafCount>0&&<div style={{position:"absolute",bottom:-18,left:"50%",transform:"translateX(-50%)",fontFamily:"'Inter',sans-serif",fontSize:".6rem",fontWeight:700,color:"rgba(236,72,153,.7)",whiteSpace:"nowrap",textShadow:"0 0 8px rgba(236,72,153,.4)"}}>Love Tree 🌳</div>}
    </div>
  );
}


/* â”€â”€ collection card â”€â”€ */
function FlowerCard({ flower, index, isNew }) {
  const st      = GROWTH_STAGES[Math.min(flower.stage, GROWTH_STAGES.length-1)];
  const bloomed = flower.stage >= GROWTH_STAGES.length-1;
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
      {bloomed && <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.08) 50%,transparent 64%)",backgroundSize:"200% 100%",animation:"fg7-shimmer 3.2s linear infinite",borderRadius:18,pointerEvents:"none"}}/>}
      {isNew  && <span style={{position:"absolute",top:5,right:5,fontSize:".47rem",fontWeight:800,background:"linear-gradient(90deg,#ec4899,#8b5cf6)",color:"#fff",padding:"2px 7px",borderRadius:50,textTransform:"uppercase",animation:"fg7-badge .9s ease-in-out infinite"}}>NEW</span>}
      <svg width="60" height="80" viewBox="0 0 78 110" style={{display:"block",marginBottom:2}}>
        {flower.stage===0 && <PlantSeedling  sway="none"/>}
        {flower.stage===1 && <PlantSprouting sway="none"/>}
        {flower.stage===2 && <PlantGrowing   sway="none"/>}
        {flower.stage===3 && <PlantBloomed   flowerColor={flower.type} sway="none" index={index}/>}
      </svg>
      <span style={{fontSize:".58rem",fontWeight:700,fontFamily:"'Inter',sans-serif",
        color:bloomed?"#ec4899":"#10b981",
        background:bloomed?"rgba(236,72,153,.15)":"rgba(16,185,129,.15)",
        padding:"2px 8px",borderRadius:50,
        border:`1px solid ${bloomed?"rgba(236,72,153,.35)":"rgba(16,185,129,.3)"}`}}>{st.label}</span>
      <span style={{fontSize:".56rem",color:"rgba(255,255,255,.3)",fontFamily:"'Inter',sans-serif"}}>{flower.date}</span>
    </motion.div>
  );
}

/* â•â•â•â• MAIN â•â•â•â• */
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

  /* sky palette â€” realistic colours */
  const SKY = {
    morning: { bg:"linear-gradient(180deg,#0f0624 0%,#4a1d96 30%,#c2410c 65%,#f59e0b 100%)",  horizon:"rgba(249,115,22,.35)" },
    day:     { bg:"linear-gradient(180deg,#0c4a6e 0%,#0369a1 30%,#0ea5e9 65%,#e0f2fe 100%)", horizon:"rgba(125,211,252,.22)" },
    evening: { bg:"linear-gradient(180deg,#0c0a1e 0%,#4c1d95 28%,#be185d 62%,#ea580c 100%)",  horizon:"rgba(249,115,22,.3)"  },
    night:   { bg:"linear-gradient(180deg,#020410 0%,#060c28 35%,#0d1340 65%,#111827 100%)",   horizon:"rgba(30,58,138,.3)"   },
  };

  /* stable element pools */
  const skyStars  = useRef([...Array(80)].map(()=>({ t:`${2+Math.random()*74}%`, l:`${Math.random()*98}%`, sz:1+Math.random()*2.5, dur:1.6+Math.random()*4, del:Math.random()*8 }))).current;
  const clouds    = useRef([{l:"3%",t:"9%",s:1,d:12},{l:"29%",t:"4%",s:.7,d:15},{l:"55%",t:"13%",s:.62,d:10},{l:"76%",t:"6%",s:.88,d:17}]).current;

  /* load â€” auto-seeds July+August data if garden has fewer than 48 flowers */
  useEffect(() => {
    (async () => {
      try {
        let [g, v, s] = await Promise.all([
          dbGet("fg_garden", []),
          dbGet("fg_lastvisit", ""),
          dbGet("fg_streak", 0),
        ]);

        // Seed if we have fewer than 48 flowers (catches fresh DB + old partial data)
        if (!Array.isArray(g) || g.length < 48) {
          try {
            const seedRes = await fetch("/api/seed-garden?force=1", { method: "POST" });
            if (seedRes.ok) {
              // Re-fetch fresh data after seeding
              [g, v, s] = await Promise.all([
                dbGet("fg_garden", []),
                dbGet("fg_lastvisit", ""),
                dbGet("fg_streak", 0),
              ]);
            }
          } catch (e) {
            console.warn("seed-garden failed:", e.message);
          }
        }

        if (Array.isArray(g) && g.length > 0) setGarden(g);
        if (v) setLastVisit(v);
        if (typeof s === "number") setStreak(s);
      } catch (e) {
        console.warn("garden load error:", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  /* confetti */
  const confetti = useCallback(()=>{
    if(!confRef.current) return;
    const cs=["ðŸŒ¸","ðŸŒº","ðŸŒ·","ðŸŒ¼","ðŸ’•","âœ¨","ðŸŒ»","ðŸ’—","ðŸª·","ðŸ’«","ðŸŒ¸","ðŸŒº"];
    for(let i=0;i<30;i++){
      const el=document.createElement("div");
      el.style.cssText=`position:fixed;top:-22px;left:${Math.random()*100}%;font-size:${10+Math.random()*20}px;pointer-events:none;z-index:99;animation:fg7-float ${1.8+Math.random()*2.8}s ${Math.random()*.8}s ease-out forwards;`;
      el.textContent=cs[Math.floor(Math.random()*cs.length)];
      confRef.current.appendChild(el);
      setTimeout(()=>el.remove(),5500);
    }
  },[]);

  /* water / plant â€” adds today's flower, grows existing ones */
  const water = async () => {
    if (alreadyW || watered) return;
    setDrops(true); setTimeout(() => setDrops(false), 1600);
    await new Promise(r => setTimeout(r, 750));

    const fl = {
      id:        Date.now(),
      type:      FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)],
      stage:     0,
      date:      new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short" }),
      plantedAt: new Date().toISOString(),
      daysAgo:   0,
    };

    // Grow all existing flowers by 1 stage
    const grown = garden.map(f => ({
      ...f,
      stage: Math.min(f.stage + 1, GROWTH_STAGES.length - 1),
    }));
    const updated   = [...grown, fl];
    const ns        = streak + 1;
    const newBlooms = grown.filter(f =>
      f.stage === GROWTH_STAGES.length - 1 &&
      garden.find(g => g.id === f.id && g.stage === GROWTH_STAGES.length - 2)
    );

    // Update state immediately
    setGarden(updated);
    setNewId(fl.id);
    setWatered(true);
    setLastVisit(today);
    setStreak(ns);

    if (newBlooms.length > 0) {
      setPetals(true);
      setTimeout(() => setPetals(false), 4000);
    }
    confetti();

    // Persist to MongoDB + localStorage
    await Promise.all([
      dbSet("fg_garden",    updated),
      dbSet("fg_lastvisit", today),
      dbSet("fg_streak",    ns),
    ]);
    setTimeout(() => setNewId(null), 3500);
  };

  const sky = SKY[tod];

  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"0 4px 110px",position:"relative"}}>
      <div ref={confRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:98,overflow:"hidden"}}/>
      <WaterDrops on={drops}/> <PetalRain on={petals}/>

      {/* â•â• SCENE â•â• */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:.7}}
        style={{borderRadius:24,overflow:"hidden",marginBottom:22,
          boxShadow:"0 24px 72px rgba(0,0,0,.72),0 0 0 1px rgba(255,255,255,.07)"}}>

        {/* â”€ SKY â”€ */}
        <div style={{background:sky.bg,position:"relative",minHeight:260,overflow:"hidden",transition:"background 4s ease",padding:"26px 20px 0"}}>
          <StarCanvas show={!isDay}/>

          {/* twinkling stars overlay */}
          {!isDay && skyStars.map((st,i)=>(
            <div key={i} style={{position:"absolute",top:st.t,left:st.l,width:st.sz,height:st.sz,
              background:"#fff",borderRadius:"50%",pointerEvents:"none",zIndex:1,
              animation:`fg7-twink ${st.dur}s ease-in-out ${st.del}s infinite`}}/>
          ))}

          {/* sun â€” day/morning */}
          {isDay && (
            <div style={{position:"absolute",top:16,right:28,width:58,height:58,zIndex:2}}>
              {/* rays */}
              {[...Array(12)].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:2,height:22+(i%2)*6,
                  background:"rgba(253,224,71,.5)",borderRadius:2,transformOrigin:"top center",
                  transform:`translate(-50%,-100%) rotate(${i*30}deg) translateY(-36px)`,
                  animation:`fg7-sunray ${3+i*.2}s ease-in-out ${i*.15}s infinite`}}/>
              ))}
              <div style={{position:"absolute",inset:0,borderRadius:"50%",
                background:"radial-gradient(circle,#fefce8 0%,#fde047 45%,#f59e0b 100%)",
                boxShadow:"0 0 40px 18px rgba(253,224,71,.6),0 0 90px 40px rgba(251,191,36,.3)",
                animation:"fg7-sunray 4s ease-in-out infinite"}}/>
            </div>
          )}

          {/* moon â€” night */}
          {tod==="night" && (
            <div style={{position:"absolute",top:14,right:28,width:58,height:58,borderRadius:"50%",zIndex:2,
              background:"linear-gradient(135deg,#fefce8,#fde68a,#f5c518)",
              boxShadow:"0 0 36px 14px rgba(253,224,71,.28),0 0 80px 36px rgba(251,191,36,.14)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem"}}>ðŸŒ™</div>
          )}

          {/* horizon glow */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:"35%",
            background:`linear-gradient(0deg,${sky.horizon},transparent)`,pointerEvents:"none",
            animation:"fg7-mist 6s ease-in-out infinite"}}/>

          {/* clouds */}
          {clouds.map((c,i)=>(
            <div key={i} style={{position:"absolute",top:c.t,left:c.l,zIndex:2,
              width:`${180*c.s}px`,height:`${55*c.s}px`,
              background:"rgba(255,255,255,.14)",borderRadius:"50%",
              filter:`blur(${8*c.s}px)`,opacity:isDay?.75:.2,
              transition:"opacity 3s ease",
              animation:`fg7-cloud ${c.d}s ease-in-out ${i*2.5}s infinite alternate`}}/>
          ))}

          {/* subtle wind streaks */}
          {wind && (
            <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:3}}>
              {[...Array(6)].map((_,i)=>(
                <div key={i} style={{position:"absolute",top:`${14+i*11}%`,left:0,
                  width:`${80+i*50}px`,height:"1px",
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)",
                  animation:`fg7-wind ${1+i*.25}s linear ${i*.12}s infinite`}}/>
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
              ðŸŒ¸ Our Love Garden
            </div>

            <motion.h1 initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} transition={{delay:.2}}
              style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.6rem",fontWeight:600,
                fontStyle:"italic",color:"#fff",margin:"0 0 10px",
                textShadow:"0 2px 20px rgba(0,0,0,.7),0 0 40px rgba(236,72,153,.3)"}}>
              Flower Garden ðŸŒº
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
              {tod==="morning"&&"ðŸŒ… Good morning"}{tod==="day"&&"â˜€ï¸ Afternoon"}
              {tod==="evening"&&"ðŸŒ† Evening"}{tod==="night"&&"ðŸŒ™ Night time"}
              {wind&&<span style={{marginLeft:10,opacity:.6}}>Â· gentle breeze</span>}
            </div>
          </div>
        </div>

        {/* â”€ GROUND â”€ */}
        <div style={{position:"relative",overflow:"hidden",minHeight:280,
          background:"linear-gradient(180deg,#1e4d10 0%,#163a09 18%,#0f2a05 38%,#0c2004 55%,#3a1800 78%,#1e0d00 100%)"}}>

          {/* top grass-light edge */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:14,
            background:"linear-gradient(180deg,rgba(74,222,128,.28) 0%,rgba(34,197,94,.1) 60%,transparent 100%)"}}/>

          {/* soil base */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:50,
            background:"linear-gradient(180deg,#5c2a06 0%,#3d1800 50%,#1a0900 100%)"}}/>

          {/* ambient under-soil glow */}
          <div style={{position:"absolute",bottom:45,left:"10%",right:"10%",height:28,
            background:"radial-gradient(ellipse at 50% 100%,rgba(74,222,128,.06) 0%,transparent 70%)"}}/>

          {/* ── LOVE TREE (right side, grows with streak) ── */}
          <LoveTree streak={streak} leafCount={bloomedCount + Math.min(streak, 30)}/>
          {/* flowers — offset left to leave room for love tree */}
          <div style={{
            display:"flex", justifyContent:"flex-start", alignItems:"flex-end",
            flexWrap:"wrap", gap:10,
            padding:"18px 140px 105px 16px",
            position:"relative", zIndex:3,
            minHeight:250,
          }}>
            <AnimatePresence>
              {(garden.length===0
                ? [{id:0,type:"ðŸŒ¹",stage:0,date:""}]
                : garden
              ).slice().reverse().slice(0,30).map((f,i)=>(
                <Flower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>

          {/* â”€â”€ SVG FENCE â”€â”€ */}
          <svg viewBox="0 0 900 68" preserveAspectRatio="none"
            style={{position:"absolute",bottom:0,left:0,width:"100%",height:"68px",zIndex:5,display:"block"}}>
            <defs>
              <linearGradient id="fg-rail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#c8722a"/>
                <stop offset="40%"  stopColor="#9a4e1a"/>
                <stop offset="100%" stopColor="#6b3010"/>
              </linearGradient>
              <linearGradient id="fg-post" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#d4884a"/>
                <stop offset="35%"  stopColor="#a05a20"/>
                <stop offset="100%" stopColor="#6b3010"/>
              </linearGradient>
              <filter id="fg-dropshadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".5"/>
              </filter>
              <filter id="fg-postshadow">
                <feDropShadow dx="1" dy="0" stdDeviation="1.5" floodOpacity=".4"/>
              </filter>
            </defs>
            {/* soil strip */}
            <rect x="0" y="52" width="900" height="16" fill="#3d1800"/>
            {/* top plank */}
            <rect x="0" y="10" width="900" height="11" rx="2" fill="url(#fg-rail)" filter="url(#fg-dropshadow)"/>
            {/* bottom plank */}
            <rect x="0" y="32" width="900" height="9"  rx="2" fill="url(#fg-rail)" filter="url(#fg-dropshadow)"/>
            {/* plank highlights */}
            <rect x="0" y="10" width="900" height="2" rx="1" fill="rgba(255,200,120,.18)"/>
            <rect x="0" y="32" width="900" height="1.5" rx="1" fill="rgba(255,200,120,.14)"/>
            {/* wood grain on planks */}
            {[60,140,210,290,370,450,530,610,690,770,840].map((x,i)=>(
              <g key={i}>
                <line x1={x} y1="10" x2={x+8} y2="21" stroke="rgba(0,0,0,.14)" strokeWidth="1.2"/>
                <line x1={x+3} y1="10" x2={x+11} y2="21" stroke="rgba(255,255,255,.05)" strokeWidth=".8"/>
              </g>
            ))}
            {/* posts */}
            {[...Array(11)].map((_,i)=>{
              const px = i*84+14;
              return (
                <g key={i} filter="url(#fg-postshadow)">
                  <rect x={px} y="0" width="14" height="54" rx="3" fill="url(#fg-post)"/>
                  <line x1={px+4}  y1="2" x2={px+4}  y2="52" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
                  <line x1={px+9}  y1="2" x2={px+9}  y2="52" stroke="rgba(0,0,0,.1)"        strokeWidth="1"/>
                  <ellipse cx={px+7} cy="3.5" rx="5.5" ry="2.5" fill="rgba(255,210,140,.28)"/>
                  <rect x={px} y="0" width="14" height="6" rx="3" fill="rgba(220,140,60,.3)"/>
                </g>
              );
            })}
          </svg>

          {/* stats pills */}
          <div style={{position:"absolute",top:8,left:0,right:0,display:"flex",justifyContent:"center",gap:10,zIndex:6}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,
              color:"#86efac",background:"rgba(0,0,0,.65)",padding:"4px 14px",borderRadius:50,
              backdropFilter:"blur(6px)",border:"1px solid rgba(134,239,172,.22)"}}>ðŸŒ¸ {bloomedCount} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,
              color:"rgba(255,255,255,.55)",background:"rgba(0,0,0,.65)",padding:"4px 14px",borderRadius:50,
              backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,.14)"}}>ðŸŒ± {garden.length-bloomedCount} growing</span>
          </div>
        </div>
      </motion.div>

      {/* â”€â”€ STATS â”€â”€ */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.12}}
        style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Planted", value:garden.length,           color:"#ec4899",icon:"ðŸŒ±",bg:"rgba(236,72,153,.08)"},
          {label:"Bloomed", value:bloomedCount,            color:"#8b5cf6",icon:"ðŸŒ¸",bg:"rgba(139,92,246,.08)"},
          {label:"Growing", value:garden.length-bloomedCount,color:"#10b981",icon:"ðŸŒ¿",bg:"rgba(16,185,129,.08)"},
          {label:"Streak",  value:`${streak}d`,            color:"#f59e0b",icon:"ðŸ”¥",bg:"rgba(245,158,11,.08)"},
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

      {/* â”€â”€ PROGRESS â”€â”€ */}
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
                {pct>=(i+1)*10?"â¤ï¸":"ðŸ¤"}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* â”€â”€ WATER BUTTON â”€â”€ */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <AnimatePresence mode="wait">
          {alreadyW||watered ? (
            <motion.div key="done"
              initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              style={{display:"inline-flex",alignItems:"center",gap:10,padding:"16px 30px",
                background:"rgba(16,185,129,.1)",border:"1.5px solid rgba(16,185,129,.32)",
                borderRadius:50,color:"#10b981",fontFamily:"'Inter',sans-serif",fontSize:".9rem",fontWeight:600}}>
              âœ… {watered?"Garden watered! New flower planted ðŸŒ¸":"Come back tomorrow ðŸ’•"}
            </motion.div>
          ):(
            <motion.button key="btn"
              whileHover={{scale:1.07,y:-5}} whileTap={{scale:.95}} onClick={water}
              style={{display:"inline-flex",alignItems:"center",gap:12,padding:"19px 52px",
                background:"linear-gradient(135deg,#1d4ed8,#0891b2,#059669)",
                border:"none",borderRadius:50,color:"#fff",
                fontFamily:"'Manrope',sans-serif",fontSize:"1.05rem",fontWeight:800,cursor:"pointer",
                boxShadow:"0 14px 44px rgba(29,78,216,.45),0 4px 16px rgba(0,0,0,.3)",
                position:"relative",overflow:"hidden",animation:"fg7-pulse 2.8s ease-in-out 1.2s infinite"}}>
              <div style={{position:"absolute",inset:0,borderRadius:50,
                background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%)",
                backgroundSize:"200% 100%",animation:"fg7-shimmer 2.2s linear infinite"}}/>
              <span style={{position:"relative"}}>ðŸ’§ Water the Garden Today</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* â”€â”€ VIEW TOGGLE â”€â”€ */}
      {garden.length>0&&(
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {["garden","collection"].map(v=>(
            <motion.button key={v} whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>setView(v)}
              style={{padding:"9px 24px",borderRadius:50,
                background:v===view?"rgba(236,72,153,.22)":"rgba(255,255,255,.05)",
                border:`1.5px solid ${v===view?"rgba(236,72,153,.5)":"rgba(255,255,255,.1)"}`,
                color:v===view?"#ec4899":"rgba(255,255,255,.45)",
                fontFamily:"'Inter',sans-serif",fontSize:".78rem",fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
              {v==="garden"?"ðŸŒ¿ Garden Scene":"ðŸŒ¸ Collection"}
            </motion.button>
          ))}
        </div>
      )}

      {/* â”€â”€ CONTENT â”€â”€ */}
      {loading ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,.38)"}}>
          <motion.div animate={{rotate:360}} transition={{duration:1.4,repeat:Infinity,ease:"linear"}}
            style={{fontSize:"2.6rem",display:"inline-block"}}>ðŸŒ¸</motion.div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".9rem",marginTop:14}}>Loading your gardenâ€¦</p>
        </div>
      ):garden.length===0?(
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{textAlign:"center",padding:"52px 24px",background:"rgba(255,255,255,.03)",
            border:"1.5px dashed rgba(236,72,153,.24)",borderRadius:24}}>
          <motion.span animate={{scale:[1,1.14,1]}} transition={{duration:2,repeat:Infinity}}
            style={{fontSize:"3.4rem"}}>ðŸŒ±</motion.span>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.28rem",fontStyle:"italic",
            color:"rgba(255,255,255,.48)",margin:"16px 0 10px"}}>Press the button to plant your first flower!</p>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".82rem",color:"rgba(255,255,255,.28)",margin:0}}>
            Visit every day to grow a beautiful garden ðŸŒ¸</p>
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
            textAlign:"center",margin:"0 0 12px"}}>ðŸŒ¿ Garden Bed</p>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:14,paddingBottom:26}}>
            <AnimatePresence>
              {garden.slice().reverse().slice(0,28).map((f,i)=>(
                <Flower key={f.id} flower={f} index={i} wind={wind}/>
              ))}
            </AnimatePresence>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:18}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"#86efac"}}>ðŸŒ¸ {bloomedCount} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"rgba(255,255,255,.32)"}}>ðŸŒ± {garden.length-bloomedCount} growing</span>
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

      {/* â”€â”€ MILESTONES â”€â”€ */}
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
                    animation:done?`fg7-sway ${3.5+i*.4}s ease-in-out ${i*.38}s infinite`:"none",
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

      {/* â”€â”€ FOOTER â”€â”€ */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}
        style={{marginTop:28,textAlign:"center",padding:"28px 24px",
          background:"linear-gradient(135deg,rgba(236,72,153,.09),rgba(139,92,246,.06))",
          border:"1px solid rgba(236,72,153,.16)",borderRadius:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.04) 50%,transparent 64%)",
          backgroundSize:"200% 100%",animation:"fg7-shimmer 5s linear infinite",pointerEvents:"none"}}/>
        <motion.div animate={{scale:[1,1.08,1]}} transition={{duration:3,repeat:Infinity}}
          style={{fontSize:"1.8rem",marginBottom:10}}>ðŸ’</motion.div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.06rem",fontStyle:"italic",
          color:"rgba(255,255,255,.55)",margin:"0 0 8px",lineHeight:1.7}}>
          "Every day you water this garden, you're telling me you choose us ðŸ’™"
        </p>
        <p style={{fontFamily:"'Manrope',sans-serif",fontSize:".88rem",fontWeight:700,
          color:"rgba(255,255,255,.65)",margin:0}}>â€” Surya &amp; Sadhana ðŸ’</p>
      </motion.div>
    </div>
  );
}
