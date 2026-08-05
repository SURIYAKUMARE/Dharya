import { useState, useEffect, useRef } from "react";
import { dbGet, dbSet, uploadPhoto, getPhoto } from "../api"; // eslint-disable-line no-unused-vars

/* ─── Config ─── */
const SURYA_COLOR   = "#00d97e";
const SADHANA_COLOR = "#ff1a6e";

const BOXES = [
  { owner:"surya",   color:SURYA_COLOR,   seal:"💚", ribbon:"#00916e", label:"Surya's Gift #1",   particles:["🌿","✦","💚","🍃","⭐"] },
  { owner:"surya",   color:SURYA_COLOR,   seal:"🌿", ribbon:"#059669", label:"Surya's Gift #2",   particles:["💚","✧","🌱","◦","✦"] },
  { owner:"surya",   color:SURYA_COLOR,   seal:"💎", ribbon:"#06B6D4", label:"Surya's Gift #3",   particles:["💎","✦","🌊","⭐","✧"] },
  { owner:"sadhana", color:SADHANA_COLOR, seal:"💗", ribbon:"#c2005c", label:"Sadhana's Gift #1", particles:["💗","🌸","✨","💕","⭐"] },
  { owner:"sadhana", color:SADHANA_COLOR, seal:"🌸", ribbon:"#be185d", label:"Sadhana's Gift #2", particles:["🌺","💖","✦","🌷","✨"] },
  { owner:"sadhana", color:SADHANA_COLOR, seal:"✨", ribbon:"#8b3fc8", label:"Sadhana's Gift #3", particles:["✨","💕","⭐","🌟","💫"] },
];

/* ─── Confetti burst ─── */
function Confetti({ color, particles }) {
  const items = [...Array(22)].map((_, i) => ({
    sym:  particles[i % particles.length],
    x:    (Math.random() - 0.5) * 340,
    y:    -(80 + Math.random() * 200),
    rot:  (Math.random() - 0.5) * 720,
    size: 14 + Math.random() * 14,
    dur:  0.9 + Math.random() * 0.7,
    delay:i * 0.035,
  }));
  return (
    <div style={{ position:"absolute", top:"50%", left:"50%", pointerEvents:"none", zIndex:30 }}>
      {items.map((p, i) => (
        <span key={i} style={{
          position:"absolute",
          fontSize:`${p.size}px`,
          animation:`confettiBurst ${p.dur}s ease-out ${p.delay}s both`,
          "--cx": `${p.x}px`, "--cy": `${p.y}px`, "--cr": `${p.rot}deg`,
          display:"inline-block",
          filter:`drop-shadow(0 0 6px ${color})`,
        }}>{p.sym}</span>
      ))}
    </div>
  );
}

/* ─── Floating background particles ─── */
function BgParticles({ color, particles }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0, borderRadius:"inherit" }}>
      {[...Array(10)].map((_, i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-20px",
          left:`${i*10+3}%`,
          fontSize:`${8+(i%3)*5}px`,
          color, opacity:0.35,
          animation:`floatUp ${7+i*0.9}s linear ${i*0.5}s infinite`,
          filter:`drop-shadow(0 0 4px ${color})`,
        }}>{particles[i % particles.length]}</span>
      ))}
    </div>
  );
}

/* ─── 3D Gift Box visual ─── */
function GiftBox3D({ color, seal, opened, shaking, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`sb3-gift ${shaking?"sb3-shake":""} ${opened?"sb3-opened":""}`}
      style={{ "--gc": color }}
    >
      {/* Lid */}
      <div className="sb3-lid">
        <div className="sb3-lid-face sb3-lid-top" />
        <div className="sb3-lid-face sb3-lid-front" />
        <div className="sb3-lid-face sb3-lid-right" />
      </div>
      {/* Body */}
      <div className="sb3-body">
        <div className="sb3-body-face sb3-body-top" />
        <div className="sb3-body-face sb3-body-front">
          <span className="sb3-seal-emoji">{seal}</span>
        </div>
        <div className="sb3-body-face sb3-body-right" />
      </div>
      {/* Ribbon cross */}
      <div className="sb3-ribbon-v" />
      <div className="sb3-ribbon-h" />
      {/* Bow */}
      <div className="sb3-bow">
        <div className="sb3-bow-l" />
        <div className="sb3-bow-r" />
        <div className="sb3-bow-knot" />
      </div>
      {/* Glow */}
      <div className="sb3-glow" />
    </div>
  );
}

