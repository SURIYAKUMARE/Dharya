import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Heart, TrendingUp, Edit3, CheckCircle, ChevronDown, X, Mail } from "lucide-react";
import { getDreams, saveDreams, dbGet, dbSet } from "../api";
import { useTilt } from "../App";

const DREAM_COME_TRUE_YEARS = 4;
const emojis     = ["🌟","💖","🌈","✨","🦋"];
const categories = ["✈️ Travel","💼 Career","❤️ Love","🏠 Home","🎓 Growth","💰 Wealth","🌺 Health","🎨 Hobby"];

const LOVE_NOTES = [
  "Every dream you have is one I want to make real for you 💍",
  "You deserve every single thing you've ever wished for 🌸",
  "I'll be beside you for every dream, big and small 💙",
  "Your happiness is my biggest dream 🌟",
  "Together we can turn every dream into a memory 🦋",
  "Write your dreams boldly — I'll help you chase them all 💫",
];

const MOOD_OPTIONS = [
  { emoji:"😍", label:"Dreamy",   color:"#EC4899" },
  { emoji:"🥰", label:"Loved",    color:"#f472b6" },
  { emoji:"✨", label:"Inspired", color:"#8B5CF6" },
  { emoji:"🌸", label:"Hopeful",  color:"#06B6D4" },
  { emoji:"😊", label:"Happy",    color:"#10B981" },
  { emoji:"🌙", label:"Peaceful", color:"#6366f1" },
];

/* ── Live Countdown ── */
function LiveCountdown({ targetDate, label }) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { d:0, h:0, m:0, s:0 };
    return { d:Math.floor(diff/86400000), h:Math.floor((diff/3600000)%24), m:Math.floor((diff/60000)%60), s:Math.floor((diff/1000)%60) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [targetDate]); // eslint-disable-line

  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"14px 16px", marginBottom:"10px" }}>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1.2px", margin:"0 0 10px" }}>{label}</p>
      <div style={{ display:"flex", gap:"8px" }}>
        {[{v:t.d,u:"Days"},{v:t.h,u:"Hrs"},{v:t.m,u:"Min"},{v:t.s,u:"Sec"}].map(({v,u}) => (
          <div key={u} style={{ flex:1, background:"linear-gradient(135deg,#EC4899,#8B5CF6)", borderRadius:"10px", padding:"8px 4px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.2rem", fontWeight:800, color:"#fff", lineHeight:1 }}>{String(v).padStart(2,"0")}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.6rem", color:"rgba(255,255,255,0.7)", textTransform:"uppercase", letterSpacing:"0.5px", marginTop:"3px" }}>{u}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function addTime(base, ms) { return new Date(new Date(base).getTime() + ms); }
const MS = { "1 Year":365*86400000, "4 Years":4*365*86400000, "10 Years":10*365*86400000 };

/* ── Love Note Card with 3D tilt ── */
function LoveNoteCard() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const tilt = useTilt(5);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i+1)%LOVE_NOTES.length); setFade(true); }, 300);
    }, 5000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onMouseEnter={tilt.onMouseEnter}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.5 }}
      style={{
        margin:"0 0 24px", padding:"28px 28px 24px",
        background:"linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.08))",
        border:"1px solid rgba(236,72,153,0.2)",
        borderRadius:"24px", textAlign:"center",
        backdropFilter:"blur(12px)", position:"relative", overflow:"hidden",
      }}
    >
      <div className="tilt-shine" style={{borderRadius:"24px"}}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg, transparent, #EC4899, #8B5CF6, transparent)" }} />
      {/* floating orb */}
      <div style={{position:"absolute",top:"-30px",right:"-30px",width:"100px",height:"100px",background:"radial-gradient(circle,rgba(236,72,153,0.12) 0%,transparent 70%)",borderRadius:"50%",filter:"blur(15px)",pointerEvents:"none"}}/>
      <Mail size={20} style={{ color:"#EC4899", marginBottom:"12px", opacity:0.8 }} />
      <p style={{
        fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:500,
        color:"rgba(255,255,255,0.7)", lineHeight:1.7, margin:"0 0 16px",
        opacity: fade ? 1 : 0, transition:"opacity 0.3s",
        fontStyle:"italic",
      }}>
        "{LOVE_NOTES[idx]}"
      </p>
      <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginBottom:"10px" }}>
        {LOVE_NOTES.map((_,i) => (
          <button key={i} onClick={() => { setFade(false); setTimeout(()=>{setIdx(i);setFade(true);},300); }}
            style={{
              width: i===idx?"18px":"6px", height:"6px",
              background: i===idx ? "#EC4899" : "rgba(255,255,255,0.2)",
              borderRadius:"3px", border:"none", cursor:"pointer",
              transition:"all 0.3s",
            }}
          />
        ))}
      </div>
      <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.78rem", fontWeight:700, color:"rgba(255,255,255,0.3)", margin:0 }}>— Surya 💙</p>
    </motion.div>
  );
}

