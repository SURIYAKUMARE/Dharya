import { useState, useEffect } from "react";

/* ══════════════════════════════════════════
   Time-of-day greeting
══════════════════════════════════════════ */
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const TIME_DATA = {
  morning: {
    emoji: "☀️",
    sky: "linear-gradient(180deg,#ffe0b2 0%,#fff9c4 50%,#e3f2fd 100%)",
    greeting: "Good Morning, Sadhana ☀️",
    sub: "A brand new day — and my first thought was you 🌸",
    bg: "#fff9c4",
  },
  afternoon: {
    emoji: "🌤️",
    sky: "linear-gradient(180deg,#e3f2fd 0%,#b3e5fc 50%,#e1f5fe 100%)",
    greeting: "Good Afternoon, Sadhana 🌤️",
    sub: "Hope your day is as beautiful as you are 💙",
    bg: "#e3f2fd",
  },
  evening: {
    emoji: "🌅",
    sky: "linear-gradient(180deg,#ff7043 0%,#ff8a65 30%,#ffb74d 60%,#ffe0b2 100%)",
    greeting: "Good Evening, Sadhana 🌅",
    sub: "The day is ending — and I'm thinking of you 💖",
    bg: "#fff3e0",
  },
  night: {
    emoji: "🌙",
    sky: "linear-gradient(180deg,#0d0d2b 0%,#1a1a4e 40%,#2d1b69 100%)",
    greeting: "Good Night, My Moon 🌙",
    sub: "The stars are out — and so is my love for you ✨",
    bg: "#1a1a4e",
  },
};

/* ══════════════════════════════════════════
   Tonight's Promises (rotate daily)
══════════════════════════════════════════ */
const PROMISES = [
  "I promise to always be your safe place 💙",
  "I promise to make you smile every single day 🌸",
  "I promise to never let you feel alone 🫂",
  "I promise to love you on your hardest days, not just the easy ones 💍",
  "I promise to always choose you, in every version of our story 🌟",
  "I promise that your dreams will always matter to me 💫",
  "I promise to grow with you, not just beside you 🌱",
  "I promise to be the reason you believe in forever 💗",
  "I promise to still look at you the same way when we're old 🥰",
  "I promise to fight for us, every single time 💪",
  "I promise to be your biggest fan, always 🌙",
  "I promise that the best days are still ahead of us 🌅",
];

/* ══════════════════════════════════════════
   Shooting Star Wish
══════════════════════════════════════════ */
const STAR_WISHES = [
  "May tomorrow bring you something that makes your heart smile 🌟",
  "May you wake up tomorrow feeling loved and at peace 🌸",
  "May every dream you dream tonight be beautiful 💫",
  "May you always know that somewhere, Surya is thinking of you 💙",
  "May the universe give back everything you deserve 💍",
  "May your heart feel as light as the stars tonight ✨",
];

