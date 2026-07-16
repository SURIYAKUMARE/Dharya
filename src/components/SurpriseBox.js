import { useState, useEffect, useRef } from "react";
import { dbGet, dbSet, uploadPhoto, getPhoto } from "../api"; // eslint-disable-line no-unused-vars

/* ── 3 boxes per user ── */
const BOX_COLORS = ["#ff69b4","#c71585","#f59e0b","#15803d","#7c3aed","#ec4899"];
const BOX_SEALS  = ["💝","🎁","🌟","💚","💌","🎀"];
const BOX_BG     = [
  "linear-gradient(135deg,#fff0f8,#fce4f0)",
  "linear-gradient(135deg,#fce4f0,#fff0f8)",
  "linear-gradient(135deg,#fffde7,#fff9c4)",
  "linear-gradient(135deg,#f0fdf4,#dcfce7)",
  "linear-gradient(135deg,#f3e5f5,#ede7f6)",
  "linear-gradient(135deg,#fdf2f8,#fce7f3)",
];

// boxes 0-2 = Surya's, 3-5 = Sadhana's
const OWNER = ["surya","surya","surya","sadhana","sadhana","sadhana"];
const OWNER_LABEL = { surya:"💙 From Surya", sadhana:"💗 From Sadhana" };

function BoxEditor({ idx, box, onSave, onClose }) {
  const [title,    setTitle]    = useState(box.title    || "");
  const [hint,     setHint]     = useState(box.hint     || "");
  const [body,     setBody]     = useState(box.body     || "");
  const [gift,     setGift]     = useState(box.gift     || "");
  const [preview,  setPreview]  = useState(box.photo    || "");
  const [file,     setFile]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2.5*1024*1024) { alert("Max 2MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
    setFile(f);
  };

  const save = async () => {
    setSaving(true);
    let photoUrl = box.photo || "";
    if (file) photoUrl = await uploadPhoto(`surprise_img_${idx}`, file);
    const updated = { title, hint, body, gift, photo: photoUrl, owner: OWNER[idx] };
    await dbSet(`surprise_box_${idx}`, updated);
    onSave(updated);
    setSaving(false);
    onClose();
  };

  return (
    <div className="sb-editor">
      <h3 className="sb-editor-title">✏️ Edit Box {idx+1}</h3>
      <label className="ep-label">Hint (shown on sealed box)</label>
      <input className="ep-input" value={hint} placeholder="Open when..." onChange={e=>setHint(e.target.value)} />
      <label className="ep-label">Title</label>
      <input className="ep-input" value={title} placeholder="Surprise title..." onChange={e=>setTitle(e.target.value)} />
      <label className="ep-label">Message</label>
      <textarea className="ep-textarea" rows={5} value={body} placeholder="Write your surprise message..." onChange={e=>setBody(e.target.value)} />
      <label className="ep-label">Gift label</label>
      <input className="ep-input" value={gift} placeholder="e.g. 🫂 One unlimited hug" onChange={e=>setGift(e.target.value)} />
      <label className="ep-label">📷 Photo (optional)</label>
      {preview ? (
        <div className="sb-editor-photo">
          <img src={preview} alt="preview" />
          <button className="journey-photo-remove" onClick={()=>{setPreview("");setFile(null);if(fileRef.current)fileRef.current.value="";}}>✕ Remove</button>
        </div>
      ) : (
        <label className="journey-photo-upload">
          📷 Upload Photo
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} />
        </label>
      )}
      <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
        <button className="journey-save-btn" onClick={save} disabled={saving}>{saving?"Saving...":"Save 💙"}</button>
        <button className="journey-cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function SurpriseBox({ user }) {
  const [boxes,    setBoxes]    = useState(Array(6).fill(null));
  const [photos,   setPhotos]   = useState({});
  const [opened,   setOpened]   = useState({});
  const [active,   setActive]   = useState(null);
  const [shaking,  setShaking]  = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("surya"); // "surya" | "sadhana"

  useEffect(() => {
    (async () => {
      const loaded = await Promise.all(
        Array.from({length:6}, (_,i) => dbGet(`surprise_box_${i}`, null))
      );
      const photoMap = {};
      for (let i=0;i<6;i++) {
        if (loaded[i]?.photo) photoMap[i] = loaded[i].photo;
        else {
          const p = await getPhoto(`surprise_img_${i}`);
          if (p) photoMap[i] = p;
        }
      }
      setBoxes(loaded);
      setPhotos(photoMap);
      setLoading(false);
    })();
  }, []);

  const tryOpen = (i) => {
    setShaking(i);
    setTimeout(() => { setShaking(null); setOpened(o=>({...o,[i]:true})); setActive(i); }, 600);
  };

  const close     = () => setActive(null);
  const canEdit   = (i) => user === OWNER[i]; // owner can edit their own boxes

  const handleSave = (i, updated) => {
    setBoxes(prev => prev.map((b,j) => j===i ? updated : b));
    if (updated.photo) setPhotos(p => ({...p,[i]:updated.photo}));
  };

  // filter boxes by tab
  const indices = tab === "surya" ? [0,1,2] : [3,4,5];
  const activeBox = active !== null ? boxes[active] : null;

  return (
    <div className="surprise-box-page">
      <div className="sb-hero">
        <h1 className="sb-title">Surprise Box 🎁</h1>
        <p className="sb-sub">3 surprises from Surya + 3 from Sadhana 💙💗</p>
      </div>

      {/* Tab switcher */}
      <div className="sb-tabs">
        <button className={`sb-tab ${tab==="surya"?"sb-tab-active-surya":""}`} onClick={()=>setTab("surya")}>
          💙 Surya's Surprises
        </button>
        <button className={`sb-tab ${tab==="sadhana"?"sb-tab-active-sadhana":""}`} onClick={()=>setTab("sadhana")}>
          💗 Sadhana's Surprises
        </button>
      </div>

      {loading ? (
        <div className="db-loading"><div className="db-loading-icon">🎁</div><p>Loading surprises...</p></div>
      ) : (
        <div className="sb-grid">
          {indices.map(i => {
            const box   = boxes[i];
            const color = BOX_COLORS[i];
            const bg    = BOX_BG[i];
            const isOpen = !!opened[i];
            const hasContent = box?.title || box?.body;

            return (
              <div key={i} className={`sb-item ${isOpen?"sb-opened":""} ${shaking===i?"sb-shake":""}`}
                style={{ borderColor:color, background: bg }}>

                {/* Edit button — only for owner */}
                {canEdit(i) && (
                  <button className="sb-edit-btn" style={{color}} onClick={e=>{e.stopPropagation();setEditing(i)}}>✏️</button>
                )}

                <div className="sb-seal" style={{ background:color }}>{BOX_SEALS[i]}</div>
                <div className="sb-owner-label">{OWNER_LABEL[OWNER[i]]}</div>
                <div className="sb-label">Box {(i%3)+1}</div>

                {/* Photo thumbnail */}
                {photos[i] && (
                  <div className="sb-thumb-wrap">
                    <img src={photos[i]} alt="" className="sb-thumb" />
                  </div>
                )}

                {hasContent ? (
                  <>
                    <p className="sb-hint">"{box.hint || "A special surprise inside..."}"</p>
                    {isOpen
                      ? <button className="sb-read-btn" style={{background:color}} onClick={e=>{e.stopPropagation();setActive(i)}}>Open Again 💕</button>
                      : <div className="sb-lock" onClick={()=>tryOpen(i)}>🔒 Tap to open</div>
                    }
                  </>
                ) : (
                  <div className="sb-empty-hint">
                    {canEdit(i) ? <span onClick={()=>setEditing(i)} style={{color,cursor:"pointer"}}>＋ Add a surprise</span> : <span style={{color:"#ccc"}}>Coming soon...</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editor overlay */}
      {editing !== null && (
        <div className="sb-overlay" onClick={()=>setEditing(null)}>
          <div className="sb-modal" style={{background:"white",borderColor:BOX_COLORS[editing]}} onClick={e=>e.stopPropagation()}>
            <div className="sb-modal-ribbon" style={{background:BOX_COLORS[editing]}} />
            <BoxEditor idx={editing} box={boxes[editing]||{}} onSave={u=>handleSave(editing,u)} onClose={()=>setEditing(null)} />
          </div>
        </div>
      )}

      {/* Read overlay */}
      {active !== null && activeBox && (
        <div className="sb-overlay" onClick={close}>
          <div className="sb-modal" style={{background:BOX_BG[active],borderColor:BOX_COLORS[active]}} onClick={e=>e.stopPropagation()}>
            <div className="sb-modal-ribbon" style={{background:BOX_COLORS[active]}} />
            <div className="sb-modal-seal">{BOX_SEALS[active]}</div>
            <div className="sb-owner-label" style={{textAlign:"center",marginBottom:"8px"}}>{OWNER_LABEL[OWNER[active]]}</div>
            {photos[active] && <img src={photos[active]} alt="" className="sb-modal-photo" />}
            <h2 className="sb-modal-title" style={{color:BOX_COLORS[active]}}>{activeBox.title || "A Surprise 🎁"}</h2>
            <pre className="sb-modal-body">{activeBox.body || "This surprise is being written with love..."}</pre>
            {activeBox.gift && (
              <div className="sb-modal-gift" style={{borderColor:BOX_COLORS[active]}}>🎁 {activeBox.gift}</div>
            )}
            <p className="sb-modal-from">{OWNER_LABEL[OWNER[active]]}</p>
            <button className="sb-modal-close" style={{background:BOX_COLORS[active]}} onClick={close}>Close 💕</button>
          </div>
        </div>
      )}

      <div className="dream-footer" style={{marginTop:"50px"}}>
        <p>"Every surprise starts with love 💙💗"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
