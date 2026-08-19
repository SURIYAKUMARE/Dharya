import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, Upload, X, MapPin, Clock, User, Users, Heart, Star, Calendar } from "lucide-react";
import { dbGet, dbSet, getPhoto, uploadPhoto, deletePhoto } from "../api";
import { useTilt } from "../App";

/* ── Default moments — updated with July 2026 entries ── */
const DEFAULT_MOMENTS = [
  { year:"19/06/2023", title:"We First Met",            desc:"At the tuition class — a beautiful, unexpected beginning 🌟",        emoji:"🌟", addedBy:"surya"   },
  { year:"17/05/2026", title:"Surya Proposed",          desc:"At midnight under the stars — a moment I'll never forget 💍",        emoji:"💍", addedBy:"surya"   },
  { year:"18/05/2026", title:"Sadhana Proposed Back",   desc:"At evening — she said yes in the most beautiful way 🌸",             emoji:"🌸", addedBy:"sadhana" },
  { year:"19/05/2026", title:"We Both Said Yes",        desc:"Two hearts, one answer — forever starts here 💕",                    emoji:"💕", addedBy:"both"    },
  { year:"20/05/2026", title:"Our Journey Begins",      desc:"From this day, hand in hand, forever and always 🌹",                 emoji:"🌹", addedBy:"both"    },
  { year:"01/07/2026", title:"One Month Together",      desc:"One month of pure happiness — every second with you is a gift 💖",   emoji:"💖", addedBy:"both"    },
  { year:"10/07/2026", title:"Our First Garden Day",    desc:"We started our love garden — one flower for every day 🌻",           emoji:"🌻", addedBy:"both"    },
  { year:"18/08/2026", title:"90 Days of Love",         desc:"90 days of smiles, memories, and growing love — here's to forever ✨",emoji:"✨", addedBy:"both"    },
];

const DEFAULT_IMGS = [
  "/images/photo1.jpg.jpg","/images/photo2.jpg.jpeg","/images/photo3.jpg.jpeg",
  "/images/photo4.jpg.jpeg","/images/photo5.jpg.jpeg",
];

const CATEGORY_COLORS = {
  surya:   { color:"#10B981", bg:"rgba(16,185,129,0.12)", label:"Surya",   icon:<User size={11}/> },
  sadhana: { color:"#ff6b8e", bg:"rgba(255,107,142,0.12)",label:"Sadhana", icon:<User size={11}/> },
  both:    { color:"#f59e0b", bg:"rgba(245,158,11,0.12)", label:"Both",    icon:<Users size={11}/> },
};

/* ── 3D tilt wrapper ── */
function TiltCard({ children, style }) {
  const tilt = useTilt(5);
  return (
    <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} onMouseEnter={tilt.onMouseEnter}
      className="tilt-card" style={{ position:"relative", ...style }}>
      <div className="tilt-shine" style={{ borderRadius:20 }}/>
      {children}
    </div>
  );
}

/* ── Author badge ── */
function AuthorBadge({ who }) {
  const cfg = CATEGORY_COLORS[who] || CATEGORY_COLORS.both;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px",
      background:cfg.bg, border:`1px solid ${cfg.color}33`, borderRadius:50,
      fontSize:"0.63rem", fontWeight:700, color:cfg.color, fontFamily:"'Inter',sans-serif", letterSpacing:"0.3px" }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ── Journey stat card ── */
function StatCard({ icon, value, label, color, delay }) {
  return (
    <motion.div initial={{ opacity:0, y:20, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }}
      transition={{ delay, type:"spring", stiffness:260, damping:20 }}
      whileHover={{ y:-4, scale:1.04 }}
      style={{ flex:1, minWidth:80, padding:"18px 12px", textAlign:"center",
        background:"rgba(255,255,255,0.04)", border:`1px solid ${color}22`,
        borderRadius:18, backdropFilter:"blur(12px)", boxShadow:`0 4px 20px ${color}10` }}>
      <div style={{ fontSize:"1.5rem", marginBottom:6 }}>{icon}</div>
      <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.6rem", fontWeight:800, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.56rem", color:"rgba(255,255,255,0.35)",
        textTransform:"uppercase", letterSpacing:"0.8px", marginTop:4 }}>{label}</div>
    </motion.div>
  );
}

