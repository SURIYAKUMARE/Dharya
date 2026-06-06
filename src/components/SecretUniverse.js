import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════
   1. HEARTBEAT COUNTER
══════════════════════════════════════════ */
const MET_DATE = new Date("2023-06-19T00:00:00");
const BPM = 72;

function HeartbeatCounter() {
  const [beats, setBeats] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const calcBeats = () => {
      const secs = (new Date() - MET_DATE) / 1000;
      return Math.floor(secs * (BPM / 60));
    };
    setBeats(calcBeats());
    const id = setInterval(() => {
      setBeats(calcBeats());
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }, 833); // ~72bpm
    return () => clearInterval(id);
  }, []);

  const fmt = (n) => n.toLocaleString("en-IN");

  return (
    <div className="hb-wrap">
      <div className={`hb-heart ${pulse ? "hb-pulse" : ""}`}>❤️</div>
      <div className="hb-num">{fmt(beats)}</div>
      <p className="hb-label">heartbeats since we met</p>
      <p className="hb-sub">Every single one was for you 💙</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   2. LOVE CARD OF THE DAY
══════════════════════════════════════════ */
const DAILY_CARDS = [
  { bg: "linear-gradient(135deg,#ff85b3,#c71585)", emoji: "🌹", msg: "Today I woke up thinking of you. That's been my routine since 19 June 2023.", tag: "Morning Thought" },
  { bg: "linear-gradient(135deg,#a78bfa,#7c3aed)", emoji: "🌙", msg: "In another universe, I still find you. In every universe, I choose you.", tag: "Cosmic Love" },
  { bg: "linear-gradient(135deg,#fbbf24,#f59e0b)", emoji: "🌻", msg: "You are my favourite hello and my hardest goodbye.", tag: "Simple Truth" },
  { bg: "linear-gradient(135deg,#34d399,#059669)", emoji: "🌿", msg: "Growing with you is the most beautiful thing happening in my life.", tag: "Growth" },
  { bg: "linear-gradient(135deg,#60a5fa,#2563eb)", emoji: "🌊", msg: "Like the ocean always returns to the shore, my heart always returns to you.", tag: "Always" },
  { bg: "linear-gradient(135deg,#f87171,#dc2626)", emoji: "🔥", msg: "You make ordinary moments feel extraordinary just by being in them.", tag: "Magic" },
  { bg: "linear-gradient(135deg,#f9a8d4,#ec4899)", emoji: "🌸", msg: "If love were a language, I'd be fluent only in you.", tag: "Language of Love" },
];

function DailyLoveCard() {
  const today = new Date();
  const dayIdx = (today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate()) % DAILY_CARDS.length;
  const card = DAILY_CARDS[dayIdx];
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="daily-card-wrap">
      <h3 className="daily-card-heading">🎴 Love Card of the Day</h3>
      <p className="daily-card-sub">Changes every day — only for you 💌</p>
      <div className={`daily-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)}>
        <div className="daily-card-front" style={{ background: card.bg }}>
          <div className="daily-card-emoji">{card.emoji}</div>
          <div className="daily-card-tag">{card.tag}</div>
          <p className="daily-card-tap">Tap to reveal 💕</p>
        </div>
        <div className="daily-card-back">
          <div className="daily-card-back-emoji">{card.emoji}</div>
          <p className="daily-card-msg">"{card.msg}"</p>
          <p className="daily-card-from">— Surya 💙</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   3. SCRATCH & REVEAL
══════════════════════════════════════════ */
const SCRATCH_MESSAGES = [
  "You are the best thing that has ever happened to me 💍",
  "I will love you every single day for the rest of my life 🌟",
  "Sadhana + Surya = Forever ❤️",
  "You are my home, my heart, my everything 🏡",
  "One day I will make you the happiest person alive 💍",
];

function ScratchCard() {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [pct, setPct] = useState(0);
  const isDrawing = useRef(false);
  const msgIdx = useRef(Math.floor(new Date().getDate() % SCRATCH_MESSAGES.length));

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = useCallback((e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // calc revealed %
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) clear++;
    }
    const p = Math.round((clear / (canvas.width * canvas.height)) * 100);
    setPct(p);
    if (p > 60) setRevealed(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#c71585";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // pattern overlay
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < 20; i++) {
      ctx.font = "18px serif";
      ctx.fillText("💖", (i % 5) * 60 + 10, Math.floor(i / 5) * 50 + 20);
    }
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Scratch Me ✨", canvas.width / 2, canvas.height / 2);
  }, []);

  const reset = () => {
    setRevealed(false);
    setPct(0);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#c71585";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Scratch Me ✨", canvas.width / 2, canvas.height / 2);
    msgIdx.current = Math.floor(Math.random() * SCRATCH_MESSAGES.length);
  };

  return (
    <div className="scratch-wrap">
      <h3 className="scratch-heading">🎰 Scratch & Reveal</h3>
      <p className="scratch-sub">Scratch to uncover a secret message 💕</p>
      <div className="scratch-card-wrap">
        <div className="scratch-message">{SCRATCH_MESSAGES[msgIdx.current]}</div>
        <canvas
          ref={canvasRef}
          width={300} height={160}
          className={`scratch-canvas ${revealed ? "scratch-done" : ""}`}
          onMouseDown={() => (isDrawing.current = true)}
          onMouseUp={() => (isDrawing.current = false)}
          onMouseMove={scratch}
          onTouchStart={(e) => { e.preventDefault(); isDrawing.current = true; }}
          onTouchEnd={() => (isDrawing.current = false)}
          onTouchMove={(e) => { e.preventDefault(); scratch(e); }}
          style={{ touchAction: "none" }}
        />
      </div>
      <div className="scratch-progress">
        <div className="scratch-prog-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {revealed && (
        <button className="scratch-again-btn" onClick={reset}>Scratch Again 💖</button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   4. SECRET MESSAGE WALL
══════════════════════════════════════════ */
const SECRET_MSGS = [
  { hint: "Our first meeting date (DD/MM/YYYY)", key: "19/06/2023", msg: "That day, my heart said: 'She's the one.' I've never doubted it since. 💙" },
  { hint: "The month we started (word, e.g. May)", key: "may",       msg: "May 2026 — the month the rest of my life began. Every May will mean you now. 🌸" },
  { hint: "My nickname for you (one word 🥰)",    key: "moon",       msg: "My moon — you light up my darkest nights without even knowing it. 🌙💕" },
  { hint: "How many dreams you wrote (number)",   key: "5",          msg: "5 dreams — and I promise to make every single one come true, one by one. 💍" },
];

function SecretMessageWall() {
  const [unlocked, setUnlocked] = useState({});
  const [inputs,   setInputs]   = useState(Array(SECRET_MSGS.length).fill(""));
  const [errors,   setErrors]   = useState(Array(SECRET_MSGS.length).fill(false));
  const [sparks,   setSparks]   = useState(null);

  const tryUnlock = (i) => {
    if (inputs[i].trim().toLowerCase() === SECRET_MSGS[i].key.toLowerCase()) {
      setUnlocked(u => ({ ...u, [i]: true }));
      setSparks(i);
      setTimeout(() => setSparks(null), 1000);
    } else {
      const e = [...errors]; e[i] = true; setErrors(e);
      setTimeout(() => { const e2 = [...errors]; e2[i] = false; setErrors(e2); }, 800);
    }
  };

  return (
    <div className="secret-wall">
      <h3 className="secret-heading">🔐 Secret Messages</h3>
      <p className="secret-sub">Surya hid messages only you can unlock 💌</p>
      <div className="secret-list">
        {SECRET_MSGS.map((s, i) => (
          <div key={i} className={`secret-item ${unlocked[i] ? "unlocked" : ""}`}>
            {sparks === i && (
              <div className="secret-sparks">
                {["✨","💖","🌟","💫","🎉"].map((sp, si) => (
                  <span key={si} className="secret-spark" style={{ animationDelay:`${si*0.08}s` }}>{sp}</span>
                ))}
              </div>
            )}
            <div className="secret-lock-icon">{unlocked[i] ? "🔓" : "🔒"}</div>
            <p className="secret-hint">Hint: {s.hint}</p>
            {!unlocked[i] ? (
              <div className="secret-input-row">
                <input
                  className={`secret-input ${errors[i] ? "secret-error" : ""}`}
                  placeholder="Type the answer..."
                  value={inputs[i]}
                  onChange={e => { const n=[...inputs]; n[i]=e.target.value; setInputs(n); }}
                  onKeyDown={e => e.key === "Enter" && tryUnlock(i)}
                />
                <button className="secret-unlock-btn" onClick={() => tryUnlock(i)}>Unlock 🗝️</button>
              </div>
            ) : (
              <div className="secret-msg-revealed">
                <p className="secret-msg-text">"{s.msg}"</p>
                <span className="secret-from">— Surya 💙</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="secret-footer">
        {Object.keys(unlocked).length} / {SECRET_MSGS.length} messages unlocked 🌟
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════
   5. OUR NIGHT SKY  (memory star map)
══════════════════════════════════════════ */
const STARS = [
  { x: 15, y: 18, name: "First Smile",     size: 3.5, color: "#ffd700" },
  { x: 45, y: 12, name: "Tuition Days",    size: 2.5, color: "#ff85b3" },
  { x: 72, y: 22, name: "First Hello",     size: 3,   color: "#a78bfa" },
  { x: 28, y: 38, name: "First Laugh",     size: 2,   color: "#34d399" },
  { x: 60, y: 42, name: "I Proposed",      size: 4,   color: "#ff69b4" },
  { x: 85, y: 32, name: "She Said Yes",    size: 4.5, color: "#ffd700" },
  { x: 20, y: 62, name: "Our Journey",     size: 2.5, color: "#60a5fa" },
  { x: 50, y: 70, name: "Our Song",        size: 3,   color: "#f9a8d4" },
  { x: 78, y: 65, name: "Future Dreams",   size: 3.5, color: "#c71585" },
  { x: 35, y: 85, name: "Forever Starts",  size: 5,   color: "#ffd700" },
];

function NightSky() {
  const [active, setActive] = useState(null);

  return (
    <div className="sky-wrap">
      <h3 className="sky-heading">🌌 Our Night Sky</h3>
      <p className="sky-sub">The sky on 19 June 2023 — each star is a memory 🌟</p>
      <div className="sky-canvas">
        {/* Constellation lines */}
        <svg className="sky-svg">
          {STARS.slice(0, -1).map((s, i) => (
            <line key={i}
              x1={`${s.x}%`} y1={`${s.y}%`}
              x2={`${STARS[i+1].x}%`} y2={`${STARS[i+1].y}%`}
              stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4"
            />
          ))}
        </svg>
        {STARS.map((s, i) => (
          <div
            key={i}
            className={`sky-star ${active === i ? "sky-star-active" : ""}`}
            style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size*6, height:s.size*6, background:s.color, boxShadow:`0 0 ${s.size*4}px ${s.color}` }}
            onClick={() => setActive(active === i ? null : i)}
          >
            {active === i && (
              <div className="sky-star-tooltip">{s.name}</div>
            )}
          </div>
        ))}
        {/* Date label */}
        <div className="sky-date">19 June 2023 · The Night We Were Meant To Meet ✨</div>
      </div>
      <p className="sky-hint">Tap any star to see the memory 💫</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function SecretUniverse({ setPage }) {
  return (
    <div className="universe-page">
      <div className="universe-hero">
        <h1 className="universe-title">Our Secret Universe 🌌</h1>
        <p className="universe-sub">A world only Surya built — only for Sadhana 💗</p>
      </div>

      {/* Heartbeat */}
      <HeartbeatCounter />

      {/* Night Sky */}
      <NightSky />

      {/* Daily Card */}
      <DailyLoveCard />

      {/* Scratch card */}
      <ScratchCard />

      {/* Secret messages */}
      <SecretMessageWall />

      <div className="dream-footer" style={{ marginTop:"50px" }}>
        <p>"You are my universe, Sadhana 🌌"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
