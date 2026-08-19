import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Trash2, Image, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useTilt } from "../App";

const DEFAULT_MEDIA = [
  { type:"image", src:"/images/photo1.jpg.jpg",  msg:"The day we first met 💫",                  addedBy:"surya"   },
  { type:"image", src:"/images/photo2.jpg.jpeg", msg:"Surya proposed at midnight 💍",             addedBy:"surya"   },
  { type:"image", src:"/images/photo3.jpg.jpeg", msg:"She proposed back 💖",                      addedBy:"sadhana" },
  { type:"image", src:"/images/photo4.jpg.jpeg", msg:"We both said yes 💕",                       addedBy:"both"    },
  { type:"image", src:"/images/photo5.jpg.jpeg", msg:"Our journey begins 🌸",                     addedBy:"both"    },
  { type:"image", src:"/images/photo11.jpg.jpg", msg:"Every smile is a memory 😊",                addedBy:"surya"   },
  { type:"image", src:"/images/photo12.jpg.png", msg:"You make every day beautiful 🌷",           addedBy:"surya"   },
  { type:"image", src:"/images/photo13.jpg.jpg", msg:"My favourite person 💓",                    addedBy:"surya"   },
  { type:"image", src:"/images/photo14.jpg.jpg", msg:"Together is my favourite place 🏡",         addedBy:"surya"   },
  { type:"image", src:"/images/photo16.jpg.jpg", msg:"You are my everything ✨",                  addedBy:"surya"   },
  { type:"image", src:"/images/photo17.jpg.jpg", msg:"Forever and always 💒",                     addedBy:"surya"   },
  { type:"image", src:"/images/1000111741.jpg",  msg:"Sadhana, my love 🌹",                       addedBy:"surya"   },
  { type:"video", src:"/images/photo15.jpg.mp4", msg:"A moment to remember 🎬",                   addedBy:"surya"   },
  { type:"video", src:"/images/photo81.jpg.mp4", msg:"Our story in motion 🎥",                    addedBy:"surya"   },
];

const AUTHOR_CFG = {
  surya:   { color:"#10B981", bg:"rgba(16,185,129,0.15)",  label:"💙 Surya"   },
  sadhana: { color:"#EC4899", bg:"rgba(236,72,153,0.15)",  label:"💗 Sadhana" },
  both:    { color:"#8B5CF6", bg:"rgba(139,92,246,0.15)",  label:"💑 Both"    },
};

async function fetchGallery() {
  try { const r = await fetch("/api/gallery"); return r.ok ? r.json() : []; } catch { return []; }
}
async function deleteGalleryItem(id) {
  try { await fetch(`/api/gallery?id=${id}`, { method:"DELETE" }); } catch {}
}

/* ── Author pill ── */
function AuthorPill({ who }) {
  const cfg = AUTHOR_CFG[who] || AUTHOR_CFG.both;
  return (
    <span style={{
      fontSize:"0.62rem", fontWeight:700,
      color:cfg.color, background:cfg.bg,
      padding:"2px 9px", borderRadius:50,
      border:`1px solid ${cfg.color}44`,
      fontFamily:"'Inter',sans-serif",
    }}>{cfg.label}</span>
  );
}

