5import { useState, useEffect, useRef } from "react";
import TreeOfLife from "./TreeOfLife";

/* ── Confetti canvas ── */
const CONFETTI_COLORS = [
  "#ff1a6e","#ff6eb4","#ffd700","#00d97e","#a855f7",
  "#f59e0b","#ec4899","#10b981","#fff","#FFB6C1",
];

function Confetti({ active }) {
  const canvasRef   = useRef(null);
  const particlesRef = useRef([]);
  const rafRef      = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    particlesRef.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 5,
      spin: (Math.random() - 0.5) * 0.4,
      angle: Math.random() * Math.PI * 2,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      life: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.angle += p.spin;
        p.vy += 0.1; p.life -= 0.005;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; p.life = 1; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", inset:0, pointerEvents:"none", zIndex:9998,
      opacity: active ? 1 : 0, transition:"opacity 0.5s ease",
    }} />
  );
}

/* ── Blinking floating hearts (the "blinkit" effect) ── */
const BLINK_HEARTS = ["💖","💗","💕","💓","�","❤️","�","✨","⭐","�"];

function BlinkingHearts({ active }) {
  const items = BLINK_HEARTS.map((sym, i) => ({
    sym,
    left:  `${(i * 9.2 + 3) % 94}%`,
    dur:   `${4 + (i % 4) * 1.4}s`,
    delay: `${i * 0.45}s`,
    blinkDelay: `${(i % 3) * 0.6}s`,
    size:  `${18 + (i % 3) * 8}px`,
  }));
  if (!active) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9997, overflow:"hidden" }}>
      {items.map((p, i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-50px", left:p.left,
          fontSize:p.size,
          animation:`floatUpBday ${p.dur} linear ${p.delay} infinite, heartBlink 1.2s ease-in-out ${p.blinkDelay} infinite`,
          display:"inline-block",
          filter:"drop-shadow(0 0 8px rgba(255,26,110,0.7))",
        }}>{p.sym}</span>
      ))}
    </div>
  );
}

/* ── Birthday messages ── */
const BDAY_MESSAGES = [
  { icon:"🌸", text:"You are the rarest kind of beautiful — inside and out." },
  { icon:"💫", text:"Every moment with you feels like a gift I never deserved but always treasure." },
  { icon:"🎂", text:"Happy Birthday, Sadhana! May this year bring you all the joy your heart can hold." },
  { icon:"💕", text:"You're the reason I smile without reason. Thank you for existing in my universe." },
  { icon:"🌟", text:"Today is your day — and every day I choose you, again and again, forever." },
];

/* ── Blinking heart SVG (like the old proposal heart) ── */
function PulsingHeart({ color = "#ff1a6e", size = 80 }) {
  return (
    <div style={{
      width: size, height: size, margin: "0 auto",
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative",
    }}>
      {/* Outer glow rings — old blinkit style */}
      {[0,1,2].map(i => (
        <div key={i} style={{
          position:"absolute", inset: -(i * 14 + 8),
          borderRadius:"50%",
          border:`2px solid ${color}`,
          opacity: 0,
          animation:`heartRingPulse 2s ease-out ${i * 0.55}s infinite`,
        }} />
      ))}
      <span style={{
        fontSize: size * 0.65,
        animation:"heartBeat 0.85s ease-in-out infinite",
        filter:`drop-shadow(0 0 18px ${color}) drop-shadow(0 0 6px ${color})`,
        display:"inline-block",
        lineHeight:1,
      }}>
        💗
      </span>
    </div>
  );
}

/* ── Gift box phases ── */
const PHASES = [
  { emoji:"🎀", title:"Pull the Ribbon…",  sub:"Something magical is inside",          btn:"Pull 🎀",    color:"#ff1a6e" },
  { emoji:"🎁", title:"Lift the Lid…",     sub:"Almost there! Don't peek yet 👀",       btn:"Open 🎁",    color:"#a855f7" },
  { emoji:"🎂", title:"Happy Birthday, Sadhana! 🎉", sub:"A day as rare and beautiful as you 💕", btn:"Read your messages →", color:"#f59e0b" },
];

