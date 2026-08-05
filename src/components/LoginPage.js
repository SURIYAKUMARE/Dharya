import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, ArrowRight, Heart } from "lucide-react";
import { useTilt } from "../App";

const CORRECT_USER = "DHARYA";
const USERS = {
  "29/02/2008": "sadhana",
  "09/10/2007": "surya",
};

const THEMES = {
  sadhana: {
    primary:  "#e8305a",
    secondary:"#6b2fa0",
    glow:     "rgba(232,48,90,0.22)",
    avatar:   "💗",
    burst:    "💖",
    greeting: "Welcome back",
    name:     "Sadhana",
    sub:      "Your special place is waiting for you",
    btnText:  "Enter your world",
    bg:       "linear-gradient(160deg, #05020a 0%, #090415 50%, #0d0620 100%)",
    orb1:     "rgba(139,0,64,0.22)",
    orb2:     "rgba(74,10,107,0.18)",
  },
  surya: {
    primary:  "#10B981",
    secondary:"#06B6D4",
    glow:     "rgba(16,185,129,0.18)",
    avatar:   "🌿",
    burst:    "💚",
    greeting: "Welcome back",
    name:     "Surya",
    sub:      "Your private space is ready",
    btnText:  "Enter your world",
    bg:       "linear-gradient(160deg, #030d08 0%, #041208 50%, #020a06 100%)",
    orb1:     "rgba(16,185,129,0.12)",
    orb2:     "rgba(6,182,212,0.08)",
  },
  default: {
    primary:  "#c9932a",
    secondary:"#e8305a",
    glow:     "rgba(201,147,42,0.2)",
    avatar:   "✨",
    burst:    "💫",
    greeting: "Welcome to",
    name:     "Dharya",
    sub:      "Only someone special knows the way in",
    btnText:  "Enter →",
    bg:       "linear-gradient(160deg, #05020a 0%, #090415 50%, #0d0620 100%)",
    orb1:     "rgba(201,147,42,0.12)",
    orb2:     "rgba(139,0,64,0.1)",
  },
};

