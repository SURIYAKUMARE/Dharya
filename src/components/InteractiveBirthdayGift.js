import { useState, useEffect, useRef } from "react";

/* ── Confetti particle ── */
const CONFETTI_COLORS = [
  "#ff1a6e","#ff6eb4","#ffd700","#00d97e","#06B6D4",
  "#a855f7","#f59e0b","#ec4899","#10b981","#3b82f6",
];

function Confetti({ active }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn particles
    particlesRef.current = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 5,
      spin: (Math.random() - 0.5) * 0.4,
      angle: Math.random() * Math.PI * 2,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      opacity: 1,
      life: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.12;
        p.life -= 0.006;
        p.opacity = Math.max(0, p.life);
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.life = 1;
          p.opacity = 1;
        }
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        pointerEvents: "none", zIndex: 9998,
        opacity: active ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    />
  );
}

/* ── Floating emoji ribbon ── */
const BALLOONS = ["🎈","🎊","🎉","🎁","✨","🌟","💖","🎀","🍰","🎂","⭐","💕"];

function FloatingRibbon({ active }) {
  const items = BALLOONS.map((sym, i) => ({
    sym, left: `${(i * 8.1 + 2) % 96}%`,
    dur: `${5 + (i % 4) * 1.6}s`,
    delay: `${i * 0.35}s`,
    size: `${20 + (i % 3) * 8}px`,
    opacity: 0.6 + (i % 3) * 0.15,
  }));
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9997, overflow:"hidden" }}>
      {items.map((p, i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-50px", left:p.left,
          fontSize:p.size, opacity:p.opacity,
          animation:`floatUp ${p.dur} linear ${p.delay} infinite`,
          display:"inline-block",
          filter:"drop-shadow(0 0 8px rgba(255,100,200,0.6))",
        }}>{p.sym}</span>
      ))}
    </div>
  );
}

/* ── Star burst ── */
function StarBurst({ count = 12, color = "#ff1a6e" }) {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        return (
          <div key={i} style={{
            position:"absolute", top:"50%", left:"50%",
            width:8, height:8, borderRadius:"50%",
            background:color,
            transformOrigin:"0 0",
            animation:`burst 0.7s ease-out ${i * 0.04}s both`,
            "--angle": `${angle}deg`,
          }} />
        );
      })}
    </div>
  );
}

/* ── Gift layers ── */
const LAYERS = [
  {
    phase: "ribbon",
    emoji: "🎀",
    title: "Pull the Ribbon…",
    sub: "Something magical is inside",
    btnText: "Pull 🎀",
    color: "#ff1a6e",
  },
  {
    phase: "lid",
    emoji: "🎁",
    title: "Lift the Lid…",
    sub: "Almost there! Don't peek yet 👀",
    btnText: "Open 🎁",
    color: "#a855f7",
  },
  {
    phase: "reveal",
    emoji: "🎂",
    title: "Happy Birthday, Sadhana! 🎉",
    sub: "28th Feb — A day as rare and beautiful as you 💕",
    btnText: "Continue →",
    color: "#f59e0b",
  },
];

/* ── Birthday messages carousel ── */
const BDAY_MESSAGES = [
  { icon:"🌸", text:"You came into the world on the rarest day — Feb 29. One of a kind, just like you." },
  { icon:"💫", text:"Every moment with you feels like a gift I never deserved but always treasure." },
  { icon:"🎂", text:"Happy Birthday, Sadhana! May this year bring you all the joy your heart can hold." },
  { icon:"💕", text:"You're the reason I smile without reason. Thank you for existing in my universe." },
  { icon:"🌟", text:"Today is your day — and every day I choose you, again and again, forever." },
];

