import { useEffect, useRef, useState, useCallback } from "react";

/* Default hardcoded photos (shown if no MongoDB photos yet) */
const DEFAULT_MEDIA = [
  { type:"image", src:"/images/photo1.jpg.jpg",   msg:"The day we first met 💫",              addedBy:"surya"   },
  { type:"image", src:"/images/photo2.jpg.jpeg",  msg:"I proposed to you at midnight 💍",     addedBy:"surya"   },
  { type:"image", src:"/images/photo3.jpg.jpeg",  msg:"She proposed to me 💖",                addedBy:"sadhana" },
  { type:"image", src:"/images/photo4.jpg.jpeg",  msg:"We both said yes 💕",                  addedBy:"both"    },
  { type:"image", src:"/images/photo5.jpg.jpeg",  msg:"Our journey begins 🌸",                addedBy:"both"    },
  { type:"image", src:"/images/photo11.jpg.jpg",  msg:"Every smile is a memory 😊",           addedBy:"surya"   },
  { type:"image", src:"/images/photo12.jpg.png",  msg:"You make every day beautiful 🌷",      addedBy:"surya"   },
  { type:"image", src:"/images/photo13.jpg.jpg",  msg:"My favourite person 💓",               addedBy:"surya"   },
  { type:"image", src:"/images/photo14.jpg.jpg",  msg:"Together is my favourite place 🏡",   addedBy:"surya"   },
  { type:"image", src:"/images/photo16.jpg.jpg",  msg:"You are my everything ✨",             addedBy:"surya"   },
  { type:"image", src:"/images/photo17.jpg.jpg",  msg:"Forever and always 💒",               addedBy:"surya"   },
  { type:"image", src:"/images/1000111741.jpg",   msg:"Sadhana, my love 🌹",                 addedBy:"surya"   },
  { type:"video", src:"/images/photo15.jpg.mp4",  msg:"A moment to remember 🎬",              addedBy:"surya"   },
  { type:"video", src:"/images/photo81.jpg.mp4",  msg:"Our story in motion 🎥",              addedBy:"surya"   },
];

