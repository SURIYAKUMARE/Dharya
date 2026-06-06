import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────── */
/*  Constants                                  */
/* ─────────────────────────────────────────── */
const DREAM_COME_TRUE_YEARS = 4;
const emojis     = ["🌟", "💖", "🌈", "✨", "🦋"];
const categories = ["✈️ Travel", "💼 Career", "❤️ Love", "🏠 Home", "🎓 Growth", "💰 Wealth", "🌺 Health", "🎨 Hobby"];

const LOVE_NOTES = [
  "Every dream you have is one I want to make real for you 💍",
  "You deserve every single thing you've ever wished for 🌸",
  "I'll be beside you for every dream, big and small 💙",
  "Your happiness is my biggest dream 🌟",
  "Together we can turn every dream into a memory 🦋",
  "Write your dreams boldly — I'll help you chase them all 💫",
];

const MOOD_OPTIONS = [
  { emoji: "😍", label: "Dreamy" },
  { emoji: "🥰", label: "Loved" },
  { emoji: "✨", label: "Inspired" },
  { emoji: "🌸", label: "Hopeful" },
  { emoji: "😊", label: "Happy" },
  { emoji: "🌙", label: "Peaceful" },
];

/* ─────────────────────────────────────────── */
/*  Live Countdown                             */
/* ─────────────────────────────────────────── */
function LiveCountdown({ targetDate, label }) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="mini-countdown">
      <p className="mini-label">{label}</p>
      <div className="mini-boxes">
        {[{ v: t.d, u: "Days" }, { v: t.h, u: "Hrs" }, { v: t.m, u: "Min" }, { v: t.s, u: "Sec" }].map(({ v, u }) => (
          <div key={u} className="mini-box">
            <span className="mini-num">{String(v).padStart(2, "0")}</span>
            <span className="mini-unit">{u}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function addTime(base, ms) {
  return new Date(new Date(base).getTime() + ms);
}

const MS = {
  "1 Year":   365 * 86400000,
  "4 Years":  4 * 365 * 86400000,
  "10 Years": 10 * 365 * 86400000,
};

/* ─────────────────────────────────────────── */
/*  Dream Jar                                  */
/* ─────────────────────────────────────────── */
function DreamJar({ dreams, progress }) {
  const filled = dreams.filter(d => d.trim()).length;
  const avgProgress = dreams.filter(d => d.trim()).length
    ? progress.filter((_, i) => dreams[i]?.trim()).reduce((a, b) => a + b, 0) /
      dreams.filter(d => d.trim()).length
    : 0;

  const fillPct = filled === 0 ? 0 : Math.round(avgProgress);

  return (
    <div className="dream-jar-wrap">
      <h3 className="dream-jar-title">🫙 Dream Jar</h3>
      <p className="dream-jar-sub">Average dream progress: <strong>{fillPct}%</strong></p>
      <div className="dream-jar">
        <div className="dream-jar-fill" style={{ height: `${fillPct}%` }} />
        <div className="dream-jar-bubbles">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="dream-bubble" style={{ left: `${10 + i * 14}%`, animationDelay: `${i * 0.4}s` }}>
              {emojis[i % emojis.length]}
            </span>
          ))}
        </div>
        <span className="dream-jar-pct">{fillPct}%</span>
      </div>
      <p className="dream-jar-msg">
        {fillPct === 0 && "Start writing dreams to fill the jar 🌸"}
        {fillPct > 0  && fillPct < 50  && "Dreams are brewing ✨"}
        {fillPct >= 50 && fillPct < 100 && "Halfway there! Keep going 💫"}
        {fillPct === 100 && "All dreams are becoming real 💍🎉"}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Love Note                                  */
/* ─────────────────────────────────────────── */
function LoveNoteCard() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const next = () => {
    setFade(false);
    setTimeout(() => {
      setIdx(i => (i + 1) % LOVE_NOTES.length);
      setFade(true);
    }, 300);
  };

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="love-note-card">
      <div className="love-note-icon">💌</div>
      <p className="love-note-text" style={{ opacity: fade ? 1 : 0, transition: "opacity 0.3s" }}>
        {LOVE_NOTES[idx]}
      </p>
      <div className="love-note-dots">
        {LOVE_NOTES.map((_, i) => (
          <button
            key={i}
            className={`love-dot ${i === idx ? "active" : ""}`}
            onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 300); }}
            aria-label={`Note ${i + 1}`}
          />
        ))}
      </div>
      <p className="love-note-from">— Surya 💙</p>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Mood Picker                                */
