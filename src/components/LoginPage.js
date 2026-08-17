import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Heart } from "lucide-react";
import { useTilt } from "../App";

/* ─────────────────────────────────────────────────
   CREDENTIALS
───────────────────────────────────────────────── */
const CORRECT_USER = "DHARYA";
const USERS = {
  "29/02/2008": "sadhana",
  "09/10/2007": "surya",
};

/* ─────────────────────────────────────────────────
   THEMES
───────────────────────────────────────────────── */
const THEMES = {
  sadhana: {
    primary:   "#ff2d78",
    secondary: "#c040f0",
    accent:    "#ff8cc8",
    glow:      "rgba(255,45,120,0.42)",
    glowSoft:  "rgba(255,45,120,0.15)",
    avatar:    "\uD83D\uDC97",
    name:      "Sadhana",
    greeting:  "Welcome back, Sadhana",
    sub:       "Your special world is waiting \u2728",
    btnText:   "Enter my world",
    burst:     ["\uD83D\uDC96","\uD83C\uDF38","\u2728","\uD83D\uDC95","\uD83C\uDF37","\uD83D\uDC97","\u2B50","\uD83C\uDF3A"],
    particles: ["\uD83D\uDC97","\uD83C\uDF38","\u2728","\uD83D\uDC95","\u2B50","\uD83C\uDF37","\uD83D\uDC96","\uD83C\uDF3A"],
    bg:        "linear-gradient(140deg,#07000f 0%,#0f0120 55%,#150028 100%)",
    orb1:      "rgba(200,10,90,0.30)",
    orb2:      "rgba(120,10,200,0.22)",
  },
  surya: {
    primary:   "#00e080",
    secondary: "#00c8e0",
    accent:    "#80ffcc",
    glow:      "rgba(0,224,128,0.38)",
    glowSoft:  "rgba(0,224,128,0.13)",
    avatar:    "\uD83C\uDF3F",
    name:      "Surya",
    greeting:  "Welcome back, Surya",
    sub:       "Your private space is ready \uD83C\uDF3F",
    btnText:   "Enter my world",
    burst:     ["\uD83D\uDC9A","\uD83C\uDF3F","\u2728","\uD83C\uDF43","\u2B50","\uD83C\uDF0A","\uD83D\uDC8E","\uD83C\uDF31"],
    particles: ["\uD83C\uDF3F","\u2728","\u22C6","\u25E6","\uD83C\uDF43","\u2022","\uD83C\uDF31","\u2B50","\uD83D\uDC9A"],
    bg:        "linear-gradient(140deg,#00100a 0%,#011a0e 55%,#001f10 100%)",
    orb1:      "rgba(0,200,110,0.22)",
    orb2:      "rgba(0,180,220,0.16)",
  },
  default: {
    primary:   "#ff2d78",
    secondary: "#f0a020",
    accent:    "#ffb060",
    glow:      "rgba(255,45,120,0.28)",
    glowSoft:  "rgba(255,45,120,0.10)",
    avatar:    "\u2728",
    name:      "Dharya",
    greeting:  "Welcome to Dharya",
    sub:       "Only someone special knows the way in \uD83D\uDD10",
    btnText:   "Enter \u2192",
    burst:     ["\uD83D\uDCAB","\u2B50","\u2728","\uD83C\uDF1F","\uD83D\uDC9B","\uD83D\uDD25","\uD83D\uDCA5","\uD83C\uDF20"],
    particles: ["\u2726","\u00B7","\u2727","\u25E6","\u22C6","\u2B50","\uD83D\uDCAB","\u2728","\uD83C\uDF1F"],
    bg:        "linear-gradient(140deg,#07000f 0%,#0f0120 55%,#150028 100%)",
    orb1:      "rgba(180,10,80,0.20)",
    orb2:      "rgba(100,10,180,0.16)",
  },
};

