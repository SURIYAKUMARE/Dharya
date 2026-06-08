import { useState } from "react";

const SURYA_NOTES = [
  { id:1, color:"#ffd700", rot:-3, from:"Surya", text:"You are the first thing I think about every morning and the last thing every night 🌙", emoji:"💙" },
  { id:2, color:"#ff85b3", rot:2,  from:"Surya", text:"I would choose you in every universe, in every lifetime, without a second thought 💍", emoji:"🌸" },
  { id:3, color:"#a78bfa", rot:-4, from:"Surya", text:"Your dreams are safe with me — I'll protect every single one of them 🌟", emoji:"💫" },
  { id:4, color:"#34d399", rot:3,  from:"Surya", text:"I love the way your mind works — you see the world differently and it's beautiful 💚", emoji:"✨" },
  { id:5, color:"#fb923c", rot:-2, from:"Surya", text:"Watching you grow into yourself is one of the greatest privileges of my life 🌺", emoji:"🌻" },
  { id:6, color:"#60a5fa", rot:4,  from:"Surya", text:"Being loved by you is the best thing that has ever happened to me 💙", emoji:"🌊" },
];

const NOTE_COLORS = ["#ffd700","#ff85b3","#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6","#86efac"];

export default function LoveNotesWall() {
  const [notes,   setNotes]   = useState(SURYA_NOTES);
  const [reply,   setReply]   = useState("");
  const [color,   setColor]   = useState(NOTE_COLORS[0]);
  const [popped,  setPopped]  = useState(null);
  const [adding,  setAdding]  = useState(false);

  const addNote = () => {
    if (!reply.trim()) return;
    const n = {
      id: Date.now(),
      color,
      rot: Math.floor(Math.random() * 10) - 5,
      from: "Sadhana",
      text: reply.trim(),
      emoji: "💗",
    };
    setNotes(prev => [...prev, n]);
    setReply("");
    setAdding(false);
  };

  const removeNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (popped === id) setPopped(null);
  };

  return (
    <div className="wall-page">
      <div className="wall-hero">
        <h1 className="wall-title">Love Notes Wall 📝</h1>
        <p className="wall-sub">Surya left notes for you — pin one back 💌</p>
      </div>

      {/* Cork wall */}
      <div className="cork-wall">
        {notes.map(n => (
          <div
            key={n.id}
            className={`sticky-note ${popped === n.id ? "sticky-popped" : ""}`}
            style={{ background: n.color + "ee", transform: `rotate(${n.rot}deg)` }}
            onClick={() => setPopped(popped === n.id ? null : n.id)}
          >
            <div className="sticky-pin" />
            <div className="sticky-from">
              {n.from === "Surya" ? "💙 Surya" : "💗 Sadhana"}
            </div>
            <p className="sticky-text">{n.text}</p>
            <div className="sticky-emoji">{n.emoji}</div>
            {n.from === "Sadhana" && popped === n.id && (
              <button className="sticky-del" onClick={(e) => { e.stopPropagation(); removeNote(n.id); }}>✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Add note section */}
      {!adding ? (
        <div style={{ textAlign:"center", marginTop:"28px" }}>
          <button className="wall-add-btn" onClick={() => setAdding(true)}>
            ＋ Pin Your Reply 💗
          </button>
        </div>
      ) : (
        <div className="wall-form">
          <h3 className="wall-form-title">Write your note 💌</h3>
          <textarea
            className="wall-textarea"
            placeholder="Write something for Surya to see..."
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={3}
          />
          <div className="wall-color-row">
            <span className="wall-color-label">Pick a color:</span>
            {NOTE_COLORS.map(c => (
              <button
                key={c}
                className={`wall-color-dot ${color === c ? "wall-color-active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          {/* Preview */}
          {reply.trim() && (
            <div className="wall-preview" style={{ background: color + "ee" }}>
              <div className="sticky-from">💗 Sadhana</div>
              <p className="sticky-text">{reply}</p>
            </div>
          )}
          <div className="wall-form-btns">
            <button className="wall-pin-btn" onClick={addNote} disabled={!reply.trim()}>Pin It 📌</button>
            <button className="wall-cancel-btn" onClick={() => { setAdding(false); setReply(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="dream-footer" style={{ marginTop: "50px" }}>
        <p>"Every note you leave becomes a piece of my heart 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
