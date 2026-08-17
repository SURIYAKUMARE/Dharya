import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Heart, Lock } from "lucide-react";
import { useTilt } from "../App";

const CORRECT_USER = "DHARYA";
const USERS = {
  "29/02/2008": "sadhana",
  "09/10/2007": "surya",
};

const THEMES = {
  sadhana: {
    primary:    "#ff1a6e",
    secondary:  "#b340e8",
    glow:       "rgba(255,26,110,0.38)",
    glowSoft:   "rgba(255,26,110,0.15)",
    avatar:     "\uD83D\uDC97",
    burst:      ["\uD83D\uDC96","\uD83C\uDF38","\u2728","\uD83D\uDC95","\uD83C\uDF37","\uD83D\uDC97","\u2B50","\uD83C\uDF3A"],
    name:       "Sadhana",
    greeting:   "Welcome back",
    sub:        "Your world is waiting \u2728",
    btnText:    "Enter my world",
    bg:         "linear-gradient(135deg,#060010 0%,#0d0118 55%,#130020 100%)",
    orb1:       "rgba(180,0,80,0.30)",
    orb2:       "rgba(100,10,180,0.22)",
    particles:  ["\uD83D\uDC97","\uD83C\uDF38","\u2728","\uD83D\uDC95","\u2B50","\uD83C\uDF37","\uD83D\uDC96","\uD83C\uDF3A"],
    inputBg:    "rgba(255,26,110,0.05)",
  },
  surya: {
    primary:    "#00d97e",
    secondary:  "#06B6D4",
    glow:       "rgba(0,217,126,0.35)",
    glowSoft:   "rgba(0,217,126,0.12)",
    avatar:     "\uD83C\uDF3F",
    burst:      ["\uD83D\uDC9A","\uD83C\uDF3F","\u2728","\uD83C\uDF43","\u2B50","\uD83C\uDF0A","\uD83D\uDC8E","\uD83C\uDF31"],
    name:       "Surya",
    greeting:   "Welcome back",
    sub:        "Your private space is ready \uD83C\uDF3F",
    btnText:    "Enter my world",
    bg:         "linear-gradient(135deg,#000e05 0%,#011508 55%,#001a0a 100%)",
    orb1:       "rgba(0,200,100,0.22)",
    orb2:       "rgba(6,182,212,0.16)",
    particles:  ["\uD83C\uDF3F","\u2728","\u22C6","\u25E6","\uD83C\uDF43","\u2022","\uD83C\uDF31","\u2B50","\uD83D\uDC9A"],
    inputBg:    "rgba(0,217,126,0.05)",
  },
  default: {
    primary:    "#ff1a6e",
    secondary:  "#e8a030",
    glow:       "rgba(255,26,110,0.28)",
    glowSoft:   "rgba(255,26,110,0.10)",
    avatar:     "\u2728",
    burst:      ["\uD83D\uDCAB","\u2B50","\u2728","\uD83C\uDF1F","\uD83D\uDC9B","\uD83D\uDD25","\uD83D\uDCA5","\uD83C\uDF20"],
    name:       "Dharya",
    greeting:   "Welcome to",
    sub:        "Only someone special knows the way in \uD83D\uDD10",
    btnText:    "Enter \u2192",
    bg:         "linear-gradient(135deg,#060010 0%,#0d0118 55%,#130020 100%)",
    orb1:       "rgba(180,0,80,0.20)",
    orb2:       "rgba(100,10,160,0.16)",
    particles:  ["\u2726","\u00B7","\u2727","\u25E6","\u22C6","\u2B50","\uD83D\uDCAB","\u2728","\uD83C\uDF1F"],
    inputBg:    "rgba(255,26,110,0.04)",
  },
};

