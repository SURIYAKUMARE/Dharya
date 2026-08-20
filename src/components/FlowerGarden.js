import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

const FLOWER_TYPES = ["🌹","🪷","🌺","🌷","🌸","🌻","🌼","💐","🌹","🪷"];
const GROWTH_STAGES = [
  { label:"Seedling",  px:32 },
  { label:"Sprouting", px:40 },
  { label:"Growing",   px:50 },
  { label:"Blooming",  px:58 },
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

/* ── inject CSS ── */
function injectCSS() {
  const old = document.getElementById("fgarden-css"); if(old) old.remove();
  const s = document.createElement("style"); s.id = "fgarden-css";
  s.textContent = `
    @keyframes fg-sway   { 0%,100%{transform-origin:50% 100%;transform:rotate(-3deg)} 50%{transform-origin:50% 100%;transform:rotate(3deg) translateY(-4px)} }
    @keyframes fg-swayW  { 0%,100%{transform-origin:50% 100%;transform:rotate(-7deg)} 50%{transform-origin:50% 100%;transform:rotate(7deg) translateY(-8px)} }
    @keyframes fg-bloom  { 0%,100%{filter:drop-shadow(0 2px 6px rgba(236,72,153,.5))} 50%{filter:drop-shadow(0 4px 20px rgba(236,72,153,1)) drop-shadow(0 0 30px rgba(251,191,36,.5))} }
    @keyframes fg-twink  { 0%,100%{opacity:.12;transform:scale(.7)} 50%{opacity:1;transform:scale(1.3)} }
    @keyframes fg-float  { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-160px) rotate(360deg);opacity:0} }
    @keyframes fg-petal  { 0%{transform:translateY(-10px) translateX(0) rotate(0);opacity:1} 50%{opacity:.8;transform:translateY(45vh) translateX(28px) rotate(200deg)} 100%{transform:translateY(108vh) translateX(-15px) rotate(420deg);opacity:0} }
    @keyframes fg-drop   { 0%{transform:translateY(-52px);opacity:1} 100%{transform:translateY(105px);opacity:0} }
    @keyframes fg-ripple { 0%{transform:scale(.2);opacity:.9} 100%{transform:scale(4.2);opacity:0} }
    @keyframes fg-spin   { to{transform:rotate(360deg)} }
    @keyframes fg-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(236,72,153,.5)} 50%{box-shadow:0 0 0 24px rgba(236,72,153,0)} }
    @keyframes fg-shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes fg-sunray { 0%,100%{opacity:.35} 50%{opacity:.65} }
    @keyframes fg-badge  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
    @keyframes fg-cloud  { 0%{transform:translateX(0)} 100%{transform:translateX(28px)} }
    @keyframes fg-mist   { 0%,100%{opacity:.16} 50%{opacity:.26} }
    @keyframes fg-wind   { 0%{transform:translateX(-110%) skewX(-12deg);opacity:0} 50%{opacity:.15} 100%{transform:translateX(130vw) skewX(-12deg);opacity:0} }
    @keyframes fg-hblink { 0%,100%{opacity:1;transform:scale(1);filter:drop-shadow(0 0 4px rgba(236,72,153,.7))} 45%{opacity:.45;transform:scale(.82);filter:none} 75%{opacity:.95;transform:scale(1.1);filter:drop-shadow(0 0 8px rgba(236,72,153,1))} }
    @keyframes fg-gblink { 0%,100%{opacity:1;transform:scale(1);filter:drop-shadow(0 0 4px rgba(74,222,128,.7))} 45%{opacity:.45;transform:scale(.82);filter:none} 75%{opacity:.95;transform:scale(1.1);filter:drop-shadow(0 0 8px rgba(74,222,128,1))} }
    @keyframes fg-bark   { 0%,100%{opacity:1} 50%{opacity:.85} }
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════
   REALISTIC FLOWER SVGs
══════════════════════════════════════════ */
const HEART = "M0,-7 C-7,-14 -16,-9 -16,-2 C-16,5 -7,12 0,19 C7,12 16,5 16,-2 C16,-9 7,-14 0,-7 Z";

function Soil({ cx=39 }) {
  return <>
    <ellipse cx={cx} cy="92" rx="21" ry="7" fill="#3d1f0a" opacity=".72"/>
    <ellipse cx={cx} cy="90" rx="14" ry="4.5" fill="#5c3010" opacity=".5"/>
  </>;
}

/* Seedling */
function Seedling({ sw }) {
  return <g style={{animation:sw,transformOrigin:"39px 92px"}}>
    <Soil/><path d="M39,90 C39,82 38,74 39,65" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M38,76 C30,70 26,61 30,57 C34,53 38,60 38,68 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/>
    <path d="M40,72 C48,66 52,57 48,53 C44,49 40,56 40,64 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/>
    <ellipse cx="39" cy="64" rx="4.5" ry="6" fill="#a3e635" stroke="#65a30d" strokeWidth=".8"/>
    <path d="M37,61 C38,58 40,58 41,61" stroke="#65a30d" strokeWidth=".7" fill="none"/>
  </g>;
}

/* Sprouting */
function Sprouting({ sw }) {
  return <g style={{animation:sw,transformOrigin:"39px 92px"}}>
    <Soil/>
    <path d="M39,90 C38,78 40,63 38,49" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M38,78 C27,71 20,63 24,56 C28,49 37,57 38,70 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.2"/>
    <path d="M40,74 C51,67 58,59 54,52 C50,45 41,53 40,66 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.2"/>
    <path d="M37,62 C28,55 24,46 29,41 C34,36 38,44 38,56 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/>
    <path d="M39,59 C48,52 52,43 47,38 C42,33 39,41 39,53 Z" fill="#86efac" stroke="#22c55e" strokeWidth="1"/>
    <ellipse cx="38" cy="48" rx="5" ry="6.5" fill="#bbf7d0" stroke="#4ade80" strokeWidth=".9"/>
    <path d="M32,65 C34,61 36,59 38,58" stroke="#15803d" strokeWidth=".5" fill="none" opacity=".6"/>
    <path d="M44,61 C42,57 40,55 39,54" stroke="#15803d" strokeWidth=".5" fill="none" opacity=".6"/>
  </g>;
}

/* Growing */
function Growing({ sw }) {
  return <g style={{animation:sw,transformOrigin:"39px 92px"}}>
    <Soil/>
    <path d="M39,90 C38,75 40,59 38,41" stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d="M39,66 C43,59 47,53 49,45" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M38,83 C24,75 17,65 21,56 C25,47 37,57 38,73 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.3"/>
    <path d="M40,79 C54,71 61,61 57,52 C53,43 41,53 40,69 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.3"/>
    <path d="M38,67 C26,59 20,49 25,43 C30,37 38,47 38,59 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.1"/>
    <path d="M40,63 C52,55 57,45 52,39 C47,33 40,43 40,55 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.1"/>
    <path d="M37,51 C29,45 26,38 30,34 C34,30 38,38 38,47 Z" fill="#86efac" stroke="#22c55e" strokeWidth=".9"/>
    <ellipse cx="38" cy="40" rx="5.5" ry="7" fill="#bbf7d0" stroke="#4ade80" strokeWidth="1"/>
  </g>;
}

/* Rose — spiral petals with thorns */
function Rose({ sw }) {
  const cx=39,cy=28;
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <path d={`M${cx},90 C${cx-2},75 ${cx+1},57 ${cx},${cy+35}`} stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d={`M${cx-1},73 C${cx-9},69 ${cx-10},63 ${cx-4},66`} stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d={`M${cx+1},61 C${cx+8},57 ${cx+9},51 ${cx+4},54`} stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d={`M${cx-1},79 C${cx-15},71 ${cx-21},61 ${cx-15},53 C${cx-9},45 ${cx-1},55 ${cx-1},69 Z`} fill="#22c55e" stroke="#15803d" strokeWidth="1.2"/>
    <path d={`M${cx+1},75 C${cx+15},67 ${cx+20},57 ${cx+14},49 C${cx+8},41 ${cx+1},51 ${cx+1},65 Z`} fill="#22c55e" stroke="#15803d" strokeWidth="1.2"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*19,ty=cy+Math.sin(r)*15,mx=cx+Math.cos(r)*10,my=cy+Math.sin(r)*10;return <path key={i} d={`M${cx},${cy} Q${mx-Math.sin(r)*7},${my+Math.cos(r)*7} ${tx},${ty} Q${tx+Math.sin(r)*6},${ty-Math.cos(r)*6} ${cx},${cy}`} fill={i%2===0?"#e11d48":"#be123c"} stroke="#9f1239" strokeWidth=".6" opacity=".92"/>;})}
    {[22,67,112,157,202,247,292,337].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*12,ty=cy+Math.sin(r)*10;return <path key={i} d={`M${cx},${cy} C${cx+Math.cos(r-.4)*8},${cy+Math.sin(r-.4)*8} ${tx},${ty} C${tx},${ty} ${cx+Math.cos(r+.4)*8},${cy+Math.sin(r+.4)*8} ${cx},${cy}`} fill="#f43f5e" stroke="#e11d48" strokeWidth=".4" opacity=".95"/>;})}
    <circle cx={cx} cy={cy} r="6.5" fill="#fb7185" stroke="#e11d48" strokeWidth=".7"/>
    <circle cx={cx} cy={cy} r="3.5" fill="#fecdd3" stroke="#f43f5e" strokeWidth=".5"/>
    <circle cx={cx-1.5} cy={cy-1.5} r="1.8" fill="rgba(255,255,255,.65)"/>
  </g>;
}

/* Lotus — floating on water pad */
function Lotus({ sw }) {
  const cx=39,cy=29;
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <ellipse cx={cx} cy={cy+53} rx="23" ry="6.5" fill="#166534" opacity=".7"/>
    <ellipse cx={cx} cy={cy+52} rx="20" ry="5" fill="#15803d" opacity=".5"/>
    <path d={`M${cx},${cy+51} C${cx-1},${cy+39} ${cx+1},${cy+23} ${cx},${cy+13}`} stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {[0,36,72,108,144,180,216,252,288,324].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*21,ty=cy+Math.sin(r)*17,c1x=cx+Math.cos(r-.5)*13,c1y=cy+Math.sin(r-.5)*13,c2x=cx+Math.cos(r+.5)*13,c2y=cy+Math.sin(r+.5)*13;return <path key={i} d={`M${cx},${cy+4} C${c1x},${c1y} ${tx-Math.sin(r)*5},${ty+Math.cos(r)*5} ${tx},${ty} C${tx+Math.sin(r)*5},${ty-Math.cos(r)*5} ${c2x},${c2y} Z`} fill={i%2===0?"#fce7f3":"#fdf2f8"} stroke="#fbcfe8" strokeWidth=".6" opacity=".93"/>;})}
    {[0,60,120,180,240,300].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*13,ty=cy+Math.sin(r)*11;return <path key={i} d={`M${cx},${cy+2} C${cx+Math.cos(r-.5)*8},${cy+Math.sin(r-.5)*8} ${tx},${ty} C${cx+Math.cos(r+.5)*8},${cy+Math.sin(r+.5)*8} ${cx},${cy+2}`} fill="#f9a8d4" stroke="#ec4899" strokeWidth=".5" opacity=".96"/>;})}
    <circle cx={cx} cy={cy} r="5.5" fill="#fde68a" stroke="#f59e0b" strokeWidth=".8"/>
    {[0,51,103,154,206,257,309].map((a,i)=>{const r=a*Math.PI/180;return <circle key={i} cx={cx+Math.cos(r)*3.5} cy={cy+Math.sin(r)*3.5} r=".9" fill="#92400e" opacity=".85"/>;})}
    <circle cx={cx-1} cy={cy-1} r="2" fill="rgba(255,255,255,.55)"/>
  </g>;
}

/* Hibiscus — 5 tropical petals with long stamen */
function Hibiscus({ sw }) {
  const cx=39,cy=28;
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <path d={`M${cx},90 C${cx-2},76 ${cx+2},59 ${cx},${cy+35}`} stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d={`M${cx-1},81 C${cx-17},73 ${cx-23},61 ${cx-15},53 C${cx-8},45 ${cx-1},57 ${cx-1},71 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.2"/>
    <path d={`M${cx+1},76 C${cx+17},68 ${cx+21},56 ${cx+14},49 C${cx+7},42 ${cx+1},53 ${cx+1},66 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.2"/>
    {[0,72,144,216,288].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*23,ty=cy+Math.sin(r)*21,c1x=cx+Math.cos(r-.6)*15,c1y=cy+Math.sin(r-.6)*15,c2x=cx+Math.cos(r+.6)*15,c2y=cy+Math.sin(r+.6)*15;return <g key={i}><path d={`M${cx},${cy} C${c1x},${c1y} ${tx},${ty} ${tx},${ty} C${tx},${ty} ${c2x},${c2y} ${cx},${cy}`} fill={["#fb7185","#f43f5e","#e11d48","#f43f5e","#fb7185"][i]} stroke="#be123c" strokeWidth=".6" opacity=".93"/><line x1={cx} y1={cy} x2={tx} y2={ty} stroke="rgba(255,255,255,.22)" strokeWidth=".9"/></g>;})}
    <line x1={cx} y1={cy} x2={cx} y2={cy-16} stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
    {[0,51,103,154,206,257,309].map((a,i)=>{const r=a*Math.PI/180;return <circle key={i} cx={cx+Math.cos(r)*4.2} cy={cy-16+Math.sin(r)*3.2} r="1.3" fill="#fde68a" stroke="#f59e0b" strokeWidth=".4"/>;})}
    <circle cx={cx} cy={cy} r="5" fill="#fbbf24" stroke="#d97706" strokeWidth=".7"/>
    <circle cx={cx-1} cy={cy-1} r="2.2" fill="rgba(255,255,255,.5)"/>
  </g>;
}

/* Tulip — elegant cup shape */
function Tulip({ sw, col="#ec4899" }) {
  const cx=39,cy=29,dk=col==="#ec4899"?"#be185d":"#b91c1c",lt=col==="#ec4899"?"#fbcfe8":"#fecaca";
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <path d={`M${cx},90 C${cx-1},76 ${cx+1},59 ${cx},${cy+28}`} stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d={`M${cx},71 C${cx-15},65 ${cx-19},57 ${cx-11},53 C${cx-4},49 ${cx},57 ${cx},67 Z`} fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>
    <path d={`M${cx},${cy+28} C${cx-19},${cy+22} ${cx-21},${cy+8} ${cx-15},${cy-3} C${cx-9},${cy-11} ${cx},${cy+3} ${cx},${cy+28}`} fill={col} stroke={dk} strokeWidth=".6"/>
    <path d={`M${cx},${cy+28} C${cx-7},${cy+18} ${cx-5},${cy+2} ${cx},${cy-9} C${cx+5},${cy+2} ${cx+7},${cy+18} ${cx},${cy+28}`} fill={lt} stroke={col} strokeWidth=".5"/>
    <path d={`M${cx},${cy+28} C${cx+19},${cy+22} ${cx+21},${cy+8} ${cx+15},${cy-3} C${cx+9},${cy-11} ${cx},${cy+3} ${cx},${cy+28}`} fill={col} stroke={dk} strokeWidth=".6"/>
    <path d={`M${cx-3},${cy+20} C${cx-4},${cy+12} ${cx-3},${cy+4} ${cx},${cy}`} stroke="rgba(255,255,255,.42)" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <ellipse cx={cx} cy={cy-5} rx="7" ry="4.5" fill="rgba(255,255,255,.12)"/>
  </g>;
}

/* Sunflower */
function Sunflower({ sw }) {
  const cx=39,cy=26;
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <path d={`M${cx},90 C${cx-3},73 ${cx+2},53 ${cx},${cy+28}`} stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d={`M${cx-1},81 C${cx-23},71 ${cx-27},57 ${cx-15},47 C${cx-5},39 ${cx-1},56 ${cx-1},71 Z`} fill="#15803d" stroke="#14532d" strokeWidth="1.3"/>
    <path d={`M${cx+1},73 C${cx+23},63 ${cx+25},49 ${cx+13},39 C${cx+3},31 ${cx+1},47 ${cx+1},63 Z`} fill="#15803d" stroke="#14532d" strokeWidth="1.3"/>
    {[...Array(18)].map((_,i)=>{const a=(i/18)*Math.PI*2,tx=cx+Math.cos(a)*23,ty=cy+Math.sin(a)*21,c1x=cx+Math.cos(a-.2)*15,c1y=cy+Math.sin(a-.2)*15,c2x=cx+Math.cos(a+.2)*15,c2y=cy+Math.sin(a+.2)*15;return <path key={i} d={`M${cx},${cy} C${c1x},${c1y} ${tx},${ty} ${tx},${ty} C${tx},${ty} ${c2x},${c2y} ${cx},${cy}`} fill={i%2===0?"#fbbf24":"#f59e0b"} stroke="#d97706" strokeWidth=".5" opacity=".96"/>;})}
    <circle cx={cx} cy={cy} r="11" fill="#78350f"/><circle cx={cx} cy={cy} r="10" fill="#92400e"/>
    {[...Array(14)].map((_,i)=>{const a=(i/14)*Math.PI*2;return <circle key={i} cx={cx+Math.cos(a)*6} cy={cy+Math.sin(a)*6} r="1.5" fill="#1c0a00" opacity=".8"/>;})}
    {[...Array(7)].map((_,i)=>{const a=(i/7)*Math.PI*2;return <circle key={i} cx={cx+Math.cos(a)*3} cy={cy+Math.sin(a)*3} r="1" fill="#1c0a00" opacity=".7"/>;})}
    <circle cx={cx-2} cy={cy-2} r="2.2" fill="rgba(255,255,255,.28)"/>
  </g>;
}

/* Marigold — ruffled layered petals */
function Marigold({ sw }) {
  const cx=39,cy=29;
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <path d={`M${cx},90 C${cx-1},76 ${cx+1},59 ${cx},${cy+33}`} stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d={`M${cx-1},79 C${cx-15},71 ${cx-19},61 ${cx-11},53 C${cx-4},45 ${cx-1},57 ${cx-1},69 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.1"/>
    <path d={`M${cx+1},74 C${cx+15},66 ${cx+18},56 ${cx+10},48 C${cx+3},41 ${cx+1},52 ${cx+1},64 Z`} fill="#16a34a" stroke="#15803d" strokeWidth="1.1"/>
    {[...Array(16)].map((_,i)=>{const a=(i/16)*Math.PI*2,r=21,tx=cx+Math.cos(a)*r,ty=cy+Math.sin(a)*r*.87,c1x=cx+Math.cos(a-.28)*13,c1y=cy+Math.sin(a-.28)*11,c2x=cx+Math.cos(a+.28)*13,c2y=cy+Math.sin(a+.28)*11;return <path key={i} d={`M${cx},${cy} C${c1x},${c1y} ${tx},${ty} ${tx},${ty} C${tx},${ty} ${c2x},${c2y} ${cx},${cy}`} fill={i%2===0?"#f97316":"#ea580c"} stroke="#c2410c" strokeWidth=".5" opacity=".93"/>;})}
    {[...Array(11)].map((_,i)=>{const a=(i/11)*Math.PI*2+Math.PI/11,r=12,tx=cx+Math.cos(a)*r,ty=cy+Math.sin(a)*r*.87;return <path key={i} d={`M${cx},${cy} C${cx+Math.cos(a-.3)*7},${cy+Math.sin(a-.3)*6} ${tx},${ty} C${cx+Math.cos(a+.3)*7},${cy+Math.sin(a+.3)*6} ${cx},${cy}`} fill="#fbbf24" stroke="#f59e0b" strokeWidth=".4" opacity=".96"/>;})}
    <circle cx={cx} cy={cy} r="5.5" fill="#fde68a" stroke="#f59e0b" strokeWidth=".8"/>
    <circle cx={cx} cy={cy} r="3" fill="#fef9c3"/>
    <circle cx={cx-1} cy={cy-1} r="1.8" fill="rgba(255,255,255,.65)"/>
  </g>;
}

/* Cherry Blossom — delicate 5-petal flower */
function Cherry({ sw }) {
  const cx=39,cy=27;
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <path d={`M${cx},90 C${cx-2},76 ${cx+1},59 ${cx},${cy+35}`} stroke="#92400e" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <path d={`M${cx},65 C${cx-10},57 ${cx-16},50 ${cx-18},44`} stroke="#a16207" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d={`M${cx},60 C${cx+10},52 ${cx+15},45 ${cx+17},39`} stroke="#a16207" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {[0,72,144,216,288].map((a,i)=>{const r=a*Math.PI/180,tx=cx+Math.cos(r)*19,ty=cy+Math.sin(r)*18,c1x=cx+Math.cos(r-.7)*12,c1y=cy+Math.sin(r-.7)*12,c2x=cx+Math.cos(r+.7)*12,c2y=cy+Math.sin(r+.7)*12;return <path key={i} d={`M${cx},${cy} C${c1x},${c1y} ${tx-Math.sin(r)*5},${ty+Math.cos(r)*5} ${tx},${ty} C${tx+Math.sin(r)*5},${ty-Math.cos(r)*5} ${c2x},${c2y} Z`} fill={i%2===0?"#fce7f3":"#fbcfe8"} stroke="#f9a8d4" strokeWidth=".7" opacity=".95"/>;})}
    <circle cx={cx} cy={cy} r="5" fill="#fde68a" stroke="#f59e0b" strokeWidth=".7"/>
    {[...Array(8)].map((_,i)=>{const a=(i/8)*Math.PI*2;return <line key={i} x1={cx} y1={cy} x2={cx+Math.cos(a)*7} y2={cy+Math.sin(a)*7} stroke="#f472b6" strokeWidth=".8" opacity=".7"/>;})}
    {[...Array(8)].map((_,i)=>{const a=(i/8)*Math.PI*2;return <circle key={i} cx={cx+Math.cos(a)*7} cy={cy+Math.sin(a)*7} r=".9" fill="#ec4899" opacity=".9"/>;})}
    <circle cx={cx-1} cy={cy-1} r="1.8" fill="rgba(255,255,255,.6)"/>
  </g>;
}

/* Lavender — spike of small purple florets */
function Lavender({ sw }) {
  const cx=39;
  return <g style={{animation:sw,transformOrigin:`${cx}px 92px`}}>
    <Soil cx={cx}/>
    <path d={`M${cx},90 C${cx-1},78 ${cx+1},64 ${cx},50`} stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d={`M${cx},70 C${cx-9},63 ${cx-13},56 ${cx-15},49`} stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d={`M${cx},65 C${cx+9},58 ${cx+12},51 ${cx+14},44`} stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d={`M${cx-1},80 C${cx-12},73 ${cx-16},63 ${cx-8},55 C${cx-1},47 ${cx-1},59 ${cx-1},71 Z`} fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>
    <path d={`M${cx+1},75 C${cx+12},68 ${cx+15},58 ${cx+8},51 C${cx+2},45 ${cx+1},56 ${cx+1},67 Z`} fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>
    {[50,47,44,41,38,35,32].map((y,i)=>[0,i+1].map(s=>(<ellipse key={`${i}${s}`} cx={cx+(s?5:-5)} cy={y} rx="3.5" ry="4.5" fill={i<3?"#c4b5fd":"#a78bfa"} stroke="#7c3aed" strokeWidth=".5" opacity=".9"/>)))}
    {[47,44,41].map((y,i)=><ellipse key={`m${i}`} cx={cx} cy={y} rx="3" ry="4" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth=".5" opacity=".9"/>)}
    {/* bract lines */}
    {[50,47,44,41,38,35].map((y,i)=><path key={i} d={`M${cx},${y+4} C${cx-2},${y+1} ${cx-3},${y-1} ${cx-2},${y-3}`} stroke="#6d28d9" strokeWidth=".5" fill="none" opacity=".5"/>)}
  </g>;
}

/* ── maps flower emoji → SVG component ── */
function BloomedFlower({ type, sw, idx }) {
  const map = {
    "🌹":<Rose sw={sw}/>, "🪷":<Lotus sw={sw}/>, "🌺":<Hibiscus sw={sw}/>,
    "🌷":<Tulip sw={sw} col="#ec4899"/>, "🌸":<Tulip sw={sw} col="#f9a8d4"/>,
    "🌻":<Sunflower sw={sw}/>, "🌼":<Marigold sw={sw}/>,
    "💐":<Rose sw={sw}/>, "🌹":<Cherry sw={sw}/>,
  };
  return map[type] || <Rose sw={sw}/>;
}

/* ── single plant with stage-based SVG ── */
function Plant({ flower, index, wind }) {
  const bloomed = flower.stage >= GROWTH_STAGES.length - 1;
  const sizes   = [{w:68,h:100},{w:80,h:115},{w:90,h:130},{w:102,h:148}];
  const {w:W,h:H} = sizes[Math.min(flower.stage,3)];
  const sw = wind
    ? `fg-swayW ${.9+(index%3)*.3}s ease-in-out ${index*.07}s infinite`
    : bloomed
      ? `fg-sway ${2.5+(index%6)*.4}s ease-in-out ${index*.14}s infinite`
      : `fg-sway ${3+(index%4)*.5}s ease-in-out ${index*.18}s infinite`;

  return (
    <motion.div layout
      initial={{scale:0,y:55,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:0,y:25,opacity:0}}
      transition={{type:"spring",stiffness:175,damping:17,delay:index*.055}}
      style={{flexShrink:0,position:"relative",
        filter:bloomed?"drop-shadow(0 4px 16px rgba(236,72,153,.55)) drop-shadow(0 0 10px rgba(251,191,36,.28))":"drop-shadow(0 2px 8px rgba(0,0,0,.45))"}}
    >
      <svg width={W} height={H} viewBox="0 0 78 110" style={{overflow:"visible",display:"block"}}>
        {flower.stage===0 && <Seedling  sw={sw}/>}
        {flower.stage===1 && <Sprouting sw={sw}/>}
        {flower.stage===2 && <Growing   sw={sw}/>}
        {flower.stage===3 && <BloomedFlower type={flower.type} sw={sw} idx={index}/>}
      </svg>
    </motion.div>
  );
}

/* ══ REALISTIC LOVE TREE ══
   Trunk + 3-level branching, pink & green heart leaves blink
   independently. Tree grows more leaves with leafCount. */
function LoveTree({ leafCount = 0 }) {
  const lvl  = Math.min(5, Math.floor(leafCount / 5) + 1);
  const W=140, H=220;

  /* leaf positions, colour, animation timing */
  const allLeaves = [
    /* level 1 — 5 leaves on main lower branches */
    {x:60,y:118,r:-18,c:"#f9a8d4",d:1.9,dl:0.0},
    {x:78,y:108,r: 14,c:"#86efac",d:2.3,dl:0.3},
    {x:52,y:102,r:-30,c:"#f9a8d4",d:1.6,dl:0.6},
    {x:84,y:95, r: 22,c:"#4ade80",d:2.0,dl:0.9},
    {x:65,y:92, r: -6,c:"#ec4899",d:1.8,dl:0.4},
    /* level 2 — mid branches */
    {x:45,y:80, r:-24,c:"#f9a8d4",d:2.1,dl:0.2},
    {x:88,y:76, r: 18,c:"#86efac",d:1.7,dl:0.5},
    {x:58,y:72, r:-12,c:"#ec4899",d:2.4,dl:0.8},
    {x:76,y:67, r: 28,c:"#4ade80",d:1.5,dl:1.1},
    {x:48,y:68, r:-34,c:"#f9a8d4",d:2.0,dl:0.3},
    {x:90,y:63, r: 10,c:"#86efac",d:1.9,dl:0.7},
    /* level 3 — upper */
    {x:40,y:58, r:-20,c:"#f9a8d4",d:2.2,dl:0.1},
    {x:92,y:54, r: 26,c:"#4ade80",d:1.8,dl:0.4},
    {x:62,y:50, r:-10,c:"#ec4899",d:2.5,dl:0.6},
    {x:80,y:46, r: 16,c:"#86efac",d:1.6,dl:0.9},
    {x:50,y:50, r:-28,c:"#f9a8d4",d:2.1,dl:0.2},
    {x:94,y:46, r: 8, c:"#4ade80",d:1.9,dl:0.5},
    /* level 4 — top */
    {x:36,y:42, r:-22,c:"#ec4899",d:2.3,dl:0.0},
    {x:96,y:38, r: 30,c:"#86efac",d:1.7,dl:0.3},
    {x:55,y:36, r:-14,c:"#f9a8d4",d:2.0,dl:0.6},
    {x:82,y:32, r: 20,c:"#4ade80",d:1.8,dl:0.8},
    {x:45,y:36, r:-32,c:"#ec4899",d:2.2,dl:0.2},
    {x:97,y:32, r: 12,c:"#f9a8d4",d:1.6,dl:0.5},
    {x:68,y:27, r:  0,c:"#86efac",d:2.1,dl:0.7},
    /* level 5 — crown */
    {x:34,y:28, r:-18,c:"#f9a8d4",d:2.4,dl:0.1},
    {x:98,y:24, r: 24,c:"#4ade80",d:1.9,dl:0.4},
    {x:50,y:22, r:-26,c:"#ec4899",d:2.1,dl:0.6},
    {x:84,y:18, r: 18,c:"#86efac",d:1.7,dl:0.8},
    {x:68,y:14, r: -6,c:"#f9a8d4",d:2.3,dl:0.9},
    {x:42,y:18, r:-35,c:"#4ade80",d:2.0,dl:0.2},
    {x:88,y:14, r: 32,c:"#ec4899",d:1.8,dl:0.5},
  ];
  const visible = allLeaves.slice(0, lvl * 6 + (lvl > 4 ? 1 : 0));

  return (
    <div style={{position:"absolute",right:2,bottom:68,width:W,height:H,pointerEvents:"none",zIndex:4,userSelect:"none"}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <defs>
          <linearGradient id="tg1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#4a1e08"/>
            <stop offset="30%" stopColor="#7c3a12"/>
            <stop offset="60%" stopColor="#9a4e18"/>
            <stop offset="100%" stopColor="#5a2808"/>
          </linearGradient>
          <linearGradient id="tg2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#6b3010"/>
            <stop offset="50%" stopColor="#a05020"/>
            <stop offset="100%" stopColor="#6b3010"/>
          </linearGradient>
          <filter id="tsh">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#00000055"/>
          </filter>
        </defs>

        {/* ── TRUNK ── natural bark texture */}
        <path d="M62,215 C60,195 57,170 59,145 C61,120 64,108 68,85 C72,108 75,120 77,145 C79,170 76,195 74,215 Z"
          fill="url(#tg1)" stroke="#3a1506" strokeWidth="1" filter="url(#tsh)"/>
        {/* bark lines */}
        <path d="M65,210 C64,192 63,168 64,144 C65,124 66,112 68,92" stroke="rgba(255,210,140,.18)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M70,210 C71,192 72,170 71,148" stroke="rgba(0,0,0,.12)" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M63,170 C61,162 60,154 62,148" stroke="rgba(255,200,100,.12)" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M73,160 C75,152 76,146 74,140" stroke="rgba(0,0,0,.1)" strokeWidth="1" fill="none" strokeLinecap="round"/>

        {/* ── BRANCHES — grow per level ── */}
        {lvl>=1&&<><path d="M66,148 C56,136 46,126 41,114" stroke="url(#tg2)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#tsh)"/><path d="M70,143 C80,131 90,121 95,109" stroke="url(#tg2)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#tsh)"/></>}
        {lvl>=2&&<><path d="M65,125 C56,113 49,103 46,91" stroke="url(#tg2)" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M71,122 C80,110 87,100 90,88" stroke="url(#tg2)" strokeWidth="5" fill="none" strokeLinecap="round"/></>}
        {lvl>=3&&<><path d="M66,106 C58,94 52,84 49,72" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M70,103 C78,91 84,81 87,69" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round"/></>}
        {lvl>=4&&<><path d="M67,88 C60,76 55,66 52,56" stroke="#a0522d" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M69,85 C76,73 81,63 84,53" stroke="#a0522d" strokeWidth="3" fill="none" strokeLinecap="round"/></>}
        {lvl>=5&&<><path d="M67,70 C62,58 58,48 55,38" stroke="#b8622e" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M69,67 C74,55 79,45 82,35" stroke="#b8622e" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M68,55 C68,42 68,32 68,22" stroke="#b8622e" strokeWidth="2" fill="none" strokeLinecap="round"/></>}

        {/* ── HEART LEAVES — blinking pink & green ── */}
        {visible.map((lf,i)=>{
          const isPink = lf.c==="#ec4899"||lf.c==="#f9a8d4";
          const anim   = isPink
            ? `fg-hblink ${lf.d}s ease-in-out ${lf.dl}s infinite`
            : `fg-gblink ${lf.d}s ease-in-out ${lf.dl}s infinite`;
          const stroke = isPink ? "#be185d" : "#15803d";
          return (
            <g key={i} transform={`translate(${lf.x},${lf.y}) rotate(${lf.r}) scale(.55)`}
               style={{animation:anim,transformBox:"fill-box",transformOrigin:"center"}}>
              <path d={HEART} fill={lf.c} stroke={stroke} strokeWidth="1.5" opacity=".97"/>
              {/* leaf vein */}
              <path d="M0,-7 C0,2 0,10 0,18" stroke="rgba(255,255,255,.38)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              <path d="M0,4 C-4,2 -7,0 -9,-2"  stroke="rgba(255,255,255,.25)" strokeWidth=".8" fill="none" strokeLinecap="round"/>
              <path d="M0,4 C4,2 7,0 9,-2"    stroke="rgba(255,255,255,.25)" strokeWidth=".8" fill="none" strokeLinecap="round"/>
            </g>
          );
        })}

        {/* ── ROOTS ── */}
        <path d="M61,214 C53,218 47,216 44,220" stroke="#3a1506" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M75,214 C83,218 89,216 92,220" stroke="#3a1506" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M68,216 C68,220 68,222 68,226" stroke="#3a1506" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      {/* label */}
      {leafCount>0&&(
        <div style={{position:"absolute",bottom:-20,left:"50%",transform:"translateX(-50%)",
          fontFamily:"'Inter',sans-serif",fontSize:".62rem",fontWeight:700,
          color:"rgba(236,72,153,.8)",whiteSpace:"nowrap",
          textShadow:"0 0 10px rgba(236,72,153,.5)"}}>
          Love Tree 🌳
        </div>
      )}
    </div>
  );
}

/* ── Water drops overlay ── */
function WaterDrops({ on }) {
  if (!on) return null;
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:60,overflow:"hidden"}}>
    {[...Array(20)].map((_,i)=><span key={i} style={{position:"absolute",top:"8%",left:`${2+i*5}%`,fontSize:`${10+(i%4)*5}px`,animation:`fg-drop ${.48+i*.055}s ease-in ${i*.048}s both`}}>💧</span>)}
    {[...Array(6)].map((_,i)=><div key={i} style={{position:"absolute",bottom:"26%",left:`${7+i*15}%`,width:28,height:12,border:"2px solid rgba(96,165,250,.65)",borderRadius:"50%",animation:`fg-ripple 1.1s ease-out ${.52+i*.1}s both`}}/>)}
  </div>;
}

/* ── Petal rain ── */
function PetalRain({ on }) {
  if (!on) return null;
  const p=["🌸","🌺","🌷","🌼","🪷","💮","🌸","🌺","✨","💕","🌸","🌺","🌷","💗","🌸","🌺"];
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:55,overflow:"hidden"}}>
    {p.map((x,i)=><span key={i} style={{position:"absolute",top:"-12px",left:`${1+i*6.2}%`,fontSize:`${12+(i%5)*6}px`,animation:`fg-petal ${2.6+i*.23}s ease-in-out ${i*.06}s forwards`}}>{x}</span>)}
  </div>;
}

/* ── Star canvas ── */
function StarCanvas({ show }) {
  const cv = useRef(null), raf = useRef(null);
  useEffect(() => {
    if (!show) return;
    const el = cv.current; if(!el) return;
    const rsz = () => { el.width=el.offsetWidth; el.height=el.offsetHeight; };
    rsz(); const ro = new ResizeObserver(rsz); ro.observe(el);
    const ctx = el.getContext("2d");
    const stars = Array.from({length:110},()=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.8,ph:Math.random()*Math.PI*2,sp:.25+Math.random()*1.3}));
    const shots=[]; const spawn=()=>shots.push({x:Math.random()*el.width*.8,y:Math.random()*el.height*.4,vx:9+Math.random()*12,vy:3+Math.random()*6,len:100+Math.random()*160,life:1,decay:.016+Math.random()*.013});
    spawn(); const timer=setInterval(spawn,1800);
    const tick=()=>{
      const {width:cw,height:ch}=el; ctx.clearRect(0,0,cw,ch); const t=Date.now()/1000;
      stars.forEach(s=>{const a=.15+.85*Math.abs(Math.sin(t*s.sp+s.ph));ctx.beginPath();ctx.arc(s.x*cw,s.y*ch,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${a.toFixed(2)})`;ctx.fill();});
      for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.x+=s.vx;s.y+=s.vy;s.life-=s.decay;if(s.life<=0||s.x>cw+250){shots.splice(i,1);continue;}const tx=s.x-s.vx*(s.len/Math.max(Math.abs(s.vx),1)),ty=s.y-s.vy*(s.len/Math.max(Math.abs(s.vx),1));const g=ctx.createLinearGradient(tx,ty,s.x,s.y);g.addColorStop(0,"transparent");g.addColorStop(.6,"rgba(200,170,255,.55)");g.addColorStop(1,"rgba(255,255,255,.95)");ctx.save();ctx.globalAlpha=Math.max(0,s.life);ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.shadowColor="#a78bfa";ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(s.x,s.y);ctx.stroke();ctx.beginPath();ctx.arc(s.x,s.y,2.5,0,Math.PI*2);ctx.fillStyle="#fff";ctx.shadowBlur=18;ctx.fill();ctx.restore();}
      raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(raf.current);clearInterval(timer);ro.disconnect();};
  },[show]);
  if(!show) return null;
  return <canvas ref={cv} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
}

/* ── Collection card ── */
function FlowerCard({ flower, index, isNew }) {
  const st      = GROWTH_STAGES[Math.min(flower.stage,GROWTH_STAGES.length-1)];
  const bloomed = flower.stage >= GROWTH_STAGES.length-1;
  return (
    <motion.div layout
      initial={{scale:0,opacity:0,y:18}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0,opacity:0}}
      transition={{type:"spring",stiffness:280,damping:22,delay:index*.03}} whileHover={{scale:1.06,y:-4}}
      style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"14px 10px 12px",
        background:bloomed?"linear-gradient(135deg,rgba(236,72,153,.18),rgba(139,92,246,.11))":"rgba(255,255,255,.05)",
        border:`1.5px solid ${bloomed?"rgba(236,72,153,.5)":"rgba(255,255,255,.09)"}`,
        borderRadius:18,backdropFilter:"blur(10px)",position:"relative",overflow:"hidden",
        boxShadow:bloomed?"0 8px 30px rgba(236,72,153,.28)":"0 4px 14px rgba(0,0,0,.2)"}}>
      {bloomed&&<div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.09) 50%,transparent 64%)",backgroundSize:"200% 100%",animation:"fg-shimmer 3.2s linear infinite",borderRadius:18,pointerEvents:"none"}}/>}
      {isNew&&<span style={{position:"absolute",top:5,right:5,fontSize:".47rem",fontWeight:800,background:"linear-gradient(90deg,#ec4899,#8b5cf6)",color:"#fff",padding:"2px 7px",borderRadius:50,textTransform:"uppercase",animation:"fg-badge .9s ease-in-out infinite"}}>NEW</span>}
      <svg width="60" height="80" viewBox="0 0 78 110" style={{display:"block",marginBottom:2}}>
        {flower.stage===0&&<Seedling  sw="none"/>}
        {flower.stage===1&&<Sprouting sw="none"/>}
        {flower.stage===2&&<Growing   sw="none"/>}
        {flower.stage===3&&<BloomedFlower type={flower.type} sw="none" idx={index}/>}
      </svg>
      <span style={{fontSize:".58rem",fontWeight:700,fontFamily:"'Inter',sans-serif",color:bloomed?"#ec4899":"#10b981",background:bloomed?"rgba(236,72,153,.15)":"rgba(16,185,129,.15)",padding:"2px 8px",borderRadius:50,border:`1px solid ${bloomed?"rgba(236,72,153,.35)":"rgba(16,185,129,.3)"}`}}>{st.label}</span>
      <span style={{fontSize:".56rem",color:"rgba(255,255,255,.3)",fontFamily:"'Inter',sans-serif"}}>{flower.date}</span>
    </motion.div>
  );
}

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
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

  useEffect(()=>{ const c=()=>{ const h=new Date().getHours(); setTod(h>=6&&h<12?"morning":h>=12&&h<17?"day":h>=17&&h<20?"evening":"night"); }; c(); const id=setInterval(c,60000); return()=>clearInterval(id); },[]);
  useEffect(()=>{ const g=()=>{setWind(true);setTimeout(()=>setWind(false),2600);}; g(); const id=setInterval(g,7000+Math.random()*5000); return()=>clearInterval(id); },[]);
  useEffect(()=>{ const id=setInterval(()=>setMsgIdx(i=>(i+1)%LOVE_MSGS.length),4500); return()=>clearInterval(id); },[]);

  const today  = new Date().toDateString();
  const alreadyW = lastVisit === today;
  const bloomedCount = garden.filter(f=>f.stage>=GROWTH_STAGES.length-1).length;
  const pct = garden.length ? Math.round((bloomedCount/garden.length)*100) : 0;
  const isDay = tod==="morning"||tod==="day";
  const treeLeaves = bloomedCount + Math.min(streak, 30);

  const skyGrad = {
    morning:"linear-gradient(180deg,#2d0a4e 0%,#7c3aed 26%,#ea580c 60%,#fbbf24 100%)",
    day:    "linear-gradient(180deg,#0c4a6e 0%,#0369a1 25%,#0ea5e9 60%,#bae6fd 100%)",
    evening:"linear-gradient(180deg,#0c0a1e 0%,#5b21b6 26%,#db2777 58%,#f97316 100%)",
    night:  "linear-gradient(180deg,#020614 0%,#060d2e 35%,#0e1545 65%,#1a1260 100%)",
  };
  const horizon = { morning:"rgba(249,115,22,.32)", day:"rgba(125,211,252,.2)", evening:"rgba(249,115,22,.28)", night:"rgba(30,58,138,.28)" };

  const skyStars  = useRef([...Array(70)].map(()=>({t:`${2+Math.random()*74}%`,l:`${Math.random()*98}%`,sz:1+Math.random()*2.5,dur:1.5+Math.random()*4,del:Math.random()*8}))).current;
  const clouds    = useRef([{l:"3%",t:"9%",s:1,d:12},{l:"28%",t:"4%",s:.7,d:15},{l:"54%",t:"13%",s:.6,d:9},{l:"75%",t:"7%",s:.88,d:17}]).current;

  useEffect(()=>{
    (async()=>{
      let [g,v,s]=await Promise.all([dbGet("fg_garden",[]),dbGet("fg_lastvisit",""),dbGet("fg_streak",0)]);
      if(!Array.isArray(g)||g.length<48){
        try{const r=await fetch("/api/seed-garden?force=1",{method:"POST"});if(r.ok)[g,v,s]=await Promise.all([dbGet("fg_garden",[]),dbGet("fg_lastvisit",""),dbGet("fg_streak",0)]);}catch{}
      }
      if(Array.isArray(g)&&g.length>0)setGarden(g);
      if(v)setLastVisit(v);
      if(typeof s==="number")setStreak(s);
      setLoading(false);
    })();
  },[]); // eslint-disable-line

  const confetti=useCallback(()=>{
    if(!confRef.current)return;
    const cs=["🌸","🌺","🌷","🌼","💕","✨","🌻","💗","🪷","💫"];
    for(let i=0;i<30;i++){const el=document.createElement("div");el.style.cssText=`position:fixed;top:-22px;left:${Math.random()*100}%;font-size:${10+Math.random()*20}px;pointer-events:none;z-index:99;animation:fg-float ${1.8+Math.random()*2.8}s ${Math.random()*.8}s ease-out forwards;`;el.textContent=cs[Math.floor(Math.random()*cs.length)];confRef.current.appendChild(el);setTimeout(()=>el.remove(),5500);}
  },[]);

  const water=async()=>{
    if(alreadyW||watered)return;
    setDrops(true);setTimeout(()=>setDrops(false),1600);
    await new Promise(r=>setTimeout(r,750));
    const fl={id:Date.now(),type:FLOWER_TYPES[Math.floor(Math.random()*FLOWER_TYPES.length)],stage:0,date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short"}),plantedAt:new Date().toISOString(),daysAgo:0};
    const grown=garden.map(f=>({...f,stage:Math.min(f.stage+1,GROWTH_STAGES.length-1)}));
    const updated=[...grown,fl];const ns=streak+1;
    const newBlooms=grown.filter(f=>f.stage===GROWTH_STAGES.length-1&&garden.find(g=>g.id===f.id&&g.stage===GROWTH_STAGES.length-2));
    setGarden(updated);setNewId(fl.id);setWatered(true);setLastVisit(today);setStreak(ns);
    if(newBlooms.length>0){setPetals(true);setTimeout(()=>setPetals(false),4000);}
    confetti();
    await Promise.all([dbSet("fg_garden",updated),dbSet("fg_lastvisit",today),dbSet("fg_streak",ns)]);
    setTimeout(()=>setNewId(null),3500);
  };

  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"0 4px 110px",position:"relative"}}>
      <div ref={confRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:98,overflow:"hidden"}}/>
      <WaterDrops on={drops}/><PetalRain on={petals}/>

      {/* ═══ SCENE CARD ═══ */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:.72}}
        style={{borderRadius:26,overflow:"hidden",marginBottom:22,boxShadow:"0 24px 72px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.08)"}}>

        {/* SKY */}
        <div style={{background:skyGrad[tod],position:"relative",minHeight:256,overflow:"hidden",transition:"background 4s ease",padding:"26px 20px 0"}}>
          <StarCanvas show={!isDay}/>
          {!isDay&&skyStars.map((st,i)=><div key={i} style={{position:"absolute",top:st.t,left:st.l,width:st.sz,height:st.sz,background:"#fff",borderRadius:"50%",animation:`fg-twink ${st.dur}s ease-in-out ${st.del}s infinite`,pointerEvents:"none"}}/>)}
          {isDay&&<div style={{position:"absolute",top:16,right:28,width:62,height:62,zIndex:2}}>
            {[...Array(12)].map((_,i)=><div key={i} style={{position:"absolute",top:"50%",left:"50%",width:2,height:22+(i%2)*6,background:"rgba(253,224,71,.48)",borderRadius:2,transformOrigin:"top center",transform:`translate(-50%,-100%) rotate(${i*30}deg) translateY(-38px)`,animation:`fg-sunray ${3+i*.18}s ease-in-out ${i*.14}s infinite`}}/>)}
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,#fefce8 0%,#fde047 45%,#f59e0b 100%)",boxShadow:"0 0 42px 18px rgba(253,224,71,.65),0 0 95px 42px rgba(251,191,36,.32)",animation:"fg-sunray 4s ease-in-out infinite"}}/>
          </div>}
          {tod==="night"&&<div style={{position:"absolute",top:14,right:28,width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#fefce8,#fde68a,#f5c518)",boxShadow:"0 0 36px 14px rgba(253,224,71,.28),0 0 80px 36px rgba(251,191,36,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",zIndex:2}}>🌙</div>}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:"35%",background:`linear-gradient(0deg,${horizon[tod]},transparent)`,pointerEvents:"none",animation:"fg-mist 6s ease-in-out infinite"}}/>
          {clouds.map((c,i)=><div key={i} style={{position:"absolute",top:c.t,left:c.l,width:`${180*c.s}px`,height:`${55*c.s}px`,background:"rgba(255,255,255,.14)",borderRadius:"50%",filter:`blur(${8*c.s}px)`,opacity:isDay?.8:.18,animation:`fg-cloud ${c.d}s ease-in-out ${i*2.2}s infinite alternate`,transition:"opacity 3s"}}/>)}
          {wind&&<div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:3}}>{[...Array(7)].map((_,i)=><div key={i} style={{position:"absolute",top:`${13+i*10}%`,left:0,width:`${80+i*50}px`,height:"1px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)",animation:`fg-wind ${1+i*.24}s linear ${i*.11}s infinite`}}/>)}</div>}
          {/* TITLE */}
          <div style={{textAlign:"center",paddingBottom:26,position:"relative",zIndex:4}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 16px",background:"rgba(0,0,0,.38)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.18)",borderRadius:50,marginBottom:12,fontFamily:"'Inter',sans-serif",fontSize:".64rem",fontWeight:700,color:"rgba(255,255,255,.75)",letterSpacing:"1.8px",textTransform:"uppercase"}}>🌸 Our Love Garden</div>
            <motion.h1 initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} transition={{delay:.2}} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.6rem",fontWeight:600,fontStyle:"italic",color:"#fff",margin:"0 0 10px",textShadow:"0 2px 20px rgba(0,0,0,.7),0 0 40px rgba(236,72,153,.32)"}}>Flower Garden 🌺</motion.h1>
            <AnimatePresence mode="wait">
              <motion.p key={msgIdx} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.38}} style={{fontFamily:"'Inter',sans-serif",fontSize:".84rem",color:"rgba(255,255,255,.52)",margin:"0 0 8px",fontStyle:"italic"}}>"{LOVE_MSGS[msgIdx]}"</motion.p>
            </AnimatePresence>
            <div style={{fontSize:".64rem",color:"rgba(255,255,255,.36)",fontFamily:"'Inter',sans-serif"}}>
              {tod==="morning"&&"🌅 Good morning"}{tod==="day"&&"☀️ Afternoon"}{tod==="evening"&&"🌆 Evening"}{tod==="night"&&"🌙 Night time"}
              {wind&&<span style={{marginLeft:10,opacity:.6}}>· breeze</span>}
            </div>
          </div>
        </div>

        {/* ── GROUND: LEFT = flower bed | RIGHT = love tree ── */}
        <div style={{position:"relative",overflow:"hidden",minHeight:290,
          background:"linear-gradient(180deg,#1e4d10 0%,#163a09 18%,#0f2a05 38%,#0c2004 55%,#3a1800 78%,#1e0d00 100%)"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:14,background:"linear-gradient(180deg,rgba(74,222,128,.28) 0%,rgba(34,197,94,.1) 60%,transparent 100%)"}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:52,background:"linear-gradient(180deg,#5c2a06 0%,#3d1800 50%,#1a0900 100%)"}}/>
          <div style={{position:"absolute",bottom:48,left:"5%",right:"5%",height:26,background:"radial-gradient(ellipse at 50% 100%,rgba(74,222,128,.06) 0%,transparent 70%)"}}/>

          {/* divider line between flowers and tree */}
          <div style={{position:"absolute",top:0,bottom:68,left:"65%",width:1,background:"rgba(255,255,255,.06)",zIndex:3}}/>

          {/* ── LEFT: flower bed ── */}
          <div style={{position:"absolute",top:0,bottom:0,left:0,right:"35%",overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"flex-start",alignItems:"flex-end",flexWrap:"wrap",gap:8,padding:"16px 8px 105px 10px",position:"relative",zIndex:3,minHeight:260}}>
              <AnimatePresence>
                {(garden.length===0?[{id:0,type:"🌹",stage:0,date:""}]:garden).slice().reverse().slice(0,20).map((f,i)=>(
                  <Plant key={f.id} flower={f} index={i} wind={wind}/>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT: love tree (clearly separated) ── */}
          <div style={{position:"absolute",top:0,bottom:0,left:"65%",right:0,overflow:"hidden"}}>
            <LoveTree leafCount={treeLeaves}/>
            {/* tree section label */}
            <div style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",fontFamily:"'Inter',sans-serif",fontSize:".62rem",fontWeight:700,color:"rgba(255,255,255,.3)",letterSpacing:"1px",textTransform:"uppercase",whiteSpace:"nowrap"}}>Love Tree</div>
          </div>

          {/* SVG fence (spans full width) */}
          <svg viewBox="0 0 900 68" preserveAspectRatio="none"
            style={{position:"absolute",bottom:0,left:0,width:"100%",height:"68px",zIndex:5,display:"block"}}>
            <defs>
              <linearGradient id="fgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8722a"/><stop offset="40%" stopColor="#9a4e1a"/><stop offset="100%" stopColor="#6b3010"/></linearGradient>
              <linearGradient id="fgp" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#d4884a"/><stop offset="35%" stopColor="#a05a20"/><stop offset="100%" stopColor="#6b3010"/></linearGradient>
              <filter id="fgds"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".5"/></filter>
              <filter id="fgps"><feDropShadow dx="1" dy="0" stdDeviation="1.5" floodOpacity=".4"/></filter>
            </defs>
            <rect x="0" y="52" width="900" height="16" fill="#3d1800"/>
            <rect x="0" y="10" width="900" height="11" rx="2" fill="url(#fgr)" filter="url(#fgds)"/>
            <rect x="0" y="32" width="900" height="9" rx="2" fill="url(#fgr)" filter="url(#fgds)"/>
            <rect x="0" y="10" width="900" height="2" rx="1" fill="rgba(255,200,120,.18)"/>
            <rect x="0" y="32" width="900" height="1.5" rx="1" fill="rgba(255,200,120,.14)"/>
            {[60,140,210,290,370,450,530,610,690,770,840].map((x,i)=><g key={i}><line x1={x} y1="10" x2={x+8} y2="21" stroke="rgba(0,0,0,.14)" strokeWidth="1.2"/><line x1={x+3} y1="10" x2={x+11} y2="21" stroke="rgba(255,255,255,.05)" strokeWidth=".8"/></g>)}
            {[...Array(11)].map((_,i)=>{const px=i*84+14;return <g key={i} filter="url(#fgps)"><rect x={px} y="0" width="14" height="54" rx="3" fill="url(#fgp)"/><line x1={px+4} y1="2" x2={px+4} y2="52" stroke="rgba(255,255,255,.07)" strokeWidth="1"/><line x1={px+9} y1="2" x2={px+9} y2="52" stroke="rgba(0,0,0,.1)" strokeWidth="1"/><ellipse cx={px+7} cy="3.5" rx="5.5" ry="2.5" fill="rgba(255,210,140,.28)"/><rect x={px} y="0" width="14" height="6" rx="3" fill="rgba(220,140,60,.3)"/></g>;})}
          </svg>

          {/* stats pills */}
          <div style={{position:"absolute",top:8,left:0,right:0,display:"flex",justifyContent:"center",gap:10,zIndex:6}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,color:"#86efac",background:"rgba(0,0,0,.65)",padding:"4px 14px",borderRadius:50,backdropFilter:"blur(6px)",border:"1px solid rgba(134,239,172,.22)"}}>🌸 {bloomedCount} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".67rem",fontWeight:700,color:"rgba(255,255,255,.55)",background:"rgba(0,0,0,.65)",padding:"4px 14px",borderRadius:50,backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,.14)"}}>🌱 {garden.length-bloomedCount} growing</span>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.12}} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[{label:"Planted",value:garden.length,color:"#ec4899",icon:"🌱",bg:"rgba(236,72,153,.09)"},{label:"Bloomed",value:bloomedCount,color:"#8b5cf6",icon:"🌸",bg:"rgba(139,92,246,.09)"},{label:"Growing",value:garden.length-bloomedCount,color:"#10b981",icon:"🌿",bg:"rgba(16,185,129,.09)"},{label:"Streak",value:`${streak}d`,color:"#f59e0b",icon:"🔥",bg:"rgba(245,158,11,.09)"}].map((s,i)=>(
          <motion.div key={i} initial={{opacity:0,scale:.75}} animate={{opacity:1,scale:1}} transition={{delay:.16+i*.07,type:"spring",stiffness:230}} whileHover={{scale:1.06,y:-3}} style={{padding:"14px 6px",textAlign:"center",background:s.bg,border:`1.5px solid ${s.color}28`,borderRadius:16,backdropFilter:"blur(8px)"}}>
            <motion.div animate={{scale:[1,1.2,1]}} transition={{duration:2.6,repeat:Infinity,delay:i*.55}} style={{fontSize:"1.3rem",marginBottom:4}}>{s.icon}</motion.div>
            <div style={{fontFamily:"'Manrope',sans-serif",fontSize:"1.4rem",fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:".54rem",color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".5px"}}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* PROGRESS */}
      {garden.length>0&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.22}} style={{marginBottom:20,padding:"18px 20px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.36)",textTransform:"uppercase",letterSpacing:"1px"}}>Bloom Progress</span>
            <span style={{fontFamily:"'Manrope',sans-serif",fontSize:".78rem",fontWeight:800,color:"#ec4899"}}>{pct}%</span>
          </div>
          <div style={{height:9,background:"rgba(255,255,255,.07)",borderRadius:5,overflow:"hidden"}}>
            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.4,ease:"easeOut",delay:.35}} style={{height:"100%",background:"linear-gradient(90deg,#ec4899,#8b5cf6,#06b6d4)",borderRadius:5,boxShadow:"0 0 14px rgba(236,72,153,.6)"}}/>
          </div>
          <div style={{display:"flex",gap:3,marginTop:10,justifyContent:"center"}}>
            {[...Array(10)].map((_,i)=><motion.span key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:.4+i*.05}} style={{fontSize:".88rem",opacity:pct>=(i+1)*10?1:.14,transition:"opacity .5s"}}>{pct>=(i+1)*10?"❤️":"🤍"}</motion.span>)}
          </div>
        </motion.div>
      )}

      {/* WATER BUTTON */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <AnimatePresence mode="wait">
          {alreadyW||watered?(
            <motion.div key="done" initial={{opacity:0,scale:.88}} animate={{opacity:1,scale:1}} exit={{opacity:0}} style={{display:"inline-flex",alignItems:"center",gap:10,padding:"16px 30px",background:"rgba(16,185,129,.12)",border:"1.5px solid rgba(16,185,129,.35)",borderRadius:50,color:"#10b981",fontFamily:"'Inter',sans-serif",fontSize:".9rem",fontWeight:600}}>
              ✅ {watered?"Garden watered! New flower planted 🌸":"Come back tomorrow 💕"}
            </motion.div>
          ):(
            <motion.button key="btn" whileHover={{scale:1.07,y:-6}} whileTap={{scale:.94}} onClick={water} style={{display:"inline-flex",alignItems:"center",gap:12,padding:"19px 52px",background:"linear-gradient(135deg,#3b82f6,#06b6d4,#10b981)",backgroundSize:"200% 100%",animation:"fg-shimmer 3s linear infinite, fg-pulse 2.8s ease-in-out 1.2s infinite",border:"none",borderRadius:50,color:"#fff",fontFamily:"'Manrope',sans-serif",fontSize:"1.06rem",fontWeight:800,cursor:"pointer",boxShadow:"0 16px 48px rgba(59,130,246,.5)",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,borderRadius:50,background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,.26) 50%,transparent 70%)",backgroundSize:"200% 100%",animation:"fg-shimmer 2.2s linear infinite"}}/>
              <span style={{position:"relative"}}>💧 Water the Garden Today</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* VIEW TOGGLE */}
      {garden.length>0&&(
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {["garden","collection"].map(v=>(
            <motion.button key={v} whileHover={{scale:1.05}} whileTap={{scale:.96}} onClick={()=>setView(v)} style={{padding:"9px 24px",borderRadius:50,background:v===view?"rgba(236,72,153,.24)":"rgba(255,255,255,.05)",border:`1.5px solid ${v===view?"rgba(236,72,153,.52)":"rgba(255,255,255,.1)"}`,color:v===view?"#ec4899":"rgba(255,255,255,.45)",fontFamily:"'Inter',sans-serif",fontSize:".78rem",fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
              {v==="garden"?"🌿 Garden Scene":"🌸 Collection"}
            </motion.button>
          ))}
        </div>
      )}

      {/* CONTENT */}
      {loading?(
        <div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,.38)"}}>
          <motion.div animate={{rotate:360}} transition={{duration:1.4,repeat:Infinity,ease:"linear"}} style={{fontSize:"2.6rem",display:"inline-block"}}>🌸</motion.div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".9rem",marginTop:14}}>Loading your garden…</p>
        </div>
      ):garden.length===0?(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:"center",padding:"52px 24px",background:"rgba(255,255,255,.03)",border:"1.5px dashed rgba(236,72,153,.26)",borderRadius:24}}>
          <motion.span animate={{scale:[1,1.14,1]}} transition={{duration:2,repeat:Infinity}} style={{fontSize:"3.4rem"}}>🌱</motion.span>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.28rem",fontStyle:"italic",color:"rgba(255,255,255,.48)",margin:"16px 0 10px"}}>Press the button to plant your first flower!</p>
        </motion.div>
      ):view==="garden"?(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}} style={{margin:"0 0 20px",padding:"20px 16px 14px",background:"linear-gradient(180deg,rgba(34,197,94,.08),rgba(21,128,61,.14))",border:"1px solid rgba(34,197,94,.18)",borderRadius:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:22,background:"linear-gradient(180deg,#3d1c02,#261000)",borderRadius:"0 0 20px 20px"}}/>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",textAlign:"center",margin:"0 0 12px"}}>🌿 Garden Bed</p>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"flex-start",gap:10,paddingBottom:28}}>
            <AnimatePresence>{garden.slice().reverse().slice(0,24).map((f,i)=><Plant key={f.id} flower={f} index={i} wind={wind}/>)}</AnimatePresence>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:18}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"#86efac"}}>🌸 {bloomedCount} bloomed</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:".7rem",color:"rgba(255,255,255,.32)"}}>🌱 {garden.length-bloomedCount} growing</span>
          </div>
        </motion.div>
      ):(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",textAlign:"center",marginBottom:14}}>{garden.length} flowers planted</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))",gap:10}}>
            <AnimatePresence>{[...garden].reverse().map((f,i)=><FlowerCard key={f.id} flower={f} index={i} isNew={newId===f.id}/>)}</AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* MILESTONES */}
      {garden.length>0&&(
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.38}} style={{marginTop:28}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"1.5px",textAlign:"center",marginBottom:14}}>Milestones</p>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
            {MILESTONES.map((m,i)=>{const done=garden.length>=m.n;return(
              <motion.div key={i} initial={{opacity:0,scale:.78}} animate={{opacity:done?1:.35,scale:1}} transition={{delay:.42+i*.07,type:"spring"}} whileHover={done?{scale:1.08,y:-4}:{}} style={{flexShrink:0,minWidth:82,padding:"12px 8px",textAlign:"center",background:done?"rgba(236,72,153,.14)":"rgba(255,255,255,.03)",border:`1.5px solid ${done?"rgba(236,72,153,.44)":"rgba(255,255,255,.07)"}`,borderRadius:14,boxShadow:done?"0 4px 20px rgba(236,72,153,.22)":"none"}}>
                <div style={{fontSize:"1.5rem",marginBottom:5,filter:done?"none":"grayscale(1)",display:"inline-block",animation:done?`fg-sway 3.5s ease-in-out ${i*.38}s infinite`:"none",transformOrigin:"bottom center"}}>{m.e}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:".57rem",fontWeight:700,color:done?"#ec4899":"rgba(255,255,255,.28)",lineHeight:1.3}}>{m.label}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:".52rem",color:"rgba(255,255,255,.18)",marginTop:3}}>{m.n} flowers</div>
              </motion.div>
            );})}
          </div>
        </motion.div>
      )}

      {/* FOOTER */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.52}} style={{marginTop:28,textAlign:"center",padding:"28px 24px",background:"linear-gradient(135deg,rgba(236,72,153,.1),rgba(139,92,246,.07))",border:"1px solid rgba(236,72,153,.17)",borderRadius:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 36%,rgba(255,255,255,.04) 50%,transparent 64%)",backgroundSize:"200% 100%",animation:"fg-shimmer 5s linear infinite",pointerEvents:"none"}}/>
        <motion.div animate={{scale:[1,1.1,1]}} transition={{duration:3,repeat:Infinity}} style={{fontSize:"1.9rem",marginBottom:10}}>💍</motion.div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.06rem",fontStyle:"italic",color:"rgba(255,255,255,.55)",margin:"0 0 8px",lineHeight:1.7}}>"Every day you water this garden, you're telling me you choose us 💙"</p>
        <p style={{fontFamily:"'Manrope',sans-serif",fontSize:".88rem",fontWeight:700,color:"rgba(255,255,255,.65)",margin:0}}>— Surya &amp; Sadhana 💍</p>
      </motion.div>
    </div>
  );
}