async function fetchGallery() {
  try {
    const res = await fetch("/api/gallery");
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function deleteGalleryItem(id) {
  try {
    await fetch(`/api/gallery?id=${id}`, { method:"DELETE" });
  } catch {}
}

export default function MemoryGallery({ setPage, user }) {
  const [uploaded,  setUploaded]  = useState([]);  // from MongoDB
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox,  setLightbox]  = useState(null);
  const [form,      setForm]      = useState({ caption:"", file:null, preview:"" });
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const fileRef      = useRef(null);

  /* Load uploaded photos */
  useEffect(() => {
    fetchGallery().then(items => { setUploaded(items); setLoading(false); });
  }, []);

  /* Handle file pick */
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2.5*1024*1024) { alert("Max 2MB per image."); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({...f, file, preview: ev.target.result}));
    reader.readAsDataURL(file);
  };

  /* Upload and save */
  const handleUpload = async () => {
    if (!form.file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;
        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({ base64, caption: form.caption || "A beautiful memory 💕", addedBy: user }),
        });
        if (res.ok) {
          const updated = await fetchGallery();
          setUploaded(updated);
        }
        setUploading(false);
        setAdding(false);
        setForm({ caption:"", file:null, preview:"" });
        if (fileRef.current) fileRef.current.value = "";
      };
      reader.readAsDataURL(form.file);
    } catch { setUploading(false); }
  };

  /* Delete uploaded photo */
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this photo?")) return;
    await deleteGalleryItem(id);
    setUploaded(prev => prev.filter(p => p._id !== id));
  };

  /* Combine default + uploaded for display */
  const allMedia = [
    ...DEFAULT_MEDIA,
    ...uploaded.map(u => ({
      type: "image",
      src:  u.base64,
      msg:  u.caption,
      addedBy: u.addedBy,
      _id: u._id,
      isUploaded: true,
    })),
  ];

  /* Scroll auto-nav */
  const handleScroll = useCallback(() => {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;
    if (atBottom && countdown === null) setCountdown(8);
  }, [countdown]);
  useEffect(() => { window.addEventListener("scroll", handleScroll); return () => window.removeEventListener("scroll", handleScroll); }, [handleScroll]);
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { setPage("dream"); return; }
    countdownRef.current = setTimeout(() => setCountdown(c=>c-1), 1000);
    return () => clearTimeout(countdownRef.current);
  }, [countdown, setPage]);

  const addedByLabel = (who) => who === "surya" ? "💙" : who === "sadhana" ? "💗" : "💑";

  return (
    <div className="gallery-page">
      <h1>Memory Lane 📸</h1>
      <p className="gallery-subtitle">Every photo is a piece of our story 💌</p>

      {/* Upload button */}
      {!adding && (
        <div style={{textAlign:"center",marginBottom:"20px"}}>
          <button className="gallery-add-btn" onClick={() => setAdding(true)}>
            📷 Add a Photo
          </button>
        </div>
      )}

      {/* Upload form */}
      {adding && (
        <div className="gallery-upload-form">
          <h3 className="gallery-form-title">📷 Add a New Memory</h3>

          {form.preview ? (
            <div className="gallery-preview-wrap">
              <img src={form.preview} alt="preview" className="gallery-preview-img" />
              <button className="journey-photo-remove" onClick={() => { setForm(f=>({...f,file:null,preview:""})); if(fileRef.current) fileRef.current.value=""; }}>
                ✕ Remove
              </button>
            </div>
          ) : (
            <label className="gallery-file-label">
              📷 Choose Photo (max 2MB)
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} />
            </label>
          )}

          <input
            className="gallery-caption-input"
            placeholder="Caption — what does this moment mean? 💕"
            value={form.caption}
            onChange={e => setForm(f => ({...f, caption:e.target.value}))}
          />

          <div className="journey-form-btns" style={{marginTop:"12px"}}>
            <button className="journey-save-btn" onClick={handleUpload} disabled={!form.file || uploading}>
              {uploading ? "Uploading... ⏳" : "Add to Gallery 💖"}
            </button>
            <button className="journey-cancel-btn" onClick={() => { setAdding(false); setForm({caption:"",file:null,preview:""}); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div className="db-loading"><div className="db-loading-icon">📸</div><p>Loading memories...</p></div>
      ) : (
        <div className="gallery-grid">
          {allMedia.map((item, i) => (
            item.type === "video" ? (
              <div key={i} className="photo-card video-card">
                <video src={item.src} controls playsInline className="gallery-video" />
                <div className="overlay">{item.msg}</div>
              </div>
            ) : (
              <div key={i} className="photo-card" onClick={() => setLightbox(item)}>
                <img src={item.src} alt={`memory-${i+1}`} loading="lazy" />
                <div className="overlay">
                  <span className="gallery-who">{addedByLabel(item.addedBy)}</span>
                  {item.msg}
                </div>
                {/* Delete button for uploaded photos */}
                {item.isUploaded && (
                  <button className="gallery-delete-btn" onClick={e => { e.stopPropagation(); handleDelete(item._id); }}>✕</button>
                )}
              </div>
            )
          ))}

          {/* Add card inline */}
          {!adding && (
            <div className="photo-card gallery-add-card" onClick={() => setAdding(true)}>
              <span className="gallery-add-icon">📷</span>
              <p>Add Photo</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <div className="gallery-lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt="" />
            <p className="gallery-lightbox-caption">{lightbox.msg}</p>
            <button className="gallery-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          </div>
        </div>
      )}

      {countdown !== null && (
        <div className="auto-nav-banner">
          <span>💖 Up next: Dreams </span>
          <strong>{countdown}s</strong>
          <button onClick={() => { clearTimeout(countdownRef.current); setPage("dream"); }}>Go Now</button>
          <button onClick={() => { clearTimeout(countdownRef.current); setCountdown(null); }}>Stay</button>
        </div>
      )}
    </div>
  );
}