/* Floating particle component */
function Particles({ theme }) {
  const symbols = theme.primary === "#10B981"
    ? ["✦","·","✧","◦","∘"]
    : ["✦","·","✧","◦","∘"];
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {[...Array(12)].map((_, i) => (
        <span key={i} style={{
          position: "absolute",
          bottom: "-30px",
          left: `${i * 8 + 2}%`,
          fontSize: `${10 + (i % 3) * 6}px`,
          color: theme.primary,
          opacity: 0.25,
          animation: `floatUp ${9 + i * 0.7}s linear ${i * 1.1}s infinite`,
          display: "inline-block",
        }}>
          {symbols[i % symbols.length]}
        </span>
      ))}
    </div>
  );
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [shake,    setShake]    = useState(false);
  const [bursts,   setBursts]   = useState([]);
  const [focused,  setFocused]  = useState(null);
  const [mounted,  setMounted]  = useState(false);
  const tilt = useTilt(10);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const detectedUser = USERS[password] || "default";
  const theme = THEMES[detectedUser];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().toUpperCase() === CORRECT_USER && USERS[password]) {
      setBursts(Array.from({ length: 14 }, (_, i) => ({
        id: i, left: `${3 + i * 7}%`,
        delay: `${i * 0.06}s`,
        dur: `${1.1 + Math.random() * 0.7}s`,
      })));
      setTimeout(() => onLogin(USERS[password]), 900);
    } else {
      setError(
        username.trim().toUpperCase() !== CORRECT_USER
          ? "That name doesn't match"
          : "Wrong password, try again"
      );
      setShake(true);
      setTimeout(() => { setShake(false); setError(""); }, 700);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: theme.bg,
      position: "relative",
      overflow: "hidden",
      padding: "24px",
    }}>
      {/* Ambient orbs */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse at 25% 35%, ${theme.orb1} 0%, transparent 55%),
          radial-gradient(ellipse at 78% 70%, ${theme.orb2} 0%, transparent 50%),
          radial-gradient(ellipse at 60% 10%, ${theme.glow.replace("0.2","0.06")} 0%, transparent 45%)
        `,
        transition: "background 0.8s ease",
      }} />

      {/* Particles */}
      <Particles theme={theme} />

      {/* 3D rotating ring */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "600px", height: "600px", borderRadius: "50%",
          border: `1px solid ${theme.primary}18`,
          animation: "ring3DSpin 20s linear infinite",
          position: "absolute",
        }} />
        <div style={{
          width: "450px", height: "450px", borderRadius: "50%",
          border: `1px solid ${theme.secondary}12`,
          animation: "ring3DSpin 14s linear infinite reverse",
          position: "absolute",
        }} />
        <div style={{
          width: "300px", height: "300px", borderRadius: "50%",
          border: `1px solid ${theme.primary}10`,
          animation: "ring3DSpin 9s linear infinite",
          position: "absolute",
        }} />
      </div>

      {/* Burst hearts on success */}
      {bursts.map(h => (
        <span key={h.id} style={{
          position: "fixed", bottom: "-60px", left: h.left,
          fontSize: "24px", pointerEvents: "none", zIndex: 200,
          animation: `floatUp ${h.dur} ${h.delay} linear forwards`,
        }}>
          {theme.burst}
        </span>
      ))}

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onMouseEnter={tilt.onMouseEnter}
        className={`tilt-card ${shake ? "login-shake" : ""}`}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          background: "rgba(9,4,21,0.88)",
          border: `1px solid ${theme.primary}28`,
          borderRadius: "28px",
          padding: "52px 40px 44px",
          boxShadow: `0 48px 110px rgba(0,0,0,0.65), 0 0 80px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        {/* 3D shine layer */}
        <div className="tilt-shine" style={{ borderRadius: "28px" }} />
        {/* Top gradient line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${theme.primary}, ${theme.secondary}, ${theme.primary}, transparent)`,
          borderRadius: "28px 28px 0 0",
          opacity: 0.9,
        }} />

        {/* Monogram / Avatar */}
        <div style={{
          width: "72px", height: "72px", margin: "0 auto 24px",
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          borderRadius: "20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem",
          boxShadow: `0 12px 36px ${theme.glow}, 0 0 0 1px rgba(255,255,255,0.08)`,
          animation: "floatEmoji 3s ease-in-out infinite alternate",
        }}>
          {theme.avatar}
        </div>

        {/* Greeting */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.78rem", fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase", letterSpacing: "2px",
            margin: "0 0 8px",
          }}>
            {theme.greeting}
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.4rem", fontWeight: 600,
            fontStyle: "italic",
            color: "#ffffff",
            margin: "0 0 10px",
            letterSpacing: "-0.3px",
            lineHeight: 1.1,
            textShadow: `0 0 40px ${theme.glow}`,
          }}>
            {theme.name}
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.88rem",
            color: "rgba(255,255,255,0.4)",
            margin: 0,
            lineHeight: 1.6,
          }}>
            {theme.sub}
          </p>
        </div>

        {/* Username field */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.7rem", fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase", letterSpacing: "1.2px",
            marginBottom: "8px",
          }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your name…"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            onFocus={() => setFocused("user")}
            onBlur={() => setFocused(null)}
            autoComplete="off"
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "14px 18px",
              background: focused === "user" ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.055)",
              border: `1px solid ${focused === "user" ? `${theme.primary}88` : "rgba(255,255,255,0.1)"}`,
              borderRadius: "14px",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.95rem",
              outline: "none",
              transition: "all 0.25s ease",
              boxShadow: focused === "user" ? `0 0 0 3px ${theme.glow}` : "none",
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.7rem", fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase", letterSpacing: "1.2px",
            marginBottom: "8px",
          }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter password…"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
              autoComplete="off"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "14px 52px 14px 18px",
                background: focused === "pass" ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.055)",
                border: `1px solid ${focused === "pass" ? `${theme.primary}88` : USERS[password] ? `${theme.primary}66` : "rgba(255,255,255,0.1)"}`,
                borderRadius: "14px",
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.95rem",
                letterSpacing: password ? "3px" : "normal",
                outline: "none",
                transition: "all 0.25s ease",
                boxShadow: focused === "pass" ? `0 0 0 3px ${theme.glow}` : USERS[password] ? `0 0 0 3px ${theme.glow}` : "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label="Toggle password"
              style={{
                position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.35)", padding: "4px",
                transition: "color 0.2s",
                display: "flex", alignItems: "center",
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: "16px",
            padding: "12px 16px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.83rem",
            color: "#fca5a5",
            textAlign: "center",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "16px",
            background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
            border: "none",
            borderRadius: "14px",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.95rem", fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            boxShadow: `0 10px 32px ${theme.glow}`,
            transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s",
            letterSpacing: "0.2px",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 18px 48px ${theme.glow}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 10px 32px ${theme.glow}`; }}
        >
          <span>{theme.btnText}</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>

        {/* Footer note */}
        <div style={{
          marginTop: "24px",
          textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        }}>
          <Heart size={10} fill="rgba(255,255,255,0.15)" stroke="none" />
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.2)",
            margin: 0,
            fontStyle: "italic",
            letterSpacing: "0.3px",
          }}>
            Only someone special knows the way in
          </p>
          <Heart size={10} fill="rgba(255,255,255,0.15)" stroke="none" />
        </div>
      </form>
    </div>
  );
}
