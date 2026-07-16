import { useEffect, useRef, useState, useCallback } from "react";
import { dbGet, dbSet, getPhoto, uploadPhoto, deletePhoto } from "../api";

const DEFAULT_MOMENTS = [
  { year:"19/06/2023", title:"We Met",              desc:"At the tution a pleasant day...",      addedBy:"surya" },
  { year:"17/05/2026", title:"I Proposed to her",   desc:"At midnight",                           addedBy:"surya" },
  { year:"18/05/2026", title:"She Proposed to me",  desc:"At Evening",                            addedBy:"sadhana" },
  { year:"19/05/2026", title:"We both Proposed",    desc:"At Evening",                            addedBy:"both" },
  { year:"20/05/2026", title:"We start our journey",desc:"From that day, forever together...",    addedBy:"both" },
];

const DEFAULT_IMGS = [
  "/images/photo1.jpg.jpg",
  "/images/photo2.jpg.jpeg",
  "/images/photo3.jpg.jpeg",
  "/images/photo4.jpg.jpeg",
  "/images/photo5.jpg.jpeg",
];

export default function JourneyTimeline({ setPage, user }) {
  const [moments,   setMoments]   = useState([]);
  const [photos,    setPhotos]    = useState({});  // { idx: base64 or url }
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [editIdx,   setEditIdx]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({ year:"", title:"", desc:"", file: null, preview: "" });
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const itemRefs     = useRef([]);
  const fileRef      = useRef(null);

  /* ── Load from MongoDB ─────────────────── */
  useEffect(() => {
    (async () => {
      const saved = await dbGet("edit_timeline", []);
      const data  = Array.isArray(saved) && saved.length ? saved : DEFAULT_MOMENTS;
      // load all photos
      const map = {};
      for (let i = 0; i < data.length; i++) {
        const uploaded = await getPhoto(`timeline_img_${i}`);
        map[i] = uploaded || DEFAULT_IMGS[i] || "";
      }
      setMoments(data);
      setPhotos(map);
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Save to MongoDB ───────────────────── */
  const persist = async (newMoments, newPhotos) => {
    await dbSet("edit_timeline", newMoments);
    // photos are already persisted individually
    setMoments(newMoments);
    if (newPhotos) setPhotos(newPhotos);
  };

  /* ── Add / Edit submit ─────────────────── */
  const handleSubmit = async () => {
    if (!form.year.trim() || !form.title.trim()) return;
    setSaving(true);

    const isEdit = editIdx !== null;
    const idx    = isEdit ? editIdx : moments.length;

    // Upload photo if new file chosen
    let photoMap = { ...photos };
    if (form.file) {
      setUploading(true);
      const b64 = await uploadPhoto(`timeline_img_${idx}`, form.file);
      photoMap[idx] = b64;
      setUploading(false);
    }

    const moment = {
      year:    form.year.trim(),
      title:   form.title.trim(),
      desc:    form.desc.trim(),
      addedBy: user,
    };

    let updated;
    if (isEdit) {
      updated = moments.map((m, i) => i === idx ? moment : m);
    } else {
      updated = [...moments, moment];
    }

    await persist(updated, photoMap);
    setAdding(false);
    setEditIdx(null);
    setForm({ year:"", title:"", desc:"", file:null, preview:"" });
    setSaving(false);
  };

  /* ── Delete moment ─────────────────────── */
  const handleDelete = async (i) => {
    if (!window.confirm("Remove this moment?")) return;
    const updated = moments.filter((_, j) => j !== i);
    await deletePhoto(`timeline_img_${i}`);
    const newPhotos = {};
    updated.forEach((_, j) => { newPhotos[j] = photos[j >= i ? j+1 : j] || ""; });
    await persist(updated, newPhotos);
  };

  /* ── Start editing ─────────────────────── */
  const startEdit = (i) => {
    const m = moments[i];
    setForm({ year:m.year, title:m.title, desc:m.desc||"", file:null, preview: photos[i]||"" });
    setEditIdx(i);
    setAdding(true);
  };

  /* ── File picker ───────────────────────── */
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2.5*1024*1024) { alert("Max 2MB per image."); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({...f, file, preview: ev.target.result}));
    reader.readAsDataURL(file);
  };

  /* ── Scroll auto-nav ───────────────────── */
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

  /* ── Intersection observer ─────────────── */
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.2 }
    );
    itemRefs.current.forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, [moments, loading]);

  const addedByLabel = (who) => who === "surya" ? "💙 Surya" : who === "sadhana" ? "💗 Sadhana" : "💑 Both";

  return (
    <div className="timeline-page">
      <h1>Our Journey</h1>
      <p style={{textAlign:"center",color:"#aaa",fontSize:"0.9rem",marginBottom:"8px"}}>
        Every moment that made us 🌸
      </p>

      {/* Add moment button */}
      {!adding && (
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <button className="journey-add-btn" onClick={() => { setAdding(true); setEditIdx(null); setForm({year:"",title:"",desc:"",file:null,preview:""}); }}>
            ＋ Add a Moment
          </button>
        </div>
      )}

      {/* Add / Edit form */}
      {adding && (
        <div className="journey-form">
          <h3 className="journey-form-title">{editIdx !== null ? "✏️ Edit Moment" : "✨ Add a New Moment"}</h3>

          <label className="journey-label">📅 Date</label>
          <input className="journey-input" placeholder="e.g. 19/06/2023 or June 2023" value={form.year}
            onChange={e => setForm(f => ({...f, year:e.target.value}))} />

          <label className="journey-label">🏷️ Title</label>
          <input className="journey-input" placeholder="e.g. The day we first talked" value={form.title}
            onChange={e => setForm(f => ({...f, title:e.target.value}))} />

          <label className="journey-label">📝 Description (optional)</label>
          <textarea className="journey-input" rows={3} placeholder="What happened that day..." value={form.desc}
            onChange={e => setForm(f => ({...f, desc:e.target.value}))} />

          <label className="journey-label">📷 Photo (optional, max 2MB)</label>
          {form.preview ? (
            <div className="journey-photo-preview">
              <img src={form.preview} alt="preview" />
              <button className="journey-photo-remove" onClick={() => { setForm(f=>({...f,file:null,preview:""})); if(fileRef.current) fileRef.current.value=""; }}>
                ✕ Remove
              </button>
            </div>
          ) : (
            <label className="journey-photo-upload">
              📷 Choose Photo
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} />
            </label>
          )}

          <div className="journey-form-btns">
            <button className="journey-save-btn" onClick={handleSubmit} disabled={!form.year.trim()||!form.title.trim()||saving}>
              {saving ? (uploading ? "Uploading photo... ⏳" : "Saving... 💙") : (editIdx!==null ? "Update 💙" : "Add to Journey 💙")}
            </button>
            <button className="journey-cancel-btn" onClick={() => { setAdding(false); setEditIdx(null); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="db-loading"><div className="db-loading-icon">🌸</div><p>Loading journey...</p></div>
      ) : (
        <div className="timeline">
          {moments.map((m, i) => (
            <div
              key={i}
              ref={el => (itemRefs.current[i] = el)}
              className={`timeline-item ${i%2===0?"left":"right"}`}
            >
              <div className="dot" />
              <div className="content">
                <div className="journey-item-header">
                  <span className="year">{m.year}</span>
                  <span className="journey-added-by">{addedByLabel(m.addedBy)}</span>
                </div>
                <h3>{m.title}</h3>
                {m.desc && <p>{m.desc}</p>}
                {photos[i] && (
                  <img src={photos[i]} alt={m.title} />
                )}
                {/* Edit / Delete buttons */}
                <div className="journey-item-actions">
                  <button className="journey-edit-btn" onClick={() => startEdit(i)}>✏️</button>
                  <button className="journey-del-btn"  onClick={() => handleDelete(i)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}

          {/* Add moment inline at end */}
          {!adding && (
            <div className="timeline-item left" style={{opacity:1,transform:"none"}}>
              <div className="dot" style={{borderStyle:"dashed",background:"white"}} />
              <div className="content journey-add-card" onClick={() => { setAdding(true); setEditIdx(null); setForm({year:"",title:"",desc:"",file:null,preview:""}); }}>
                <span style={{fontSize:"2rem"}}>＋</span>
                <p style={{margin:"4px 0",color:"#c71585",fontWeight:600}}>Add a moment</p>
              </div>
            </div>
          )}
        </div>
      )}

      {countdown !== null && (
        <div className="auto-nav-banner">
          <span>✨ Moving to Memory Lane in </span>
          <strong>{countdown}s</strong>
          <button onClick={() => { clearTimeout(countdownRef.current); setPage("gallery"); }}>Go Now</button>
          <button onClick={() => { clearTimeout(countdownRef.current); setCountdown(null); }}>Stay</button>
        </div>
      )}
    </div>
  );
}
