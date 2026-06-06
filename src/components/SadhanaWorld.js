import { useState, useRef, useCallback } from "react";

/* ══════════════════════════════════════════
   1. COMPLIMENT MACHINE
══════════════════════════════════════════ */
const COMPLIMENTS = [
  "You have the most beautiful soul I have ever encountered 🌸",
  "Your smile is literally the highlight of my entire day 🌟",
  "You are so much stronger than you know, and I see it every day 💪",
  "The way your mind works is one of my favourite things about you 💭",
  "You make every room feel warmer just by walking into it 🌻",
  "I fall in love with you a little more every single time you laugh 💖",
  "You are rare — the kind of person the world doesn't see enough of 💎",
  "Your kindness could heal the whole world if you let it 🌍",
  "The way you care about people is extraordinary 💗",
  "You are not just beautiful on the outside — you glow from within ✨",
  "Every time I think I know how special you are, you surprise me again 🦋",
  "Being loved by you is the greatest gift of my entire life 💍",
];

function ComplimentMachine() {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [burst, setBurst] = useState(false);
  const usedRef = useRef([]);

  const getNext = useCallback(() => {
    if (usedRef.current.length >= COMPLIMENTS.length) usedRef.current = [];
    let next;
    do { next = Math.floor(Math.random() * COMPLIMENTS.length); }
    while (usedRef.current.includes(next));
    usedRef.current.push(next);
    return next;
  }, []);

  const generate = () => {
    if (typing) return;
    const n = getNext();
    setIdx(n);
    setDisplayed("");
    setTyping(true);
    setBurst(true);
    setTimeout(() => setBurst(false), 600);

    let i = 0;
    const text = COMPLIMENTS[n];
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer); setTyping(false); }
    }, 35);
  };

  return (
    <div className="compliment-wrap">
      <h3 className="compliment-heading">💬 Surya's Compliment Machine</h3>
      <p className="compliment-sub">Press the button — Surya left one just for you 🌸</p>
      <div className={`compliment-card ${burst ? "compliment-burst" : ""}`}>
        {idx === -1 ? (
          <p className="compliment-placeholder">Press below to receive your compliment 💕</p>
        ) : (
          <p className="compliment-text">
            "{displayed}{typing ? <span className="compliment-cursor">|</span> : ""}"
          </p>
        )}
        <p className="compliment-from">— Surya 💙</p>
      </div>
      <button className="compliment-btn" onClick={generate} disabled={typing}>
        {typing ? "Writing... ✍️" : idx === -1 ? "Get My Compliment 💖" : "Another One 💫"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   2. OUR PLAYLIST
══════════════════════════════════════════ */
const PLAYLIST = [
  {
    title: "Oru Adaar Love",
    artist: "Omar Lulu",
    mood: "💖 Our Vibe",
    color: "#ff69b4",
    note: "This song always reminds me of you — the innocence, the beauty, just like the day I first saw you at tuition.",
    emoji: "🎵",
  },
  {
    title: "Nenjame",
    artist: "Yuvan Shankar Raja",
    mood: "🌙 Late Night",
    color: "#7c3aed",
    note: "I listen to this every night thinking of you. Every lyric feels like it was written for us.",
    emoji: "🎶",
  },
  {
    title: "Kaadhal Vandhadhum",
    artist: "D. Imman",
    mood: "🌸 First Love",
    color: "#ec4899",
    note: "The song that plays in my heart every time I think of the moment you proposed to me.",
    emoji: "💕",
  },
  {
    title: "Munbe Vaa",
    artist: "A.R. Rahman",
    mood: "✨ Forever",
    color: "#f59e0b",
    note: "This is OUR song. When this plays, the whole world disappears and it's just you and me.",
    emoji: "🌟",
  },
  {
    title: "Kannazhaga",
    artist: "Dhibu Ninan Thomas",
    mood: "🥺 Miss You",
    color: "#3b82f6",
    note: "Every word of this song is exactly what I feel when I can't see you. You are my kannazhaga.",
    emoji: "💙",
  },
];

function OurPlaylist() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="playlist-wrap">
      <h3 className="playlist-heading">🎵 Our Playlist</h3>
      <p className="playlist-sub">Songs that hold our story 🌸</p>
      <div className="playlist-list">
        {PLAYLIST.map((s, i) => (
          <div
            key={i}
            className={`playlist-item ${expanded === i ? "expanded" : ""}`}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{ borderLeftColor: s.color }}
          >
            <div className="playlist-row">
              <div className="playlist-emoji">{s.emoji}</div>
              <div className="playlist-info">
                <span className="playlist-title">{s.title}</span>
                <span className="playlist-artist">{s.artist}</span>
              </div>
              <span className="playlist-mood" style={{ background: s.color + "33", color: s.color }}>{s.mood}</span>
              <span className="playlist-chevron">{expanded === i ? "▲" : "▼"}</span>
            </div>
            {expanded === i && (
              <div className="playlist-note">
                <p>"{s.note}"</p>
                <span className="playlist-note-from">— Surya 💙</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   3. SPECIAL DATES CALENDAR
══════════════════════════════════════════ */
const SPECIAL_DATES = [
  { label: "We First Met 🌟",       date: "2023-06-19", emoji: "💫", color: "#f59e0b", past: true  },
  { label: "Surya Proposed 💍",     date: "2026-05-17", emoji: "💍", color: "#ec4899", past: true  },
  { label: "Sadhana Proposed 💗",   date: "2026-05-18", emoji: "💗", color: "#c71585", past: true  },
  { label: "We Both Said Yes 🥂",   date: "2026-05-19", emoji: "🥂", color: "#7c3aed", past: true  },
  { label: "Our Journey Began 🌸",  date: "2026-05-20", emoji: "🌸", color: "#10b981", past: true  },
  { label: "Sadhana's Birthday 🎂", date: "2008-02-29", emoji: "🎂", color: "#f87171", past: false, yearly: true },
  { label: "Our 1st Anniversary 🎉",date: "2027-05-20", emoji: "🎉", color: "#ff69b4", past: false },
  { label: "Our Special Day 💒",    date: "2027-05-20", emoji: "💒", color: "#c71585", past: false },
];

function daysUntil(dateStr, yearly = false) {
  const now = new Date();
  now.setHours(0,0,0,0);
  let d = new Date(dateStr);
  if (yearly) {
    d = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (d < now) d = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
  }
  const diff = d - now;
  return Math.ceil(diff / 86400000);
}

function daysSince(dateStr) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(dateStr);
  return Math.floor((now - d) / 86400000);
}

function SpecialDates() {
  return (
    <div className="dates-wrap">
      <h3 className="dates-heading">📅 Our Special Dates</h3>
      <p className="dates-sub">Every date that changed our story 💌</p>
      <div className="dates-list">
        {SPECIAL_DATES.map((d, i) => {
          const isPast = d.past;
          const days = isPast ? daysSince(d.date) : daysUntil(d.date, d.yearly);
          return (
            <div key={i} className="date-item" style={{ borderColor: d.color }}>
              <div className="date-emoji" style={{ background: d.color + "22" }}>{d.emoji}</div>
              <div className="date-info">
                <span className="date-label" style={{ color: d.color }}>{d.label}</span>
                <span className="date-val">
                  {new Date(d.date).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}
                </span>
              </div>
              <div className="date-pill" style={{ background: d.color }}>
                {isPast ? `${days}d ago` : days === 0 ? "Today 🎉" : `in ${days}d`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   4. POLAROID CORKBOARD
══════════════════════════════════════════ */
const POLAROIDS = [
  { src: "/images/photo1.jpg.jpg",   caption: "The day it all began 💫",     rot: -3  },
  { src: "/images/photo2.jpg.jpeg",  caption: "The night I said I love you 💍", rot: 4 },
  { src: "/images/photo3.jpg.jpeg",  caption: "She said yes back 💗",        rot: -5  },
  { src: "/images/photo4.jpg.jpeg",  caption: "Together forever 🥂",         rot: 2   },
  { src: "/images/photo5.jpg.jpeg",  caption: "Our journey starts 🌸",       rot: -2  },
  { src: "/images/photo11.jpg.jpg",  caption: "Every smile counts 😊",       rot: 5   },
  { src: "/images/photo13.jpg.jpg",  caption: "My favourite person 💓",      rot: -4  },
  { src: "/images/photo16.jpg.jpg",  caption: "You are my everything ✨",    rot: 3   },
];

function PolaroidBoard() {
  const [active, setActive] = useState(null);

  return (
    <div className="polaroid-wrap">
      <h3 className="polaroid-heading">📸 Our Corkboard</h3>
      <p className="polaroid-sub">Tap any photo for a closer look 💕</p>
      <div className="corkboard">
        {POLAROIDS.map((p, i) => (
          <div
            key={i}
            className="polaroid"
            style={{ transform: `rotate(${p.rot}deg)` }}
            onClick={() => setActive(active === i ? null : i)}
          >
            <div className="polaroid-pin" />
            <img src={p.src} alt={p.caption} className="polaroid-img" />
            <p className="polaroid-caption">{p.caption}</p>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div className="polaroid-lightbox" onClick={() => setActive(null)}>
          <div className="polaroid-lb-card" onClick={e => e.stopPropagation()}>
            <img src={POLAROIDS[active].src} alt="" className="polaroid-lb-img" />
            <p className="polaroid-lb-caption">{POLAROIDS[active].caption}</p>
            <button className="polaroid-lb-close" onClick={() => setActive(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   5. LOVE PERCENTAGE METER
══════════════════════════════════════════ */
const LOVE_FACTS = [
  "Surya thinks about Sadhana every 4 minutes on average 💭",
  "Surya's heart rate increases by 29% when he sees her 💓",
  "He has smiled because of her 10,000+ times since they met 😊",
  "The distance between them can never change how much he loves her 🌍",
  "He would choose her again in every single lifetime 🌀",
];

function LoveMeter() {
  const [pct, setPct]       = useState(0);
  const [fact, setFact]     = useState(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    if (running) return;
    setRunning(true);
    setPct(0);
    setFact(null);
    let current = 0;
    const target = 100;
    const step = () => {
      current += Math.random() * 3 + 1;
      if (current >= target) {
        setPct(100);
        setFact(LOVE_FACTS[Math.floor(Math.random() * LOVE_FACTS.length)]);
        setRunning(false);
      } else {
        setPct(Math.floor(current));
        setTimeout(step, 30);
      }
    };
    setTimeout(step, 100);
  };

  const color = pct < 50 ? "#ff85b3" : pct < 80 ? "#ec4899" : "#c71585";

  return (
    <div className="love-meter-wrap">
      <h3 className="love-meter-heading">💯 Love Percentage Meter</h3>
      <p className="love-meter-sub">How much does Surya love Sadhana? 🌸</p>
      <div className="love-meter-bar-wrap">
        <div className="love-meter-bar" style={{ width: `${pct}%`, background: color }} />
        <span className="love-meter-pct">{pct}%</span>
      </div>
      <div className="love-meter-icons">
        {[...Array(10)].map((_, i) => (
          <span key={i} style={{ opacity: pct >= (i+1)*10 ? 1 : 0.2, transition:"opacity 0.3s", fontSize:"1.4rem" }}>❤️</span>
        ))}
      </div>
      <button className="love-meter-btn" onClick={run} disabled={running}>
        {running ? "Calculating... 💓" : pct === 100 ? "Measure Again 💖" : "Measure Love 💗"}
      </button>
      {fact && (
        <div className="love-meter-fact">
          <p>✨ {fact}</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function SadhanaWorld({ setPage }) {
  return (
    <div className="sadhana-world-page">
      <div className="sadhana-world-hero">
        <h1 className="sadhana-world-title">Sadhana's World 🌸</h1>
        <p className="sadhana-world-sub">Everything here was made with love, just for you 💗</p>
      </div>

      <ComplimentMachine />
      <LoveMeter />
      <OurPlaylist />
      <SpecialDates />
      <PolaroidBoard />

      <div className="dream-footer" style={{ marginTop:"50px" }}>
        <p>"This whole world is better because you are in it 🌍"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
