import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet } from "../api";

/* ─── COMPLIMENTS ─── */
const COMPLIMENTS = [
  "You have the most beautiful soul I have ever encountered 🌸",
  "Your smile is literally the highlight of my entire day 🌟",
  "You are so much stronger than you know, and I see it every day 💪",
  "The way your mind works is one of my favourite things about you 💭",
  "You make every room feel warmer just by walking into it 🌻",
  "I fall in love with you a little more every single time you laugh 💖",
  "You are rare — the kind of person the world doesn't see enough of 💎",
  "Your kindness could heal the whole world if you let it 🌍",
  "The way you care about people is extraordinary 💗",
  "You are not just beautiful on the outside — you glow from within ✨",
  "Every time I think I know how special you are, you surprise me again 🦋",
  "Being loved by you is the greatest gift of my entire life 💍",
];

function ComplimentMachine() {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx]     = useState(-1);
  const [typing, setTyping] = useState(false);
  const [burst, setBurst]   = useState(false);
  const usedRef = useRef([]);
  const getNext = useCallback(() => {
    if (usedRef.current.length >= COMPLIMENTS.length) usedRef.current = [];
    let n;
    do { n = Math.floor(Math.random()*COMPLIMENTS.length); } while (usedRef.current.includes(n));
    usedRef.current.push(n); return n;
  }, []);
  const generate = () => {
    if (typing) return;
    const n = getNext(); setIdx(n); setDisplayed(""); setTyping(true);
    setBurst(true); setTimeout(()=>setBurst(false),600);
    let i=0; const text=COMPLIMENTS[n];
    const timer=setInterval(()=>{ i++; setDisplayed(text.slice(0,i)); if(i>=text.length){clearInterval(timer);setTyping(false);} },35);
  };
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
      style={{ background:"rgba(9,4,21,0.85)", border:"1px solid rgba(236,72,153,0.15)", borderRadius:"24px", padding:"28px 24px", marginBottom:"16px", backdropFilter:"blur(20px)" }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontStyle:"italic", color:"#ff9ab8", margin:"0 0 6px" }}>💬 Surya's Compliment Machine</h3>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>Press the button — Surya left one just for you 🌸</p>
      <div style={{ minHeight:"80px", background:"rgba(255,255,255,0.04)", border:`1px solid ${burst?"rgba(236,72,153,0.5)":"rgba(255,255,255,0.07)"}`, borderRadius:"16px", padding:"18px 20px", marginBottom:"16px", transition:"border-color 0.3s", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        {idx===-1
          ? <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.3)", fontStyle:"italic", margin:0, textAlign:"center" }}>Press below to receive your compliment 💕</p>
          : <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.25rem", fontStyle:"italic", color:"#ff9ab8", lineHeight:1.65, margin:0 }}>"{displayed}{typing?<span style={{animation:"blink 0.8s step-end infinite",color:"#ec4899"}}>|</span>:""}"</p>
        }
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", color:"rgba(255,255,255,0.3)", margin:"8px 0 0", textAlign:"right" }}>— Surya 💙</p>
      </div>
      <button onClick={generate} disabled={typing}
        style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#e8305a,#8b0040)", border:"none", borderRadius:"14px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:typing?"wait":"pointer", opacity:typing?0.7:1, boxShadow:"0 8px 24px rgba(232,48,90,0.4)", transition:"transform 0.2s, opacity 0.2s" }}
        onMouseEnter={e=>{if(!typing)e.currentTarget.style.transform="translateY(-2px)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="";}}>
        {typing?"Writing... ✍️":idx===-1?"Get My Compliment 💖":"Another One 💫"}
      </button>
    </motion.div>
  );
}

/* ─── LOVE METER ─── */
const LOVE_FACTS = [
  "Surya thinks about Sadhana every 4 minutes on average 💭",
  "His heart rate increases by 29% when he sees her 💓",
  "He has smiled because of her 10,000+ times since they met 😊",
  "Distance can never change how much he loves her 🌍",
  "He would choose her again in every lifetime 🌀",
];
function LoveMeter() {
  const [pct,setPct]=useState(0); const [fact,setFact]=useState(null); const [running,setRunning]=useState(false);
  const run=()=>{
    if(running) return; setRunning(true); setPct(0); setFact(null);
    let cur=0; const step=()=>{ cur+=Math.random()*3+1;
      if(cur>=100){setPct(100);setFact(LOVE_FACTS[Math.floor(Math.random()*LOVE_FACTS.length)]);setRunning(false);}
      else{setPct(Math.floor(cur));setTimeout(step,30);}
    }; setTimeout(step,100);
  };
  const color=pct<50?"#ff85b3":pct<80?"#ec4899":"#c71585";
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.05}}
      style={{ background:"rgba(9,4,21,0.85)", border:"1px solid rgba(236,72,153,0.15)", borderRadius:"24px", padding:"28px 24px", marginBottom:"16px", backdropFilter:"blur(20px)" }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontStyle:"italic", color:"#ff9ab8", margin:"0 0 6px" }}>💯 Love Percentage</h3>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>How much does Surya love Sadhana? 🌸</p>
      <div style={{ position:"relative", height:"28px", background:"rgba(255,255,255,0.06)", borderRadius:"50px", overflow:"hidden", marginBottom:"14px", border:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:"50px", transition:"width 0.05s linear", boxShadow:`0 0 12px ${color}88` }}/>
        <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontFamily:"'Manrope',sans-serif", fontSize:"0.8rem", fontWeight:800, color:"#fff" }}>{pct}%</span>
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:"4px", marginBottom:"16px", flexWrap:"wrap" }}>
        {[...Array(10)].map((_,i)=><span key={i} style={{ opacity:pct>=(i+1)*10?1:0.18, transition:"opacity 0.3s", fontSize:"1.3rem" }}>❤️</span>)}
      </div>
      <button onClick={run} disabled={running}
        style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#e8305a,#8b0040)", border:"none", borderRadius:"14px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:running?"wait":"pointer", opacity:running?0.7:1, boxShadow:"0 8px 24px rgba(232,48,90,0.4)" }}>
        {running?"Calculating... 💓":pct===100?"Measure Again 💖":"Measure Love 💗"}
      </button>
      {fact&&<div style={{ marginTop:"14px", padding:"12px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", fontStyle:"italic", color:"#ff9ab8", lineHeight:1.6 }}>✨ {fact}</div>}
    </motion.div>
  );
}

