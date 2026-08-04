import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Trash2, ChevronRight, Image } from "lucide-react";
import { useTilt } from "../App";

const DEFAULT_MEDIA = [
  { type:"image", src:"/images/photo1.jpg.jpg",  msg:"The day we first met 💫",           addedBy:"surya"   },
  { type:"image", src:"/images/photo2.jpg.jpeg", msg:"I proposed to you at midnight 💍",  addedBy:"surya"   },
  { type:"image", src:"/images/photo3.jpg.jpeg", msg:"She proposed to me 💖",             addedBy:"sadhana" },
  { type:"image", src:"/images/photo4.jpg.jpeg", msg:"We both said yes 💕",               addedBy:"both"    },
  { type:"image", src:"/images/photo5.jpg.jpeg", msg:"Our journey begins 🌸",             addedBy:"both"    },
  { type:"image", src:"/images/photo11.jpg.jpg", msg:"Every smile is a memory 😊",        addedBy:"surya"   },
  { type:"image", src:"/images/photo12.jpg.png", msg:"You make every day beautiful 🌷",   addedBy:"surya"   },
  { type:"image", src:"/images/photo13.jpg.jpg", msg:"My favourite person 💓",            addedBy:"surya"   },
  { type:"image", src:"/images/photo14.jpg.jpg", msg:"Together is my favourite place 🏡", addedBy:"surya"   },
  { type:"image", src:"/images/photo16.jpg.jpg", msg:"You are my everything ✨",          addedBy:"surya"   },
  { type:"image", src:"/images/photo17.jpg.jpg", msg:"Forever and always 💒",            addedBy:"surya"   },
  { type:"image", src:"/images/1000111741.jpg",  msg:"Sadhana, my love 🌹",              addedBy:"surya"   },
  { type:"video", src:"/images/photo15.jpg.mp4", msg:"A moment to remember 🎬",           addedBy:"surya"   },
  { type:"video", src:"/images/photo81.jpg.mp4", msg:"Our story in motion 🎥",           addedBy:"surya"   },
];

async function fetchGallery() {
  try { const r = await fetch("/api/gallery"); return r.ok ? r.json() : []; } catch { return []; }
}
async function deleteGalleryItem(id) {
  try { await fetch(`/api/gallery?id=${id}`, { method:"DELETE" }); } catch {}
}

/* 3D tilt photo card */
function PhotoCard({ item, index, onOpen, onDelete }) {
  const tilt = useTilt(8);
  const accentColor = item.addedBy === "surya" ? "#10B981" : item.addedBy === "sadhana" ? "#EC4899" : "#8B5CF6";

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onMouseEnter={tilt.onMouseEnter}
      className="photo-card tilt-card"
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0  }}
      transition={{ delay: index * 0.04, duration: 0.5, type:"spring", bounce:0.2 }}
      onClick={() => onOpen && onOpen(item)}
      style={{ cursor: item.type === "video" ? "default" : "pointer", position:"relative" }}
    >
      <div className="tilt-shine" style={{ borderRadius:"20px" }} />
      {item.type === "video" ? (
        <video src={item.src} controls playsInline className="gallery-video" />
      ) : (
        <img src={item.src} alt={`memory-${index+1}`} loading="lazy" />
      )}
      {/* Overlay */}
      <div className="overlay">
        <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"6px" }}>
          <span style={{ fontSize:"0.65rem", fontWeight:700, color:accentColor, background:`${accentColor}22`, padding:"2px 8px", borderRadius:"50px", border:`1px solid ${accentColor}44`, fontFamily:"'Inter',sans-serif" }}>
            {item.addedBy === "surya" ? "💙 Surya" : item.addedBy === "sadhana" ? "💗 Sadhana" : "💑 Both"}
          </span>
        </div>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", fontWeight:500, color:"rgba(255,255,255,0.9)", margin:0, lineHeight:1.5 }}>{item.msg}</p>
      </div>
      {item.isUploaded && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(item._id); }}
          style={{ position:"absolute", top:"10px", right:"10px", width:"28px", height:"28px", background:"rgba(239,68,68,0.85)", border:"none", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", zIndex:2, backdropFilter:"blur(4px)", transition:"transform 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.15)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
        >
          <Trash2 size={13} strokeWidth={2.5}/>
        </button>
      )}
    </motion.div>
  );
}

