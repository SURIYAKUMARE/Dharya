import { useEffect, useState } from "react";

const DREAM_COME_TRUE_YEARS = 4;
const emojis = ["🌟", "💖", "🌈", "✨", "🦋"];

/* ── Live countdown box ── */
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
    const id = setInterval(() => setT(calc()), 1000);
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
  "1 Hour":    3600000,
  "1 Day":     86400000,
  "7 Days":    7 * 86400000,
  "1 Month":   30 * 86400000,
  "1 Year":    365 * 86400000,
  "4 Years":   4 * 365 * 86400000,
  "10 Years":  10 * 365 * 86400000,
  "100 Years": 100 * 365 * 86400000,
};

/* ── Surprise Overlay ── */
function SurpriseOverlay({ suryaDreams, sadhanaDreams, onClose }) {
  const now = new Date();
  const dreamDate = addTime(now, DREAM_COME_TRUE_YEARS * 365 * 86400000);

  return (
    <div className="surprise-overlay" onClick={onClose}>
      <div className="surprise-card" onClick={(e) => e.stopPropagation()}>
        <div className="surprise-stars">
          {["⭐","💫","✨","🌟","💖","🌸","🦋"].map((s, i) => (
            <span key={i} className="surprise-star" style={{ animationDelay: `${i * 0.3}s` }}>{s}</span>
          ))}
        </div>

        <h2 className="surprise-title">Your Dreams Will Come True 💫</h2>
        <p className="surprise-msg">
          Every dream written here will become real —<br />
          <strong>within 4 years or after 4 years</strong>, I promise 💍
        </p>

        {/* Surya's dreams */}
        {suryaDreams.filter(d => d.trim()).length > 0 && (
          <>
            <h3 className="surprise-person-title">💙 Surya's Dreams</h3>
            <div className="surprise-dreams-list">
              {suryaDreams.filter(d => d.trim()).map((d, i) => (
                <div key={i} className="surprise-dream-item">
                  <span className="surprise-dream-emoji">{emojis[i]}</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sadhana's dreams */}
        {sadhanaDreams.filter(d => d.trim()).length > 0 && (
          <>
            <h3 className="surprise-person-title">💗 Sadhana's Dreams</h3>
            <div className="surprise-dreams-list">
              {sadhanaDreams.filter(d => d.trim()).map((d, i) => (
                <div key={i} className="surprise-dream-item">
                  <span className="surprise-dream-emoji">{emojis[i]}</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="surprise-date-label">⏳ Dreams come true on:</p>
        <p className="surprise-target-date">
          {dreamDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </p>

        <div className="surprise-countdowns">
          {Object.entries(MS).map(([label, ms]) => (
            <LiveCountdown key={label} label={`Until ${label} from now`} targetDate={addTime(now, ms)} />
          ))}
        </div>

        <button className="surprise-close" onClick={onClose}>Close 💕</button>
      </div>
    </div>
  );
}

/* ── Dream Input Section ── */
function DreamForm({ name, emoji, color, inputs, onChange, saved, onSave }) {
  return (
    <div className="dream-form-wrap" style={{ borderColor: color }}>
      <div className="dream-form-avatar">{emoji}</div>
      <h2 className="dream-form-title" style={{ color }}>{name}'s 5 Dreams</h2>
      <p className="dream-form-sub">Write your 5 biggest dreams — they will come true 💫</p>

      {inputs.map((val, i) => (
        <div key={i} className="dream-input-row">
          <span className="dream-input-emoji">{emojis[i]}</span>
          <input
            className="dream-input"
            type="text"
            placeholder={`Dream ${i + 1}...`}
            value={val}
            onChange={(e) => onChange(i, e.target.value)}
            style={{ borderColor: color }}
          />
        </div>
      ))}

      {saved.filter(d => d.trim()).length === 0 ? (
        <button
          className="dream-save-btn"
          style={{ background: `linear-gradient(135deg, ${color}, #c71585)` }}
          onClick={onSave}
        >
          Save My Dreams 💖
        </button>
      ) : (
        <div className="dream-saved-badge">✅ Dreams Saved!</div>
      )}

      {/* Show saved */}
      {saved.filter(d => d.trim()).length > 0 && (
        <div className="saved-dreams-wrap" style={{ marginTop: "20px" }}>
          {saved.filter(d => d.trim()).map((d, i) => (
            <div key={i} className="saved-dream-item">
              <span>{emojis[i]}</span> {d}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ── */
export default function DreamDashboard() {
  const [suryaInputs,   setSuryaInputs]   = useState(["","","","",""]);
  const [sadhanaInputs, setSadhanaInputs] = useState(["","","","",""]);
  const [suryaSaved,    setSuryaSaved]    = useState([]);
  const [sadhanaSaved,  setSadhanaSaved]  = useState([]);
  const [showSurprise,  setShowSurprise]  = useState(false);

  const handleSuryaSave = () => {
    if (!suryaInputs.some(d => d.trim())) return;
    setSuryaSaved(suryaInputs);
    if (sadhanaSaved.length > 0) setShowSurprise(true);
  };

  const handleSadhanaSave = () => {
    if (!sadhanaInputs.some(d => d.trim())) return;
    setSadhanaSaved(sadhanaInputs);
    if (suryaSaved.length > 0) setShowSurprise(true);
  };

  // show surprise when both saved
  useEffect(() => {
    if (suryaSaved.filter(d=>d.trim()).length > 0 && sadhanaSaved.filter(d=>d.trim()).length > 0) {
      setShowSurprise(true);
    }
  }, [suryaSaved, sadhanaSaved]);

  return (
    <div className="dream-page">
      <div className="dream-hero">
        <h1 className="dream-title">Dreams Become Real 💫</h1>
        <p className="dream-subtitle">Every dream starts and ends with you, Sadhana 🌸</p>
      </div>

{/* Both dream forms */}
      <div className="dream-forms-row">
        <DreamForm
          name="Surya"
          emoji="💙"
          color="#4a90d9"
          inputs={suryaInputs}
          onChange={(i, v) => { const n=[...suryaInputs]; n[i]=v; setSuryaInputs(n); }}
          saved={suryaSaved}
          onSave={handleSuryaSave}
        />
        <DreamForm
          name="Sadhana"
          emoji="�"
          color="#c71585"
          inputs={sadhanaInputs}
          onChange={(i, v) => { const n=[...sadhanaInputs]; n[i]=v; setSadhanaInputs(n); }}
          saved={sadhanaSaved}
          onSave={handleSadhanaSave}
        />
      </div>

      <div className="dream-footer">
        <p>"With you, every dream feels possible ❤️"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>

      {showSurprise && (
        <SurpriseOverlay
          suryaDreams={suryaSaved}
          sadhanaDreams={sadhanaSaved}
          onClose={() => setShowSurprise(false)}
        />
      )}
    </div>
  );
}