export default function InteractiveBirthdayGift({ user, onDone }) {
  const [step,       setStep]       = useState(0); // 0=ribbon, 1=lid, 2=reveal, 3=messages, 4=done
  const [confetti,   setConfetti]   = useState(false);
  const [shake,      setShake]      = useState(false);
  const [burst,      setBurst]      = useState(false);
  const [msgIdx,     setMsgIdx]     = useState(0);
  const [animating,  setAnimating]  = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [giftGlow,   setGiftGlow]   = useState(false);

  // Only show for sadhana (or demo), skip for surya
  const isSadhana = user === "sadhana" || user === "demo";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Auto glow pulse on gift
  useEffect(() => {
    const id = setInterval(() => setGiftGlow(g => !g), 1400);
    return () => clearInterval(id);
  }, []);

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);

    if (step === 0) {
      // Pull ribbon
      setTimeout(() => { setStep(1); setAnimating(false); }, 500);
    } else if (step === 1) {
      // Lift lid → reveal
      setBurst(true);
      setConfetti(true);
      setTimeout(() => { setBurst(false); setStep(2); setAnimating(false); }, 700);
      setTimeout(() => setConfetti(false), 6000);
    } else if (step === 2) {
      // Go to messages
      setTimeout(() => { setStep(3); setAnimating(false); }, 300);
    } else if (step === 3) {
      // Cycle messages or finish
      if (msgIdx < BDAY_MESSAGES.length - 1) {
        setMsgIdx(i => i + 1);
        setAnimating(false);
      } else {
        setTimeout(() => { setStep(4); setAnimating(false); }, 300);
      }
    } else if (step === 4) {
      onDone();
    }
  };

  const skip = () => onDone();

  const current = step < 3 ? LAYERS[Math.min(step, 2)] : null;
  const msg = BDAY_MESSAGES[msgIdx];

  // If surya — skip straight through
  if (!isSadhana) {
    onDone();
    return null;
  }

  const theme = {
    bg: "linear-gradient(160deg,#0a0112 0%,#10011a 50%,#1c0130 100%)",
    primary: "#ff1a6e",
    secondary: "#a855f7",
    glow: "rgba(255,26,110,0.35)",
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:theme.bg,
      overflow:"hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`
          radial-gradient(ellipse at 20% 30%, rgba(255,26,110,0.28) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 75%, rgba(168,85,247,0.22) 0%, transparent 50%)
        `,
      }} />

      <Confetti active={confetti} />
      <FloatingRibbon active={step >= 2} />

      {/* Card */}
      <div style={{
        position:"relative", zIndex:10,
        width:"100%", maxWidth:"420px",
        margin:"0 24px",
        background:"rgba(9,4,21,0.92)",
        border:`1.5px solid ${step < 3 ? LAYERS[Math.min(step,2)].color : "#f59e0b"}44`,
        borderRadius:"32px",
        padding:"48px 36px 40px",
        boxShadow:`0 48px 120px rgba(0,0,0,0.75), 0 0 80px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        backdropFilter:"blur(32px)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(50px) scale(0.94)",
        transition:"opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        textAlign:"center",
      }}>
        {/* Shimmer ribbon */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"2.5px",
          background:`linear-gradient(90deg, transparent, ${step < 3 ? LAYERS[Math.min(step,2)].color : "#f59e0b"}, transparent)`,
          borderRadius:"32px 32px 0 0",
          backgroundSize:"200% 100%",
          animation:"shimmerRibbon 2.5s linear infinite",
        }} />

        {/* Step indicator dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:7, marginBottom:28 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: step === i ? 22 : 7,
              height:7, borderRadius:10,
              background: i <= step ? (step < 3 ? LAYERS[Math.min(step,2)].color : "#f59e0b") : "rgba(255,255,255,0.12)",
              transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: i === step ? `0 0 12px ${step < 3 ? LAYERS[Math.min(step,2)].color : "#f59e0b"}88` : "none",
            }} />
          ))}
        </div>

        {/* ── Phase: Ribbon / Lid / Reveal ── */}
        {step < 3 && (
          <div>
            <div style={{
              position:"relative",
              fontSize:"5rem",
              marginBottom:24,
              display:"inline-block",
              animation:`${shake ? "none" : "floatEmoji 2.5s ease-in-out infinite alternate"}`,
              filter:`drop-shadow(0 0 24px ${current.color}88)`,
              transform: shake ? "scale(1.3) rotate(-5deg)" : "scale(1)",
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              {current.emoji}
              {burst && <StarBurst count={14} color={current.color} />}
              {/* Pulsing ring */}
              <div style={{
                position:"absolute", inset:-16, borderRadius:"50%",
                border:`2px solid ${current.color}${giftGlow ? "55" : "22"}`,
                transition:"border-color 0.7s ease",
                animation:"pulseRing 2s ease-out infinite",
              }} />
            </div>

            <h2 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"2rem", fontWeight:600,
              fontStyle:"italic", color:"#fff",
              margin:"0 0 10px",
              textShadow:`0 0 40px ${current.color}66`,
              lineHeight:1.2,
            }}>
              {current.title}
            </h2>
            <p style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:"0.9rem", color:"rgba(255,255,255,0.5)",
              margin:"0 0 32px", lineHeight:1.6,
            }}>
              {current.sub}
            </p>

            <button onClick={handleNext} style={{
              width:"100%", padding:"17px",
              background:`linear-gradient(135deg,${current.color},${theme.secondary})`,
              border:"none", borderRadius:"18px", color:"#fff",
              fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
              cursor:"pointer", letterSpacing:"0.3px",
              boxShadow:`0 14px 42px ${current.color}55`,
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; }}
            >
              {current.btnText}
            </button>
          </div>
        )}

        {/* ── Phase: Messages ── */}
        {step === 3 && (
          <div key={`msg-${msgIdx}`} style={{ animation:"fadeInUp 0.45s ease" }}>
            <div style={{ fontSize:"3.5rem", marginBottom:20, display:"inline-block",
              filter:"drop-shadow(0 0 20px rgba(245,158,11,0.6))",
              animation:"floatEmoji 2.5s ease-in-out infinite alternate",
            }}>
              {msg.icon}
            </div>
            <p style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"1.55rem", fontWeight:600, fontStyle:"italic",
              color:"#fff", lineHeight:1.5, margin:"0 0 28px",
              textShadow:"0 0 40px rgba(245,158,11,0.4)",
            }}>
              "{msg.text}"
            </p>

            {/* Progress */}
            <div style={{ display:"flex", justifyContent:"center", gap:5, marginBottom:28 }}>
              {BDAY_MESSAGES.map((_, i) => (
                <div key={i} style={{
                  width: i === msgIdx ? 18 : 6, height:6, borderRadius:6,
                  background: i <= msgIdx ? "#f59e0b" : "rgba(255,255,255,0.12)",
                  transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              ))}
            </div>

            <button onClick={handleNext} style={{
              width:"100%", padding:"17px",
              background:"linear-gradient(135deg,#f59e0b,#ec4899)",
              border:"none", borderRadius:"18px", color:"#fff",
              fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
              cursor:"pointer",
              boxShadow:"0 14px 42px rgba(245,158,11,0.4)",
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; }}
            >
              {msgIdx < BDAY_MESSAGES.length - 1 ? "Next message →" : "Enter my gift 💗"}
            </button>
          </div>
        )}

        {/* ── Phase: Final / Enter ── */}
        {step === 4 && (
          <div style={{ animation:"fadeInUp 0.45s ease" }}>
            <div style={{ fontSize:"4rem", marginBottom:20, animation:"floatEmoji 2s ease-in-out infinite alternate",
              filter:"drop-shadow(0 0 24px rgba(255,26,110,0.7))",
            }}>
              💗
            </div>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"2.2rem", fontWeight:600, fontStyle:"italic",
              color:"#fff", margin:"0 0 10px",
              textShadow:"0 0 50px rgba(255,26,110,0.5)",
            }}>
              Your gift is waiting inside ✨
            </h2>
            <p style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:"0.9rem", color:"rgba(255,255,255,0.5)",
              margin:"0 0 32px", lineHeight:1.6,
            }}>
              Everything I built here is for you, Sadhana. With love. 💕
            </p>
            <button onClick={onDone} style={{
              width:"100%", padding:"17px",
              background:"linear-gradient(135deg,#ff1a6e,#a855f7)",
              border:"none", borderRadius:"18px", color:"#fff",
              fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
              cursor:"pointer",
              boxShadow:"0 14px 42px rgba(255,26,110,0.45)",
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; }}
            >
              Open my world 💗
            </button>
          </div>
        )}

        {/* Skip button */}
        {step < 4 && (
          <button onClick={skip} style={{
            marginTop:20, background:"none", border:"none",
            color:"rgba(255,255,255,0.25)", cursor:"pointer",
            fontFamily:"'Inter',sans-serif", fontSize:"0.78rem",
            letterSpacing:"0.5px",
            transition:"color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.25)"; }}
          >
            Skip for now →
          </button>
        )}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 1; }
          100% { transform: translateY(-110vh) scale(0.9); opacity: 0; }
        }
        @keyframes floatEmoji {
          0%   { transform: translateY(0) rotate(-3deg); }
          100% { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmerRibbon {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes burst {
          0%   { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(1); opacity:1; }
          100% { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(80px) scale(0); opacity:0; }
        }
        @keyframes dotPulse {
          from { opacity:0.3; transform:scale(0.8); }
          to   { opacity:1;   transform:scale(1.2); }
        }
      `}</style>
    </div>
  );
}
