import { useState } from "react";

const MOODS = [
  {
    key: "happy",
    emoji: "😊",
    label: "Happy",
    color: "#f59e0b",
    bg: "linear-gradient(135deg,#fffde7,#fff9c4,#fef9c3)",
    quote: "Your happiness lights up every room and every heart near you 🌻",
    song: "Kannazhaga — Dhibu Ninan Thomas",
    activity: "Go outside, feel the sun, and let today be exactly as good as you are 🌅",
    vibe: "golden",
  },
  {
    key: "loved",
    emoji: "🥰",
    label: "Loved",
    color: "#ec4899",
    bg: "linear-gradient(135deg,#fdf2f8,#fce7f3,#fff0f8)",
    quote: "You deserve every drop of love you're feeling right now — and infinitely more 💗",
    song: "Oru Adaar Love — Omar Lulu",
    activity: "Write down one thing that made you feel loved today — treasure it 💌",
    vibe: "pink",
  },
  {
    key: "calm",
    emoji: "🌸",
    label: "Calm",
    color: "#10b981",
    bg: "linear-gradient(135deg,#f0fdf4,#dcfce7,#ecfdf5)",
    quote: "Peace is a superpower — and you wear it beautifully 🌿",
    song: "Nee Naan Mudhal — D. Imman",
    activity: "Make yourself a warm drink, sit somewhere comfortable, and just breathe 🍵",
    vibe: "green",
  },
  {
    key: "dreamy",
    emoji: "✨",
    label: "Dreamy",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#f5f3ff,#ede9fe,#f3e8ff)",
    quote: "Dreams are just the future knocking early — and yours are about to open the door 🌙",
    song: "Nenjame — Yuvan Shankar Raja",
    activity: "Write down one dream you have for your future — even the ones that feel too big 💫",
    vibe: "purple",
  },
  {
    key: "missing",
    emoji: "🥺",
    label: "Missing",
    color: "#3b82f6",
    bg: "linear-gradient(135deg,#eff6ff,#dbeafe,#e0f2fe)",
    quote: "Missing someone this much means the love is real — and it is 💙",
    song: "Munbe Vaa — A.R. Rahman",
    activity: "Look at something that reminds you of a happy memory — hold that feeling close 🌊",
    vibe: "blue",
  },
  {
    key: "tired",
    emoji: "😴",
    label: "Tired",
    color: "#6b7280",
    bg: "linear-gradient(135deg,#f9fafb,#f3f4f6,#e5e7eb)",
    quote: "Rest is not weakness — it's how you come back stronger 🌙",
    song: "Uyirey Uyirey — Haricharan",
    activity: "Put everything down. Take a proper rest. You've earned it more than you know 💤",
    vibe: "grey",
  },
  {
    key: "excited",
    emoji: "🎉",
    label: "Excited",
    color: "#f97316",
    bg: "linear-gradient(135deg,#fff7ed,#ffedd5,#fef3c7)",
    quote: "That energy you have right now? Channel it — big things are coming for you 🚀",
    song: "Kaadhal Vandhadhum — D. Imman",
    activity: "Do one thing today that scares you a little — the good kind of scared 🎯",
    vibe: "orange",
  },
];

export default function MoodBoard() {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const pick = (mood) => {
    if (selected?.key === mood.key) return;
    setRevealed(false);
    setSelected(mood);
    setTimeout(() => setRevealed(true), 200);
  };

  return (
    <div
      className="moodboard-page"
      style={{ background: selected ? selected.bg : "linear-gradient(135deg,#fff0f5,#fce4f0)", transition: "background 0.6s ease" }}
    >
      <div className="mb-hero">
        <h1 className="mb-title" style={{ color: selected ? selected.color : "#c71585" }}>
          🌈 Mood Board
        </h1>
        <p className="mb-sub">Tell Surya how you're feeling — he has something for every mood 💙</p>
      </div>

      {/* Mood picker */}
      <div className="mb-picker">
        {MOODS.map(m => (
          <button
            key={m.key}
            className={`mb-mood-btn ${selected?.key === m.key ? "mb-active" : ""}`}
            style={selected?.key === m.key ? { background: m.color, borderColor: m.color } : {}}
            onClick={() => pick(m)}
          >
            <span className="mb-mood-emoji">{m.emoji}</span>
            <span className="mb-mood-label" style={selected?.key === m.key ? { color:"white" } : {}}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Response card */}
      {selected && (
        <div className={`mb-response ${revealed ? "mb-revealed" : ""}`}>
          {/* Quote */}
          <div className="mb-card mb-quote-card" style={{ borderColor: selected.color }}>
            <div className="mb-card-icon" style={{ color: selected.color }}>💬</div>
            <p className="mb-quote-text" style={{ color: selected.color }}>
              "{selected.quote}"
            </p>
            <p className="mb-from">— Surya 💙</p>
          </div>

          {/* Song */}
          <div className="mb-card mb-song-card" style={{ borderColor: selected.color }}>
            <div className="mb-card-icon">🎵</div>
            <p className="mb-card-label">Surya's song pick for this mood:</p>
            <p className="mb-song-name" style={{ color: selected.color }}>{selected.song}</p>
          </div>

          {/* Activity */}
          <div className="mb-card mb-activity-card" style={{ borderColor: selected.color }}>
            <div className="mb-card-icon">🌟</div>
            <p className="mb-card-label">Surya says — try this right now:</p>
            <p className="mb-activity-text">{selected.activity}</p>
          </div>

          {/* Big mood emoji */}
          <div className="mb-big-emoji">{selected.emoji}</div>
        </div>
      )}

      {!selected && (
        <div className="mb-placeholder">
          <p>Tap a mood above and Surya will respond 💙</p>
        </div>
      )}

      <div className="dream-footer" style={{ marginTop: "50px" }}>
        <p>"Whatever mood you're in, I love you in all of them 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
