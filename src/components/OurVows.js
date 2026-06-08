import { useState } from "react";

const VOWS = [
  {
    from: "Surya",
    emoji: "💙",
    color: "#3b82f6",
    bg: "linear-gradient(160deg,#eff6ff,#dbeafe)",
    title: "Surya's Vow to Sadhana",
    vow: `Sadhana,

I vow to love you not just on the easy days, but on the hard ones — when life is loud, when you are tired, when the world feels like too much.

I vow to be the person you call first, the one who shows up without being asked, the hand that reaches for yours before you even have to reach.

I vow to celebrate every version of you — the one who is thriving, and the one who is still finding her way.

I vow to be patient with your fears, honest with my heart, and present in every moment we are given.

I vow to spend the rest of my life trying to be worthy of your love — and never, not for a single day, taking it for granted.

You are my beginning, my present, and every future I have ever imagined.

I choose you, Sadhana.
Today, tomorrow, and in every lifetime after this.`,
    sealed: false,
  },
  {
    from: "Sadhana",
    emoji: "💗",
    color: "#c71585",
    bg: "linear-gradient(160deg,#fff0f5,#fce4f0)",
    title: "A Vow to Write",
    vow: null, // Sadhana writes her own
    sealed: false,
    editable: true,
  },
];

const SEAL_STORAGE = "vow_sadhana";
const TEXT_STORAGE = "vow_sadhana_text";

export default function OurVows() {
  const [active,    setActive]    = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [vowText,   setVowText]   = useState(() => localStorage.getItem(TEXT_STORAGE) || "");
  const [sealed,    setSealed]    = useState(() => !!localStorage.getItem(SEAL_STORAGE));
  const [sealing,   setSealing]   = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [particles, setParticles] = useState([]);

  const open = (i) => {
    setActive(i);
    setRevealed(false);
    setTimeout(() => setRevealed(true), 300);
  };

  const close = () => {
    setRevealed(false);
    setTimeout(() => setActive(null), 300);
  };

  const sealVow = () => {
    if (!vowText.trim()) return;
    setSealing(true);
    setParticles(Array.from({ length: 12 }, (_, i) => i));
    localStorage.setItem(SEAL_STORAGE, "1");
    localStorage.setItem(TEXT_STORAGE, vowText);
    setTimeout(() => {
      setSealed(true);
      setSealing(false);
      setEditMode(false);
      setParticles([]);
    }, 1600);
  };

  const unseal = () => {
    localStorage.removeItem(SEAL_STORAGE);
    setSealed(false);
    setEditMode(true);
  };

  return (
    <div className="vows-page">
      {/* Particle burst */}
      {particles.length > 0 && (
        <div className="vow-particles">
          {particles.map(i => (
            <span key={i} className="vow-particle" style={{
              left: `${10 + i * 7}%`,
              animationDelay: `${i * 0.08}s`,
            }}>
              {["💍","💖","✨","🌸","💗","🌟"][i % 6]}
            </span>
          ))}
        </div>
      )}

      <div className="vows-hero">
        <h1 className="vows-title">Our Vows 💒</h1>
        <p className="vows-sub">Words that will last forever — written from the heart 🌸</p>
      </div>

      {/* Vow cards */}
      <div className="vows-cards">

        {/* Surya's vow */}
        <div className="vow-card" style={{ borderColor: VOWS[0].color, background: VOWS[0].bg }}
          onClick={() => open(0)}>
          <div className="vow-card-wax" style={{ background: VOWS[0].color }}>
            {VOWS[0].emoji}
          </div>
          <h3 className="vow-card-title" style={{ color: VOWS[0].color }}>{VOWS[0].title}</h3>
          <p className="vow-card-from">Written by Surya 💙</p>
          <button className="vow-read-btn" style={{ background: VOWS[0].color }}>Read Vow 💙</button>
        </div>

        {/* Sadhana's vow */}
        <div className="vow-card" style={{ borderColor: VOWS[1].color, background: VOWS[1].bg }}>
          <div className="vow-card-wax" style={{ background: VOWS[1].color }}>
            {VOWS[1].emoji}
          </div>
          <h3 className="vow-card-title" style={{ color: VOWS[1].color }}>Sadhana's Vow</h3>
          <p className="vow-card-from">Written by Sadhana 💗</p>

          {sealed && !editMode ? (
            <div className="vow-sealed-badge" onClick={() => open(1)}>
              🔒 Sealed with love — tap to read
            </div>
          ) : editMode || !sealed ? (
            <div className="vow-write-area" onClick={e => e.stopPropagation()}>
              <textarea
                className="vow-textarea"
                placeholder="Write your vow to Surya here... from your heart 💗"
                value={vowText}
                onChange={e => setVowText(e.target.value)}
                rows={5}
                disabled={sealing}
              />
              <button
                className="vow-seal-btn"
                style={{ background: VOWS[1].color }}
                onClick={sealVow}
                disabled={!vowText.trim() || sealing}
              >
                {sealing ? "Sealing... 💗" : "Seal with Love 💍"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Overlay reader */}
      {active !== null && (
        <div className="vow-overlay" onClick={close}>
          <div
            className={`vow-modal ${revealed ? "vow-modal-in" : ""}`}
            style={{ background: VOWS[active].bg, borderColor: VOWS[active].color }}
            onClick={e => e.stopPropagation()}
          >
            <div className="vow-modal-ribbon" style={{ background: VOWS[active].color }} />
            <div className="vow-modal-wax" style={{ background: VOWS[active].color }}>
              {VOWS[active].emoji}
            </div>
            <h2 className="vow-modal-title" style={{ color: VOWS[active].color }}>
              {active === 0 ? VOWS[0].title : "Sadhana's Vow"}
            </h2>
            <div className="vow-modal-divider" style={{ background: VOWS[active].color }} />
            <pre className="vow-modal-text">{active === 0 ? VOWS[0].vow : vowText}</pre>
            {active === 1 && sealed && (
              <button className="vow-unseal-btn" onClick={() => { close(); setTimeout(unseal, 400); }}>
                ✏️ Edit Vow
              </button>
            )}
            <button className="vow-modal-close" style={{ background: VOWS[active].color }} onClick={close}>
              Close 💕
            </button>
          </div>
        </div>
      )}

      <div className="dream-footer" style={{ marginTop:"60px" }}>
        <p>"A vow isn't just words — it's a direction, a promise, a life 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