/* ── Single photo/video card ── */
function MediaCard({ item, index, onOpen, onDelete }) {
  const tilt   = useTilt(7);
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onMouseEnter={tilt.onMouseEnter}
      className="photo-card tilt-card"
      initial={{ opacity:0, y:28, scale:0.94 }}
      animate={{ opacity:1, y:0,  scale:1    }}
      transition={{ delay: Math.min(index*0.04, 0.6), duration:0.45, type:"spring", bounce:0.18 }}
      style={{ cursor: item.type==="video" ? "default" : "pointer", position:"relative" }}
      onClick={() => item.type==="image" && onOpen && onOpen(index)}
    >
      <div className="tilt-shine" style={{ borderRadius:20 }}/>

      {/* media */}
      {item.type === "video" ? (
        <video src={item.src} controls playsInline className="gallery-video"
          style={{ borderRadius:"20px 20px 0 0" }}/>
      ) : (
        <img src={item.src} alt={`memory-${index+1}`} loading="lazy"
          style={{ borderRadius:"20px 20px 0 0" }}/>
      )}

      {/* caption bar */}
      <div style={{
        padding:"12px 14px 14px",
        background:"linear-gradient(180deg,rgba(10,4,24,0.82),rgba(6,2,14,0.96))",
        borderRadius:"0 0 20px 20px",
        borderTop:"1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <AuthorPill who={item.addedBy}/>
          <button
            onClick={e=>{ e.stopPropagation(); setLiked(l=>!l); }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"2px 4px", fontSize:"1rem",
              filter: liked ? "none" : "grayscale(80%)",
              animation: liked ? "heartPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              transition:"filter 0.2s" }}>
            {liked ? "❤️" : "🤍"}
          </button>
        </div>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", fontWeight:500,
          color:"rgba(255,255,255,0.72)", margin:0, lineHeight:1.5 }}>{item.msg}</p>
      </div>

      {/* delete button for uploaded items */}
      {item.isUploaded && (
        <motion.button
          whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
          onClick={e=>{ e.stopPropagation(); onDelete(item._id); }}
          style={{ position:"absolute", top:10, right:10, width:30, height:30,
            background:"rgba(239,68,68,0.88)", border:"none", borderRadius:"50%",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", zIndex:2, backdropFilter:"blur(4px)",
            boxShadow:"0 2px 10px rgba(239,68,68,0.4)" }}>
          <Trash2 size={13} strokeWidth={2.5}/>
        </motion.button>
      )}
    </motion.div>
  );
}