/* ─── PLAYLIST ─── */
const DEFAULT_PLAYLIST = [
  { title:"Oru Adaar Love",   artist:"Omar Lulu",        mood:"💖 Our Vibe",   color:"#ff69b4", note:"This song always reminds me of you — the innocence, the beauty, just like the day I first saw you.", emoji:"🎵" },
  { title:"Nenjame",          artist:"Yuvan Shankar Raja",mood:"🌙 Late Night", color:"#7c3aed", note:"I listen to this every night thinking of you. Every lyric feels like it was written for us.",       emoji:"🎶" },
  { title:"Kaadhal Vandhadhum",artist:"D. Imman",         mood:"🌸 First Love", color:"#ec4899", note:"The song that plays in my heart every time I think of the moment you proposed to me.",             emoji:"💕" },
  { title:"Munbe Vaa",        artist:"A.R. Rahman",       mood:"✨ Forever",    color:"#f59e0b", note:"This is OUR song. When this plays, the whole world disappears and it's just you and me.",           emoji:"🌟" },
  { title:"Kannazhaga",       artist:"Dhibu Ninan Thomas",mood:"🥺 Miss You",   color:"#3b82f6", note:"Every word of this song is exactly what I feel when I can't see you. You are my kannazhaga.",      emoji:"💙" },
];
function OurPlaylist() {
  const [expanded,setExpanded]=useState(null);
  const [playlist,setPlaylist]=useState(DEFAULT_PLAYLIST);
  useEffect(()=>{
    Promise.all(DEFAULT_PLAYLIST.map((s,i)=>Promise.all([dbGet(`playlist_title_${i+1}`,""),dbGet(`playlist_artist_${i+1}`,""),dbGet(`playlist_note_${i+1}`,"")]).then(([t,a,n])=>({...s,title:t&&t.trim()?t:s.title,artist:a&&a.trim()?a:s.artist,note:n&&n.trim()?n:s.note})))).then(setPlaylist);
  },[]); // eslint-disable-line
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.1}}
      style={{ background:"rgba(9,4,21,0.85)", border:"1px solid rgba(236,72,153,0.15)", borderRadius:"24px", padding:"28px 24px", marginBottom:"16px", backdropFilter:"blur(20px)" }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontStyle:"italic", color:"#ff9ab8", margin:"0 0 6px" }}>🎵 Our Playlist</h3>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>Songs that hold our story 🌸</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {playlist.map((s,i)=>(
          <div key={i} onClick={()=>setExpanded(expanded===i?null:i)}
            style={{ borderLeft:`3px solid ${s.color}`, background:expanded===i?`${s.color}12`:"rgba(255,255,255,0.04)", borderRadius:"0 14px 14px 0", padding:"12px 14px", cursor:"pointer", transition:"background 0.25s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ fontSize:"1.3rem" }}>{s.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.title}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", color:"rgba(255,255,255,0.4)" }}>{s.artist}</div>
              </div>
              <span style={{ fontSize:"0.65rem", fontWeight:700, color:s.color, background:`${s.color}22`, padding:"3px 8px", borderRadius:"50px", border:`1px solid ${s.color}44`, flexShrink:0 }}>{s.mood}</span>
              <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem", flexShrink:0 }}>{expanded===i?"▲":"▼"}</span>
            </div>
            {expanded===i&&<div style={{ marginTop:"12px", paddingTop:"12px", borderTop:`1px solid ${s.color}33` }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", fontStyle:"italic", color:"rgba(255,255,255,0.65)", lineHeight:1.7, margin:"0 0 6px" }}>"{s.note}"</p>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", color:"rgba(255,255,255,0.35)" }}>— Surya 💙</span>
            </div>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── SPECIAL DATES ─── */
const SPECIAL_DATES = [
  { label:"We First Met 🌟",        date:"2023-06-19", emoji:"💫", color:"#f59e0b", past:true  },
  { label:"Surya Proposed 💍",      date:"2026-05-17", emoji:"💍", color:"#ec4899", past:true  },
  { label:"Sadhana Proposed 💗",    date:"2026-05-18", emoji:"💗", color:"#c71585", past:true  },
  { label:"We Both Said Yes 🥂",    date:"2026-05-19", emoji:"🥂", color:"#7c3aed", past:true  },
  { label:"Our Journey Began 🌸",   date:"2026-05-20", emoji:"🌸", color:"#10b981", past:true  },
  { label:"Sadhana's Birthday 🎂",  date:"2008-02-29", emoji:"🎂", color:"#f87171", past:false, yearly:true },
  { label:"Our 1st Anniversary 🎉", date:"2027-05-20", emoji:"🎉", color:"#ff69b4", past:false },
];
function daysUntil(s,yearly=false){const now=new Date();now.setHours(0,0,0,0);let d=new Date(s);if(yearly){d=new Date(now.getFullYear(),d.getMonth(),d.getDate());if(d<now)d=new Date(now.getFullYear()+1,d.getMonth(),d.getDate());}return Math.ceil((d-now)/86400000);}
function daysSince(s){const now=new Date();now.setHours(0,0,0,0);return Math.floor((now-new Date(s))/86400000);}
function SpecialDates() {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.15}}
      style={{ background:"rgba(9,4,21,0.85)", border:"1px solid rgba(236,72,153,0.15)", borderRadius:"24px", padding:"28px 24px", marginBottom:"16px", backdropFilter:"blur(20px)" }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontStyle:"italic", color:"#ff9ab8", margin:"0 0 6px" }}>📅 Our Special Dates</h3>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>Every date that changed our story 💌</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {SPECIAL_DATES.map((d,i)=>{
          const days=d.past?daysSince(d.date):daysUntil(d.date,d.yearly);
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", background:"rgba(255,255,255,0.04)", border:`1px solid ${d.color}30`, borderRadius:"14px" }}>
              <div style={{ width:"38px", height:"38px", background:`${d.color}20`, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>{d.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", fontWeight:700, color:d.color, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.label}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{new Date(d.date).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
              </div>
              <div style={{ background:d.color, color:"#fff", padding:"4px 10px", borderRadius:"50px", fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:800, flexShrink:0, boxShadow:`0 2px 8px ${d.color}60` }}>
                {d.past?`${days}d ago`:days===0?"Today 🎉":`in ${days}d`}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── POLAROID CORKBOARD ─── */
const POLAROIDS = [
  { src:"/images/photo1.jpg.jpg",  caption:"The day it all began 💫",        rot:-3 },
  { src:"/images/photo2.jpg.jpeg", caption:"The night I said I love you 💍", rot:4  },
  { src:"/images/photo3.jpg.jpeg", caption:"She said yes back 💗",           rot:-5 },
  { src:"/images/photo4.jpg.jpeg", caption:"Together forever 🥂",            rot:2  },
  { src:"/images/photo5.jpg.jpeg", caption:"Our journey starts 🌸",          rot:-2 },
  { src:"/images/photo11.jpg.jpg", caption:"Every smile counts 😊",          rot:5  },
  { src:"/images/photo13.jpg.jpg", caption:"My favourite person 💓",         rot:-4 },
  { src:"/images/photo16.jpg.jpg", caption:"You are my everything ✨",       rot:3  },
];
function PolaroidBoard() {
  const [active,setActive]=useState(null);
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.2}}
      style={{ background:"rgba(9,4,21,0.85)", border:"1px solid rgba(236,72,153,0.15)", borderRadius:"24px", padding:"28px 24px", marginBottom:"16px", backdropFilter:"blur(20px)" }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontStyle:"italic", color:"#ff9ab8", margin:"0 0 6px" }}>📸 Our Corkboard</h3>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.4)", margin:"0 0 18px" }}>Tap any photo for a closer look 💕</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"16px" }}>
        {POLAROIDS.map((p,i)=>(
          <div key={i} onClick={()=>setActive(i)}
            style={{ background:"#fff", padding:"10px 10px 28px", borderRadius:"4px", transform:`rotate(${p.rot}deg)`, boxShadow:"4px 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)", cursor:"pointer", transition:"transform 0.3s", position:"relative" }}
            onMouseEnter={e=>e.currentTarget.style.transform="rotate(0deg) scale(1.08) translateY(-4px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=`rotate(${p.rot}deg)`}>
            <div style={{ position:"absolute", top:"-8px", left:"50%", transform:"translateX(-50%)", width:"12px", height:"12px", background:"radial-gradient(circle at 40% 35%,#ff6b6b,#c71585)", borderRadius:"50%", boxShadow:"0 2px 4px rgba(0,0,0,0.4)" }}/>
            <div style={{ width:"100%", aspectRatio:"1", overflow:"hidden", borderRadius:"2px", marginBottom:"8px" }}>
              <img src={p.src} alt={p.caption} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.background="#fce4ec";e.target.style.display="flex";e.target.alt="💕";}}/>
            </div>
            <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:"0.75rem", color:"rgba(0,0,0,0.55)", margin:0, textAlign:"center", lineHeight:1.3 }}>{p.caption}</p>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {active!==null&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", backdropFilter:"blur(20px)" }}
            onClick={()=>setActive(null)}>
            <motion.div initial={{scale:0.7,rotateX:15}} animate={{scale:1,rotateX:0}} exit={{scale:0.8}} transition={{type:"spring",stiffness:250,damping:22}}
              style={{ background:"#fff", padding:"14px 14px 40px", borderRadius:"4px", maxWidth:"400px", width:"100%", boxShadow:"0 40px 100px rgba(0,0,0,0.7)", position:"relative" }}
              onClick={e=>e.stopPropagation()}>
              <img src={POLAROIDS[active].src} alt="" style={{ width:"100%", borderRadius:"2px", display:"block" }}/>
              <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:"1.1rem", color:"rgba(0,0,0,0.6)", margin:"14px 0 0", textAlign:"center" }}>{POLAROIDS[active].caption}</p>
              <button onClick={()=>setActive(null)} style={{ position:"absolute", top:"-12px", right:"-12px", width:"32px", height:"32px", background:"linear-gradient(135deg,#e8305a,#8b0040)", border:"none", borderRadius:"50%", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:"0.9rem", boxShadow:"0 4px 12px rgba(232,48,90,0.5)" }}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── MAIN PAGE with tabs ─── */
const TABS = [
  { key:"compliments", label:"💬", title:"Compliments" },
  { key:"meter",       label:"💯", title:"Love Meter"  },
  { key:"playlist",    label:"🎵", title:"Playlist"    },
  { key:"dates",       label:"📅", title:"Dates"       },
  { key:"corkboard",   label:"📸", title:"Photos"      },
];

export default function SadhanaWorld({ setPage }) {
  const [tab, setTab] = useState("compliments");

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto", padding:"8px 4px 60px" }}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
        style={{ textAlign:"center", marginBottom:"24px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"5px 16px", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(236,72,153,0.2)", borderRadius:"50px", marginBottom:"12px", fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#EC4899", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          🌸 Built for Sadhana
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.6rem", fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 8px", textShadow:"0 0 40px rgba(236,72,153,0.25)" }}>
          Sadhana's World 🌸
        </h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", margin:0 }}>
          Everything here was made with love, just for you 💗
        </p>
      </motion.div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:"6px", overflowX:"auto", paddingBottom:"4px", marginBottom:"20px", justifyContent:"center" }}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"3px", padding:"10px 14px", background:tab===t.key?"linear-gradient(135deg,rgba(236,72,153,0.2),rgba(139,92,246,0.15))":"rgba(255,255,255,0.05)", border:`1.5px solid ${tab===t.key?"rgba(236,72,153,0.45)":"rgba(255,255,255,0.08)"}`, borderRadius:"16px", cursor:"pointer", transition:"all 0.22s" }}>
            <span style={{ fontSize:"1.3rem" }}>{t.label}</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.58rem", fontWeight:700, color:tab===t.key?"#ec4899":"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{t.title}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.3}}>
          {tab==="compliments" && <ComplimentMachine />}
          {tab==="meter"       && <LoveMeter />}
          {tab==="playlist"    && <OurPlaylist />}
          {tab==="dates"       && <SpecialDates />}
          {tab==="corkboard"   && <PolaroidBoard />}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div style={{ textAlign:"center", marginTop:"28px", padding:"22px", background:"linear-gradient(135deg,rgba(236,72,153,0.07),rgba(139,92,246,0.05))", border:"1px solid rgba(236,72,153,0.12)", borderRadius:"20px" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", fontStyle:"italic", color:"rgba(255,255,255,0.5)", margin:"0 0 6px" }}>
          "This whole world is better because you are in it 🌍"
        </p>
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.88rem", fontWeight:800, color:"rgba(255,255,255,0.7)", margin:0 }}>
          Surya &amp; Sadhana — Forever 💍
        </p>
      </div>
    </div>
  );
}