/* ── Mood Picker ── */
function MoodPicker({ mood, onChange }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.5 }}
      style={{ marginBottom:"28px" }}
    >
      <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"rgba(255,255,255,0.5)", margin:"0 0 14px", textAlign:"center", letterSpacing:"0.2px" }}>
        How are you feeling today?
      </p>
      <div style={{ display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap" }}>
        {MOOD_OPTIONS.map(({emoji,label,color}) => (
          <button key={label} onClick={() => onChange(label===mood?"":label)}
            style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:"5px",
              padding:"12px 14px",
              background: mood===label ? `${color}22` : "rgba(255,255,255,0.04)",
              border:`1px solid ${mood===label ? `${color}55` : "rgba(255,255,255,0.08)"}`,
              borderRadius:"16px", cursor:"pointer",
              transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              transform: mood===label ? "scale(1.08) translateY(-2px)" : "scale(1)",
              boxShadow: mood===label ? `0 8px 24px ${color}33` : "none",
            }}
          >
            <span style={{ fontSize:"1.4rem" }}>{emoji}</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:600, color: mood===label ? color : "rgba(255,255,255,0.35)", letterSpacing:"0.3px" }}>{label}</span>
          </button>
        ))}
      </div>
      {mood && <p style={{ textAlign:"center", fontFamily:"'Inter',sans-serif", fontSize:"0.83rem", color:"rgba(255,255,255,0.4)", marginTop:"12px" }}>Feeling <strong style={{color:"#EC4899"}}>{mood}</strong> today 💕</p>}
    </motion.div>
  );
}

