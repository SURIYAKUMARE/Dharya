import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useTilt } from "../App";

const CORRECT_USER = "DHARYA";
const USERS = {
  "29/02/2008":  "sadhana",
  "09/10/2007":  "surya",
  "password123456": "demo",
};

/* Demo account — auto-fill button on login page */
const DEMO_PASSWORD = "password123456";

const THEMES = {
  sadhana: {
    primary:   "#ff1a6e",
    secondary: "#8b3fc8",
    glow:      "rgba(255,26,110,0.32)",
    avatar:    "💗",
    burst:     ["💖","🌸","✨","💕","🌷","💗","⭐","🌺"],
    greeting:  "Welcome back,",
    name:      "Sadhana",
    sub:       "Your special place is waiting for you ✨",
    btnText:   "Enter your world",
    bg:        "linear-gradient(160deg,#0a0112 0%,#10011a 50%,#150225 100%)",
    orb1:      "rgba(194,0,92,0.32)",
    orb2:      "rgba(91,14,166,0.24)",
    particles: ["💗","🌸","✨","💕","⭐","🌷","💖","🌺","✦","◦"],
  },
  surya: {
    primary:   "#00d97e",
    secondary: "#06B6D4",
    glow:      "rgba(0,217,126,0.28)",
    avatar:    "🌿",
    burst:     ["💚","🌿","✨","🍃","⭐","🌊","💎","🌱"],
    greeting:  "Welcome back,",
    name:      "Surya",
    sub:       "Your private space is ready 🌿",
    btnText:   "Enter your world",
    bg:        "linear-gradient(160deg,#000f06 0%,#011508 50%,#021a0a 100%)",
    orb1:      "rgba(0,217,126,0.22)",
    orb2:      "rgba(6,182,212,0.16)",
    particles: ["🌿","✦","·","✧","◦","🍃","∘","🌱","⭐","💚"],
  },
  demo: {
    primary:   "#f59e0b",
    secondary: "#ec4899",
    glow:      "rgba(245,158,11,0.28)",
    avatar:    "👀",
    burst:     ["✨","⭐","💫","🌟","🎉","🎊","💥","🔥"],
    greeting:  "Demo Preview —",
    name:      "Dharya",
    sub:       "Exploring as a guest 👀",
    btnText:   "Enter demo",
    bg:        "linear-gradient(160deg,#0a0800 0%,#120e00 50%,#1a1400 100%)",
    orb1:      "rgba(245,158,11,0.20)",
    orb2:      "rgba(236,72,153,0.14)",
    particles: ["✨","⭐","💫","🌟","◦","✦","·","✧","🎉","◈"],
  },
  default: {
    primary:   "#ff1a6e",
    secondary: "#e8a030",
    glow:      "rgba(255,26,110,0.24)",
    avatar:    "✨",
    burst:     ["💫","⭐","✨","🌟","💛","🔥","💥","🌠"],
    greeting:  "Welcome to",
    name:      "Dharya",
    sub:       "Only someone special knows the way in 🔐",
    btnText:   "Enter →",
    bg:        "linear-gradient(160deg,#0a0112 0%,#10011a 50%,#150225 100%)",
    orb1:      "rgba(194,0,92,0.20)",
    orb2:      "rgba(91,14,166,0.16)",
    particles: ["✦","·","✧","◦","∘","⭐","💫","✨","🌟","◈"],
  },
};

/* ── Typewriter hook ── */
function useTypewriter(text, speed = 60, start = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!start) return;
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed, start]);
  return displayed;
}

/* ── Sparkle cursor trail ── */
function SparkleTrail({ color }) {
  const [sparks, setSparks] = useState([]);
  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setSparks(s => [...s.slice(-20), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparks(s => s.filter(sp => sp.id !== id)), 700);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:2 }}>
      {sparks.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:s.x-4, top:s.y-4,
          width:8, height:8, borderRadius:"50%",
          background:color, opacity:0.7,
          animation:"sparkFade 0.7s ease forwards",
          pointerEvents:"none",
        }} />
      ))}
    </div>
  );
}