/* ─────────────────────────────────────────────────
   INJECT KEYFRAMES
───────────────────────────────────────────────── */
function injectStyles() {
  if (document.getElementById("lp-v5")) return;
  const s = document.createElement("style");
  s.id = "lp-v5";
  s.textContent = `
    @keyframes lp5-cardIn {
      0%   { opacity:0; transform:translateY(44px) scale(0.95); }
      100% { opacity:1; transform:translateY(0)    scale(1); }
    }
    @keyframes lp5-avatarPop {
      0%   { transform:scale(0.3) rotate(-18deg); opacity:0; }
      60%  { transform:scale(1.12) rotate(4deg);  opacity:1; }
      100% { transform:scale(1)   rotate(0deg);   opacity:1; }
    }
    @keyframes lp5-avatarFloat {
      0%,100% { transform:translateY(0); }
      50%     { transform:translateY(-8px); }
    }
    @keyframes lp5-titleFadeIn {
      0%   { opacity:0; transform:translateY(10px); }
      100% { opacity:1; transform:translateY(0); }
    }
    @keyframes lp5-pulse {
      0%   { transform:scale(0.86); opacity:0.22; }
      70%  { transform:scale(1.18); opacity:0; }
      100% { transform:scale(1.18); opacity:0; }
    }
    @keyframes lp5-float {
      0%   { transform:translateY(0) rotate(0deg);       opacity:0; }
      7%   { opacity:var(--fp,0.15); }
      88%  { opacity:var(--fp,0.15); }
      100% { transform:translateY(-108vh) rotate(380deg); opacity:0; }
    }
    @keyframes lp5-ribbonMove {
      0%   { background-position:-200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes lp5-fadeUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes lp5-dot {
      from { transform:scale(0.65); opacity:0.3; }
      to   { transform:scale(1.45); opacity:1; }
    }
    @keyframes lp5-blink {
      0%,100% { opacity:0.5; }
      50%     { opacity:0; }
    }
    @keyframes lp5-heartbeat {
      0%,100% { transform:scale(1); }
      14%     { transform:scale(1.055); }
      28%     { transform:scale(1); }
      42%     { transform:scale(1.04); }
    }
    @keyframes lp5-shake {
      0%,100% { transform:translateX(0); }
      15%     { transform:translateX(-9px); }
      30%     { transform:translateX(9px); }
      50%     { transform:translateX(-5px); }
      70%     { transform:translateX(5px); }
      85%     { transform:translateX(-2px); }
    }
    @keyframes lp5-spark {
      0%   { transform:scale(1); opacity:0.8; }
      100% { transform:scale(3); opacity:0; }
    }
    @keyframes lp5-successIn {
      from { opacity:0; transform:scale(0.9); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes lp5-successBounce {
      0%   { transform:scale(0.35) rotate(-16deg); opacity:0; }
      60%  { transform:scale(1.18) rotate(5deg);   opacity:1; }
      100% { transform:scale(1)    rotate(0deg);   opacity:1; }
    }
    .lp5-shake { animation:lp5-shake 0.5s ease !important; }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────
   STARFIELD  (upgraded shooting stars)
───────────────────────────────────────────────── */
function Starfield({ color }) {
  const cvRef  = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const ctx = cv.getContext("2d");

    /* twinkling stars */
    const stars = Array.from({ length: 160 }, () => ({
      x:  Math.random(), y:  Math.random(),
      r:  0.3 + Math.random() * 1.7,
      b:  0.05 + Math.random() * 0.50,
      ph: Math.random() * Math.PI * 2,
      sp: 0.20 + Math.random() * 1.0,
    }));

    /* shooting star pool */
    const shots = [];

    const spawnShot = () => {
      /* random angle between 20°–45° downward */
      const angle  = (20 + Math.random() * 25) * (Math.PI / 180);
      const speed  = 10 + Math.random() * 14;          /* faster */
      const bright = Math.random() < 0.3;              /* 30% chance of bright gold star */
      shots.push({
        x:     Math.random() * cv.width  * 0.75,
        y:     Math.random() * cv.height * 0.45,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        len:   120 + Math.random() * 200,              /* longer tails */
        life:  1,
        decay: 0.013 + Math.random() * 0.010,          /* varied fade speed */
        width: bright ? 2.2 : 1.6,
        headR: bright ? 3.5 : 2.2,
        color: bright ? "#ffd97d" : color,             /* gold or theme colour */
        bright,
      });
    };

    /* spawn 1 immediately, then stagger */
    spawnShot();
    const timer = setInterval(spawnShot, 1400);        /* more frequent */

    const tick = () => {
      const cw = cv.width, ch = cv.height, t = Date.now() / 1000;
      ctx.clearRect(0, 0, cw, ch);

      /* ── stars ── */
      stars.forEach(s => {
        const a = s.b * (0.45 + 0.55 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fill();
      });

      /* ── shooting stars ── */
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx; s.y += s.vy; s.life -= s.decay;
        if (s.life <= 0 || s.x > cw + 250 || s.y > ch + 100) {
          shots.splice(i, 1); continue;
        }
        const alpha = Math.max(0, s.life);

        /* tail gradient */
        const tx = s.x - s.vx * (s.len / Math.max(Math.abs(s.vx), 1));
        const ty = s.y - s.vy * (s.len / Math.max(Math.abs(s.vx), 1));
        const g  = ctx.createLinearGradient(tx, ty, s.x, s.y);
        g.addColorStop(0,    "transparent");
        g.addColorStop(0.40, s.color + "44");
        g.addColorStop(0.75, s.color + "bb");
        g.addColorStop(1,    "#ffffff");

        ctx.save();
        ctx.globalAlpha  = alpha;
        ctx.strokeStyle  = g;
        ctx.lineWidth    = s.width;
        ctx.shadowColor  = s.color;
        ctx.shadowBlur   = s.bright ? 18 : 10;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        /* bright sparkle tip */
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.headR, 0, Math.PI * 2);
        ctx.fillStyle   = "#ffffff";
        ctx.shadowColor = s.color;
        ctx.shadowBlur  = s.bright ? 24 : 14;
        ctx.fill();

        /* extra glow ring for bright shots */
        if (s.bright) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.headR * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = s.color + "33";
          ctx.shadowBlur = 0;
          ctx.fill();
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timer);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return (
    <canvas
      ref={cvRef}
      style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}
    />
  );
}

/* ─────────────────────────────────────────────────
   FLOATING PARTICLES
───────────────────────────────────────────────── */
function FloatingParticles({ theme }) {
  const items = useRef(
    Array.from({ length:18 }, (_,i) => ({
      sym:   theme.particles[i%theme.particles.length],
      left:  `${(i*5.4+1.8)%96}%`,
      size:  `${11+(i%4)*4}px`,
      dur:   `${12+(i%5)*3}s`,
      delay: `${i*0.6}s`,
      op:    (0.12+(i%4)*0.05).toFixed(2),
    }))
  ).current;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,overflow:"hidden"}}>
      {items.map((p,i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-55px", left:p.left,
          fontSize:p.size, color:theme.primary,
          filter:`drop-shadow(0 0 5px ${theme.primary}66)`,
          "--fp":p.op, animation:`lp5-float ${p.dur} linear ${p.delay} infinite`,
        }}>{p.sym}</span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PULSE RINGS
───────────────────────────────────────────────── */
function PulseRings({ color }) {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          position:"absolute",
          width:`${340+i*165}px`, height:`${340+i*165}px`,
          borderRadius:"50%",
          border:`1px solid ${color}${["28","1a","0e"][i]}`,
          animation:`lp5-pulse ${[3.8,5.5,7.8][i]}s ease-out ${i*1.4}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CURSOR TRAIL
───────────────────────────────────────────────── */
function CursorTrail({ color }) {
  const [sparks, setSparks] = useState([]);
  useEffect(() => {
    const h = e => {
      const id = Date.now()+Math.random();
      setSparks(s=>[...s.slice(-24),{id,x:e.clientX,y:e.clientY}]);
      setTimeout(()=>setSparks(s=>s.filter(p=>p.id!==id)),640);
    };
    window.addEventListener("mousemove",h);
    return ()=>window.removeEventListener("mousemove",h);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:2}}>
      {sparks.map(s=>(
        <div key={s.id} style={{
          position:"absolute",left:s.x-3,top:s.y-3,
          width:6,height:6,borderRadius:"50%",
          background:color,boxShadow:`0 0 6px ${color}`,
          animation:"lp5-spark 0.64s ease forwards",
        }}/>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   TYPEWRITER HOOK
───────────────────────────────────────────────── */
function useTypewriter(text, speed=50, active=true) {
  const [out,setOut] = useState("");
  useEffect(()=>{
    if (!active) return;
    setOut("");
    let i=0;
    const t=setInterval(()=>{ i++; setOut(text.slice(0,i)); if(i>=text.length)clearInterval(t); },speed);
    return ()=>clearInterval(t);
  },[text,speed,active]);
  return out;
}

/* ─────────────────────────────────────────────────
   SUCCESS OVERLAY
───────────────────────────────────────────────── */
function SuccessOverlay({ theme, name }) {
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background:`radial-gradient(ellipse at center,${theme.primary}28 0%,rgba(3,0,10,0.97) 68%)`,
      backdropFilter:"blur(24px)", animation:"lp5-successIn 0.38s ease forwards",
    }}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"5.5rem",display:"inline-block",animation:"lp5-successBounce 0.72s cubic-bezier(0.34,1.56,0.64,1) 0.1s both"}}>
          {theme.avatar}
        </div>
        <div style={{
          fontFamily:"'Cormorant Garamond',serif",fontSize:"3.4rem",
          fontWeight:600,fontStyle:"italic",color:"#fff",marginTop:22,
          animation:"lp5-fadeUp 0.5s ease 0.35s both",
          textShadow:`0 0 80px ${theme.glow}`,
        }}>
          Hello, {name} {"\uD83D\uDCAB"}
        </div>
        <p style={{
          fontFamily:"'Inter',sans-serif",fontSize:"0.94rem",
          color:"rgba(255,255,255,0.40)",marginTop:10,
          animation:"lp5-fadeUp 0.5s ease 0.55s both",
        }}>Opening your world{"…"}</p>
        <div style={{display:"flex",gap:11,justifyContent:"center",marginTop:32,animation:"lp5-fadeUp 0.5s ease 0.72s both"}}>
          {[0,1,2,3,4].map((_,i)=>(
            <div key={i} style={{
              width:10,height:10,borderRadius:"50%",background:theme.primary,
              animation:`lp5-dot 1.2s ease-in-out ${i*0.17}s infinite alternate`,
            }}/>
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

  useEffect(()=>{
    injectStyles();
    const t=setTimeout(()=>setMounted(true),80);
    return ()=>clearTimeout(t);
  },[]);

  const detectedUser = USERS[password] || "default";
  const theme        = THEMES[detectedUser];
  const greeting     = useTypewriter(theme.greeting, 55, mounted);

  const handleSubmit = e => {
    e.preventDefault();
    const uname     = username.trim().toUpperCase();
    const validUser = USERS[password];
    const validName = uname===CORRECT_USER || uname==="ADMIN";
    if (validName && validUser) {
      setBurst(Array.from({length:22},(_,i)=>({
        id:i, left:`${2+i*4.5}%`, delay:`${i*0.04}s`,
        dur:`${1.1+Math.random()*0.8}s`,
        sym:theme.burst[i%theme.burst.length],
        size:`${18+(i%3)*10}px`,
      })));
      setTimeout(()=>setSuccess({name:THEMES[validUser]?.name||"Guest"}),360);
      setTimeout(()=>onLogin(validUser),1950);
    } else {
      setError(!validName
        ? "That name doesn\u2019t match \uD83D\uDC94"
        : "Wrong password, try again \uD83D\uDD10");
      setShake(true);
      setTimeout(()=>{setShake(false);setError("");},750);
    }
  };

  /* transition helper */
  const fi = delay => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition:`opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  });

  /* dark glass input style */
  const inp = (isFoc, hasVal) => ({
    width:"100%", boxSizing:"border-box",
    padding:"15px 20px",
    background: isFoc ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
    border:`1.5px solid ${isFoc ? theme.primary+"cc" : hasVal ? theme.primary+"55" : "rgba(255,255,255,0.10)"}`,
    borderRadius:"14px",
    color:"#ffffff",
    fontFamily:"'Inter',sans-serif",
    fontSize:"0.95rem",
    outline:"none",
    transition:"all 0.28s ease",
    boxShadow: isFoc ? `0 0 0 3px ${theme.glowSoft}, 0 6px 24px rgba(0,0,0,0.3)` : "none",
    caretColor: theme.primary,
    letterSpacing: hasVal ? "1.5px" : "normal",
  });

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"transparent", position:"relative", overflow:"hidden", padding:"20px",
    }}>

      {/* background */}
      <div style={{position:"fixed",inset:0,zIndex:-1,background:theme.bg,transition:"background 1s ease"}}/>
      <div style={{
        position:"fixed",inset:0,pointerEvents:"none",zIndex:0,transition:"background 1s ease",
        background:`radial-gradient(ellipse at 18% 25%,${theme.orb1} 0%,transparent 52%),
                    radial-gradient(ellipse at 85% 80%,${theme.orb2} 0%,transparent 48%)`,
      }}/>

      <Starfield color={theme.primary}/>
      <PulseRings color={theme.primary}/>
      <FloatingParticles theme={theme}/>
      <CursorTrail color={theme.primary}/>

      {/* burst */}
      {burst.map(h=>(
        <span key={h.id} style={{
          position:"fixed",bottom:"-60px",left:h.left,
          fontSize:h.size,pointerEvents:"none",zIndex:200,
          animation:`lp5-float ${h.dur} ${h.delay} linear forwards`,
          filter:`drop-shadow(0 0 9px ${theme.primary})`,
        }}>{h.sym}</span>
      ))}

      {success && <SuccessOverlay theme={theme} name={success.name}/>}

      {/* ══════════════════════════════════════
          CARD
      ══════════════════════════════════════ */}
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onMouseEnter={tilt.onMouseEnter}
        className={`tilt-card${shake ? " lp5-shake" : ""}`}
        style={{
          position:"relative", zIndex:10,
          width:"100%", maxWidth:"440px",
          background:"linear-gradient(150deg,rgba(10,2,24,0.90) 0%,rgba(18,4,40,0.94) 100%)",
          border:`1px solid ${theme.primary}30`,
          borderRadius:"32px",
          padding:"52px 44px 48px",
          overflow:"hidden",
          boxShadow:`
            0 50px 110px rgba(0,0,0,0.80),
            0 0 80px ${theme.glowSoft},
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 0 0 1px rgba(255,255,255,0.03)
          `,
          backdropFilter:"blur(36px)",
          WebkitBackdropFilter:"blur(36px)",
          opacity:   mounted ? 1 : 0,
          animation: mounted ? "lp5-cardIn 0.68s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
        }}
      >

        {/* top gradient bar */}
        <div style={{
          position:"absolute",top:0,left:0,right:0,height:"3px",zIndex:4,
          background:`linear-gradient(90deg,transparent,${theme.primary},${theme.accent},${theme.secondary},transparent)`,
          backgroundSize:"200% 100%",
          animation:"lp5-ribbonMove 3s linear infinite",
          borderRadius:"32px 32px 0 0",
          boxShadow:`0 0 18px ${theme.glow}`,
        }}/>

        {/* left side accent glow line */}
        <div style={{
          position:"absolute",top:"20%",bottom:"20%",left:0,width:"2px",zIndex:4,
          background:`linear-gradient(180deg,transparent,${theme.primary}88,${theme.secondary}66,transparent)`,
          borderRadius:"0 2px 2px 0",
        }}/>

        {/* glass shimmer sweep */}
        <div style={{
          position:"absolute",top:0,bottom:0,left:"-80%",width:"55%",zIndex:1,
          background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.04) 50%,transparent 60%)",
          animation:"lp5-ribbonMove 6s ease-in-out infinite",
          backgroundSize:"300% 100%",
          pointerEvents:"none",
        }}/>

        <div className="tilt-shine" style={{borderRadius:"32px",zIndex:2}}/>

        {/* status dots */}
        <div style={{position:"absolute",top:20,right:22,display:"flex",gap:5,zIndex:5}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{
              width:5,height:5,borderRadius:"50%",
              background:theme.primary,opacity:0.28,
              animation:`lp5-dot 2s ease-in-out ${i*0.4}s infinite alternate`,
            }}/>
          ))}
        </div>

        {/* ── AVATAR ── */}
        <div style={{textAlign:"center",marginBottom:28,...fi(0.05)}}>
          <div style={{position:"relative",display:"inline-block"}}>
            {/* glow halo only — no rotating rings */}
            <div style={{
              position:"absolute",inset:-30,borderRadius:"50%",
              background:`radial-gradient(circle,${theme.primary}25 0%,transparent 65%)`,
              filter:"blur(12px)",
              animation:"lp5-avatarFloat 4s ease-in-out infinite",
            }}/>
            {/* avatar box */}
            <div style={{
              width:90,height:90,
              background:`linear-gradient(135deg,${theme.primary},${theme.secondary})`,
              borderRadius:"26px",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"2.8rem",lineHeight:1,
              boxShadow:`
                0 18px 52px ${theme.glow},
                0 0 0 2px rgba(255,255,255,0.14),
                0 0 70px ${theme.primary}30,
                inset 0 1px 0 rgba(255,255,255,0.28)
              `,
              animation:"lp5-avatarPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
              position:"relative",zIndex:1,
            }}>
              {theme.avatar}
            </div>
          </div>
        </div>

        {/* ── BADGE ── */}
        <div style={{textAlign:"center",marginBottom:12,...fi(0.12)}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:`${theme.primary}12`,
            border:`1px solid ${theme.primary}30`,
            borderRadius:50,padding:"5px 16px",
            fontFamily:"'Inter',sans-serif",
            fontSize:"0.60rem",fontWeight:700,
            color:theme.accent,letterSpacing:"2.5px",textTransform:"uppercase",
            boxShadow:`0 0 18px ${theme.glowSoft}`,
          }}>
            <span>{"\u2756"}</span>
            <span>{detectedUser==="default" ? "Welcome" : "Back Again"}</span>
            <span>{"\u2756"}</span>
          </div>
        </div>

        {/* ── TITLE (typewriter, NO gradient clip) ── */}
        <div style={{textAlign:"center",marginBottom:10,...fi(0.18)}}>
          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"2.6rem",fontWeight:600,fontStyle:"italic",
            margin:0,lineHeight:1.15,minHeight:"3.2rem",
            color:"#ffffff",
            textShadow:`0 0 40px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.5)`,
          }}>
            <span style={{color:theme.accent}}>{greeting.split(",")[0]}</span>
            {greeting.includes(",") && (
              <>
                <span style={{color:"rgba(255,255,255,0.75)"}}>,</span>
                {" "}
                <span style={{
                  color:theme.primary,
                  textShadow:`0 0 30px ${theme.glow}`,
                }}>
                  {greeting.split(",")[1]?.trim()}
                </span>
              </>
            )}
            <span style={{
              animation:"lp5-blink 1s step-end infinite",
              opacity:0.45,color:"rgba(255,255,255,0.45)",
            }}>|</span>
          </h1>
        </div>

        {/* ── SUBTITLE ── */}
        <div style={{textAlign:"center",marginBottom:28,...fi(0.25)}}>
          <p style={{
            fontFamily:"'Inter',sans-serif",
            fontSize:"0.85rem",color:"rgba(255,255,255,0.35)",
            margin:0,lineHeight:1.8,
          }}>
            {theme.sub}
          </p>
        </div>

        {/* divider */}
        <div style={{
          height:"1px",marginBottom:28,
          background:`linear-gradient(90deg,transparent,${theme.primary}50,${theme.accent}40,${theme.secondary}35,transparent)`,
          boxShadow:`0 0 8px ${theme.glowSoft}`,
        }}/>

        {/* ── USERNAME ── */}
        <div style={{marginBottom:16,...fi(0.30)}}>
          <label style={{
            display:"block",fontFamily:"'Inter',sans-serif",
            fontSize:"0.62rem",fontWeight:700,
            color:"rgba(255,255,255,0.32)",textTransform:"uppercase",
            letterSpacing:"2px",marginBottom:9,
          }}>Username</label>
          <input
            type="text"
            placeholder={"Enter your name\u2026"}
            value={username}
            onChange={e=>{setUsername(e.target.value);setError("");}}
            onFocus={()=>setFocused("user")}
            onBlur={()=>setFocused(null)}
            autoComplete="off"
            style={inp(focused==="user",false)}
          />
        </div>

        {/* ── PASSWORD ── */}
        <div style={{marginBottom:24,...fi(0.40)}}>
          <label style={{
            display:"block",fontFamily:"'Inter',sans-serif",
            fontSize:"0.62rem",fontWeight:700,
            color:"rgba(255,255,255,0.32)",textTransform:"uppercase",
            letterSpacing:"2px",marginBottom:9,
          }}>Password</label>
          <div style={{position:"relative"}}>
            <input
              type={showPass?"text":"password"}
              placeholder={"Enter password\u2026"}
              value={password}
              onChange={e=>{setPassword(e.target.value);setError("");}}
              onFocus={()=>setFocused("pass")}
              onBlur={()=>setFocused(null)}
              autoComplete="off"
              style={{...inp(focused==="pass",!!USERS[password]),paddingRight:52}}
            />
            <button
              type="button"
              onClick={()=>setShowPass(v=>!v)}
              aria-label="Toggle password visibility"
              style={{
                position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",
                color:showPass?theme.primary:"rgba(255,255,255,0.30)",
                padding:"4px",display:"flex",alignItems:"center",transition:"color 0.2s",
              }}
            >
              {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {USERS[password] && (
            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,animation:"lp5-fadeUp 0.3s ease"}}>
              <div style={{
                width:7,height:7,borderRadius:"50%",
                background:theme.primary,
                boxShadow:`0 0 8px ${theme.primary}`,
                animation:"lp5-dot 1s ease-in-out infinite alternate",
              }}/>
              <span style={{
                fontFamily:"'Inter',sans-serif",fontSize:"0.70rem",
                color:theme.accent,fontWeight:600,
                textShadow:`0 0 10px ${theme.primary}88`,
              }}>
                {THEMES[USERS[password]].name} detected {"\u2713"}
              </span>
            </div>
          )}
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            marginBottom:18,padding:"13px 18px",
            background:"rgba(239,68,68,0.09)",
            border:"1px solid rgba(239,68,68,0.25)",
            borderRadius:"14px",
            fontFamily:"'Inter',sans-serif",
            fontSize:"0.83rem",color:"#fca5a5",
            textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:9,
            animation:"lp5-fadeUp 0.3s ease",
          }}>
            <span>{"⚠️"}</span>{error}
          </div>
        )}

        {/* ── SUBMIT BUTTON ── */}
        <div style={{...fi(0.50)}}>
          <button
            type="submit"
            style={{
              width:"100%",padding:"17px",
              background:`linear-gradient(135deg,${theme.primary} 0%,${theme.secondary} 100%)`,
              border:"none",borderRadius:"18px",color:"#fff",
              fontFamily:"'Inter',sans-serif",
              fontSize:"0.97rem",fontWeight:700,
              cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:11,
              boxShadow:`0 16px 48px ${theme.glow}, 0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)`,
              transition:"transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s",
              letterSpacing:"0.35px",
              animation:"lp5-heartbeat 2.5s ease-in-out 2.5s infinite",
              position:"relative",overflow:"hidden",
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.transform="translateY(-4px) scale(1.03)";
              e.currentTarget.style.boxShadow=`0 26px 65px ${theme.glow}, 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)`;
              e.currentTarget.style.animationPlayState="paused";
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform="translateY(0) scale(1)";
              e.currentTarget.style.boxShadow=`0 16px 48px ${theme.glow}, 0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)`;
              e.currentTarget.style.animationPlayState="running";
            }}
            onMouseDown={e=>{e.currentTarget.style.transform="translateY(1px) scale(0.98)";}}
            onMouseUp={e=>{e.currentTarget.style.transform="translateY(-4px) scale(1.03)";}}
          >
            {/* shimmer sweep */}
            <div style={{
              position:"absolute",inset:0,borderRadius:"18px",
              background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%)",
              backgroundSize:"200% 100%",
              animation:"lp5-ribbonMove 2.4s linear infinite",
            }}/>
            <span style={{position:"relative"}}>{theme.btnText}</span>
            <ArrowRight size={17} strokeWidth={2.5} style={{position:"relative"}}/>
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop:28,textAlign:"center",
          display:"flex",flexDirection:"column",alignItems:"center",gap:10,
          ...fi(0.65),
        }}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <Heart size={9} fill={`${theme.primary}44`} stroke="none"/>
            <span style={{
              fontFamily:"'Inter',sans-serif",fontSize:"0.68rem",
              color:"rgba(255,255,255,0.18)",fontStyle:"italic",
            }}>
              Only someone special knows the way in
            </span>
            <Heart size={9} fill={`${theme.primary}44`} stroke="none"/>
          </div>
          <div style={{display:"flex",gap:6}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{
                width:3.5,height:3.5,borderRadius:"50%",
                background:`${theme.primary}38`,
                animation:`lp5-dot 1.8s ease-in-out ${i*0.25}s infinite alternate`,
              }}/>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}