/* ── Surprise Overlay ── */
function SurpriseOverlay({ sadhanaDreams, categories: cats, progress, savedAt, onClose }) {
  const base = savedAt || new Date();
  const dreamDate = addTime(base, DREAM_COME_TRUE_YEARS*365*86400000);
  const validDreams = sadhanaDreams.map((d,i) => ({text:d,cat:cats[i],pct:progress[i]})).filter(d=>d.text.trim());

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", backdropFilter:"blur(12px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity:0, scale:0.9, y:30 }} animate={{ opacity:1, scale:1, y:0 }}
          exit={{ opacity:0, scale:0.9 }} transition={{ type:"spring", duration:0.5 }}
          style={{
            background:"rgba(15,6,20,0.97)", border:"1px solid rgba(236,72,153,0.2)",
            borderRadius:"28px", padding:"40px 32px", maxWidth:"520px", width:"100%",
            boxShadow:"0 40px 100px rgba(0,0,0,0.6), 0 0 80px rgba(236,72,153,0.1)",
            position:"relative", maxHeight:"85vh", overflowY:"auto",
          }}
          onClick={e=>e.stopPropagation()}
        >
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg, transparent, #EC4899, #8B5CF6, transparent)", borderRadius:"28px 28px 0 0" }} />
          <button onClick={onClose} style={{ position:"absolute", top:"16px", right:"16px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"50%", width:"32px", height:"32px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.5)" }}>
            <X size={14}/>
          </button>
          <div style={{ textAlign:"center", marginBottom:"24px" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>💫</div>
            <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.6rem", fontWeight:800, color:"#fff", margin:"0 0 8px", letterSpacing:"-0.3px" }}>Your Dreams Will Come True</h2>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", color:"rgba(255,255,255,0.45)", margin:0, lineHeight:1.6 }}>Every dream written here will become real — within <strong style={{color:"#EC4899"}}>4 years</strong> 💍</p>
          </div>
          {validDreams.length > 0 && validDreams.map((d,i) => (
            <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"14px", marginBottom:"10px" }}>
              <span style={{ fontSize:"1.4rem", flexShrink:0 }}>{emojis[i]}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.8)", margin:"0 0 6px", fontWeight:500 }}>{d.text}</p>
                {d.cat && <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#8B5CF6", background:"rgba(139,92,246,0.12)", padding:"2px 8px", borderRadius:"50px", border:"1px solid rgba(139,92,246,0.2)" }}>{d.cat}</span>}
                <div style={{ marginTop:"8px", height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"2px" }}>
                  <div style={{ height:"100%", width:`${d.pct}%`, background:"linear-gradient(90deg,#EC4899,#8B5CF6)", borderRadius:"2px", transition:"width 0.6s ease" }}/>
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", color:"rgba(255,255,255,0.3)", margin:"4px 0 0" }}>{d.pct}% there</p>
              </div>
            </div>
          ))}
          <div style={{ textAlign:"center", margin:"20px 0 16px", padding:"16px", background:"rgba(201,169,110,0.06)", border:"1px solid rgba(201,169,110,0.15)", borderRadius:"16px" }}>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"rgba(201,169,110,0.6)", textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 6px" }}>Dreams come true by</p>
            <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.3rem", fontWeight:800, color:"#c9a96e", margin:0 }}>{dreamDate.toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</p>
          </div>
          {Object.entries(MS).map(([label,ms]) => <LiveCountdown key={label} label={`Time until ${label} from save`} targetDate={addTime(base,ms)}/>)}
          <button onClick={onClose} style={{ width:"100%", marginTop:"16px", padding:"14px", background:"linear-gradient(90deg,#EC4899,#8B5CF6)", border:"none", borderRadius:"14px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(236,72,153,0.3)" }}>Close 💕</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Dashboard ── */
export default function DreamDashboard({ user }) {
  const [inputs,       setInputs]       = useState(["","","","",""]);
  const [dreamCats,    setDreamCats]    = useState(["","","","",""]);
  const [dreamProg,    setDreamProg]    = useState([0,0,0,0,0]);
  const [saved,        setSaved]        = useState([]);
  const [savedCats,    setSavedCats]    = useState([]);
  const [savedProg,    setSavedProg]    = useState([0,0,0,0,0]);
  const [savedAt,      setSavedAt]      = useState(null);
  const [editMode,     setEditMode]     = useState(false);
  const [mood,         setMood]         = useState("");
  const [showSurprise, setShowSurprise] = useState(false);
  const [showCat,      setShowCat]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const confettiRef = useRef(null);
  const isSurya = user === "surya";
  const name = isSurya ? "Surya" : "Sadhana";

  useEffect(() => {
    (async () => {
      const d = await getDreams();
      if (d && d.inputs) {
        setInputs(d.inputs); setDreamCats(d.cats||["","","","",""]); setDreamProg(d.prog||[0,0,0,0,0]);
        setSaved(d.inputs); setSavedCats(d.cats||[]); setSavedProg(d.prog||[0,0,0,0,0]);
        setSavedAt(d.savedAt ? new Date(d.savedAt) : null);
        if (d.inputs.some(x=>x.trim())) setShowSurprise(true);
      }
      const m = await dbGet("dd_mood",""); if (m) setMood(m);
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  const handleSave = async () => {
    if (!inputs.some(d=>d.trim())) return;
    const now = new Date();
    setSaved([...inputs]); setSavedCats([...dreamCats]); setSavedProg([...dreamProg]);
    setSavedAt(now); setEditMode(false);
    await saveDreams(inputs, dreamCats, dreamProg, now);
    spawnConfetti();
    setTimeout(() => setShowSurprise(true), 900);
  };

  useEffect(() => { if (!loading) dbSet("dd_mood", mood); }, [mood]); // eslint-disable-line

  const handleEdit = () => { setInputs([...saved]); setDreamCats([...savedCats]); setDreamProg([...savedProg]); setEditMode(true); };

  const handleProgressChange = async (i, val) => {
    if (saved.length > 0 && !editMode) {
      const n=[...savedProg]; n[i]=Number(val); setSavedProg(n);
      await saveDreams(saved, savedCats, n, savedAt);
    } else { const n=[...dreamProg]; n[i]=Number(val); setDreamProg(n); }
  };

  const spawnConfetti = () => {
    const colors=["#EC4899","#8B5CF6","#10B981","#06B6D4","#f472b6","#a78bfa"];
    if (!confettiRef.current) return;
    for (let i=0;i<60;i++) {
      const el=document.createElement("div"); el.className="confetti";
      el.style.cssText=`left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};width:${8+Math.random()*8}px;height:${8+Math.random()*8}px;border-radius:${Math.random()>0.5?"50%":"2px"};animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()*0.5}s;`;
      confettiRef.current.appendChild(el);
      setTimeout(()=>el.remove(),4000);
    }
  };

  const isEditing = saved.length===0||editMode;
  const displayProg = isEditing ? dreamProg : savedProg;

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 20px", color:"rgba(255,255,255,0.4)" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:"14px", animation:"floatEmoji 2s ease-in-out infinite alternate" }}>💙</div>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading your dreams…</p>
    </div>
  );

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto", padding:"8px 4px 40px" }}>
      <div ref={confettiRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:99 }}/>

      {/* Header */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5}} style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"6px 18px", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(236,72,153,0.2)", borderRadius:"50px", marginBottom:"14px", fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:700, color:"#EC4899", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          <Star size={11}/> Dream World
        </div>
        <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"2.2rem", fontWeight:800, color:"#fff", margin:"0 0 8px", letterSpacing:"-0.5px" }}>
          {name}'s Dreams {isSurya?"🌿":"🌸"}
        </h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", margin:0, lineHeight:1.6 }}>Every dream you write here will come true 💫</p>
        {!isSurya && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            style={{ marginTop:"14px", display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 18px", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(236,72,153,0.18)", borderRadius:"50px" }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", color:"rgba(255,255,255,0.55)", fontStyle:"italic" }}>
              "I'll make every one of these real for you" — Surya 💙
            </span>
          </motion.div>
        )}
      </motion.div>

      <LoveNoteCard />
      <MoodPicker mood={mood} onChange={setMood} />

      {/* Dream Form */}
      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4, duration:0.5 }}
        style={{
          background:"rgba(9,4,21,0.82)", border:"1px solid rgba(232,48,90,0.14)",
          borderRadius:"24px", padding:"28px 24px", marginBottom:"8px",
          backdropFilter:"blur(18px)",
          boxShadow:"0 16px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset",
          position:"relative",
        }}
      >
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg, transparent, #e8305a, #6b2fa0, transparent)", borderRadius:"24px 24px 0 0" }} />
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:700, color:"rgba(232,48,90,0.7)", textTransform:"uppercase", letterSpacing:"1.5px", textAlign:"center", marginBottom:"20px" }}>
          ✨ {isEditing ? "Write your dreams" : "Your dreams"} — {name}
        </p>

        {(isEditing ? inputs : saved).map((val,i) => (
          <div key={i} style={{ marginBottom:"16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", padding:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom: isEditing&&val.trim()?"10px":"0" }}>
              <span style={{ fontSize:"1.3rem", flexShrink:0 }}>{emojis[i]}</span>
              {isEditing ? (
                <input className="login-input"
                  type="text" placeholder={`Dream ${i+1}…`} value={val}
                  onChange={e=>{const n=[...inputs];n[i]=e.target.value;setInputs(n);}}
                  style={{ flex:1, padding:"11px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none", boxSizing:"border-box" }}
                />
              ) : (
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color: val?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.2)", fontStyle:val?"normal":"italic" }}>{val||"—"}</span>
              )}
            </div>
            {isEditing && (
              <div style={{ marginTop:"8px" }}>
                <button onClick={()=>setShowCat(showCat===i?null:i)}
                  style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"5px 12px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"50px", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#8B5CF6" }}>
                  {dreamCats[i]||"+ Category"} <ChevronDown size={11}/>
                </button>
                {showCat===i && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"8px" }}>
                    {categories.map(c => (
                      <button key={c} onClick={()=>{const n=[...dreamCats];n[i]=c;setDreamCats(n);setShowCat(null);}}
                        style={{ padding:"4px 12px", background: dreamCats[i]===c?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.05)", border:`1px solid ${dreamCats[i]===c?"rgba(139,92,246,0.4)":"rgba(255,255,255,0.08)"}`, borderRadius:"50px", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", color: dreamCats[i]===c?"#a78bfa":"rgba(255,255,255,0.45)" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!isEditing && savedCats[i] && <span style={{ display:"inline-block", marginTop:"6px", padding:"2px 10px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"50px", fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:600, color:"#8B5CF6" }}>{savedCats[i]}</span>}
            {(typeof val==="string"&&val.trim()) && (
              <div style={{ marginTop:"10px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:600, color:"rgba(255,255,255,0.35)", display:"flex", alignItems:"center", gap:"4px" }}><TrendingUp size={11}/> Progress</span>
                  <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.75rem", fontWeight:700, color:"#EC4899" }}>{displayProg[i]}%</span>
                </div>
                <input type="range" min="0" max="100" value={displayProg[i]} onChange={e=>handleProgressChange(i,e.target.value)} className="dream-slider" style={{ width:"100%", accentColor:"#EC4899" }}/>
                <div style={{ height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"2px", marginTop:"6px" }}>
                  <div style={{ height:"100%", width:`${displayProg[i]}%`, background:"linear-gradient(90deg,#EC4899,#8B5CF6)", borderRadius:"2px", transition:"width 0.4s ease" }}/>
                </div>
              </div>
            )}
          </div>
        ))}

        {isEditing ? (
          <button onClick={handleSave}
            style={{ width:"100%", marginTop:"8px", padding:"15px", background:"linear-gradient(90deg,#EC4899,#8B5CF6)", border:"none", borderRadius:"14px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 28px rgba(236,72,153,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <Sparkles size={16}/> Save My Dreams
          </button>
        ) : (
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginTop:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:"12px", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:700, color:"#10B981" }}>
              <CheckCircle size={14}/> Saved!
            </div>
            <button onClick={handleEdit} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:600, color:"rgba(255,255,255,0.55)" }}>
              <Edit3 size={14}/> Edit
            </button>
            <button onClick={()=>setShowSurprise(true)} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:"linear-gradient(90deg,#EC4899,#8B5CF6)", border:"none", borderRadius:"12px", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:700, color:"#fff", boxShadow:"0 6px 18px rgba(236,72,153,0.3)" }}>
              <Star size={14}/> View Promise
            </button>
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6,duration:0.5}}
        style={{ textAlign:"center", padding:"28px", background:"linear-gradient(135deg,rgba(236,72,153,0.08),rgba(139,92,246,0.08))", border:"1px solid rgba(236,72,153,0.15)", borderRadius:"24px", marginTop:"8px" }}>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"1rem", color:"rgba(255,255,255,0.6)", margin:"0 0 8px", fontStyle:"italic" }}>"With you, every dream feels possible ❤️"</p>
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.1rem", fontWeight:800, color:"#fff", margin:0, letterSpacing:"-0.2px" }}>Surya &amp; Sadhana — Forever 💍</p>
      </motion.div>

      {showSurprise && <SurpriseOverlay sadhanaDreams={saved} categories={savedCats} progress={savedProg} savedAt={savedAt} onClose={()=>setShowSurprise(false)}/>}
    </div>
  );
}