/* ── Success Overlay ── */
function SuccessOverlay({ theme, name }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:`radial-gradient(ellipse at center, ${theme.primary}22 0%, rgba(5,2,10,0.97) 70%)`,
      backdropFilter:"blur(16px)",
      animation:"successFadeIn 0.4s ease forwards",
    }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"4rem", animation:"successBounce 0.6s var(--spring,cubic-bezier(.34,1.56,.64,1)) 0.1s both", display:"inline-block" }}>
          {theme.avatar}
        </div>
        <div style={{
          fontFamily:"'Cormorant Garamond',serif", fontSize:"2.8rem",
          fontWeight:600, fontStyle:"italic", color:"#fff",
          marginTop:16, animation:"fadeInUp 0.5s ease 0.3s both",
          textShadow:`0 0 60px ${theme.glow}`,
        }}>
          Hello, {name} 💫
        </div>
        <div style={{
          fontFamily:"'Inter',sans-serif", fontSize:"1rem",
          color:"rgba(255,255,255,0.5)", marginTop:8,
          animation:"fadeInUp 0.5s ease 0.5s both",
        }}>
          Opening your world…
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:24, animation:"fadeInUp 0.5s ease 0.7s both" }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} style={{
              width:8, height:8, borderRadius:"50%",
              background:theme.primary,
              animation:`dotPulse 1.2s ease-in-out ${i*0.15}s infinite alternate`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error,    setError]      = useState("");
  const [shake,    setShake]      = useState(false);
  const [bursts,   setBursts]     = useState([]);
  const [focused,  setFocused]    = useState(null);
  const [mounted,  setMounted]    = useState(false);
  const [success,  setSuccess]    = useState(null);
  const [cardHover, setCardHover] = useState(false);
  const tilt = useTilt(8);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const detectedUser = USERS[password] || "default";
  const theme = THEMES[detectedUser];
  const greetingTyped = useTypewriter(theme.greeting + " " + theme.name, 55, mounted);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Accept "DHARYA" or "ADMIN" as username; demo password maps to demo user
    const uname = username.trim().toUpperCase();
    const validUser = USERS[password];
    const validUsername = uname === CORRECT_USER || uname === "ADMIN";

    if (validUsername && validUser) {
      const user = USERS[password];
      setBursts(Array.from({ length: 20 }, (_, i) => ({
        id: i, left: `${2 + i * 4.8}%`,
        delay: `${i * 0.04}s`,
        dur: `${1.0 + Math.random() * 0.8}s`,
        sym: theme.burst[i % theme.burst.length],
        size: `${20 + (i % 3) * 8}px`,
      })));
      setTimeout(() => setSuccess({ name: THEMES[user]?.name || "Guest" }), 400);
      setTimeout(() => onLogin(user), 1800);
    } else {
      setError(!validUsername ? "That name doesn't match 💔" : "Wrong password, try again 🔐");
      setShake(true);
      setTimeout(() => { setShake(false); setError(""); }, 800);
    }
  };

  /* Auto-fill demo credentials */
  const fillDemo = () => {
    setUsername("ADMIN");
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  const inputStyle = (isFoc, valid) => ({
    width:"100%", boxSizing:"border-box",
    padding:"15px 20px",
    background: isFoc ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.055)",
    border:`1.5px solid ${isFoc ? `${theme.primary}cc` : valid ? `${theme.primary}66` : "rgba(255,255,255,0.1)"}`,
    borderRadius:"16px", color:"#fff",
    fontFamily:"'Inter',sans-serif", fontSize:"0.95rem",
    outline:"none", transition:"all 0.3s ease",
    boxShadow: isFoc ? `0 0 0 4px ${theme.glow}, 0 4px 20px rgba(0,0,0,0.3)` : valid ? `0 0 0 3px ${theme.glow}` : "none",
    letterSpacing: valid ? "3px" : "normal",
  });

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:theme.bg, position:"relative", overflow:"hidden", padding:"24px",
      transition:"background 1s ease",
    }}>
      {/* Ambient gradient */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:`
          radial-gradient(ellipse at 20% 30%, ${theme.orb1} 0%, transparent 55%),
          radial-gradient(ellipse at 80% 75%, ${theme.orb2} 0%, transparent 50%),
          radial-gradient(ellipse at 60% 5%, ${theme.primary}08 0%, transparent 45%)
        `,
        transition:"background 1s ease",
      }} />

      <PulseRings theme={theme} />
      <FloatingParticles theme={theme} />

      {/* Burst emojis on success */}
      {bursts.map(h => (
        <span key={h.id} style={{
          position:"fixed", bottom:"-60px", left:h.left,
          fontSize:h.size, pointerEvents:"none", zIndex:200,
          animation:`floatUp ${h.dur} ${h.delay} linear forwards`,
          filter:`drop-shadow(0 0 8px ${theme.primary})`,
        }}>{h.sym}</span>
      ))}

      {/* Success overlay */}
      {success && <SuccessOverlay theme={theme} name={success.name} />}

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={() => { tilt.onMouseLeave(); setCardHover(false); }}
        onMouseEnter={() => { tilt.onMouseEnter(); setCardHover(true); }}
        className={`tilt-card ${shake ? "login-shake" : ""}`}
        style={{
          position:"relative", zIndex:10, width:"100%", maxWidth:"440px",
          background:"rgba(9,4,21,0.90)",
          border:`1.5px solid ${theme.primary}30`,
          borderRadius:"32px",
          padding:"56px 44px 48px",
          boxShadow:`0 56px 120px rgba(0,0,0,0.7), 0 0 100px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          backdropFilter:"blur(32px)",
          WebkitBackdropFilter:"blur(32px)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
          transition:"opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1), border-color 0.6s ease, box-shadow 0.6s ease",
        }}
      >
        <div className="tilt-shine" style={{ borderRadius:"32px" }} />

        {/* Animated top ribbon */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"2.5px",
          background:`linear-gradient(90deg, transparent, ${theme.primary}, ${theme.secondary}, ${theme.primary}, transparent)`,
          borderRadius:"32px 32px 0 0",
          backgroundSize:"200% 100%",
          animation:"shimmerRibbon 2.5s linear infinite",
        }} />

        {/* Glowing dot accents */}
        <div style={{ position:"absolute", top:18, right:18, display:"flex", gap:5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:6, height:6, borderRadius:"50%",
              background: theme.primary,
              opacity: cardHover ? 0.9 : 0.3,
              animation:`dotPulse 1.8s ease-in-out ${i*0.3}s infinite alternate`,
              transition:"opacity 0.3s",
            }} />
          ))}
        </div>

        {/* Avatar */}
        <div style={{
          width:84, height:84, margin:"0 auto 28px",
          background:`linear-gradient(135deg,${theme.primary},${theme.secondary})`,
          borderRadius:"24px",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"2.4rem",
          boxShadow:`0 16px 48px ${theme.glow}, 0 0 0 1.5px rgba(255,255,255,0.1), 0 0 80px ${theme.primary}33`,
          animation:"floatEmoji 3s ease-in-out infinite alternate",
          position:"relative",
          transition:"box-shadow 0.4s",
        }}>
          {theme.avatar}
          {/* Orbit ring */}
          <div style={{
            position:"absolute", inset:-10,
            borderRadius:"50%",
            border:`1px dashed ${theme.primary}44`,
            animation:"ring3DSpin 8s linear infinite",
          }} />
        </div>

        {/* Typewriter greeting */}
        <div style={{ textAlign:"center", marginBottom:"36px" }}>
          <p style={{
            fontFamily:"'Inter',sans-serif",
            fontSize:"0.72rem", fontWeight:700,
            color:"rgba(255,255,255,0.35)",
            textTransform:"uppercase", letterSpacing:"2.5px",
            margin:"0 0 10px",
          }}>
            {THEMES[detectedUser].greeting.includes("Welcome to") ? "✦ Welcome ✦" : "✦ Back again ✦"}
          </p>
          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"2.6rem", fontWeight:600,
            fontStyle:"italic", color:"#ffffff",
            margin:"0 0 10px", letterSpacing:"-0.3px", lineHeight:1.1,
            textShadow:`0 0 60px ${theme.glow}`,
            minHeight:"3.2rem",
          }}>
            {greetingTyped}
            <span style={{ animation:"cursorBlink 1s step-end infinite", opacity:0.6 }}>|</span>
          </h1>
          <p style={{
            fontFamily:"'Inter',sans-serif", fontSize:"0.88rem",
            color:"rgba(255,255,255,0.38)", margin:0, lineHeight:1.7,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(8px)",
            transition:"all 0.8s ease 0.6s",
          }}>
            {theme.sub}
          </p>
        </div>

        {/* Username */}
        <div style={{ marginBottom:"16px",
          opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(20px)",
          transition:"all 0.6s ease 0.4s",
        }}>
          <label style={{
            display:"block", fontFamily:"'Inter',sans-serif",
            fontSize:"0.68rem", fontWeight:700,
            color:"rgba(255,255,255,0.35)",
            textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"8px",
          }}>Username</label>
          <input
            type="text" placeholder="Enter your name…"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            onFocus={() => setFocused("user")}
            onBlur={() => setFocused(null)}
            autoComplete="off"
            style={inputStyle(focused==="user", false)}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom:"22px",
          opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(20px)",
          transition:"all 0.6s ease 0.55s",
        }}>
          <label style={{
            display:"block", fontFamily:"'Inter',sans-serif",
            fontSize:"0.68rem", fontWeight:700,
            color:"rgba(255,255,255,0.35)",
            textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"8px",
          }}>Password</label>
          <div style={{ position:"relative" }}>
            <input
              type={showPass?"text":"password"}
              placeholder="Enter password…"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
              autoComplete="off"
              style={{ ...inputStyle(focused==="pass", !!USERS[password]), paddingRight:"52px" }}
            />
            <button type="button" onClick={() => setShowPass(v=>!v)} aria-label="Toggle password"
              style={{
                position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer",
                color:showPass ? theme.primary : "rgba(255,255,255,0.35)",
                padding:"4px", transition:"color 0.2s",
                display:"flex", alignItems:"center",
              }}>
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {/* Detected user hint */}
          {USERS[password] && (
            <div style={{
              marginTop:8, display:"flex", alignItems:"center", gap:6,
              animation:"fadeInUp 0.3s ease",
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:theme.primary, animation:"dotPulse 1s ease-in-out infinite alternate" }} />
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", color:theme.primary, fontWeight:600 }}>
                {THEMES[USERS[password]].name} detected ✓
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom:"16px", padding:"12px 18px",
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)",
            borderRadius:"14px", fontFamily:"'Inter',sans-serif",
            fontSize:"0.84rem", color:"#fca5a5", textAlign:"center",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
            animation:"shakeIn 0.4s ease",
          }}>
            <span>⚠️</span>{error}
          </div>
        )}

        {/* Submit */}
        <button type="submit"
          style={{
            width:"100%", padding:"17px",
            background:`linear-gradient(135deg,${theme.primary},${theme.secondary})`,
            border:"none", borderRadius:"18px", color:"#fff",
            fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
            boxShadow:`0 12px 40px ${theme.glow}, 0 0 0 1px rgba(255,255,255,0.08)`,
            transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
            letterSpacing:"0.3px",
            opacity:mounted?1:0,
            animation: mounted ? "btnAppear 0.5s ease 0.7s both" : "none",
            backgroundSize:"200% 100%",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px) scale(1.02)"; e.currentTarget.style.boxShadow=`0 22px 56px ${theme.glow}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow=`0 12px 40px ${theme.glow}`; }}
          onMouseDown={e => { e.currentTarget.style.transform="translateY(1px) scale(0.98)"; }}
          onMouseUp={e => { e.currentTarget.style.transform="translateY(-4px) scale(1.02)"; }}
        >
          <Sparkles size={15} strokeWidth={2} />
          <span>{theme.btnText}</span>
          <ArrowRight size={16} strokeWidth={2.5}/>
        </button>

        {/* Footer */}
        <div style={{
          marginTop:"28px", textAlign:"center",
          display:"flex", flexDirection:"column", alignItems:"center", gap:"12px",
          opacity:mounted?1:0, transition:"opacity 0.8s ease 0.9s",
        }}>
          {/* Demo account button */}
          <button
            type="button"
            onClick={fillDemo}
            style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"9px 20px",
              background:"rgba(245,158,11,0.08)",
              border:"1.5px solid rgba(245,158,11,0.3)",
              borderRadius:"50px", cursor:"pointer",
              fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", fontWeight:700,
              color:"#f59e0b",
              transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.background="rgba(245,158,11,0.14)";e.currentTarget.style.boxShadow="0 6px 20px rgba(245,158,11,0.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background="rgba(245,158,11,0.08)";e.currentTarget.style.boxShadow="none";}}
          >
            <span>👀</span>
            <span>Try Demo Account</span>
            <span style={{fontSize:"0.68rem",opacity:0.7}}>→</span>
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <Heart size={9} fill={`${theme.primary}44`} stroke="none"/>
            <p style={{
              fontFamily:"'Inter',sans-serif", fontSize:"0.72rem",
              color:"rgba(255,255,255,0.2)", margin:0, fontStyle:"italic", letterSpacing:"0.3px",
            }}>
              Only someone special knows the way in
            </p>
            <Heart size={9} fill={`${theme.primary}44`} stroke="none"/>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width:4, height:4, borderRadius:"50%",
                background:`${theme.primary}40`,
                animation:`dotPulse 1.5s ease-in-out ${i*0.2}s infinite alternate`,
              }} />
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