/* ─── Reveal Modal ─── */
function RevealModal({ idx, box, photo, onClose, onEdit, canEdit }) {
  const cfg = BOXES[idx];
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 30);
    setTimeout(() => setShowConfetti(true), 200);
    setTimeout(() => setShowConfetti(false), 2200);
  }, []);

  return (
    <div
      className="sb3-overlay"
      onClick={onClose}
      style={{ "--mc": cfg.color }}
    >
      {/* Confetti explosion */}
      {showConfetti && (
        <div style={{ position:"fixed", top:"50%", left:"50%", pointerEvents:"none", zIndex:9999 }}>
          <Confetti color={cfg.color} particles={cfg.particles} />
        </div>
      )}

      <div
        className={`sb3-modal ${mounted?"sb3-modal-in":""}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top shimmer ribbon */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"3px",
          background:`linear-gradient(90deg,transparent,${cfg.color},#fff,${cfg.color},transparent)`,
          backgroundSize:"200%", animation:"shimmerRibbon 2s linear infinite", borderRadius:"24px 24px 0 0",
        }}/>

        {/* Floating particles inside modal */}
        <BgParticles color={cfg.color} particles={cfg.particles} />

        {/* Seal bounce */}
        <div className="sb3-modal-seal" style={{ animation:"successBounce 0.7s var(--spring,cubic-bezier(.34,1.56,.64,1)) 0.1s both" }}>
          {cfg.seal}
        </div>

        {/* Owner tag */}
        <div className="sb3-modal-owner" style={{ background:`${cfg.color}18`, border:`1px solid ${cfg.color}44`, color:cfg.color }}>
          {cfg.owner === "surya" ? "💚 From Surya" : "💗 From Sadhana"}
        </div>

        {/* Photo */}
        {photo && (
          <div className="sb3-modal-photo-wrap" style={{ animation:"fadeInUp 0.5s ease 0.2s both" }}>
            <img src={photo} alt="" className="sb3-modal-photo" style={{ borderColor:`${cfg.color}44` }}/>
          </div>
        )}

        {/* Title */}
        <h2 className="sb3-modal-title" style={{ color:cfg.color, animation:"fadeInUp 0.5s ease 0.3s both" }}>
          {box?.title || "A Special Surprise 🎁"}
        </h2>

        {/* Message */}
        <div className="sb3-modal-body" style={{ animation:"fadeInUp 0.5s ease 0.4s both" }}>
          <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',sans-serif", fontSize:"0.92rem", color:"rgba(255,255,255,0.82)", lineHeight:1.8, margin:0 }}>
            {box?.body || "This surprise is being written with love... 💕"}
          </pre>
        </div>

        {/* Gift label */}
        {box?.gift && (
          <div className="sb3-modal-gift" style={{ borderColor:`${cfg.color}55`, background:`${cfg.color}10`, animation:"fadeInUp 0.5s ease 0.5s both" }}>
            <span style={{ color:cfg.color, fontSize:"1.2rem" }}>🎁</span>
            <span style={{ color:"rgba(255,255,255,0.9)", fontWeight:700 }}>{box.gift}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="sb3-modal-btns" style={{ animation:"fadeInUp 0.5s ease 0.6s both" }}>
          {canEdit && (
            <button className="sb3-btn-outline" style={{ borderColor:`${cfg.color}55`, color:cfg.color }} onClick={onEdit}>
              ✏️ Edit
            </button>
          )}
          <button className="sb3-btn-close" style={{ background:`linear-gradient(135deg,${cfg.color},${cfg.ribbon || cfg.color})`, boxShadow:`0 8px 28px ${cfg.color}44` }} onClick={onClose}>
            Close 💕
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Editor ─── */
function BoxEditor({ idx, box, onSave, onClose }) {
  const cfg = BOXES[idx];
  const [title,   setTitle]   = useState(box?.title  || "");
  const [hint,    setHint]    = useState(box?.hint   || "");
  const [body,    setBody]    = useState(box?.body   || "");
  const [gift,    setGift]    = useState(box?.gift   || "");
  const [preview, setPreview] = useState(box?.photo  || "");
  const [file,    setFile]    = useState(null);
  const [saving,  setSaving]  = useState(false);
  const fileRef = useRef(null);

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 2.5*1024*1024) { alert("Max 2MB"); return; }
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f); setFile(f);
  };
  const save = async () => {
    setSaving(true);
    let photoUrl = box?.photo || "";
    if (file) photoUrl = await uploadPhoto(`surprise_img_${idx}`, file);
    const updated = { title, hint, body, gift, photo:photoUrl, owner:BOXES[idx].owner };
    await dbSet(`surprise_box_${idx}`, updated);
    onSave(updated); setSaving(false); onClose();
  };

  const iStyle = { width:"100%", boxSizing:"border-box", padding:"12px 16px", background:`${cfg.color}0a`, border:`1.5px solid ${cfg.color}33`, borderRadius:12, color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none", marginBottom:12, transition:"border 0.2s" };
  const lStyle = { display:"block", fontSize:"0.68rem", fontWeight:700, color:cfg.color, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 };

  return (
    <div style={{ padding:"24px 22px", position:"relative", zIndex:1 }}>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontStyle:"italic", color:"#fff", margin:"0 0 20px", textAlign:"center" }}>
        ✏️ Edit {cfg.label}
      </h3>
      <label style={lStyle}>Hint (shown on sealed box)</label>
      <input style={iStyle} value={hint} placeholder="Open when..." onChange={e=>setHint(e.target.value)} />
      <label style={lStyle}>Title</label>
      <input style={iStyle} value={title} placeholder="Surprise title..." onChange={e=>setTitle(e.target.value)} />
      <label style={lStyle}>Message</label>
      <textarea style={{...iStyle, resize:"vertical"}} rows={5} value={body} placeholder="Write your surprise message..." onChange={e=>setBody(e.target.value)} />
      <label style={lStyle}>Gift label</label>
      <input style={iStyle} value={gift} placeholder="e.g. 🫂 One unlimited hug" onChange={e=>setGift(e.target.value)} />
      <label style={lStyle}>📷 Photo (optional)</label>
      {preview ? (
        <div style={{ marginBottom:12, display:"flex", gap:10, alignItems:"center" }}>
          <img src={preview} alt="" style={{ width:80, height:60, objectFit:"cover", borderRadius:8, border:`1.5px solid ${cfg.color}44` }}/>
          <button onClick={()=>{setPreview("");setFile(null);if(fileRef.current)fileRef.current.value="";}} style={{ padding:"6px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#fca5a5", cursor:"pointer", fontSize:"0.78rem" }}>✕ Remove</button>
        </div>
      ) : (
        <label style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 18px", background:`${cfg.color}0d`, border:`1.5px dashed ${cfg.color}44`, borderRadius:10, cursor:"pointer", fontSize:"0.82rem", color:cfg.color, fontWeight:600, marginBottom:16 }}>
          📷 Upload Photo
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} />
        </label>
      )}
      <div style={{ display:"flex", gap:10, marginTop:8 }}>
        <button onClick={save} disabled={saving} style={{ flex:1, padding:"12px", background:`linear-gradient(135deg,${cfg.color},${cfg.ribbon||cfg.color})`, border:"none", borderRadius:12, color:"#fff", fontWeight:700, cursor:"pointer", fontSize:"0.9rem", boxShadow:`0 6px 20px ${cfg.color}44`, opacity:saving?0.7:1 }}>
          {saving?"Saving... ⏳":"Save 💚"}
        </button>
        <button onClick={onClose} style={{ padding:"12px 20px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontWeight:600 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export default function SurpriseBox({ user }) {
  const [boxes,   setBoxes]   = useState(Array(6).fill(null));
  const [photos,  setPhotos]  = useState({});
  const [opened,  setOpened]  = useState({});
  const [active,  setActive]  = useState(null);
  const [shaking, setShaking] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("surya");
  const [mounted, setMounted] = useState(false);
  const [hovering,setHovering]= useState(null);

  useEffect(() => {
    (async () => {
      const loaded = await Promise.all(Array.from({length:6},(_,i)=>dbGet(`surprise_box_${i}`,null)));
      const photoMap = {};
      for (let i=0;i<6;i++) {
        if (loaded[i]?.photo) photoMap[i] = loaded[i].photo;
        else { const p = await getPhoto(`surprise_img_${i}`); if(p) photoMap[i]=p; }
      }
      setBoxes(loaded); setPhotos(photoMap); setLoading(false);
      setTimeout(() => setMounted(true), 60);
    })();
  }, []);

  const tryOpen = i => {
    if (opened[i]) { setActive(i); return; }
    setShaking(i);
    setTimeout(() => { setShaking(null); setOpened(o=>({...o,[i]:true})); setActive(i); }, 700);
  };
  const handleSave = (i, upd) => {
    setBoxes(p=>p.map((b,j)=>j===i?upd:b));
    if (upd.photo) setPhotos(p=>({...p,[i]:upd.photo}));
  };

  const indices = tab==="surya" ? [0,1,2] : [3,4,5];
  const isSurya = user === "surya"; // eslint-disable-line no-unused-vars
  const tabColor = tab==="surya" ? SURYA_COLOR : SADHANA_COLOR;

  return (
    <div className="sb3-page" style={{
      opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(30px)",
      transition:"all 0.7s ease",
    }}>

      {/* Ambient background particles */}
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        {["💗","🌸","💚","🌿","✨","⭐","💕","🍃","💖","✦"].map((s,i)=>(
          <span key={i} style={{
            position:"absolute", bottom:"-30px", left:`${i*10+2}%`,
            fontSize:`${9+(i%3)*5}px`, opacity:0.15,
            color: i%2===0 ? SADHANA_COLOR : SURYA_COLOR,
            animation:`floatUp ${8+i*0.9}s linear ${i*0.7}s infinite`,
          }}>{s}</span>
        ))}
      </div>

      {/* ── Hero ── */}
      <div className="sb3-hero">
        <div className="sb3-hero-icon" style={{ animation:"floatEmoji 3s ease-in-out infinite alternate" }}>🎁</div>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:`linear-gradient(90deg,transparent,${SADHANA_COLOR},${SURYA_COLOR},${SADHANA_COLOR},transparent)`, backgroundSize:"200%", animation:"shimmerRibbon 2.5s linear infinite", borderRadius:"inherit" }} />
        <h1 className="sb3-hero-title">Surprise Box</h1>
        <p className="sb3-hero-sub">
          <span style={{ color:SURYA_COLOR }}>3 from Surya</span>
          <span style={{ color:"rgba(255,255,255,0.4)", margin:"0 8px" }}>+</span>
          <span style={{ color:SADHANA_COLOR }}>3 from Sadhana</span>
        </p>
        {/* Pulse rings */}
        {[0,1,2].map(i=>(
          <div key={i} style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:`${120+i*70}px`, height:`${120+i*70}px`, borderRadius:"50%", border:`1px solid ${tabColor}${["22","18","10"][i]}`, animation:`pulseRing ${[3,4.5,6][i]}s ease-out ${i*0.7}s infinite`, pointerEvents:"none" }} />
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div className="sb3-tabs">
        {["surya","sadhana"].map(t=>(
          <button key={t} className={`sb3-tab ${tab===t?"sb3-tab-active":""}`}
            style={tab===t ? { background:`${t==="surya"?SURYA_COLOR:SADHANA_COLOR}18`, border:`1.5px solid ${t==="surya"?SURYA_COLOR:SADHANA_COLOR}`, color:t==="surya"?SURYA_COLOR:SADHANA_COLOR, boxShadow:`0 0 20px ${t==="surya"?SURYA_COLOR:SADHANA_COLOR}33` } : {}}
            onClick={()=>setTab(t)}>
            {t==="surya" ? "💚 Surya's Surprises" : "💗 Sadhana's Surprises"}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="sb3-loading">
          <div style={{ fontSize:"2.5rem", animation:"floatEmoji 1.5s ease-in-out infinite alternate" }}>🎁</div>
          <p style={{ color:"rgba(255,255,255,0.4)", marginTop:10 }}>Loading surprises...</p>
        </div>
      ) : (
        <div className="sb3-grid">
          {indices.map((i, gi) => {
            const cfg = BOXES[i];
            const box = boxes[i];
            const isOpen = !!opened[i];
            const hasContent = box?.title || box?.body;
            const canEdit = user === cfg.owner;
            const isHov = hovering === i;

            return (
              <div key={i}
                className={`sb3-card ${isOpen?"sb3-card-opened":""}`}
                style={{
                  "--cc": cfg.color,
                  borderColor: isHov ? cfg.color : `${cfg.color}44`,
                  boxShadow: isHov ? `0 20px 60px ${cfg.color}30, 0 0 0 1px ${cfg.color}33` : `0 8px 30px rgba(0,0,0,0.4)`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0) scale(1)" : "translateY(40px) scale(0.92)",
                  transition: `opacity 0.6s ease ${gi*0.12}s, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${gi*0.12}s, border-color 0.3s, box-shadow 0.3s`,
                }}
                onMouseEnter={()=>setHovering(i)}
                onMouseLeave={()=>setHovering(null)}
              >
                {/* Background particles inside card */}
                <BgParticles color={cfg.color} particles={cfg.particles} />

                {/* Top ribbon */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${cfg.color},transparent)`, backgroundSize:isHov?"150% 100%":"200% 100%", animation:"shimmerRibbon 2s linear infinite", borderRadius:"20px 20px 0 0" }} />

                {/* Edit button */}
                {canEdit && (
                  <button className="sb3-edit-btn" style={{ color:cfg.color, borderColor:`${cfg.color}44` }}
                    onClick={e=>{e.stopPropagation();setEditing(i)}}>✏️</button>
                )}

                {/* Owner tag */}
                <div className="sb3-owner-tag" style={{ background:`${cfg.color}15`, border:`1px solid ${cfg.color}33`, color:cfg.color }}>
                  {cfg.owner==="surya"?"💚 From Surya":"💗 From Sadhana"}
                </div>

                {/* 3D Gift Box */}
                <GiftBox3D
                  color={cfg.color}
                  seal={cfg.seal}
                  opened={isOpen}
                  shaking={shaking===i}
                  onClick={()=>tryOpen(i)}
                />

                {/* Box number */}
                <div className="sb3-num" style={{ color:`${cfg.color}bb` }}>
                  Gift #{(i%3)+1}
                </div>

                {/* Photo thumbnail */}
                {photos[i] && (
                  <div className="sb3-thumb-wrap">
                    <img src={photos[i]} alt="" className="sb3-thumb" style={{ borderColor:`${cfg.color}44` }}/>
                  </div>
                )}

                {/* Hint / CTA */}
                <div className="sb3-hint-area">
                  {hasContent ? (
                    <>
                      <p className="sb3-hint-text">"{box.hint || "A special surprise inside..."}"</p>
                      <button className={`sb3-open-btn ${isOpen?"sb3-open-btn-again":""}`}
                        style={{ background:`linear-gradient(135deg,${cfg.color},${cfg.ribbon||cfg.color})`, boxShadow:`0 6px 22px ${cfg.color}44` }}
                        onClick={()=>tryOpen(i)}>
                        {isOpen ? "Open Again 💕" : "🔒 Open Surprise"}
                      </button>
                    </>
                  ) : (
                    <div className="sb3-empty">
                      {canEdit
                        ? <span style={{ color:cfg.color, cursor:"pointer", fontWeight:700 }} onClick={()=>setEditing(i)}>＋ Add a surprise</span>
                        : <span style={{ color:"rgba(255,255,255,0.25)", fontStyle:"italic" }}>Coming soon...</span>
                      }
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reveal Modal ── */}
      {active !== null && boxes[active] && (
        <RevealModal idx={active} box={boxes[active]} photo={photos[active]}
          onClose={()=>setActive(null)}
          onEdit={()=>{setEditing(active);setActive(null);}}
          canEdit={user===BOXES[active].owner}
        />
      )}

      {/* ── Editor Modal ── */}
      {editing !== null && (
        <div className="sb3-overlay" onClick={()=>setEditing(null)}>
          <div className="sb3-modal sb3-editor-modal" style={{ "--mc":BOXES[editing].color }} onClick={e=>e.stopPropagation()}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:`linear-gradient(90deg,transparent,${BOXES[editing].color},transparent)`, borderRadius:"24px 24px 0 0" }} />
            <BoxEditor idx={editing} box={boxes[editing]||{}} onSave={u=>handleSave(editing,u)} onClose={()=>setEditing(null)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign:"center", padding:"40px 20px 20px", marginTop:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:8 }}>
          <span style={{ color:SADHANA_COLOR }}>💗</span>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.85rem", fontStyle:"italic", margin:0 }}>
            "Every surprise starts with love"
          </p>
          <span style={{ color:SURYA_COLOR }}>💚</span>
        </div>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", fontStyle:"italic", color:"rgba(255,255,255,0.5)", margin:0 }}>
          Surya &amp; Sadhana — Forever 💍
        </p>
      </div>
    </div>
  );
}