export default function MemoryGallery({ setPage, user }) {
  const [uploaded,  setUploaded]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox,  setLightbox]  = useState(null);
  const [form,      setForm]      = useState({ caption:"", file:null, preview:"" });
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const fileRef      = useRef(null);

  useEffect(() => { fetchGallery().then(items => { setUploaded(items); setLoading(false); }); }, []);

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2.5*1024*1024) { alert("Max 2MB"); return; }
    const r = new FileReader();
    r.onload = ev => setForm(f => ({...f, file, preview: ev.target.result}));
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
          body: JSON.stringify({ base64: ev.target.result, caption: form.caption || "A beautiful memory 💕", addedBy: user }),
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

  const handleScroll = useCallback(() => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;
    if (atBottom && countdown === null) setCountdown(8);
  }, [countdown]);

  useEffect(() => { window.addEventListener("scroll", handleScroll); return () => window.removeEventListener("scroll", handleScroll); }, [handleScroll]);
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { setPage("dream"); return; }
    countdownRef.current = setTimeout(() => setCountdown(c => c-1), 1000);
    return () => clearTimeout(countdownRef.current);
  }, [countdown, setPage]);

  const inputStyle = { width:"100%", boxSizing:"border-box", padding:"13px 16px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"13px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none" };

  return (
    <div style={{ maxWidth:"720px", margin:"0 auto", padding:"8px 4px 40px" }}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5}} style={{textAlign:"center",marginBottom:"32px"}}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"6px 18px", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(236,72,153,0.2)", borderRadius:"50px", marginBottom:"14px", fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:700, color:"#EC4899", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          <Image size={12}/> Memory Lane
        </div>
        <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"2.2rem", fontWeight:800, color:"#fff", margin:"0 0 10px", letterSpacing:"-0.5px" }}>Our Photos 📸</h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", margin:0, lineHeight:1.6 }}>Every photo is a piece of our story 💌</p>
      </motion.div>

      {/* Add button */}
      {!adding && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:"center",marginBottom:"28px"}}>
          <button onClick={() => setAdding(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"12px 28px", background:"linear-gradient(90deg,#EC4899,#8B5CF6)", border:"none", borderRadius:"14px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(236,72,153,0.35)", transition:"transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(236,72,153,0.45)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 8px 24px rgba(236,72,153,0.35)";}}>
            <Camera size={16} strokeWidth={2.5}/> Add a Photo
          </button>
        </motion.div>
      )}

      {/* Upload form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{opacity:0,y:-20,rotateX:8,scale:0.97}} animate={{opacity:1,y:0,rotateX:0,scale:1}}
            exit={{opacity:0,y:-16,scale:0.97}} transition={{duration:0.4,ease:[0.25,0.46,0.45,0.94]}}
            style={{ margin:"0 0 32px", background:"rgba(255,255,255,0.055)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"24px", padding:"28px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", backdropFilter:"blur(16px)", transformPerspective:800 }}
          >
            <h3 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.1rem", fontWeight:800, color:"#fff", margin:"0 0 20px", display:"flex", alignItems:"center", gap:"10px" }}>
              <Camera size={18}/> Add a New Memory
            </h3>
            {form.preview ? (
              <div style={{ position:"relative", display:"inline-block", marginBottom:"16px" }}>
                <img src={form.preview} alt="preview" style={{ width:"160px", height:"120px", objectFit:"cover", borderRadius:"14px", display:"block", boxShadow:"0 8px 24px rgba(0,0,0,0.35)" }}/>
                <button onClick={() => { setForm(f=>({...f,file:null,preview:""})); if(fileRef.current) fileRef.current.value=""; }}
                  style={{ position:"absolute", top:"-8px", right:"-8px", width:"24px", height:"24px", background:"#ef4444", border:"2px solid rgba(0,0,0,0.3)", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                  <X size={12} strokeWidth={3}/>
                </button>
              </div>
            ) : (
              <label style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"10px 20px", background:"rgba(255,255,255,0.06)", border:"1px dashed rgba(255,255,255,0.15)", borderRadius:"12px", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"rgba(255,255,255,0.45)", marginBottom:"16px" }}>
                <Upload size={14}/> Choose Photo (max 2MB)
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
              </label>
            )}
            <input style={{...inputStyle, marginBottom:"16px"}} placeholder="Caption — what does this moment mean? 💕" value={form.caption} onChange={e=>setForm(f=>({...f,caption:e.target.value}))}/>
            <div style={{display:"flex",gap:"12px"}}>
              <button onClick={handleUpload} disabled={!form.file||uploading}
                style={{ flex:1, padding:"13px", background:"linear-gradient(90deg,#EC4899,#8B5CF6)", border:"none", borderRadius:"13px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(236,72,153,0.3)", opacity:(!form.file||uploading)?0.5:1 }}>
                {uploading ? "Uploading… ⏳" : "Add to Gallery 💖"}
              </button>
              <button onClick={() => { setAdding(false); setForm({caption:"",file:null,preview:""}); }}
                style={{ padding:"13px 20px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"13px", cursor:"pointer", color:"rgba(255,255,255,0.5)", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery grid */}
      {loading ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,0.4)"}}>
          <div style={{fontSize:"2.5rem",marginBottom:"12px",animation:"floatEmoji 2s ease-in-out infinite alternate"}}>📸</div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"0.9rem"}}>Loading memories…</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {allMedia.map((item, i) => (
            <PhotoCard key={i} item={item} index={i} onOpen={item.type==="image" ? setLightbox : null} onDelete={handleDelete}/>
          ))}
          {!adding && (
            <motion.div
              initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
              className="photo-card"
              onClick={() => setAdding(true)}
              style={{ cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px", minHeight:"160px", background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(236,72,153,0.25)", borderRadius:"20px" }}
            >
              <Camera size={32} style={{color:"rgba(236,72,153,0.4)"}}/>
              <p style={{margin:0,fontFamily:"'Inter',sans-serif",fontSize:"0.875rem",fontWeight:600,color:"rgba(236,72,153,0.5)"}}>Add Photo</p>
            </motion.div>
          )}
        </div>
      )}

      {/* 3D Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", backdropFilter:"blur(20px)" }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{scale:0.7,rotateX:20,rotateY:-10,opacity:0}}
              animate={{scale:1, rotateX:0, rotateY:0, opacity:1}}
              exit={{scale:0.8, rotateX:-10, opacity:0}}
              transition={{type:"spring",stiffness:220,damping:24}}
              style={{ position:"relative", maxWidth:"560px", width:"100%", transformPerspective:900 }}
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.src} alt="" style={{ width:"100%", borderRadius:"20px", display:"block", boxShadow:"0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(236,72,153,0.15)" }}/>
              <div style={{ marginTop:"14px", textAlign:"center" }}>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", color:"rgba(255,255,255,0.7)", margin:0, fontStyle:"italic" }}>{lightbox.msg}</p>
              </div>
              <button
                onClick={() => setLightbox(null)}
                style={{ position:"absolute", top:"-12px", right:"-12px", width:"36px", height:"36px", background:"rgba(15,6,20,0.95)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.7)", transition:"transform 0.22s, background 0.2s", boxShadow:"0 4px 16px rgba(0,0,0,0.5)" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="rotate(90deg) scale(1.1)";e.currentTarget.style.background="#ef4444";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.background="rgba(15,6,20,0.95)";}}
              >
                <X size={16}/>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {countdown !== null && (
        <div className="auto-nav-banner">
          <ChevronRight size={14} style={{opacity:0.6}}/> Moving to Dreams in
          <strong>{countdown}s</strong>
          <button onClick={() => { clearTimeout(countdownRef.current); setPage("dream"); }}>Go Now</button>
          <button onClick={() => { clearTimeout(countdownRef.current); setCountdown(null); }}>Stay</button>
        </div>
      )}
    </div>
  );
}
