import { useState } from "react";

const CORRECT_USER = "DHARYA";
const USERS = {
  "29/02/2008": "sadhana",
  "09/10/2007": "surya",
};

// Theme per user
const THEMES = {
  sadhana: { color:"#c71585", light:"#ff69b4", pale:"#fff0f8", border:"#f9a8c9", bg:"linear-gradient(135deg,#fff0f5,#ffe4e1)", avatar:"💗", burst:"💖", greeting:"Welcome back, Sadhana 🌸" },
  surya:   { color:"#15803d", light:"#4ade80", pale:"#f0fdf4", border:"#86efac", bg:"linear-gradient(135deg,#f0fdf4,#dcfce7)", avatar:"💙", burst:"💚", greeting:"Welcome back, Surya 💙"    },
  default: { color:"#c71585", light:"#ff69b4", pale:"#fff0f8", border:"#f9a8c9", bg:"linear-gradient(135deg,#fff0f5,#ffe4e1)", avatar:"💗", burst:"💖", greeting:"Welcome Back"              },
};

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [shake,    setShake]    = useState(false);
  const [bursts,   setBursts]   = useState([]);

  // Detect who's typing based on password
  const detectedUser = USERS[password] || "default";
  const theme = THEMES[detectedUser];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().toUpperCase() === CORRECT_USER && USERS[password]) {
      // burst animation
      setBursts(Array.from({ length: 14 }, (_, i) => ({
        id: i, left:`${4+i*7}%`, delay:`${i*0.07}s`, dur:`${1.2+Math.random()*0.6}s`,
      })));
      setTimeout(() => onLogin(USERS[password]), 900);
    } else {
      setError(username.trim().toUpperCase() !== CORRECT_USER ? "Hmm, that name doesn't match 💭" : "Wrong password, try again 🔐");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="login-bg" style={{ background: theme.bg, transition:"background 0.5s" }}>
      {/* Floating bg emojis */}
      <div className="login-hearts-bg">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="login-bg-heart" style={{ left:`${i*10+2}%`, animationDelay:`${i*1.1}s`, animationDuration:`${7+i}s`, fontSize:`${18+(i%3)*10}px` }}>
            {detectedUser === "surya" ? ["🌿","🍃","🌱","💚","✨"][i%5] : ["💖","💗","💓","💕","🌸"][i%5]}
          </span>
        ))}
      </div>

      {/* Burst on success */}
      {bursts.map(h => (
        <span key={h.id} className="login-burst-heart" style={{ left:h.left, animationDelay:h.delay, animationDuration:h.dur }}>
          {theme.burst}
        </span>
      ))}

      <form className={`login-card ${shake?"login-shake":""}`} onSubmit={handleSubmit} autoComplete="off"
        style={{ borderColor: theme.border, transition:"border-color 0.4s" }}>
        <div className="login-top-ribbon" style={{ background:`linear-gradient(90deg,${theme.light},${theme.color},${theme.light})`, transition:"background 0.4s" }} />

        <div className="login-avatar" style={{ transition:"all 0.3s" }}>{theme.avatar}</div>
        <h1 className="login-title" style={{ color: theme.color, transition:"color 0.4s" }}>{theme.greeting}</h1>
        <p className="login-subtitle">This is a special place, just for you 🌸</p>

        <div className="login-field">
          <label className="login-label" style={{ color: theme.color }}>👤 Username</label>
          <input className="login-input" type="text" placeholder="Enter your name..."
            value={username} onChange={e => { setUsername(e.target.value); setError(""); }}
            autoComplete="off" style={{ borderColor: username ? theme.border : "" }} />
        </div>

        <div className="login-field">
          <label className="login-label" style={{ color: theme.color }}>🔐 Password</label>
          <div className="login-pass-wrap">
            <input className="login-input" type={showPass?"text":"password"} placeholder="Enter your password..."
              value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
              autoComplete="off" style={{ borderColor: USERS[password] ? theme.color : "" }} />
            <button type="button" className="login-eye" onClick={() => setShowPass(v=>!v)} aria-label="toggle">
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-btn"
          style={{ background:`linear-gradient(135deg,${theme.light},${theme.color})`, transition:"background 0.4s" }}>
          {detectedUser === "surya" ? "Enter 💙" : "Enter with Love 💖"}
        </button>

        <p className="login-hint">Only someone special knows the way in 💍</p>
      </form>
    </div>
  );
}
