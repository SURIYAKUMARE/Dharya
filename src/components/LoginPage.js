import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useTilt } from "../App";

const CORRECT_USER = "DHARYA";
const USERS = {
  "29/02/2008": "sadhana",
  "09/10/2007": "surya",
};

const THEMES = {
  sadhana: {
    primary:"#ff1a6e", secondary:"#8b3fc8", glow:"rgba(255,26,110,0.32)",
    avatar:"💗", burst:["💖","🌸","✨","💕","🌷","💗","⭐","🌺"],
    greeting:"Welcome back,", name:"Sadhana",
    sub:"Your special place is waiting for you ✨",
    btnText:"Enter your world",
    bg:"linear-gradient(160deg,#08010f 0%,#0e0118 50%,#130120 100%)",
    orb1:"rgba(194,0,92,0.28)", orb2:"rgba(91,14,166,0.20)",
    particles:["💗","🌸","✨","💕","⭐","🌷","💖","🌺","✦","◦"],
  },
  surya: {
    primary:"#00d97e", secondary:"#06B6D4", glow:"rgba(0,217,126,0.28)",
    avatar:"🌿", burst:["💚","🌿","✨","🍃","⭐","🌊","💎","🌱"],
    greeting:"Welcome back,", name:"Surya",
    sub:"Your private space is ready 🌿",
    btnText:"Enter your world",
    bg:"linear-gradient(160deg,#000f06 0%,#011508 50%,#021a0a 100%)",
    orb1:"rgba(0,217,126,0.20)", orb2:"rgba(6,182,212,0.14)",
    particles:["🌿","✦","·","✧","◦","🍃","∘","🌱","⭐","💚"],
  },
  default: {
    primary:"#ff1a6e", secondary:"#e8a030", glow:"rgba(255,26,110,0.22)",
    avatar:"✨", burst:["💫","⭐","✨","🌟","💛","🔥","💥","🌠"],
    greeting:"Welcome to", name:"Dharya",
    sub:"Only someone special knows the way in 🔐",
    btnText:"Enter →",
    bg:"linear-gradient(160deg,#08010f 0%,#0e0118 50%,#130120 100%)",
    orb1:"rgba(194,0,92,0.18)", orb2:"rgba(91,14,166,0.14)",
    particles:["✦","·","✧","◦","∘","⭐","💫","✨","🌟","◈"],
  },
};