export default function JourneyTimeline({ setPage, user }) {
  const [moments,   setMoments]   = useState([]);
  const [photos,    setPhotos]    = useState({});
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [editIdx,   setEditIdx]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [expandIdx, setExpandIdx] = useState(null);
  const [form,      setForm]      = useState({ year:"", title:"", desc:"", emoji:"💕", file:null, preview:"" });
  const itemRefs = useRef([]);
  const fileRef  = useRef(null);

  const daysTogether = Math.max(0, Math.floor((Date.now() - new Date("2026-05-20").getTime()) / 86400000));

  useEffect(() => {
    (async () => {
      const saved = await dbGet("edit_timeline", []);
      const data  = Array.isArray(saved) && saved.length ? saved : DEFAULT_MOMENTS;
      const map   = {};
      for (let i = 0; i < data.length; i++) {
        const up = await getPhoto(`timeline_img_${i}`);
        map[i] = up || DEFAULT_IMGS[i] || "";
      }
      setMoments(data); setPhotos(map); setLoading(false);
    })();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    itemRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [moments, loading]);

  const persist = async (nm, np) => {
    await dbSet("edit_timeline", nm);
    setMoments(nm);
    if (np) setPhotos(np);
  };

  const handleSubmit = async () => {
    if (!form.year.trim() || !form.title.trim()) return;
    setSaving(true);
    const isEdit = editIdx !== null;
    const idx    = isEdit ? editIdx : moments.length;
    let pm = { ...photos };
    if (form.file) {
      setUploading(true);
      pm[idx] = await uploadPhoto(`timeline_img_${idx}`, form.file);
      setUploading(false);
    }
    const moment  = { year:form.year.trim(), title:form.title.trim(), desc:form.desc.trim(), emoji:form.emoji||"💕", addedBy:user };
    const updated = isEdit ? moments.map((m,i) => i===idx ? moment : m) : [...moments, moment];
    await persist(updated, pm);
    setAdding(false); setEditIdx(null);
    setForm({ year:"", title:"", desc:"", emoji:"💕", file:null, preview:"" });
    setSaving(false);
  };

  const handleDelete = async (i) => {
    if (!window.confirm("Remove this moment?")) return;
    const updated = moments.filter((_,j) => j!==i);
    await deletePhoto(`timeline_img_${i}`);
    const np = {}; updated.forEach((_,j) => { np[j] = photos[j>=i ? j+1 : j] || ""; });
    await persist(updated, np);
  };

  const startEdit = (i) => {
    const m = moments[i];
    setForm({ year:m.year, title:m.title, desc:m.desc||"", emoji:m.emoji||"💕", file:null, preview:photos[i]||"" });
    setEditIdx(i); setAdding(true);
  };

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2.5*1024*1024) { alert("Max 2MB"); return; }
    const r = new FileReader();
    r.onload = ev => setForm(f => ({...f, file, preview:ev.target.result}));
    r.readAsDataURL(file);
  };

  const inputStyle  = { width:"100%", boxSizing:"border-box", padding:"12px 16px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:13, color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none" };
  const labelStyle  = { display:"flex", alignItems:"center", gap:5, fontFamily:"'Inter',sans-serif", fontSize:"0.66rem", fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1.1px", marginBottom:8 };

  return (
    <div style={{ maxWidth:740, margin:"0 auto", padding:"8px 4px 60px" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
        style={{ textAlign:"center", marginBottom:36, padding:"0 8px" }}>

        <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 20px",
            background:"rgba(232,48,90,0.1)", border:"1px solid rgba(232,48,90,0.25)",
            borderRadius:50, marginBottom:16, fontFamily:"'Inter',sans-serif",
            fontSize:"0.7rem", fontWeight:700, color:"#ff6b8e", letterSpacing:"1.8px", textTransform:"uppercase" }}>
          <MapPin size={12}/> Our Story
        </motion.div>

        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,2.8rem)",
          fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 10px",
          textShadow:"0 0 60px rgba(232,48,90,0.3), 0 2px 10px rgba(0,0,0,0.5)" }}>
          Our Journey Together 🌹
        </h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", margin:"0 0 28px", lineHeight:1.7 }}>
          Every moment that wrote our story 💕
        </p>

        {/* ── STATS ── */}
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>
          <StatCard icon="💑" value={daysTogether} label="Days Together" color="#ff6b8e" delay={0.2}/>
          <StatCard icon="💌" value={moments.length} label="Memories" color="#f59e0b" delay={0.3}/>
          <StatCard icon="🌸" value={moments.filter(m=>m.addedBy==="sadhana"||m.addedBy==="both").length} label="Her Moments" color="#c084fc" delay={0.4}/>
          <StatCard icon="💙" value={moments.filter(m=>m.addedBy==="surya"||m.addedBy==="both").length} label="His Moments" color="#10b981" delay={0.5}/>
        </div>
      </motion.div>

      {/* ── ADD BUTTON ── */}
      {!adding && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center", marginBottom:36 }}>
          <motion.button
            whileHover={{ scale:1.05, y:-3, boxShadow:"0 20px 48px rgba(232,48,90,0.55)" }}
            whileTap={{ scale:0.96 }}
            onClick={() => { setAdding(true); setEditIdx(null); setForm({ year:"", title:"", desc:"", emoji:"💕", file:null, preview:"" }); }}
            style={{ display:"inline-flex", alignItems:"center", gap:9, padding:"13px 30px",
              background:"linear-gradient(135deg,#e8305a,#8b0040)", border:"none",
              borderRadius:50, color:"#fff", fontFamily:"'Inter',sans-serif",
              fontSize:"0.9rem", fontWeight:700, cursor:"pointer",
              boxShadow:"0 12px 32px rgba(232,48,90,0.42)" }}>
            <Plus size={17} strokeWidth={2.5}/> Add a Moment
          </motion.button>
        </motion.div>
      )}

      {/* ── FORM ── */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity:0, y:-20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-16, scale:0.97 }} transition={{ duration:0.38, ease:[0.25,0.46,0.45,0.94] }}
            style={{ margin:"0 0 40px", background:"rgba(9,4,21,0.88)", border:"1px solid rgba(232,48,90,0.18)",
              borderRadius:24, padding:"32px 28px", boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
              backdropFilter:"blur(20px)" }}>
            <h3 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.15rem", fontWeight:800,
              color:"#fff", margin:"0 0 22px", display:"flex", alignItems:"center", gap:10 }}>
              {editIdx!==null ? <><Edit3 size={17}/> Edit Moment</> : <><Plus size={17}/> Add a Moment</>}
            </h3>

            {/* Emoji picker row */}
            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}><Star size={12}/> Emoji</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["💕","💍","🌸","🌹","✨","💖","🌟","💫","🎉","🥺","🌙","🌺"].map(e => (
                  <button key={e} onClick={() => setForm(f=>({...f,emoji:e}))}
                    style={{ width:38, height:38, borderRadius:10, border:`2px solid ${form.emoji===e?"rgba(232,48,90,0.8)":"rgba(255,255,255,0.1)"}`,
                      background:form.emoji===e?"rgba(232,48,90,0.2)":"rgba(255,255,255,0.05)",
                      fontSize:"1.1rem", cursor:"pointer", transition:"all 0.2s" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {[{label:"Date", icon:<Calendar size={13}/>, field:"year", placeholder:"e.g. 19/06/2023"},
              {label:"Title",icon:<MapPin size={13}/>,   field:"title",placeholder:"e.g. The day we first talked"}]
              .map(({label,icon,field,placeholder}) => (
              <div key={field} style={{ marginBottom:14 }}>
                <label style={labelStyle}>{icon} {label}</label>
                <input style={inputStyle} placeholder={placeholder} value={form[field]}
                  onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}
                  onFocus={e=>{e.target.style.borderColor="rgba(232,48,90,0.55)";e.target.style.boxShadow="0 0 0 3px rgba(232,48,90,0.1)";}}
                  onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";e.target.style.boxShadow="none";}}/>
              </div>
            ))}

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{...inputStyle,resize:"vertical",minHeight:78,lineHeight:1.6}} rows={3}
                placeholder="What made this moment special…" value={form.desc}
                onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}><Upload size={12}/> Photo (optional, max 2MB)</label>
              {form.preview ? (
                <div style={{ position:"relative", display:"inline-block" }}>
                  <img src={form.preview} alt="preview" style={{ width:160,height:120,objectFit:"cover",borderRadius:14,display:"block",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}/>
                  <button onClick={() => { setForm(f=>({...f,file:null,preview:""})); if(fileRef.current)fileRef.current.value=""; }}
                    style={{ position:"absolute",top:-8,right:-8,width:24,height:24,background:"#ef4444",border:"2px solid rgba(0,0,0,0.3)",borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff" }}>
                    <X size={12} strokeWidth={3}/>
                  </button>
                </div>
              ) : (
                <label style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",background:"rgba(255,255,255,0.05)",border:"1.5px dashed rgba(255,255,255,0.15)",borderRadius:12,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.84rem",color:"rgba(255,255,255,0.4)" }}>
                  <Upload size={14}/> Choose Photo
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
                </label>
              )}
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <motion.button whileHover={{ y:-2 }} whileTap={{ scale:0.97 }} onClick={handleSubmit}
                disabled={!form.year.trim()||!form.title.trim()||saving}
                style={{ flex:1, padding:"14px", background:"linear-gradient(135deg,#e8305a,#8b0040)", border:"none",
                  borderRadius:14, color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem",
                  fontWeight:700, cursor:saving?"wait":"pointer", boxShadow:"0 10px 28px rgba(232,48,90,0.4)",
                  opacity:(!form.year.trim()||!form.title.trim())?0.5:1 }}>
                {saving?(uploading?"Uploading… ⏳":"Saving… ✦"):(editIdx!==null?"Update Moment":"Add to Journey")}
              </motion.button>
              <button onClick={() => { setAdding(false); setEditIdx(null); }}
                style={{ padding:"14px 20px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, cursor:"pointer", color:"rgba(255,255,255,0.5)", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TIMELINE ── */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.4)" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:2, repeat:Infinity, ease:"linear" }}
            style={{ fontSize:"2.4rem", display:"inline-block", marginBottom:14 }}>🌸</motion.div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading your journey…</p>
        </div>
      ) : (
        <div className="timeline">
          {moments.map((m, i) => (
            <div key={i} ref={el=>(itemRefs.current[i]=el)} className={`timeline-item ${i%2===0?"left":"right"}`}>
              {/* dot with emoji */}
              <div className="dot" style={{ display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem" }}>
                {m.emoji || "💕"}
              </div>

              <TiltCard>
                {/* date + badge row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", fontWeight:600, fontStyle:"italic", color:"#f59e0b", display:"flex", alignItems:"center", gap:5 }}>
                    <Clock size={11} style={{ opacity:0.6 }}/> {m.year}
                  </span>
                  <AuthorBadge who={m.addedBy}/>
                </div>

                {/* title */}
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.25rem", fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 6px", lineHeight:1.3 }}>
                  {m.title}
                </h3>

                {/* desc — expandable */}
                {m.desc && (
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.875rem", color:"rgba(255,255,255,0.5)", margin:"0 0 10px", lineHeight:1.6 }}>
                    {expandIdx===i || m.desc.length<=100 ? m.desc : m.desc.slice(0,100)+"…"}
                    {m.desc.length>100 && (
                      <button onClick={()=>setExpandIdx(expandIdx===i?null:i)}
                        style={{ background:"none", border:"none", color:"#ff6b8e", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", padding:"0 4px" }}>
                        {expandIdx===i?"less":"more"}
                      </button>
                    )}
                  </p>
                )}

                {/* photo */}
                {photos[i] && (
                  <div style={{ borderRadius:14, overflow:"hidden", marginTop:4, marginBottom:10, boxShadow:"0 8px 24px rgba(0,0,0,0.35)" }}>
                    <img src={photos[i]} alt={m.title} style={{ width:"100%", display:"block", opacity:0.92 }}/>
                  </div>
                )}

                {/* actions */}
                <div style={{ display:"flex", gap:8, marginTop:10, justifyContent:i%2===0?"flex-start":"flex-end" }}>
                  {[
                    { label:"Edit",   icon:<Edit3 size={12}/>, onClick:()=>startEdit(i), col:"rgba(255,255,255,0.5)", bg:"rgba(255,255,255,0.07)", brd:"rgba(255,255,255,0.1)" },
                    { label:"Delete", icon:<Trash2 size={12}/>,onClick:()=>handleDelete(i),col:"rgba(239,68,68,0.65)",bg:"rgba(239,68,68,0.08)",brd:"rgba(239,68,68,0.18)" },
                  ].map(({label,icon,onClick,col,bg,brd})=>(
                    <button key={label} onClick={onClick}
                      style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:10,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.74rem",fontWeight:600,color:col,background:bg,border:`1px solid ${brd}`,transition:"all 0.2s" }}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </TiltCard>
            </div>
          ))}

          {/* add prompt at end */}
          {!adding && (
            <div className="timeline-item left" style={{ opacity:1, transform:"none" }}>
              <div className="dot" style={{ borderStyle:"dashed", background:"transparent", opacity:0.35, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Plus size={14} style={{ color:"rgba(236,72,153,0.6)" }}/>
              </div>
              <motion.div whileHover={{ scale:1.02 }}
                className="content" style={{ cursor:"pointer", textAlign:"center", padding:22, background:"rgba(236,72,153,0.04)", border:"1.5px dashed rgba(236,72,153,0.2)", borderRadius:20 }}
                onClick={()=>{ setAdding(true); setEditIdx(null); setForm({year:"",title:"",desc:"",emoji:"💕",file:null,preview:""});}}>
                <Heart size={24} style={{ color:"rgba(236,72,153,0.45)", marginBottom:8 }}/>
                <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:"0.875rem", fontWeight:600, color:"rgba(236,72,153,0.55)" }}>Add your next memory</p>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