/* ── Full-screen lightbox with prev/next ── */
function Lightbox({ items, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const item = items[idx];
  const total = items.length;

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i-1+total)%total); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i+1)%total); };

  useEffect(() => {
    const handle = (e) => {
      if (e.key === "ArrowLeft")  setIdx(i=>(i-1+total)%total);
      if (e.key === "ArrowRight") setIdx(i=>(i+1)%total);
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [total, onClose]);

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.94)",
        zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"24px", backdropFilter:"blur(24px)" }}
      onClick={onClose}
    >
      {/* counter */}
      <div style={{ position:"absolute", top:20, left:"50%", transform:"translateX(-50%)",
        background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)",
        border:"1px solid rgba(255,255,255,0.12)", borderRadius:50,
        padding:"5px 16px", fontFamily:"'Inter',sans-serif",
        fontSize:"0.72rem", fontWeight:700, color:"rgba(255,255,255,0.7)" }}>
        {idx+1} / {total}
      </div>

      {/* close */}
      <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
        onClick={onClose}
        style={{ position:"absolute", top:18, right:18, width:38, height:38,
          background:"rgba(15,6,20,0.9)", border:"1px solid rgba(255,255,255,0.15)",
          borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center",
          justifyContent:"center", color:"rgba(255,255,255,0.75)",
          boxShadow:"0 4px 18px rgba(0,0,0,0.5)", zIndex:1 }}>
        <X size={17}/>
      </motion.button>

      {/* prev */}
      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
        onClick={prev}
        style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)",
          width:42, height:42, background:"rgba(255,255,255,0.1)",
          backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center",
          justifyContent:"center", color:"rgba(255,255,255,0.8)", zIndex:1 }}>
        <ChevronLeft size={22}/>
      </motion.button>

      {/* next */}
      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
        onClick={next}
        style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)",
          width:42, height:42, background:"rgba(255,255,255,0.1)",
          backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center",
          justifyContent:"center", color:"rgba(255,255,255,0.8)", zIndex:1 }}>
        <ChevronRight size={22}/>
      </motion.button>

      {/* image */}
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity:0, scale:0.88, x:60 }}
          animate={{ opacity:1, scale:1, x:0 }}
          exit={{ opacity:0, scale:0.92, x:-60 }}
          transition={{ type:"spring", stiffness:260, damping:26 }}
          style={{ position:"relative", maxWidth:600, width:"100%" }}
          onClick={e=>e.stopPropagation()}>
          <img src={item.src} alt=""
            style={{ width:"100%", borderRadius:22, display:"block",
              boxShadow:"0 50px 120px rgba(0,0,0,0.7), 0 0 80px rgba(236,72,153,0.12)" }}/>
          {/* caption */}
          <div style={{ marginTop:14, textAlign:"center",
            background:"rgba(10,4,24,0.8)", backdropFilter:"blur(12px)",
            border:"1px solid rgba(255,255,255,0.08)", borderRadius:16,
            padding:"12px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:6 }}>
              <AuthorPill who={item.addedBy}/>
            </div>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.95rem",
              color:"rgba(255,255,255,0.7)", margin:0, fontStyle:"italic",
              lineHeight:1.6 }}>{item.msg}</p>
          </div>

          {/* dot indicators */}
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:12 }}>
            {items.map((_,i) => (
              <div key={i} onClick={e=>{ e.stopPropagation(); setIdx(i); }}
                style={{ width: i===idx ? 18 : 6, height:6, borderRadius:3,
                  background: i===idx ? "#EC4899" : "rgba(255,255,255,0.25)",
                  transition:"all 0.25s ease", cursor:"pointer" }}/>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default function MemoryGallery({ setPage, user }) {
  const [uploaded,  setUploaded]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [filter,    setFilter]    = useState("all");
  const [form,      setForm]      = useState({ caption:"", file:null, preview:"" });
  const fileRef = useRef(null);

  useEffect(() => { fetchGallery().then(items => { setUploaded(items); setLoading(false); }); }, []);

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2.5*1024*1024) { alert("Max 2MB"); return; }
    const r = new FileReader();
    r.onload = ev => setForm(f => ({...f, file, preview:ev.target.result}));
    r.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!form.file) return;
    setUploading(true);
    try {
      const r = new FileReader();
      r.onload = async (ev) => {
        const res = await fetch("/api/gallery", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ base64:ev.target.result, caption:form.caption||"A beautiful memory 💕", addedBy:user }),
        });
        if (res.ok) setUploaded(await fetchGallery());
        setUploading(false); setAdding(false);
        setForm({ caption:"", file:null, preview:"" });
        if (fileRef.current) fileRef.current.value = "";
      };
      r.readAsDataURL(form.file);
    } catch { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this photo?")) return;
    await deleteGalleryItem(id);
    setUploaded(prev => prev.filter(p => p._id !== id));
  };

  const allMedia = [
    ...DEFAULT_MEDIA,
    ...uploaded.map(u => ({ type:"image", src:u.base64, msg:u.caption, addedBy:u.addedBy, _id:u._id, isUploaded:true })),
  ];

  const imageOnly = allMedia.filter(m => m.type === "image");
  const filtered  = filter === "all"
    ? allMedia
    : filter === "video"
      ? allMedia.filter(m => m.type === "video")
      : allMedia.filter(m => m.addedBy === filter);

  /* map filtered index → imageOnly index for lightbox */
  const openLightbox = (filteredIdx) => {
    const item = filtered[filteredIdx];
    const realIdx = imageOnly.findIndex(x => x.src === item.src);
    if (realIdx >= 0) setLightboxIdx(realIdx);
  };

  const inputStyle = { width:"100%", boxSizing:"border-box", padding:"13px 16px",
    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:13, color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none" };

  const FILTERS = [
    { key:"all",     label:"All 📸",    count:allMedia.length },
    { key:"surya",   label:"💙 Surya",  count:allMedia.filter(m=>m.addedBy==="surya").length },
    { key:"sadhana", label:"💗 Sadhana",count:allMedia.filter(m=>m.addedBy==="sadhana").length },
    { key:"both",    label:"💑 Both",   count:allMedia.filter(m=>m.addedBy==="both").length },
    { key:"video",   label:"🎬 Videos", count:allMedia.filter(m=>m.type==="video").length },
  ];

  return (
    <div style={{ maxWidth:740, margin:"0 auto", padding:"8px 4px 60px" }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55 }}
        style={{ textAlign:"center", marginBottom:28 }}>
        <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 20px",
            background:"rgba(236,72,153,0.1)", border:"1px solid rgba(236,72,153,0.25)",
            borderRadius:50, marginBottom:14, fontFamily:"'Inter',sans-serif",
            fontSize:"0.7rem", fontWeight:700, color:"#EC4899", letterSpacing:"1.8px", textTransform:"uppercase" }}>
          <Image size={12}/> Memory Lane
        </motion.div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.9rem,5vw,2.7rem)",
          fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 10px",
          textShadow:"0 0 60px rgba(236,72,153,0.3), 0 2px 12px rgba(0,0,0,0.5)" }}>
          Our Photos 📸
        </h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem",
          color:"rgba(255,255,255,0.4)", margin:"0 0 6px", lineHeight:1.7 }}>
          Every photo is a piece of our story 💌
        </p>
        {/* stat */}
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.78rem", fontWeight:700,
          color:"rgba(255,255,255,0.28)", margin:0 }}>
          {allMedia.length} memories · {imageOnly.length} photos · {allMedia.filter(m=>m.type==="video").length} videos
        </p>
      </motion.div>

      {/* ── FILTER TABS ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
        style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:24 }}>
        {FILTERS.map(f => (
          <motion.button key={f.key} whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
            onClick={() => setFilter(f.key)}
            style={{ padding:"7px 16px", borderRadius:50, border:`1.5px solid ${filter===f.key?"rgba(236,72,153,0.55)":"rgba(255,255,255,0.1)"}`,
              background: filter===f.key ? "rgba(236,72,153,0.18)" : "rgba(255,255,255,0.04)",
              color: filter===f.key ? "#EC4899" : "rgba(255,255,255,0.45)",
              fontFamily:"'Inter',sans-serif", fontSize:"0.76rem", fontWeight:600,
              cursor:"pointer", transition:"all 0.2s" }}>
            {f.label}
            <span style={{ marginLeft:5, fontSize:"0.65rem", opacity:0.65 }}>({f.count})</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── ADD BUTTON ── */}
      {!adding && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }}
          style={{ textAlign:"center", marginBottom:26 }}>
          <motion.button whileHover={{ scale:1.05, y:-3, boxShadow:"0 18px 42px rgba(236,72,153,0.48)" }}
            whileTap={{ scale:0.96 }}
            onClick={() => setAdding(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:9, padding:"13px 30px",
              background:"linear-gradient(135deg,#EC4899,#8B5CF6)", border:"none",
              borderRadius:50, color:"#fff", fontFamily:"'Inter',sans-serif",
              fontSize:"0.9rem", fontWeight:700, cursor:"pointer",
              boxShadow:"0 12px 32px rgba(236,72,153,0.38)" }}>
            <Camera size={17} strokeWidth={2.5}/> Add a Memory
          </motion.button>
        </motion.div>
      )}

      {/* ── UPLOAD FORM ── */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity:0, y:-20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-16, scale:0.97 }} transition={{ duration:0.38 }}
            style={{ margin:"0 0 30px", background:"rgba(9,4,21,0.88)",
              border:"1px solid rgba(236,72,153,0.16)", borderRadius:24,
              padding:"30px 26px", boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
              backdropFilter:"blur(20px)" }}>
            <h3 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.12rem", fontWeight:800,
              color:"#fff", margin:"0 0 20px", display:"flex", alignItems:"center", gap:9 }}>
              <Camera size={18}/> Add a New Memory
            </h3>

            {form.preview ? (
              <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
                <img src={form.preview} alt="preview"
                  style={{ width:180, height:135, objectFit:"cover", borderRadius:16,
                    display:"block", boxShadow:"0 8px 28px rgba(0,0,0,0.45)" }}/>
                <button onClick={() => { setForm(f=>({...f,file:null,preview:""})); if(fileRef.current)fileRef.current.value=""; }}
                  style={{ position:"absolute", top:-8, right:-8, width:26, height:26,
                    background:"#ef4444", border:"2px solid rgba(0,0,0,0.3)",
                    borderRadius:"50%", cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center", color:"#fff" }}>
                  <X size={13} strokeWidth={3}/>
                </button>
              </div>
            ) : (
              <label style={{ display:"inline-flex", alignItems:"center", gap:8,
                padding:"10px 20px", background:"rgba(255,255,255,0.05)",
                border:"1.5px dashed rgba(255,255,255,0.15)", borderRadius:12,
                cursor:"pointer", fontFamily:"'Inter',sans-serif",
                fontSize:"0.85rem", color:"rgba(255,255,255,0.42)", marginBottom:16 }}>
                <Upload size={14}/> Choose Photo (max 2MB)
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
              </label>
            )}

            <input style={{...inputStyle, marginBottom:16}}
              placeholder="Caption — what does this moment mean? 💕"
              value={form.caption} onChange={e=>setForm(f=>({...f,caption:e.target.value}))}
              onFocus={e=>{ e.target.style.borderColor="rgba(236,72,153,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(236,72,153,0.1)"; }}
              onBlur={e=>{ e.target.style.borderColor="rgba(255,255,255,0.1)"; e.target.style.boxShadow="none"; }}/>

            <div style={{ display:"flex", gap:12 }}>
              <motion.button whileHover={{ y:-2 }} whileTap={{ scale:0.97 }}
                onClick={handleUpload} disabled={!form.file||uploading}
                style={{ flex:1, padding:"13px", background:"linear-gradient(135deg,#EC4899,#8B5CF6)",
                  border:"none", borderRadius:13, color:"#fff",
                  fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700,
                  cursor:"pointer", boxShadow:"0 8px 24px rgba(236,72,153,0.3)",
                  opacity:(!form.file||uploading)?0.52:1 }}>
                {uploading ? "Uploading… ⏳" : "Add to Gallery 💖"}
              </motion.button>
              <button onClick={() => { setAdding(false); setForm({caption:"",file:null,preview:""}); }}
                style={{ padding:"13px 20px", background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)", borderRadius:13,
                  cursor:"pointer", color:"rgba(255,255,255,0.5)",
                  fontFamily:"'Inter',sans-serif", fontSize:"0.88rem" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GALLERY GRID ── */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.4)" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1.6, repeat:Infinity, ease:"linear" }}
            style={{ fontSize:"2.6rem", display:"inline-block", marginBottom:14 }}>📸</motion.div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading memories…</p>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ textAlign:"center", padding:"52px 24px",
                background:"rgba(255,255,255,0.03)",
                border:"1.5px dashed rgba(236,72,153,0.2)", borderRadius:24 }}>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem",
                color:"rgba(255,255,255,0.35)", margin:0 }}>No memories in this category yet 🌸</p>
            </motion.div>
          ) : (
            <div className="gallery-grid">
              {filtered.map((item, i) => (
                <MediaCard key={`${item.src}-${i}`} item={item} index={i}
                  onOpen={item.type==="image" ? ()=>openLightbox(i) : null}
                  onDelete={handleDelete}/>
              ))}
              {!adding && (
                <motion.div
                  initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                  whileHover={{ scale:1.03 }}
                  className="photo-card"
                  onClick={() => setAdding(true)}
                  style={{ cursor:"pointer", display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center", gap:10,
                    minHeight:180, background:"rgba(236,72,153,0.04)",
                    border:"1.5px dashed rgba(236,72,153,0.22)", borderRadius:20 }}>
                  <Heart size={30} style={{ color:"rgba(236,72,153,0.45)" }}/>
                  <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:"0.875rem",
                    fontWeight:600, color:"rgba(236,72,153,0.52)" }}>Add Memory</p>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            items={imageOnly}
            startIdx={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