export default function InteractiveBirthdayGift({ user, onDone }) {
  const [showTree,   setShowTree]   = useState(true);  // Step 0: tree
  const [step,       setStep]       = useState(0);     // 0,1,2 = gift phases; 3 = messages; 4 = final
  const [confetti,   setConfetti]   = useState(false);
  const [shake,      setShake]      = useState(false);
  const [animating,  setAnimating]  = useState(false);
  const [msgIdx,     setMsgIdx]     = useState(0);
  const [mounted,    setMounted]    = useState(false);

  // Skip straight for surya
  const isSadhana = user === "sadhana" || user === "demo";
  useEffect(() => {
    if (!isSadhana) { onDone(); }
  }, []); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!isSadhana) return null;

  // ── Show Tree of Life first ──
  if (showTree) {
    return <TreeOfLife onDone={() => setShowTree(false)} />;
  }

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);

    if (step < 2) {
      // Phase 0→1→2
      if (step === 1) {
        // Open lid → confetti burst
        setConfetti(true);
        setTimeout(() => setConfetti(false), 6000);
      }
      setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 500);
    } else if (step === 2) {
      // Go to messages
      setTimeout(() => { setStep(3); setAnimating(false); }, 300);
    } else if (step === 3) {
      if (msgIdx < BDAY_MESSAGES.length - 1) {
        setMsgIdx(i => i + 1);
        setAnimating(false);
      } else {
        setTimeout(() => { setStep(4); setAnimating(false); }, 300);
      }
    } else {
      onDone();
    }
  };

  const phase   = step < 3 ? PHASES[Math.min(step, 2)] : null;
  const msg     = BDAY_MESSAGES[msgIdx];
  const accentColor = phase?.color ?? "#ff1a6e";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(160deg,#0a0112 0%,#10011a 50%,#1c0130 100%)",
      overflow:"hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`
          radial-gradient(ellipse at 20% 30%, rgba(255,26,110,0.25) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 75%, rgba(168,85,247,0.2) 0%, transparent 50%)
        `,
      }} />

      <Confetti active={confetti} />
      {/* Blinking hearts appear from step 2 onward */}
      <BlinkingHearts active={step >= 2} />

      {/* ── CARD ── */}
      <div className={`tilt-card ${shake ? "login-shake" : ""}`} style={{
        position:"relative", zIndex:10,
        width:"100%", maxWidth:"420px",
        margin:"0 24px",
        background:"rgba(9,4,21,0.93)",
        border:`1.5px solid ${accentColor}44`,
        borderRadius:"32px",
        padding:"44px 34px 38px",
        boxShadow:`0 48px 120px rgba(0,0,0,0.75), 0 0 80px ${accentColor}33, inset 0 1px 0 rgba(255,255,255,0.07)`,
        backdropFilter:"blur(32px)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(50px) scale(0.94)",
        transition:"opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1), border-color 0.4s ease, box-shadow 0.4s ease",
        textAlign:"center",
      }}>
        <div className="tilt-shine" style={{ borderRadius:"32px" }} />

        {/* Shimmer top ribbon */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"2.5px",
          background:`linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          borderRadius:"32px 32px 0 0",
          backgroundSize:"200% 100%",
          animation:"shimmerRibbon 2.5s linear infinite",
        }} />

        {/* Progress dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:7, marginBottom:28 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: step === i ? 22 : 7, height:7, borderRadius:10,
              background: i <= step ? accentColor : "rgba(255,255,255,0.1)",
              transition:"all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: i === step ? `0 0 14px ${accentColor}99` : "none",
            }} />
          ))}
        </div>

        {/* ── Phases 0,1,2: Gift opening ── */}
        {step < 3 && phase && (
          <div key={`phase-${step}`} style={{ animation:"fadeInUp 0.4s ease" }}>
            {/* Old-style pulsing heart for reveal phase */}
            {step === 2 ? (
              <div style={{ marginBottom:28 }}>
                <PulsingHeart color={phase.color} size={90} />
              </div>
            ) : (
              <div style={{
                fontSize:"4.5rem", marginBottom:28, display:"inline-block",
                animation:`${shake ? "giftShake" : "floatEmoji"} ${shake ? "0.3s" : "2.5s"} ease-in-out ${shake ? "" : "infinite alternate"}`,
                filter:`drop-shadow(0 0 24px ${phase.color}88)`,
                transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                {phase.emoji}
                {/* Pulsing ring around gift */}
                <div style={{
                  position:"absolute", inset:"-16px", borderRadius:"50%",
                  border:`2px solid ${phase.color}44`,
                  animation:"pulseRingBday 1.8s ease-out infinite",
                  pointerEvents:"none",
                }} />
              </div>
            )}

            <h2 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize: step === 2 ? "1.9rem" : "2rem",
              fontWeight:600, fontStyle:"italic", color:"#fff",
              margin:"0 0 10px",
              textShadow:`0 0 40px ${phase.color}66`,
              lineHeight:1.2,
            }}>
              {phase.title}
            </h2>
            <p style={{
              fontFamily:"'Inter',sans-serif", fontSize:"0.9rem",
              color:"rgba(255,255,255,0.5)", margin:"0 0 30px", lineHeight:1.6,
            }}>
              {phase.sub}
            </p>

            <button onClick={handleNext} style={{
              width:"100%", padding:"16px",
              background:`linear-gradient(135deg,${phase.color},${phase.color === "#ff1a6e" ? "#a855f7" : phase.color === "#a855f7" ? "#ec4899" : "#ec4899"})`,
              border:"none", borderRadius:"18px", color:"#fff",
              fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
              cursor:"pointer", letterSpacing:"0.3px",
              boxShadow:`0 12px 40px ${phase.color}55`,
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow=`0 20px 50px ${phase.color}77`; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=`0 12px 40px ${phase.color}55`; }}
            >
              {phase.btn}
            </button>
          </div>
        )}

        {/* ── Messages ── */}
        {step === 3 && (
          <div key={`msg-${msgIdx}`} style={{ animation:"fadeInUp 0.4s ease" }}>
            {/* Blinking heart above message */}
            <div style={{ marginBottom:16 }}>
              <PulsingHeart color="#ff1a6e" size={72} />
            </div>

            <div style={{
              fontSize:"2rem", marginBottom:14,
              filter:"drop-shadow(0 0 16px rgba(255,26,110,0.6))",
              animation:"floatEmoji 2.5s ease-in-out infinite alternate",
            }}>
              {msg.icon}
            </div>

            <p style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"1.5rem", fontWeight:600, fontStyle:"italic",
              color:"#fff", lineHeight:1.55, margin:"0 0 24px",
              textShadow:"0 0 36px rgba(255,26,110,0.4)",
            }}>
              "{msg.text}"
            </p>

            {/* Message progress */}
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:26 }}>
              {BDAY_MESSAGES.map((_, i) => (
                <div key={i} style={{
                  width: i === msgIdx ? 20 : 6, height:6, borderRadius:6,
                  background: i <= msgIdx ? "#ff1a6e" : "rgba(255,255,255,0.12)",
                  transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow: i === msgIdx ? "0 0 12px #ff1a6e99" : "none",
                }} />
              ))}
            </div>

            <button onClick={handleNext} style={{
              width:"100%", padding:"16px",
              background:"linear-gradient(135deg,#ff1a6e,#a855f7)",
              border:"none", borderRadius:"18px", color:"#fff",
              fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
              cursor:"pointer",
              boxShadow:"0 12px 40px rgba(255,26,110,0.45)",
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; }}
            >
              {msgIdx < BDAY_MESSAGES.length - 1 ? "Next message →" : "Enter my gift 💗"}
            </button>
          </div>
        )}

        {/* ── Final enter ── */}
        {step === 4 && (
          <div style={{ animation:"fadeInUp 0.45s ease" }}>
            <div style={{ marginBottom:24 }}>
              <PulsingHeart color="#ff1a6e" size={100} />
            </div>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"2.1rem", fontWeight:600, fontStyle:"italic",
              color:"#fff", margin:"0 0 10px",
              textShadow:"0 0 50px rgba(255,26,110,0.5)",
            }}>
              Your gift is waiting inside ✨
            </h2>
            <p style={{
              fontFamily:"'Inter',sans-serif", fontSize:"0.88rem",
              color:"rgba(255,255,255,0.5)", margin:"0 0 30px", lineHeight:1.6,
            }}>
              Everything here is built for you, Sadhana. With love. 💕
            </p>
            <button onClick={onDone} style={{
              width:"100%", padding:"16px",
              background:"linear-gradient(135deg,#ff1a6e,#a855f7)",
              border:"none", borderRadius:"18px", color:"#fff",
              fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700,
              cursor:"pointer",
              boxShadow:"0 12px 40px rgba(255,26,110,0.45)",
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; }}
            >
              Open my world 💗
            </button>
          </div>
        )}

        {/* Skip */}
        {step < 4 && (
          <button onClick={onDone} style={{
            marginTop:20, background:"none", border:"none",
            color:"rgba(255,255,255,0.22)", cursor:"pointer",
            fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", letterSpacing:"0.5px",
            transition:"color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.22)"; }}
          >
            Skip →
          </button>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity:1; }
          100% { transform: translateY(-110vh) scale(0.9); opacity:0; }
        }
        @keyframes floatEmoji {
          0%   { transform: translateY(0) rotate(-3deg); }
          100% { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmerRibbon {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes heartBeat {
          0%,100% { transform: scale(1); }
          14%     { transform: scale(1.22); }
          28%     { transform: scale(1); }
          42%     { transform: scale(1.16); }
          70%     { transform: scale(1); }
        }
        @keyframes heartRingPulse {
          0%   { transform: scale(0.8); opacity:0.8; }
          100% { transform: scale(1.6); opacity:0; }
        }
        @keyframes heartBlink {
          0%,100% { opacity:1; }
          50%     { opacity:0.25; }
        }
        @keyframes pulseRingBday {
          0%   { transform: scale(0.85); opacity:0.7; }
          100% { transform: scale(1.3);  opacity:0; }
        }
        @keyframes giftShake {
          0%,100% { transform: rotate(0deg) scale(1.3); }
          25%     { transform: rotate(-8deg) scale(1.3); }
          75%     { transform: rotate(8deg) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
