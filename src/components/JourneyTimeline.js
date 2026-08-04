import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, Upload, X, MapPin, Clock, User, Users, ChevronRight } from "lucide-react";
import { dbGet, dbSet, getPhoto, uploadPhoto, deletePhoto } from "../api";

const DEFAULT_MOMENTS = [
  { year:"19/06/2023", title:"We Met",              desc:"At the tution a pleasant day...",    addedBy:"surya" },
  { year:"17/05/2026", title:"I Proposed to her",   desc:"At midnight",                         addedBy:"surya" },
  { year:"18/05/2026", title:"She Proposed to me",  desc:"At Evening",                          addedBy:"sadhana" },
  { year:"19/05/2026", title:"We both Proposed",    desc:"At Evening",                          addedBy:"both" },
  { year:"20/05/2026", title:"We start our journey",desc:"From that day, forever together...", addedBy:"both" },
];

const DEFAULT_IMGS = [
  "/images/photo1.jpg.jpg",
  "/images/photo2.jpg.jpeg",
  "/images/photo3.jpg.jpeg",
  "/images/photo4.jpg.jpeg",
  "/images/photo5.jpg.jpeg",
];

function AddedByBadge({ who }) {
  const cfg = {
    surya:   { icon: <User size={11}/>,  label: "Surya",   color: "#10B981", bg: "rgba(16,185,129,0.12)" },
    sadhana: { icon: <User size={11}/>,  label: "Sadhana", color: "#EC4899", bg: "rgba(236,72,153,0.12)" },
    both:    { icon: <Users size={11}/>, label: "Both",    color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  };
  const { icon, label, color, bg } = cfg[who] || cfg.both;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px",
      background: bg,
      border: `1px solid ${color}33`,
      borderRadius: "50px",
      fontSize: "0.65rem", fontWeight: 700,
      color,
      fontFamily: "'Inter', sans-serif",
      letterSpacing: "0.3px",
    }}>
      {icon} {label}
    </span>
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
  const [form,      setForm]      = useState({ year:"", title:"", desc:"", file: null, preview: "" });
  const [countdown, setCountdown] = useState(null);
  const [hoveredIdx,setHoveredIdx]= useState(null);
  const countdownRef = useRef(null);
  const itemRefs     = useRef([]);
  const fileRef      = useRef(null);

  useEffect(() => {
    (async () => {
      const saved = await dbGet("edit_timeline", []);
      const data  = Array.isArray(saved) && saved.length ? saved : DEFAULT_MOMENTS;
      const map = {};
      for (let i = 0; i < data.length; i++) {
        const uploaded = await getPhoto(`timeline_img_${i}`);
        map[i] = uploaded || DEFAULT_IMGS[i] || "";
      }
      setMoments(data);
      setPhotos(map);
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  const persist = async (newMoments, newPhotos) => {
    await dbSet("edit_timeline", newMoments);
    setMoments(newMoments);
    if (newPhotos) setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!form.year.trim() || !form.title.trim()) return;
    setSaving(true);
    const isEdit = editIdx !== null;
    const idx    = isEdit ? editIdx : moments.length;
    let photoMap = { ...photos };
    if (form.file) {
      setUploading(true);
      const b64 = await uploadPhoto(`timeline_img_${idx}`, form.file);
      photoMap[idx] = b64;
      setUploading(false);
    }
    const moment = { year: form.year.trim(), title: form.title.trim(), desc: form.desc.trim(), addedBy: user };
    const updated = isEdit ? moments.map((m, i) => i === idx ? moment : m) : [...moments, moment];
    await persist(updated, photoMap);
    setAdding(false); setEditIdx(null);
    setForm({ year:"", title:"", desc:"", file:null, preview:"" });
    setSaving(false);
  };

  const handleDelete = async (i) => {
    if (!window.confirm("Remove this moment?")) return;
    const updated = moments.filter((_, j) => j !== i);
    await deletePhoto(`timeline_img_${i}`);
    const newPhotos = {};
    updated.forEach((_, j) => { newPhotos[j] = photos[j >= i ? j+1 : j] || ""; });
    await persist(updated, newPhotos);
  };

  const startEdit = (i) => {
    const m = moments[i];
    setForm({ year:m.year, title:m.title, desc:m.desc||"", file:null, preview: photos[i]||"" });
    setEditIdx(i);
    setAdding(true);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2.5*1024*1024) { alert("Max 2MB per image."); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({...f, file, preview: ev.target.result}));
    reader.readAsDataURL(file);
  };

  const handleScroll = useCallback(() => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;
    if (atBottom && countdown === null) setCountdown(8);
  }, [countdown]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { setPage("gallery"); return; }
    countdownRef.current = setTimeout(() => setCountdown(c => c-1), 1000);
    return () => clearTimeout(countdownRef.current);
  }, [countdown, setPage]);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    itemRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [moments, loading]);

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "8px 4px 40px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: "40px", padding: "0 8px" }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 18px",
          background: "rgba(236,72,153,0.08)",
          border: "1px solid rgba(236,72,153,0.2)",
          borderRadius: "50px", marginBottom: "16px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.72rem", fontWeight: 700,
          color: "#EC4899", letterSpacing: "1.5px", textTransform: "uppercase",
        }}>
          <MapPin size={12}/> Our Story
        </div>
        <h1 style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: "2.2rem", fontWeight: 800,
          color: "#fff", margin: "0 0 10px",
          letterSpacing: "-0.5px",
        }}>
          Our Journey
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.9rem", color: "rgba(255,255,255,0.4)",
          margin: 0, lineHeight: 1.6,
        }}>
          Every moment that made us who we are today 🌸
        </p>
      </motion.div>

      {/* Add moment button */}
      {!adding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", marginBottom: "36px" }}
        >
          <button
            onClick={() => { setAdding(true); setEditIdx(null); setForm({year:"",title:"",desc:"",file:null,preview:""}); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 28px",
              background: "linear-gradient(90deg, #EC4899, #8B5CF6)",
              border: "none", borderRadius: "14px",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.88rem", fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(236,72,153,0.35)",
              transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s",
              letterSpacing: "0.2px",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 16px 40px rgba(236,72,153,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 24px rgba(236,72,153,0.35)"; }}
          >
            <Plus size={16} strokeWidth={2.5} /> Add a Moment
          </button>
        </motion.div>
      )}

      {/* Add / Edit form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25,0.46,0.45,0.94] }}
            style={{
              margin: "0 0 40px",
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "32px 28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              backdropFilter: "blur(16px)",
            }}
          >
            <h3 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: "1.2rem", fontWeight: 800, color: "#fff",
              margin: "0 0 24px",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              {editIdx !== null ? <><Edit3 size={18}/> Edit Moment</> : <><Plus size={18}/> Add a Moment</>}
            </h3>

            {[
              { label:"Date", icon:<Clock size={14}/>, field:"year", placeholder:"e.g. 19/06/2023" },
              { label:"Title", icon:<MapPin size={14}/>, field:"title", placeholder:"e.g. The day we first talked" },
            ].map(({ label, icon, field, placeholder }) => (
              <div key={field} style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem", fontWeight: 700,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase", letterSpacing: "1px",
                  marginBottom: "8px",
                }}>
                  {icon} {label}
                </label>
                <input
                  className="login-input"
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                  style={{ width:"100%", boxSizing:"border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem", fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase", letterSpacing: "1px",
                marginBottom: "8px",
              }}>
                Description (optional)
              </label>
              <textarea
                className="login-input"
                rows={3}
                placeholder="What happened that day…"
                value={form.desc}
                onChange={e => setForm(f => ({...f, desc:e.target.value}))}
                style={{ width:"100%", boxSizing:"border-box", resize:"vertical", minHeight:"80px", lineHeight:1.6 }}
              />
            </div>

            {/* Photo picker */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem", fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase", letterSpacing: "1px",
                display: "block", marginBottom: "8px",
              }}>
                Photo (optional, max 2MB)
              </label>
              {form.preview ? (
                <div style={{ position:"relative", display:"inline-block" }}>
                  <img src={form.preview} alt="preview" style={{
                    width:"160px", height:"120px", objectFit:"cover",
                    borderRadius:"14px", display:"block",
                    boxShadow:"0 8px 24px rgba(0,0,0,0.35)",
                  }} />
                  <button
                    onClick={() => { setForm(f=>({...f,file:null,preview:""})); if(fileRef.current) fileRef.current.value=""; }}
                    style={{
                      position:"absolute", top:"-8px", right:"-8px",
                      width:"24px", height:"24px",
                      background:"#ef4444", border:"2px solid rgba(0,0,0,0.3)",
                      borderRadius:"50%", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#fff",
                    }}
                  >
                    <X size={12} strokeWidth={3}/>
                  </button>
                </div>
              ) : (
                <label style={{
                  display:"inline-flex", alignItems:"center", gap:"8px",
                  padding:"10px 20px",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px dashed rgba(255,255,255,0.15)",
                  borderRadius:"12px",
                  cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",
                  fontSize:"0.85rem", color:"rgba(255,255,255,0.45)",
                  transition:"all 0.2s",
                }}>
                  <Upload size={14}/> Choose Photo
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
                </label>
              )}
            </div>

            <div style={{ display:"flex", gap:"12px" }}>
              <button
                onClick={handleSubmit}
                disabled={!form.year.trim()||!form.title.trim()||saving}
                style={{
                  flex: 1, padding:"14px",
                  background: "linear-gradient(90deg, #EC4899, #8B5CF6)",
                  border:"none", borderRadius:"14px",
                  color:"#fff",
                  fontFamily:"'Inter',sans-serif",
                  fontSize:"0.9rem", fontWeight:700,
                  cursor: saving ? "wait" : "pointer",
                  boxShadow:"0 8px 24px rgba(236,72,153,0.3)",
                  opacity: (!form.year.trim()||!form.title.trim()) ? 0.5 : 1,
                  transition:"transform 0.2s, box-shadow 0.2s",
                }}
              >
                {saving ? (uploading ? "Uploading… ⏳" : "Saving… ✦") : (editIdx!==null ? "Update Moment" : "Add to Journey")}
              </button>
              <button
                onClick={() => { setAdding(false); setEditIdx(null); }}
                style={{
                  padding:"14px 20px",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:"14px", cursor:"pointer",
                  color:"rgba(255,255,255,0.5)",
                  fontFamily:"'Inter',sans-serif", fontSize:"0.88rem",
                  transition:"all 0.2s",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"12px", animation:"floatEmoji 2s ease-in-out infinite alternate" }}>🌸</div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading your journey…</p>
        </div>
      ) : (
        <div className="timeline">
          {moments.map((m, i) => (
            <div
              key={i}
              ref={el => (itemRefs.current[i] = el)}
              className={`timeline-item ${i%2===0?"left":"right"}`}
              style={{ position:"relative" }}
            >
              <div className="dot" />
              <motion.div
                className="content"
                onHoverStart={() => setHoveredIdx(i)}
                onHoverEnd={() => setHoveredIdx(null)}
                style={{
                  transform: hoveredIdx === i ? "translateY(-4px)" : "translateY(0)",
                  transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s",
                  boxShadow: hoveredIdx === i
                    ? "0 30px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(236,72,153,0.15)"
                    : undefined,
                }}
              >
                <div style={{ display:"flex", alignItems:"center", justifyContent: i%2===0?"flex-start":"flex-end", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
                  <span style={{
                    fontFamily:"'Manrope',sans-serif",
                    fontSize:"1rem", fontWeight:800,
                    color:"#c9a96e", letterSpacing:"-0.2px",
                    display:"flex", alignItems:"center", gap:"5px",
                  }}>
                    <Clock size={12} style={{ opacity:0.6 }}/> {m.year}
                  </span>
                  <AddedByBadge who={m.addedBy} />
                </div>
                <h3 style={{
                  fontFamily:"'Manrope',sans-serif",
                  fontSize:"1.05rem", fontWeight:800,
                  color:"#fff", margin:"0 0 8px",
                  letterSpacing:"-0.2px",
                }}>
                  {m.title}
                </h3>
                {m.desc && (
                  <p style={{
                    fontFamily:"'Inter',sans-serif",
                    fontSize:"0.875rem",
                    color:"rgba(255,255,255,0.5)",
                    margin:"0 0 12px", lineHeight:1.6,
                  }}>
                    {m.desc}
                  </p>
                )}
                {photos[i] && (
                  <img
                    src={photos[i]} alt={m.title}
                    style={{
                      width:"100%", borderRadius:"14px",
                      display:"block", marginTop:"4px",
                      opacity: 0.92,
                      boxShadow:"0 8px 24px rgba(0,0,0,0.3)",
                      transition:"transform 0.4s, opacity 0.3s",
                    }}
                  />
                )}
                {/* Actions */}
                <div style={{ display:"flex", gap:"8px", marginTop:"14px", justifyContent: i%2===0?"flex-start":"flex-end" }}>
                  <button
                    onClick={() => startEdit(i)}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:"5px",
                      padding:"6px 14px",
                      background:"rgba(255,255,255,0.07)",
                      border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:"10px", cursor:"pointer",
                      fontFamily:"'Inter',sans-serif",
                      fontSize:"0.75rem", fontWeight:600,
                      color:"rgba(255,255,255,0.5)",
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color="#fff"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.5)"}
                  >
                    <Edit3 size={12}/> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:"5px",
                      padding:"6px 14px",
                      background:"rgba(239,68,68,0.08)",
                      border:"1px solid rgba(239,68,68,0.15)",
                      borderRadius:"10px", cursor:"pointer",
                      fontFamily:"'Inter',sans-serif",
                      fontSize:"0.75rem", fontWeight:600,
                      color:"rgba(239,68,68,0.6)",
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(239,68,68,0.6)"}
                  >
                    <Trash2 size={12}/> Delete
                  </button>
                </div>
              </motion.div>
            </div>
          ))}

          {/* Add inline card */}
          {!adding && (
            <div className="timeline-item left" style={{ opacity:1, transform:"none" }}>
              <div className="dot" style={{ borderStyle:"dashed", background:"transparent", opacity:0.4 }} />
              <div
                className="content"
                style={{ cursor:"pointer", textAlign:"center", padding:"24px" }}
                onClick={() => { setAdding(true); setEditIdx(null); setForm({year:"",title:"",desc:"",file:null,preview:""}); }}
              >
                <Plus size={28} style={{ color:"rgba(236,72,153,0.5)", marginBottom:"8px" }} />
                <p style={{
                  margin:0,
                  fontFamily:"'Inter',sans-serif",
                  fontSize:"0.875rem", fontWeight:600,
                  color:"rgba(236,72,153,0.6)",
                }}>
                  Add a moment
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-nav countdown */}
      {countdown !== null && (
        <div className="auto-nav-banner">
          <ChevronRight size={14} style={{opacity:0.6}}/> Moving to Gallery in
          <strong>{countdown}s</strong>
          <button onClick={() => { clearTimeout(countdownRef.current); setPage("gallery"); }}>Go Now</button>
          <button onClick={() => { clearTimeout(countdownRef.current); setCountdown(null); }}>Stay</button>
        </div>
      )}
    </div>
  );
}