/* ─────────────────────────────────────────────────
   INJECT KEYFRAMES (once per session)
───────────────────────────────────────────────── */
function injectStyles() {
  if (document.getElementById("lp-v3-styles")) return;
  const el = document.createElement("style");
  el.id = "lp-v3-styles";
  el.textContent = `
    /* particles rise */
    @keyframes lpFloat {
      0%   { transform: translateY(0)    rotate(0deg)   scale(1);   opacity: 0; }
      8%   { opacity: var(--p-op, 0.18); }
      85%  { opacity: var(--p-op, 0.18); }
      100% { transform: translateY(-105vh) rotate(360deg) scale(0.7); opacity: 0; }
    }
    /* card entrance */
    @keyframes lpCardIn {
      0%   { opacity: 0; transform: translateY(36px) scale(0.95) rotateX(4deg); }
      100% { opacity: 1; transform: translateY(0)    scale(1)    rotateX(0deg); }
    }
    /* avatar pop */
    @keyframes lpAvatarPop {
      0%   { transform: scale(0.4) rotate(-18deg); opacity: 0; }
      60%  { transform: scale(1.12) rotate(4deg);  opacity: 1; }
      100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
    }
    /* avatar gentle float */
    @keyframes lpAvatarFloat {
      0%,100% { transform: translateY(0px) scale(1); }
      50%     { transform: translateY(-7px) scale(1.02); }
    }
    /* orbit rings */
    @keyframes lpOrbitCW  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
    @keyframes lpOrbitCCW { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
    /* title shine */
    @keyframes lpTitleShine {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    /* ribbon shimmer */
    @keyframes lpRibbon {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    /* pulse rings */
    @keyframes lpPulse {
      0%   { transform: scale(0.88); opacity: 0.22; }
      70%  { transform: scale(1.15); opacity: 0; }
      100% { transform: scale(1.15); opacity: 0; }
    }
    /* spin border */
    @keyframes lpSpin { to { transform: rotate(360deg); } }
    /* fade up */
    @keyframes lpFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    /* dot pulse */
    @keyframes lpDot {
      from { transform: scale(0.7); opacity: 0.35; }
      to   { transform: scale(1.4); opacity: 1; }
    }
    /* cursor blink */
    @keyframes lpBlink {
      0%,100% { opacity: 0.45; }
      50%     { opacity: 0; }
    }
    /* heartbeat on button */
    @keyframes lpHeartbeat {
      0%,100% { transform: scale(1); }
      14%     { transform: scale(1.055); }
      28%     { transform: scale(1); }
      42%     { transform: scale(1.035); }
    }
    /* shake on error */
    @keyframes lpShake {
      0%,100% { transform: translateX(0); }
      16%     { transform: translateX(-8px); }
      33%     { transform: translateX(8px); }
      50%     { transform: translateX(-5px); }
      66%     { transform: translateX(5px); }
      83%     { transform: translateX(-2px); }
    }
    /* cursor trail dot */
    @keyframes lpSpark {
      0%   { transform: scale(1); opacity: 0.75; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    /* success screen */
    @keyframes lpSuccessIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes lpSuccessBounce {
      0%   { transform: scale(0.4) rotate(-14deg); opacity: 0; }
      65%  { transform: scale(1.18) rotate(4deg);  opacity: 1; }
      100% { transform: scale(1)   rotate(0deg);   opacity: 1; }
    }
    /* input focus glow pulse */
    @keyframes lpInputGlow {
      0%,100% { box-shadow: var(--lp-focus-shadow-a); }
      50%     { box-shadow: var(--lp-focus-shadow-b); }
    }
    .lp-shake { animation: lpShake 0.5s ease !important; }
  `;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────
   STARFIELD CANVAS
───────────────────────────────────────────────── */
function Starfield({ color }) {
  const cvRef  = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;

    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const ctx = cv.getContext("2d");
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.4 + Math.random() * 1.6,
      base: 0.08 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.9,
    }));

    const shots = [];
    const spawnShot = () => shots.push({
      x: Math.random() * cv.width * 0.6,
      y: Math.random() * cv.height * 0.38,
      vx: 5.5 + Math.random() * 8,
      vy: 2   + Math.random() * 4,
      len: 80 + Math.random() * 140,
      life: 1,
    });
    const timer = setInterval(spawnShot, 2400);

    const draw = () => {
      const cw = cv.width, ch = cv.height, t = Date.now() / 1000;
      ctx.clearRect(0, 0, cw, ch);

      /* twinkling stars */
      stars.forEach(s => {
        const a = s.base * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fill();
      });

      /* shooting stars */
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.019;
        if (s.life <= 0 || s.x > cw + 160) { shots.splice(i, 1); continue; }
        const tx = s.x - s.vx * (s.len / Math.max(s.vx, 1));
        const ty = s.y - s.vy * (s.len / Math.max(s.vx, 1));
        const g  = ctx.createLinearGradient(tx, ty, s.x, s.y);
        g.addColorStop(0,   "transparent");
        g.addColorStop(0.55, color + "88");
        g.addColorStop(1,   "#ffffff");
        ctx.beginPath();
        ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle  = g;
        ctx.lineWidth    = 1.6;
        ctx.globalAlpha  = Math.max(0, s.life);
        ctx.shadowColor  = color;
        ctx.shadowBlur   = 7;
        ctx.stroke();
        ctx.globalAlpha  = 1;
        ctx.shadowBlur   = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle   = "#fff";
        ctx.globalAlpha = Math.max(0, s.life) * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timer);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return (
    <canvas ref={cvRef} style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

/* ─────────────────────────────────────────────────
   FLOATING PARTICLES
───────────────────────────────────────────────── */
function FloatingParticles({ theme }) {
  const items = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      sym:   theme.particles[i % theme.particles.length],
      left:  `${(i * 6.2 + 1.5) % 95}%`,
      size:  `${11 + (i % 4) * 4}px`,
      dur:   `${11 + (i % 5) * 2.8}s`,
      delay: `${i * 0.65}s`,
      op:    (0.13 + (i % 4) * 0.055).toFixed(2),
    }))
  ).current;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {items.map((p, i) => (
        <span key={i} style={{
          position:  "absolute",
          bottom:    "-50px",
          left:       p.left,
          fontSize:   p.size,
          color:      theme.primary,
          filter:    `drop-shadow(0 0 5px ${theme.primary}60)`,
          "--p-op":   p.op,
          animation: `lpFloat ${p.dur} linear ${p.delay} infinite`,
        }}>
          {p.sym}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PULSE RINGS
───────────────────────────────────────────────── */
function PulseRings({ color }) {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position:     "absolute",
          width:        `${340 + i * 160}px`,
          height:       `${340 + i * 160}px`,
          borderRadius: "50%",
          border:       `1px solid ${color}${["25", "18", "0e"][i]}`,
          animation:    `lpPulse ${[3.6, 5.2, 7.2][i]}s ease-out ${i * 1.3}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CURSOR SPARKLE TRAIL
───────────────────────────────────────────────── */
function CursorTrail({ color }) {
  const [sparks, setSparks] = useState([]);
  useEffect(() => {
    const handle = (e) => {
      const id = Date.now() + Math.random();
      setSparks(s => [...s.slice(-22), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparks(s => s.filter(sp => sp.id !== id)), 620);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }}>
      {sparks.map(s => (
        <div key={s.id} style={{
          position:     "absolute",
          left:          s.x - 3,
          top:           s.y - 3,
          width:         6, height: 6,
          borderRadius: "50%",
          background:    color,
          boxShadow:    `0 0 6px ${color}`,
          animation:    "lpSpark 0.62s ease forwards",
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   TYPEWRITER HOOK
───────────────────────────────────────────────── */
function useTypewriter(text, speed = 50, active = true) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) return;
    setOut("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed, active]);
  return out;
}

/* ─────────────────────────────────────────────────
   SUCCESS OVERLAY
───────────────────────────────────────────────── */
function SuccessOverlay({ theme, name }) {
  return (
    <div style={{
      position:       "fixed", inset: 0, zIndex: 9999,
      display:        "flex", flexDirection: "column",
      alignItems:     "center", justifyContent: "center",
      background:     `radial-gradient(ellipse at center, ${theme.primary}25 0%, rgba(3,0,10,0.97) 68%)`,
      backdropFilter: "blur(22px)",
      animation:      "lpSuccessIn 0.38s ease forwards",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize:  "5rem", display: "inline-block",
          animation: "lpSuccessBounce 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
        }}>
          {theme.avatar}
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize:   "3.2rem", fontWeight: 600, fontStyle: "italic",
          color:      "#fff", marginTop: 22,
          animation:  "lpFadeUp 0.5s ease 0.35s both",
          textShadow: `0 0 70px ${theme.glow}`,
        }}>
          Hello, {name} {"\uD83D\uDCAB"}
        </div>
        <div style={{
          fontFamily: "'Inter',sans-serif",
          fontSize:   "0.92rem", color: "rgba(255,255,255,0.42)",
          marginTop:  10, animation: "lpFadeUp 0.5s ease 0.55s both",
        }}>
          Opening your world{"…"}
        </div>
        <div style={{
          display: "flex", gap: 10, justifyContent: "center",
          marginTop: 30, animation: "lpFadeUp 0.5s ease 0.75s both",
        }}>
          {[0,1,2,3,4].map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: "50%",
              background: theme.primary,
              animation: `lpDot 1.2s ease-in-out ${i * 0.17}s infinite alternate`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────────────── */
export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [shake,    setShake]    = useState(false);
  const [burst,    setBurst]    = useState([]);
  const [focused,  setFocused]  = useState(null);
  const [mounted,  setMounted]  = useState(false);
  const [success,  setSuccess]  = useState(null);
  const tilt = useTilt(5);

  useEffect(() => {
    injectStyles();
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const detectedUser = USERS[password] || "default";
  const theme        = THEMES[detectedUser];
  const greeting     = useTypewriter(
    `${theme.greeting}, ${theme.name}`,
    50, mounted
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const uname     = username.trim().toUpperCase();
    const validUser = USERS[password];
    const validName = uname === CORRECT_USER || uname === "ADMIN";

    if (validName && validUser) {
      setBurst(Array.from({ length: 20 }, (_, i) => ({
        id:    i,
        left:  `${2 + i * 4.8}%`,
        delay: `${i * 0.04}s`,
        dur:   `${1.1 + Math.random() * 0.75}s`,
        sym:   theme.burst[i % theme.burst.length],
        size:  `${18 + (i % 3) * 9}px`,
      })));
      setTimeout(() => setSuccess({ name: THEMES[validUser]?.name || "Guest" }), 350);
      setTimeout(() => onLogin(validUser), 1900);
    } else {
      const msg = !validName
        ? "That name doesn\u2019t match \uD83D\uDC94"
        : "Wrong password, try again \uD83D\uDD10";
      setError(msg);
      setShake(true);
      setTimeout(() => { setShake(false); setError(""); }, 750);
    }
  };

  /* ── input style helper ── */
  const inputStyle = (isFocused, hasMatch) => ({
    width:        "100%",
    boxSizing:    "border-box",
    padding:      "15px 20px",
    background:   isFocused
      ? `${theme.inputBg.replace("0.05", "0.09")}`
      : theme.inputBg,
    border: `1.5px solid ${
      isFocused  ? theme.primary + "cc"
      : hasMatch ? theme.primary + "60"
      :            "rgba(255,255,255,0.10)"
    }`,
    borderRadius:  "14px",
    color:         "#ffffff",
    fontFamily:    "'Inter',sans-serif",
    fontSize:      "0.95rem",
    outline:       "none",
    transition:    "all 0.28s ease",
    boxShadow:     isFocused
      ? `0 0 0 3px ${theme.glowSoft}, 0 6px 24px rgba(0,0,0,0.3)`
      : "none",
    letterSpacing: hasMatch ? "1.5px" : "normal",
    caretColor:    theme.primary,
  });

  const trans = (delay) => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "transparent", position: "relative",
      overflow: "hidden", padding: "20px",
    }}>

      {/* background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -1,
        background: theme.bg, transition: "background 1s ease",
      }} />

      {/* ambient orbs */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse at 18% 26%, ${theme.orb1} 0%, transparent 52%),
          radial-gradient(ellipse at 84% 80%, ${theme.orb2} 0%, transparent 48%)
        `,
        transition: "background 1s ease",
      }} />

      <Starfield color={theme.primary} />
      <PulseRings color={theme.primary} />
      <FloatingParticles theme={theme} />
      <CursorTrail color={theme.primary} />

      {/* burst on success */}
      {burst.map(h => (
        <span key={h.id} style={{
          position: "fixed", bottom: "-60px", left: h.left,
          fontSize: h.size, pointerEvents: "none", zIndex: 200,
          animation: `lpFloat ${h.dur} ${h.delay} linear forwards`,
          filter: `drop-shadow(0 0 8px ${theme.primary})`,
        }}>
          {h.sym}
        </span>
      ))}

      {success && <SuccessOverlay theme={theme} name={success.name} />}

      {/* ══════════════ CARD ══════════════ */}
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onMouseEnter={tilt.onMouseEnter}
        className={`tilt-card${shake ? " lp-shake" : ""}`}
        style={{
          position:     "relative",
          zIndex:       10,
          width:        "100%",
          maxWidth:     "430px",
          background:   "linear-gradient(145deg, rgba(7,2,18,0.86) 0%, rgba(12,3,28,0.90) 100%)",
          border:       `1px solid ${theme.primary}22`,
          borderRadius: "34px",
          padding:      "54px 44px 48px",
          boxShadow:    `
            0 48px 110px rgba(0,0,0,0.78),
            0 0 90px ${theme.glowSoft},
            inset 0 1px 0 rgba(255,255,255,0.07),
            inset 0 0 0 1px rgba(255,255,255,0.03)
          `,
          backdropFilter:    "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          opacity:   mounted ? 1 : 0,
          animation: mounted ? "lpCardIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
          overflow:  "hidden",
        }}
      >
        {/* spinning conic border */}
        <div style={{
          position:   "absolute", inset: -2, borderRadius: 36, zIndex: 0,
          background: `conic-gradient(from 0deg, transparent 0deg, ${theme.primary} 55deg, ${theme.secondary} 115deg, transparent 175deg, transparent 360deg)`,
          animation:  "lpSpin 4.5s linear infinite",
          WebkitMaskImage: "radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))",
          maskImage:       "radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))",
          opacity:    0.55,
        }} />

        {/* top shimmer ribbon */}
        <div style={{
          position:       "absolute", top: 0, left: 0, right: 0,
          height:         "2px", zIndex: 3,
          background:     `linear-gradient(90deg, transparent, ${theme.primary}, ${theme.secondary}, ${theme.primary}, transparent)`,
          backgroundSize: "200% 100%",
          borderRadius:   "34px 34px 0 0",
          animation:      "lpRibbon 3s linear infinite",
        }} />

        {/* tilt shine layer */}
        <div className="tilt-shine" style={{ borderRadius: "34px", zIndex: 2 }} />

        {/* corner status dots */}
        <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 5, zIndex: 3 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%",
              background: theme.primary, opacity: 0.3,
              animation: `lpDot 1.9s ease-in-out ${i * 0.38}s infinite alternate`,
            }} />
          ))}
        </div>

        {/* ── AVATAR ── */}
        <div style={{ textAlign: "center", marginBottom: 30, position: "relative", zIndex: 2, ...trans(0.05) }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* halo glow */}
            <div style={{
              position: "absolute", inset: -30, borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.primary}20 0%, transparent 65%)`,
              animation:  "lpAvatarFloat 3.8s ease-in-out infinite",
            }} />
            {/* inner orbit */}
            <div style={{
              position: "absolute", inset: -15, borderRadius: "50%",
              border:   `1.5px dashed ${theme.primary}45`,
              animation: "lpOrbitCW 7s linear infinite",
            }} />
            {/* outer orbit */}
            <div style={{
              position: "absolute", inset: -24, borderRadius: "50%",
              border:   `1px dashed ${theme.secondary}28`,
              animation: "lpOrbitCCW 13s linear infinite",
            }} />
            {/* avatar box */}
            <div style={{
              width: 90, height: 90,
              background:    `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              borderRadius:  "28px",
              display:       "flex", alignItems: "center", justifyContent: "center",
              fontSize:      "2.8rem", lineHeight: 1,
              boxShadow:     `0 18px 52px ${theme.glow}, 0 0 0 1.5px rgba(255,255,255,0.12), 0 0 70px ${theme.primary}30`,
              animation:     "lpAvatarPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
              position:      "relative", zIndex: 1,
            }}>
              {theme.avatar}
            </div>
          </div>
        </div>

        {/* ── HEADING ── */}
        <div style={{ textAlign: "center", marginBottom: 30, position: "relative", zIndex: 2 }}>

          {/* badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: `${theme.primary}12`, border: `1px solid ${theme.primary}28`,
            borderRadius: 50, padding: "5px 14px",
            fontFamily: "'Inter',sans-serif",
            fontSize: "0.6rem", fontWeight: 700,
            color: theme.primary, letterSpacing: "2.5px", textTransform: "uppercase",
            marginBottom: 14,
            ...trans(0.15),
          }}>
            <span>{"\u2756"}</span>
            <span>{detectedUser === "default" ? "Welcome" : "Back Again"}</span>
            <span>{"\u2756"}</span>
          </div>

          {/* typewriter title */}
          <h1 style={{
            fontFamily:   "'Cormorant Garamond',serif",
            fontSize:     "2.7rem", fontWeight: 600, fontStyle: "italic",
            margin:       "0 0 12px", lineHeight: 1.1, minHeight: "3.4rem",
            background:   `linear-gradient(90deg, #fff 0%, ${theme.primary} 30%, ${theme.secondary} 60%, #fff 80%, ${theme.primary} 100%)`,
            backgroundSize: "300% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip: "text",
            animation:    "lpTitleShine 4.5s linear infinite",
            filter:       `drop-shadow(0 2px 20px ${theme.glowSoft})`,
          }}>
            {greeting}
            <span style={{
              animation:           "lpBlink 1s step-end infinite",
              opacity:             0.4,
              WebkitTextFillColor: "rgba(255,255,255,0.4)",
            }}>|</span>
          </h1>

          {/* subtitle */}
          <p style={{
            fontFamily: "'Inter',sans-serif",
            fontSize:   "0.85rem", color: "rgba(255,255,255,0.32)",
            margin: 0, lineHeight: 1.75,
            ...trans(0.25),
          }}>
            {theme.sub}
          </p>
        </div>

        {/* divider */}
        <div style={{
          height: "1px", marginBottom: 28,
          background: `linear-gradient(90deg, transparent, ${theme.primary}48, ${theme.secondary}32, transparent)`,
          position: "relative", zIndex: 2,
        }} />

        {/* ── USERNAME ── */}
        <div style={{ marginBottom: 16, position: "relative", zIndex: 2, ...trans(0.30) }}>
          <label style={{
            display: "block", fontFamily: "'Inter',sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            color: "rgba(255,255,255,0.32)", textTransform: "uppercase",
            letterSpacing: "2px", marginBottom: 9,
          }}>
            Username
          </label>
          <input
            type="text"
            placeholder={"Enter your name\u2026"}
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            onFocus={() => setFocused("user")}
            onBlur={() => setFocused(null)}
            autoComplete="off"
            style={inputStyle(focused === "user", false)}
          />
        </div>

        {/* ── PASSWORD ── */}
        <div style={{ marginBottom: 24, position: "relative", zIndex: 2, ...trans(0.42) }}>
          <label style={{
            display: "block", fontFamily: "'Inter',sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            color: "rgba(255,255,255,0.32)", textTransform: "uppercase",
            letterSpacing: "2px", marginBottom: 9,
          }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder={"Enter password\u2026"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
              autoComplete="off"
              style={{ ...inputStyle(focused === "pass", !!USERS[password]), paddingRight: 52 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label="Toggle password visibility"
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: showPass ? theme.primary : "rgba(255,255,255,0.28)",
                padding: "4px", display: "flex", alignItems: "center",
                transition: "color 0.2s",
              }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* detected user hint */}
          {USERS[password] && (
            <div style={{
              marginTop: 9, display: "flex", alignItems: "center", gap: 7,
              animation: "lpFadeUp 0.3s ease",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: theme.primary,
                animation: "lpDot 1s ease-in-out infinite alternate",
              }} />
              <span style={{
                fontFamily: "'Inter',sans-serif", fontSize: "0.69rem",
                color: theme.primary, fontWeight: 600,
              }}>
                {THEMES[USERS[password]].name} detected {"\u2713"}
              </span>
            </div>
          )}
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            marginBottom: 18,
            padding: "12px 18px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.22)",
            borderRadius: "13px",
            fontFamily: "'Inter',sans-serif",
            fontSize: "0.82rem", color: "#fca5a5",
            textAlign: "center",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            animation: "lpFadeUp 0.3s ease",
            position: "relative", zIndex: 2,
          }}>
            <Lock size={13} />
            {error}
          </div>
        )}

        {/* ── SUBMIT BUTTON ── */}
        <div style={{ position: "relative", zIndex: 2, ...trans(0.55) }}>
          <button
            type="submit"
            style={{
              width:          "100%",
              padding:        "17px",
              background:     `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
              border:         "none",
              borderRadius:   "18px",
              color:          "#fff",
              fontFamily:     "'Inter',sans-serif",
              fontSize:       "0.97rem",
              fontWeight:     700,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            11,
              boxShadow:      `0 14px 44px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.14)`,
              transition:     "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
              letterSpacing:  "0.35px",
              animation:      "lpHeartbeat 2.5s ease-in-out 2.2s infinite",
              position:       "relative",
              overflow:       "hidden",
            }}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, {
                transform: "translateY(-3px) scale(1.03)",
                boxShadow: `0 24px 60px ${theme.glow}`,
                animationPlayState: "paused",
              });
            }}
            onMouseLeave={e => {
              Object.assign(e.currentTarget.style, {
                transform: "translateY(0) scale(1)",
                boxShadow: `0 14px 44px ${theme.glow}`,
                animationPlayState: "running",
              });
            }}
            onMouseDown={e => { e.currentTarget.style.transform = "translateY(1px) scale(0.98)"; }}
            onMouseUp={e =>   { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; }}
          >
            {/* shimmer sweep */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "18px",
              background: "linear-gradient(105deg, transparent 32%, rgba(255,255,255,0.22) 50%, transparent 68%)",
              backgroundSize: "200% 100%",
              animation: "lpRibbon 2.2s linear infinite",
            }} />
            <span style={{ position: "relative" }}>{theme.btnText}</span>
            <ArrowRight size={17} strokeWidth={2.5} style={{ position: "relative" }} />
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: 28, textAlign: "center",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 10,
          position: "relative", zIndex: 2,
          ...trans(0.7),
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Heart size={9} fill={`${theme.primary}40`} stroke="none" />
            <span style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "0.68rem", color: "rgba(255,255,255,0.18)",
              fontStyle: "italic",
            }}>
              Only someone special knows the way in
            </span>
            <Heart size={9} fill={`${theme.primary}40`} stroke="none" />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width: 3.5, height: 3.5, borderRadius: "50%",
                background: `${theme.primary}35`,
                animation: `lpDot 1.7s ease-in-out ${i * 0.24}s infinite alternate`,
              }} />
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}