/* ══ STARFIELD CANVAS ══ */
function Starfield({ theme }) {
  const cvRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const ctx = cv.getContext("2d");

    /* stable star positions */
    const stars = [...Array(120)].map(() => ({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.8,
      base: 0.15 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
    }));

    /* shooting star pool */
    const shots = [];
    const spawnShot = () => {
      shots.push({
        x: Math.random() * cv.width * 0.7,
        y: Math.random() * cv.height * 0.4,
        vx: 5 + Math.random() * 8,
        vy: 2 + Math.random() * 4,
        len: 80 + Math.random() * 140,
        life: 1,
        color: theme.primary,
      });
    };
    const shotTimer = setInterval(spawnShot, 1800);

    let frame = 0;
    const tick = () => {
      frame++;
      const cw = cv.width, ch = cv.height;
      const now = Date.now() / 1000;
      ctx.clearRect(0, 0, cw, ch);

      /* twinkling dots */
      stars.forEach(s => {
        const alpha = s.base * (0.55 + 0.45 * Math.sin(now * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      /* occasional coloured star dots in theme colour */
      if (frame % 4 === 0) {
        for (let i = 0; i < 3; i++) {
          const s = stars[(frame * 3 + i) % stars.length];
          const alpha = 0.2 + 0.3 * Math.sin(now * 0.8 + i);
          ctx.beginPath();
          ctx.arc(s.x * cw, s.y * ch, s.r * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = theme.primary + Math.floor(alpha * 255).toString(16).padStart(2, "0");
          ctx.shadowColor = theme.primary;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      /* shooting stars */
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.022;
        if (s.life <= 0 || s.x > cw + 100) { shots.splice(i, 1); continue; }
        const a = Math.max(0, s.life);
        const tailX = s.x - s.vx * (s.len / Math.max(s.vx, 1));
        const tailY = s.y - s.vy * (s.len / Math.max(s.vx, 1));
        const grd = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grd.addColorStop(0, "transparent");
        grd.addColorStop(0.6, s.color + "99");
        grd.addColorStop(1, "#ffffff");
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = a;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        /* tip sparkle */
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = a * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(shotTimer);
      window.removeEventListener("resize", resize);
    };
  }, [theme.primary]); // eslint-disable-line

  return (
    <canvas ref={cvRef} style={{
      position:"fixed", inset:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:0,
    }} />
  );
}

/* ── Floating emoji particles ── */
function FloatingParticles({ theme }) {
  const items = useRef(
    [...Array(16)].map((_, i) => ({
      sym:   theme.particles[i % theme.particles.length],
      left:  `${(i * 6.1 + 1) % 96}%`,
      size:  `${11 + (i % 4) * 4}px`,
      dur:   `${9 + (i % 5) * 2}s`,
      delay: `${i * 0.6}s`,
      opacity: 0.15 + (i % 3) * 0.07,
    }))
  ).current;

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
      {items.map((p, i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-40px", left:p.left,
          fontSize:p.size, opacity:p.opacity, color:theme.primary,
          animation:`floatUp ${p.dur} linear ${p.delay} infinite`,
          display:"inline-block",
          filter:`drop-shadow(0 0 5px ${theme.primary}88)`,
        }}>{p.sym}</span>
      ))}
    </div>
  );
}

/* ── Pulse rings ── */
function PulseRings({ theme }) {
  return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:1 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          position:"absolute",
          width:`${360+i*140}px`, height:`${360+i*140}px`,
          borderRadius:"50%",
          border:`1px solid ${theme.primary}${["1e","16","0e"][i]}`,
          animation:`pulseRing ${[3.5,5,7][i]}s ease-out ${i*0.8}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ── Sparkle cursor trail ── */
function SparkleTrail({ color }) {
  const [sparks, setSparks] = useState([]);
  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setSparks(s => [...s.slice(-18), { id, x:e.clientX, y:e.clientY }]);
      setTimeout(() => setSparks(s => s.filter(sp => sp.id !== id)), 650);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:2 }}>
      {sparks.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:s.x-3, top:s.y-3,
          width:6, height:6, borderRadius:"50%",
          background:color, opacity:0.7,
          animation:"sparkFade 0.65s ease forwards",
        }}/>
      ))}
    </div>
  );
}

/* ── Success overlay ── */
function SuccessOverlay({ theme, name }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:`radial-gradient(ellipse at center, ${theme.primary}20 0%, rgba(4,1,10,0.97) 70%)`,
      backdropFilter:"blur(18px)",
      animation:"successFadeIn 0.4s ease forwards",
    }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"4rem", animation:"successBounce 0.6s cubic-bezier(.34,1.56,.64,1) 0.1s both", display:"inline-block" }}>
          {theme.avatar}
        </div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.8rem", fontWeight:600, fontStyle:"italic", color:"#fff", marginTop:18, animation:"fadeInUp 0.5s ease 0.3s both", textShadow:`0 0 60px ${theme.glow}` }}>
          Hello, {name} 💫
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"1rem", color:"rgba(255,255,255,0.45)", marginTop:8, animation:"fadeInUp 0.5s ease 0.5s both" }}>
          Opening your world…
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:24, animation:"fadeInUp 0.5s ease 0.7s both" }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:theme.primary, animation:`dotPulse 1.2s ease-in-out ${i*0.15}s infinite alternate` }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Typewriter ── */
function useTypewriter(text, speed = 55, start = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!start) return;
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) clearInterval(t); }, speed);
    return () => clearInterval(t);
  }, [text, speed, start]);
  return displayed;
}

/* ══ MAIN LOGIN PAGE ══ */
export default function LoginPage({ onLogin }) {
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState("");
  const [shake,     setShake]     = useState(false);
  const [bursts,    setBursts]    = useState([]);
  const [focused,   setFocused]   = useState(null);
  const [mounted,   setMounted]   = useState(false);
  const [success,   setSuccess]   = useState(null);
  const [cardHover, setCardHover] = useState(false);
  const tilt = useTilt(6);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const detectedUser = USERS[password] || "default";
  const theme        = THEMES[detectedUser];
  const greetingTyped = useTypewriter(theme.greeting + " " + theme.name, 55, mounted);

  const handleSubmit = (e) => {
    e.preventDefault();
    const uname     = username.trim().toUpperCase();
    const validUser = USERS[password];
    const validName = uname === CORRECT_USER || uname === "ADMIN";

    if (validName && validUser) {
      const user = USERS[password];
      setBursts(Array.from({ length:20 }, (_,i) => ({
        id:i, left:`${2+i*4.8}%`,
        delay:`${i*0.04}s`, dur:`${1+Math.random()*0.8}s`,
        sym:theme.burst[i%theme.burst.length], size:`${20+(i%3)*8}px`,
      })));
      setTimeout(() => setSuccess({ name:THEMES[user]?.name || "Guest" }), 400);
      setTimeout(() => onLogin(user), 1900);
    } else {
      setError(!validName ? "That name doesn't match 💔" : "Wrong password, try again 🔐");
      setShake(true);
      setTimeout(() => { setShake(false); setError(""); }, 800);
    }
  };

  const inp = (isFoc, valid) => ({
    width:"100%", boxSizing:"border-box",
    padding:"15px 20px",
    background: isFoc ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
    border:`1.5px solid ${isFoc ? `${theme.primary}cc` : valid ? `${theme.primary}55` : "rgba(255,255,255,0.09)"}`,
    borderRadius:"14px", color:"#fff",
    fontFamily:"'Inter',sans-serif", fontSize:"0.95rem",
    outline:"none", transition:"all 0.3s ease",
    boxShadow: isFoc ? `0 0 0 3px ${theme.glow}, 0 4px 18px rgba(0,0,0,0.25)` : "none",
    letterSpacing: valid ? "2px" : "normal",
  });

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"transparent", position:"relative", overflow:"hidden", padding:"20px",
    }}>
      {/* Base bg */}
      <div style={{ position:"fixed", inset:0, zIndex:-1, background:theme.bg, transition:"background 1.2s ease" }}/>

      {/* Ambient orbs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:`radial-gradient(ellipse at 18% 28%, ${theme.orb1} 0%, transparent 52%), radial-gradient(ellipse at 82% 78%, ${theme.orb2} 0%, transparent 48%)`,
        transition:"background 1.2s ease",
      }}/>

      {/* Canvas starfield + shooting stars */}
      <Starfield theme={theme} />

      <PulseRings theme={theme} />
      <FloatingParticles theme={theme} />
      <SparkleTrail color={theme.primary} />

      {/* Burst on success */}
      {bursts.map(h => (
        <span key={h.id} style={{ position:"fixed", bottom:"-60px", left:h.left, fontSize:h.size, pointerEvents:"none", zIndex:200, animation:`floatUp ${h.dur} ${h.delay} linear forwards`, filter:`drop-shadow(0 0 8px ${theme.primary})` }}>{h.sym}</span>
      ))}

      {success && <SuccessOverlay theme={theme} name={success.name} />}

      {/* ══ CARD ══ */}
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={() => { tilt.onMouseLeave(); setCardHover(false); }}
        onMouseEnter={() => { tilt.onMouseEnter(); setCardHover(true); }}
        className={`tilt-card ${shake ? "login-shake" : ""}`}
        style={{
          position:"relative", zIndex:10,
          width:"100%", maxWidth:"420px",
          background:"linear-gradient(145deg,rgba(8,2,20,0.75) 0%,rgba(12,4,28,0.82) 100%)",
          border:`1px solid ${theme.primary}28`,
          borderRadius:"32px",
          padding:"52px 42px 46px",
          boxShadow:`0 40px 100px rgba(0,0,0,0.75), 0 0 80px ${theme.glow}, 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)`,
          backdropFilter:"blur(28px)",
          WebkitBackdropFilter:"blur(28px)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(36px) scale(0.97)",
          transition:"opacity 0.65s ease, transform 0.65s cubic-bezier(0.34,1.56,0.64,1), border-color 0.6s, box-shadow 0.6s",
        }}
      >
        <div className="tilt-shine" style={{ borderRadius:"32px" }}/>

        {/* Top shimmer ribbon */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"2px",
          background:`linear-gradient(90deg,transparent,${theme.primary},${theme.secondary},${theme.primary},transparent)`,
          borderRadius:"32px 32px 0 0", backgroundSize:"200% 100%",
          animation:"shimmerRibbon 2.5s linear infinite",
        }}/>

        {/* Corner dots */}
        <div style={{ position:"absolute", top:18, right:18, display:"flex", gap:5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:theme.primary, opacity:cardHover?0.9:0.22, animation:`dotPulse 1.8s ease-in-out ${i*0.3}s infinite alternate`, transition:"opacity 0.3s" }}/>
          ))}
        </div>

        {/* Avatar with orbit + halo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ position:"relative", display:"inline-block" }}>
            {/* Halo glow */}
            <div style={{ position:"absolute", inset:-18, borderRadius:"50%", background:`radial-gradient(circle, ${theme.primary}22 0%, transparent 70%)`, animation:"floatEmoji 3s ease-in-out infinite alternate" }}/>
            <div style={{ width:88, height:88, background:`linear-gradient(135deg,${theme.primary},${theme.secondary})`, borderRadius:"26px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.4rem", boxShadow:`0 16px 48px ${theme.glow}, 0 0 0 1.5px rgba(255,255,255,0.1)`, animation:"floatEmoji 3s ease-in-out infinite alternate", position:"relative" }}>
              {theme.avatar}
              {/* Orbit ring */}
              <div style={{ position:"absolute", inset:-12, borderRadius:"50%", border:`1.5px dashed ${theme.primary}35`, animation:"ring3DSpin 8s linear infinite" }}/>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ textAlign:"center", marginBottom:"30px" }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"3px", margin:"0 0 8px" }}>
            ✦ &nbsp;{detectedUser === "default" ? "Welcome" : "Back again"}&nbsp; ✦
          </p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.6rem", fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 10px", lineHeight:1.1, textShadow:`0 0 50px ${theme.glow}`, minHeight:"3.2rem" }}>
            {greetingTyped}<span style={{ animation:"cursorBlink 1s step-end infinite", opacity:0.45 }}>|</span>
          </h1>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"rgba(255,255,255,0.32)", margin:0, lineHeight:1.7, opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(8px)", transition:"all 0.8s ease 0.5s" }}>
            {theme.sub}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height:"1px", background:`linear-gradient(90deg,transparent,${theme.primary}30,transparent)`, marginBottom:"26px" }}/>

        {/* Username */}
        <div style={{ marginBottom:"14px", opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(16px)", transition:"all 0.55s ease 0.35s" }}>
          <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:"0.63rem", fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"1.8px", marginBottom:"8px" }}>
            Username
          </label>
          <input type="text" placeholder="Enter your name…" value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            onFocus={() => setFocused("user")} onBlur={() => setFocused(null)}
            autoComplete="off" style={inp(focused==="user", false)} />
        </div>

        {/* Password */}
        <div style={{ marginBottom:"22px", opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(16px)", transition:"all 0.55s ease 0.48s" }}>
          <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:"0.63rem", fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"1.8px", marginBottom:"8px" }}>
            Password
          </label>
          <div style={{ position:"relative" }}>
            <input type={showPass?"text":"password"} placeholder="Enter password…" value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
              autoComplete="off" style={{ ...inp(focused==="pass", !!USERS[password]), paddingRight:"50px" }} />
            <button type="button" onClick={() => setShowPass(v=>!v)} aria-label="Toggle password visibility"
              style={{ position:"absolute", right:"13px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:showPass?theme.primary:"rgba(255,255,255,0.28)", padding:"4px", display:"flex", alignItems:"center", transition:"color 0.2s" }}>
              {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {USERS[password] && (
            <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6, animation:"fadeInUp 0.3s ease" }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:theme.primary, animation:"dotPulse 1s ease-in-out infinite alternate" }}/>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", color:theme.primary, fontWeight:600 }}>
                {THEMES[USERS[password]].name} detected ✓
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom:"16px", padding:"12px 16px", background:"rgba(239,68,68,0.09)", border:"1px solid rgba(239,68,68,0.22)", borderRadius:"12px", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#fca5a5", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", animation:"shakeIn 0.4s ease" }}>
            <span>⚠️</span>{error}
          </div>
        )}

        {/* Submit */}
        <button type="submit" style={{
          width:"100%", padding:"17px",
          background:`linear-gradient(135deg,${theme.primary} 0%,${theme.secondary} 100%)`,
          border:"none", borderRadius:"18px", color:"#fff",
          fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
          boxShadow:`0 12px 40px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
          transition:"transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
          letterSpacing:"0.4px",
          opacity:mounted?1:0,
          animation:mounted?"btnAppear 0.5s ease 0.65s both":"none",
          position:"relative", overflow:"hidden",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow=`0 22px 55px ${theme.glow}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow=`0 12px 40px ${theme.glow}`; }}
          onMouseDown={e => e.currentTarget.style.transform="translateY(1px) scale(0.98)"}
          onMouseUp={e => e.currentTarget.style.transform="translateY(-3px) scale(1.02)"}
        >
          {/* button shimmer */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)", backgroundSize:"200% 100%", animation:"fg-shimmer 2.5s linear infinite", borderRadius:"18px" }}/>
          <Sparkles size={15} strokeWidth={2}/>
          <span>{theme.btnText}</span>
          <ArrowRight size={16} strokeWidth={2.5}/>
        </button>

        {/* Footer */}
        <div style={{ marginTop:"26px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:"10px", opacity:mounted?1:0, transition:"opacity 0.8s ease 0.85s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <Heart size={8} fill={`${theme.primary}44`} stroke="none"/>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", color:"rgba(255,255,255,0.18)", margin:0, fontStyle:"italic" }}>
              Only someone special knows the way in
            </p>
            <Heart size={8} fill={`${theme.primary}44`} stroke="none"/>
          </div>
          <div style={{ display:"flex", gap:5 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ width:3.5, height:3.5, borderRadius:"50%", background:`${theme.primary}35`, animation:`dotPulse 1.5s ease-in-out ${i*0.2}s infinite alternate` }}/>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