/* ─────────────────────────────────────────── */
function MoodPicker({ mood, onChange }) {
  return (
    <div className="mood-wrap">
      <h3 className="mood-title">How are you feeling today? 🌸</h3>
      <div className="mood-options">
        {MOOD_OPTIONS.map(({ emoji, label }) => (
          <button
            key={label}
            className={`mood-btn ${mood === label ? "mood-active" : ""}`}
            onClick={() => onChange(label === mood ? "" : label)}
          >
            <span className="mood-emoji">{emoji}</span>
            <span className="mood-label">{label}</span>
          </button>
        ))}
      </div>
      {mood && <p className="mood-selected">You're feeling <strong>{mood}</strong> today 💕</p>}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Surprise Overlay                           */
/* ─────────────────────────────────────────── */
function SurpriseOverlay({ sadhanaDreams, categories: cats, progress, savedAt, onClose }) {
  const base = savedAt || new Date();
  const dreamDate = addTime(base, DREAM_COME_TRUE_YEARS * 365 * 86400000);
  const validDreams = sadhanaDreams.map((d, i) => ({ text: d, cat: cats[i], pct: progress[i] })).filter(d => d.text.trim());

  return (
    <div className="surprise-overlay" onClick={onClose}>
      <div className="surprise-card" onClick={e => e.stopPropagation()}>
        <div className="surprise-stars">
          {["⭐","💫","✨","🌟","💖","🌸","🦋"].map((s, i) => (
            <span key={i} className="surprise-star" style={{ animationDelay: `${i * 0.3}s` }}>{s}</span>
          ))}
        </div>
        <h2 className="surprise-title">Your Dreams Will Come True 💫</h2>
        <p className="surprise-msg">
          Every dream written here will become real —<br />
          <strong>within 4 years</strong>, I promise 💍
        </p>

        {validDreams.length > 0 && (
          <>
            <h3 className="surprise-person-title">💗 Sadhana's Dreams</h3>
            <div className="surprise-dreams-list">
              {validDreams.map((d, i) => (
                <div key={i} className="surprise-dream-item">
                  <span className="surprise-dream-emoji">{emojis[i]}</span>
                  <div className="surprise-dream-info">
                    <span className="surprise-dream-text">{d.text}</span>
                    {d.cat && <span className="surprise-dream-cat">{d.cat}</span>}
                    <div className="surprise-progress-bar">
                      <div className="surprise-progress-fill" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="surprise-pct">{d.pct}% there 🌟</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="surprise-date-label">⏳ Dreams come true by:</p>
        <p className="surprise-target-date">
          {dreamDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </p>

        <div className="surprise-countdowns">
          {Object.entries(MS).map(([label, ms]) => (
            <LiveCountdown key={label} label={`Time until ${label} from save`} targetDate={addTime(base, ms)} />
          ))}
        </div>

        <button className="surprise-close" onClick={onClose}>Close 💕</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Main Dashboard                             */
/* ─────────────────────────────────────────── */
export default function DreamDashboard() {
  const [inputs,       setInputs]       = useState(["","","","",""]);
  const [dreamCats,    setDreamCats]    = useState(["","","","",""]);
  const [dreamProg,    setDreamProg]    = useState([0,0,0,0,0]);
  const [saved,        setSaved]        = useState([]);
  const [savedCats,    setSavedCats]    = useState([]);
  const [savedProg,    setSavedProg]    = useState([0,0,0,0,0]);
  const [savedAt,      setSavedAt]      = useState(null); // timestamp of when dreams were saved
  const [editMode,     setEditMode]     = useState(false);
  const [mood,         setMood]         = useState("");
  const [showSurprise, setShowSurprise] = useState(false);
  const [showCat,      setShowCat]      = useState(null); // which input row has cat dropdown open
  const confettiRef = useRef(null);

  const handleSave = () => {
    if (!inputs.some(d => d.trim())) return;
    setSaved([...inputs]);
    setSavedCats([...dreamCats]);
    setSavedProg([...dreamProg]);
    setSavedAt(new Date()); // capture exact save time
    setEditMode(false);
    spawnConfetti();
    setTimeout(() => setShowSurprise(true), 900);
  };

  const handleEdit = () => {
    setInputs([...saved]);
    setDreamCats([...savedCats]);
    setDreamProg([...savedProg]);
    setEditMode(true);
  };

  const handleProgressChange = (i, val) => {
    if (saved.length > 0 && !editMode) {
      // update live progress on saved view
      const n = [...savedProg]; n[i] = Number(val); setSavedProg(n);
    } else {
      const n = [...dreamProg]; n[i] = Number(val); setDreamProg(n);
    }
  };

  /* confetti burst */
  const spawnConfetti = () => {
    const colors = ["#ff69b4","#c71585","#ffd700","#ff85b3","#a78bfa","#34d399"];
    if (!confettiRef.current) return;
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      el.style.cssText = `
        left:${Math.random()*100}vw;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        width:${8+Math.random()*8}px;
        height:${8+Math.random()*8}px;
        border-radius:${Math.random()>0.5?"50%":"2px"};
        animation-duration:${2+Math.random()*2}s;
        animation-delay:${Math.random()*0.5}s;
      `;
      confettiRef.current.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  };

  const isEditing = saved.length === 0 || editMode;
  const displayProg = isEditing ? dreamProg : savedProg;

  return (
    <div className="dream-page">
      <div ref={confettiRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:99 }} />

      {/* Hero */}
      <div className="dream-hero">
        <h1 className="dream-title">Sadhana's Dream World 🌸</h1>
        <p className="dream-subtitle">Every dream you write here will come true 💫</p>
      </div>

      {/* Love note from Surya */}
      <LoveNoteCard />

      {/* Mood picker */}
      <MoodPicker mood={mood} onChange={setMood} />

      {/* Dream Form / Saved View */}
      <div className="dream-forms-row">
        <div className="dream-form-wrap" style={{ borderColor: "#c71585" }}>
          <div className="dream-form-avatar">💗</div>
          <h2 className="dream-form-title" style={{ color: "#c71585" }}>Sadhana's 5 Dreams</h2>
          <p className="dream-form-sub">Write your 5 biggest dreams — they will come true 💫</p>

          {(isEditing ? inputs : saved).map((val, i) => (
            <div key={i} className="dream-entry-block">
              {/* Input row */}
              <div className="dream-input-row">
                <span className="dream-input-emoji">{emojis[i]}</span>
                {isEditing ? (
                  <input
                    className="dream-input"
                    type="text"
                    placeholder={`Dream ${i + 1}...`}
                    value={val}
                    onChange={e => { const n=[...inputs]; n[i]=e.target.value; setInputs(n); }}
                    style={{ borderColor: "#c71585" }}
                  />
                ) : (
                  <span className="dream-saved-text">{val || <em style={{color:"#ccc"}}>—</em>}</span>
                )}
              </div>

              {/* Category selector */}
              {isEditing && (
                <div className="dream-cat-row">
                  <button
                    className="dream-cat-toggle"
                    onClick={() => setShowCat(showCat === i ? null : i)}
                  >
                    {(isEditing ? dreamCats : savedCats)[i] || "＋ Add category"}
                  </button>
                  {showCat === i && (
                    <div className="dream-cat-dropdown">
                      {categories.map(c => (
                        <button
                          key={c}
                          className={`dream-cat-option ${dreamCats[i] === c ? "selected" : ""}`}
                          onClick={() => {
                            const n=[...dreamCats]; n[i]=c; setDreamCats(n);
                            setShowCat(null);
                          }}
                        >{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category badge on saved view */}
              {!isEditing && savedCats[i] && (
                <span className="dream-cat-badge">{savedCats[i]}</span>
              )}

              {/* Progress slider */}
              {typeof val === "string" && val.trim() && (
                <div className="dream-progress-row">
                  <span className="dream-progress-label">Progress: {displayProg[i]}%</span>
                  <input
                    type="range"
                    min="0" max="100"
                    value={displayProg[i]}
                    onChange={e => handleProgressChange(i, e.target.value)}
                    className="dream-slider"
                    style={{ accentColor: "#c71585" }}
                  />
                  <div className="dream-progress-bar-wrap">
                    <div className="dream-progress-bar-fill" style={{ width: `${displayProg[i]}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Buttons */}
          {isEditing ? (
            <button
              className="dream-save-btn"
              style={{ background: "linear-gradient(135deg, #c71585, #ff69b4)" }}
              onClick={handleSave}
            >
              Save My Dreams 💖
            </button>
          ) : (
            <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap", marginTop:"16px" }}>
              <div className="dream-saved-badge">✅ Dreams Saved!</div>
              <button className="dream-edit-btn" onClick={handleEdit}>✏️ Edit Dreams</button>
              <button className="dream-view-btn" onClick={() => setShowSurprise(true)}>💫 View My Promise</button>
            </div>
          )}
        </div>
      </div>

      {/* Dream Jar */}
      {saved.length > 0 && (
        <DreamJar dreams={saved} progress={savedProg} />
      )}

      {/* Footer */}
      <div className="dream-footer">
        <p>"With you, every dream feels possible ❤️"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>

      {/* Surprise overlay */}
      {showSurprise && (
        <SurpriseOverlay
          sadhanaDreams={saved}
          categories={savedCats}
          progress={savedProg}
          savedAt={savedAt}
          onClose={() => setShowSurprise(false)}
        />
      )}
    </div>
  );
}