function ShootingStar({ onWish }) {
  const [shot, setShot]     = useState(false);
  const [wished, setWished] = useState(false);
  const [wish,   setWish]   = useState("");

  const shoot = () => {
    if (shot) return;
    setShot(true);
    setTimeout(() => {
      const w = STAR_WISHES[Math.floor(Math.random() * STAR_WISHES.length)];
      setWish(w);
      setWished(true);
      onWish && onWish(w);
    }, 1200);
  };

  return (
    <div className="star-wish-wrap" onClick={shoot} style={{ cursor: shot ? "default" : "pointer" }}>
      {!wished && (
        <>
          <div className={`wishing-star ${shot ? "star-shooting" : "star-idle"}`}>⭐</div>
          {!shot && <p className="star-hint">Tap the star to make a wish 🌙</p>}
        </>
      )}
      {wished && (
        <div className="wish-revealed">
          <div className="wish-revealed-star">🌟</div>
          <p className="wish-revealed-text">"{wish}"</p>
          <p className="wish-from">Your wish has been sent to the universe 💫</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Dream Selector (what will you dream of?)
══════════════════════════════════════════ */
const DREAM_OPTIONS = [
  { emoji:"🏡", label:"Our Home"         },
  { emoji:"✈️", label:"Our Trip"         },
  { emoji:"💍", label:"Our Wedding"      },
  { emoji:"🌅", label:"A Beautiful Day"  },
  { emoji:"🫂", label:"A Long Hug"       },
  { emoji:"🌟", label:"Our Future"       },
];

function DreamSelector() {
  const [picked, setPicked] = useState(null);
  const [note,   setNote]   = useState("");

  const NOTES = {
    "Our Home":       "Dream of us — a cozy home, soft mornings, and forever together 🏡💙",
    "Our Trip":       "Dream of the places we'll go, side by side, without a worry in the world ✈️🌸",
    "Our Wedding":    "Dream of that day — I promise it's going to be the most beautiful day of your life 💍🌟",
    "A Beautiful Day":"Dream of a perfect day where everything is just right and we're in it together 🌅💖",
    "A Long Hug":     "Dream of a hug that lasts as long as you need — I'm not letting go 🫂💙",
    "Our Future":     "Dream of everything ahead — we haven't even hit our best chapters yet 🌟💫",
  };

  const pick = (label) => {
    setPicked(label);
    setNote(NOTES[label]);
  };

  return (
    <div className="dream-sel-wrap">
      <h4 className="dream-sel-heading">What will you dream about tonight? 🌙</h4>
      <div className="dream-sel-grid">
        {DREAM_OPTIONS.map(d => (
          <button
            key={d.label}
            className={`dream-sel-btn ${picked === d.label ? "dream-sel-active" : ""}`}
            onClick={() => pick(d.label)}
          >
            <span className="dream-sel-emoji">{d.emoji}</span>
            <span className="dream-sel-label">{d.label}</span>
          </button>
        ))}
      </div>
      {note && (
        <div className="dream-sel-note">
          <p>"{note}"</p>
          <span>— Surya 💙</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Love Meter — "How much did you feel loved today?"
══════════════════════════════════════════ */
function DailyLoveFeel() {
  const [rating, setRating]   = useState(null);
  const [saved,  setSaved]    = useState(() => localStorage.getItem("tp_rating_"+new Date().toDateString()));

  const FEELS = [
    { val:1, emoji:"😶", label:"A little" },
    { val:2, emoji:"🙂", label:"Okay"     },
    { val:3, emoji:"😊", label:"Good"     },
    { val:4, emoji:"🥰", label:"A lot"    },
    { val:5, emoji:"💖", label:"Endlessly"},
  ];

  const RESPONSES = {
    1: "Even a little is a start. I'm going to work harder to make sure you feel it more tomorrow 💙",
    2: "I'll do better tomorrow. You deserve to feel it completely, every day 🌸",
    3: "Good! But I want you to feel it even more. Working on it 💙",
    4: "That makes me so happy 🥰 You deserve to feel loved like this every single day.",
    5: "Endlessly — that's exactly how I love you too 💍🌟",
  };

  const save = (val) => {
    setRating(val);
    localStorage.setItem("tp_rating_"+new Date().toDateString(), val);
    setSaved(val);
  };

  return (
    <div className="daily-feel-wrap">
      <h4 className="daily-feel-heading">💓 How loved did you feel today?</h4>
      {saved ? (
        <div className="daily-feel-saved">
          <p className="daily-feel-saved-emoji">{FEELS[Number(saved)-1].emoji}</p>
          <p className="daily-feel-saved-label">{FEELS[Number(saved)-1].label}</p>
          <p className="daily-feel-response">"{RESPONSES[Number(saved)]}"</p>
          <p className="daily-feel-from">— Surya 💙</p>
        </div>
      ) : (
        <>
          <div className="daily-feel-options">
            {FEELS.map(f => (
              <button
                key={f.val}
                className={`daily-feel-btn ${rating === f.val ? "daily-feel-active" : ""}`}
                onClick={() => save(f.val)}
              >
                <span className="daily-feel-emoji">{f.emoji}</span>
                <span className="daily-feel-label">{f.label}</span>
              </button>
            ))}
          </div>
          {rating && <p className="daily-feel-response">"{RESPONSES[rating]}"</p>}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function TonightPromise() {
  const [tod,     setTod]     = useState(getTimeOfDay());
  const [promise, setPromise] = useState("");

  useEffect(() => {
    const id = setInterval(() => setTod(getTimeOfDay()), 60000);
    // pick today's promise
    const dayIdx = Math.floor(Date.now() / 86400000) % PROMISES.length;
    setPromise(PROMISES[dayIdx]);
    return () => clearInterval(id);
  }, []);

  const data = TIME_DATA[tod];
  const isNight = tod === "night";

  return (
    <div className="tonight-page" style={{ background: data.sky }}>
      {/* Stars (only at night) */}
      {isNight && (
        <div className="tonight-stars">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="tonight-star-dot"
              style={{
                left: `${Math.random()*100}%`,
                top:  `${Math.random()*50}%`,
                animationDelay: `${Math.random()*3}s`,
                fontSize: `${8+Math.random()*8}px`,
              }}
            >✦</span>
          ))}
        </div>
      )}

      {/* Hero greeting */}
      <div className="tonight-hero">
        <div className="tonight-emoji">{data.emoji}</div>
        <h1 className="tonight-greeting" style={{ color: isNight ? "#ffd700" : "#c71585" }}>
          {data.greeting}
        </h1>
        <p className="tonight-sub" style={{ color: isNight ? "rgba(255,255,255,0.75)" : "#888" }}>
          {data.sub}
        </p>
      </div>

      {/* Tonight's Promise */}
      <div className="tonight-promise-card" style={{ background: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)" }}>
        <div className="tonight-promise-icon">💍</div>
        <p className="tonight-promise-label" style={{ color: isNight ? "#ffd700" : "#c71585" }}>
          Tonight's Promise from Surya
        </p>
        <p className="tonight-promise-text" style={{ color: isNight ? "white" : "#444" }}>
          "{promise}"
        </p>
      </div>

      {/* Shooting star wish */}
      <ShootingStar />

      {/* Dream selector */}
      <div className="tonight-section" style={{ background: isNight ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.85)" }}>
        <DreamSelector />
      </div>

      {/* How loved today */}
      <div className="tonight-section" style={{ background: isNight ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.85)" }}>
        <DailyLoveFeel />
      </div>

      {/* Footer */}
      <div className="tonight-footer" style={{ color: isNight ? "rgba(255,255,255,0.5)" : "#bbb" }}>
        "No matter what time it is — I'm always thinking of you 💙"<br />
        <span style={{ fontFamily:"Dancing Script, cursive", fontSize:"1.3rem" }}>Surya &amp; Sadhana — Forever 💍</span>
      </div>
    </div>
  );
}
