import { useState, useEffect, useRef } from "react";
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

/* ── Floating particles ── */
function FloatingParticles({ theme }) {
  const items = [...Array(18)].map((_, i) => ({
    sym:   theme.particles[i % theme.particles.length],
    left:  `${(i * 5.5 + 2) % 96}%`,
    size:  `${11 + (i % 4) * 5}px`,
    dur:   `${8 + (i % 5) * 2.2}s`,
    delay: `${i * 0.55}s`,
    opacity: 0.18 + (i % 3) * 0.08,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
      {items.map((p, i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-40px", left:p.left,
          fontSize:p.size, opacity:p.opacity,
          color: theme.primary,
          animation:`floatUp ${p.dur} linear ${p.delay} infinite`,
          display:"inline-block",
          filter:`drop-shadow(0 0 6px ${theme.primary}88)`,
        }}>{p.sym}</span>
      ))}
    </div>
  );
}

/* ── Pulse rings behind the card ── */
function PulseRings({ theme }) {
  return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:0 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          position:"absolute",
          width:`${340 + i*130}px`, height:`${340 + i*130}px`,
          borderRadius:"50%",
          border:`1px solid ${theme.primary}${["22","18","10"][i]}`,
          animation:`pulseRing ${[3.5,5,7][i]}s ease-out ${i*0.8}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ══ GOLDEN TREE CANVAS — login page background ══ */
function GoldenTree() {
  const cvRef    = useRef(null);
  const rafRef   = useRef(null);
  const tRef     = useRef(0);
  const stateRef = useRef({
    petals:    [],
    stars:     [],
    fireflies: [],
    sparks:    [],
    rings:     [],
    dust:      [],
  });

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const ctx = cv.getContext("2d");

    /* ── pure gold palette ── */
    const GOLDS = [
      "#ffd700","#ffcc00","#ffb800","#f5c842","#ffe066",
      "#ffc200","#ffe599","#ffeaa0","#ffdb4d","#ffd24d",
      "#e6b800","#d4a017","#c8960c","#f0c040","#fff0a0",
    ];
    const pick = () => GOLDS[Math.floor(Math.random() * GOLDS.length)];

    /* ── pre-build blossom positions ── */
    const blossoms = [];
    function branch(x, y, len, ang, depth) {
      if (depth === 0 || len < 5) return;
      const ex = x + Math.cos(ang) * len;
      const ey = y + Math.sin(ang) * len;
      if (depth <= 3) {
        for (let k = 0; k < depth + 3; k++) {
          blossoms.push({
            x: ex + (Math.random() - .5) * 28,
            y: ey + (Math.random() - .5) * 28,
            r: 4 + Math.random() * 9,
            spawnT: 0.1 + Math.random() * 0.65,
            color: pick(),
            sway: Math.random() * Math.PI * 2,
            twinkleOffset: Math.random() * Math.PI * 2,
          });
        }
      }
      branch(ex, ey, len * .70, ang - .42, depth - 1);
      branch(ex, ey, len * .70, ang + .42, depth - 1);
      if (depth > 2) branch(ex, ey, len * .52, ang + (Math.random() - .5) * .3, depth - 2);
    }
    const buildTree = () => {
      blossoms.length = 0;
      branch(cv.width / 2, cv.height * .92, cv.height * .26, -Math.PI / 2, 8);
    };
    buildTree();
    window.addEventListener("resize", buildTree);

    /* ── draw helpers ── */
    function drawHeart(x, y, size, color, alpha) {
      ctx.save(); ctx.globalAlpha = alpha ?? 1;
      ctx.beginPath();
      ctx.moveTo(x, y + size * .3);
      ctx.bezierCurveTo(x, y - size * .2, x - size, y - size * .2, x - size, y + size * .3);
      ctx.bezierCurveTo(x - size, y + size * .85, x, y + size * 1.4, x, y + size * 1.7);
      ctx.bezierCurveTo(x, y + size * 1.4, x + size, y + size * .85, x + size, y + size * .3);
      ctx.bezierCurveTo(x + size, y - size * .2, x, y - size * .2, x, y + size * .3);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.fill(); ctx.restore();
    }

    function drawStar(x, y, r, color, alpha) {
      ctx.save(); ctx.globalAlpha = alpha ?? 1;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const a2 = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
        i === 0 ? ctx.moveTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r)
                : ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
        ctx.lineTo(x + Math.cos(a2) * (r * .42), y + Math.sin(a2) * (r * .42));
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.fill(); ctx.restore();
    }

    function drawTree(x, y, len, ang, depth, alpha) {
      if (depth === 0 || len < 5) return;
      const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey);
      /* trunk → branches: deep amber → bright gold */
      const r = depth > 5 ? 160 : depth > 3 ? 210 : 255;
      const g = depth > 5 ? 100 : depth > 3 ? 165 : 215;
      ctx.strokeStyle = `rgba(${r},${g},0,${alpha})`;
      ctx.lineWidth = Math.max(0.8, depth * 1.7);
      ctx.shadowColor = `rgba(255,215,0,0.65)`; ctx.shadowBlur = depth > 3 ? 12 : 6;
      ctx.stroke(); ctx.shadowBlur = 0;
      drawTree(ex, ey, len * .70, ang - .42, depth - 1, alpha);
      drawTree(ex, ey, len * .70, ang + .42, depth - 1, alpha);
      if (depth > 2) drawTree(ex, ey, len * .52, ang + (Math.random() - .5) * .3, depth - 2, alpha);
    }

    /* ── spawners ── */
    const S = stateRef.current;

    // golden shooting stars
    const starTimer = setInterval(() => {
      S.stars.push({
        x: Math.random() * cv.width, y: Math.random() * cv.height * .35,
        vx: 4 + Math.random() * 7, vy: 2 + Math.random() * 3.5,
        len: 90 + Math.random() * 130, life: 1,
        color: pick(),
      });
    }, 1600);

    // golden fireflies
    for (let i = 0; i < 26; i++) {
      S.fireflies.push({
        x: Math.random() * cv.width, y: cv.height * .08 + Math.random() * cv.height * .78,
        vx: (Math.random() - .5) * .55, vy: (Math.random() - .5) * .55,
        r: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        color: pick(),
      });
    }

    // golden dust particles drifting up
    const dustTimer = setInterval(() => {
      if (tRef.current > 0.25) {
        const cx = cv.width / 2;
        S.dust.push({
          x: cx + (Math.random() - .5) * cv.width * .6,
          y: cv.height * .85 + Math.random() * cv.height * .1,
          vx: (Math.random() - .5) * 1.2,
          vy: -(0.4 + Math.random() * 1.4),
          r: 1 + Math.random() * 3,
          life: 1,
          color: pick(),
        });
      }
    }, 120);

    // heart/star petals drifting up from canopy
    const petalTimer = setInterval(() => {
      if (tRef.current > 0.45) {
        const cx = cv.width / 2;
        S.petals.push({
          x: cx + (Math.random() - .5) * cv.width * .5,
          y: cv.height * .1 + Math.random() * cv.height * .6,
          vx: (Math.random() - .5) * 1.6, vy: -(0.6 + Math.random() * 1.8),
          r: 5 + Math.random() * 10,
          rot: Math.random() * Math.PI * 2, vr: (Math.random() - .5) * .07,
          life: 1,
          isStar: Math.random() > .55,
          color: pick(),
        });
      }
    }, 200);

    // pulse rings at tree base
    const ringTimer = setInterval(() => {
      if (tRef.current > 0.25) {
        S.rings.push({ r: 0, life: 1, color: pick() });
      }
    }, 1000);

    // spark bursts from blossoms
    const sparkTimer = setInterval(() => {
      if (tRef.current > 0.55 && blossoms.length > 0) {
        const b = blossoms[Math.floor(Math.random() * blossoms.length)];
        for (let i = 0; i < 6; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = .6 + Math.random() * 2.5;
          S.sparks.push({
            x: b.x, y: b.y,
            vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            life: 1, r: 1.5 + Math.random() * 2.5, color: b.color,
          });
        }
      }
    }, 500);

    /* ── main tick ── */
    const tick = () => {
      tRef.current += 0.003;
      const t   = tRef.current;
      const cw  = cv.width, ch = cv.height;
      const cx  = cw / 2, cy = ch * .92;
      const now = Date.now();

      ctx.clearRect(0, 0, cw, ch);

      /* subtle golden aurora waves */
      for (let i = 0; i < 4; i++) {
        const aAlpha = 0.03 + Math.sin(now / 3200 + i * 1.1) * 0.015;
        const aGrd = ctx.createLinearGradient(0, ch * (.08 + i * .22), cw, ch * (.38 + i * .18));
        aGrd.addColorStop(0,   `rgba(255,215,0,${aAlpha})`);
        aGrd.addColorStop(0.5, `rgba(255,180,0,${aAlpha * .7})`);
        aGrd.addColorStop(1,   "transparent");
        ctx.fillStyle = aGrd; ctx.fillRect(0, 0, cw, ch);
      }

      /* central gold bloom glow under canopy */
      const gAlpha = Math.min(t * 1.4, 1) * 0.28;
      const grd = ctx.createRadialGradient(cx, cy * .65, 0, cx, cy * .65, cw * .52);
      grd.addColorStop(0,   `rgba(255,215,0,${gAlpha})`);
      grd.addColorStop(.35, `rgba(245,185,0,${gAlpha * .55})`);
      grd.addColorStop(.7,  `rgba(200,140,0,${gAlpha * .2})`);
      grd.addColorStop(1,   "transparent");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, cw, ch);

      /* ground glow halo */
      const hGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, cw * .35);
      hGrd.addColorStop(0,   `rgba(255,200,0,${Math.min(t,1)*0.18})`);
      hGrd.addColorStop(1,   "transparent");
      ctx.fillStyle = hGrd; ctx.fillRect(0, 0, cw, ch);

      /* pulse rings at base */
      S.rings.forEach(ring => {
        ring.r   += 2.4;
        ring.life -= 0.011;
        const a = Math.max(0, ring.life) * 0.4;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color; ctx.lineWidth = 1.5;
        ctx.globalAlpha = a;
        ctx.shadowColor = ring.color; ctx.shadowBlur = 12;
        ctx.stroke(); ctx.restore();
      });
      S.rings = S.rings.filter(r => r.life > 0);

      /* golden tree trunk & branches */
      ctx.save();
      drawTree(cx, cy, ch * .26, -Math.PI / 2, 8, Math.min(t * 2.2, 0.72));
      ctx.restore();

      /* golden blossoms (hearts + stars) with twinkle */
      blossoms.forEach((b, idx) => {
        if (t < b.spawnT) return;
        const lt  = Math.min((t - b.spawnT) / .3, 1);
        const sc  = lt < .6 ? lt / .6 : 1 + Math.sin((lt - .6) / .4 * Math.PI) * .12;
        const sway    = Math.sin(now / 2000 + b.sway) * 2.8;
        const twinkle = .6 + Math.sin(now / 750 + b.twinkleOffset) * .2;
        ctx.save();
        ctx.translate(b.x + sway, b.y); ctx.scale(sc, sc);
        /* alternate hearts and stars */
        if (idx % 3 === 0) {
          drawStar(0, 0, b.r * 1.1, b.color, lt * twinkle);
        } else {
          drawHeart(0, 0, b.r, b.color, lt * twinkle);
        }
        ctx.restore();
      });

      /* golden shooting stars */
      S.stars.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.life -= 0.02;
        const a = Math.max(0, s.life);
        ctx.save(); ctx.globalAlpha = a * .75;
        const g2 = ctx.createLinearGradient(s.x - s.vx * 12, s.y - s.vy * 12, s.x, s.y);
        g2.addColorStop(0, "transparent");
        g2.addColorStop(1, s.color);
        ctx.strokeStyle = g2; ctx.lineWidth = 2.5;
        ctx.shadowColor = s.color; ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * (s.len / s.vx), s.y - s.vy * (s.len / s.vx));
        ctx.lineTo(s.x, s.y);
        ctx.stroke(); ctx.restore();
        drawStar(s.x, s.y, 4, s.color, a * .7);
      });
      S.stars = S.stars.filter(s => s.life > 0 && s.x < cw + 120 && s.y < ch + 120);

      /* golden fireflies */
      S.fireflies.forEach(f => {
        f.x += f.vx + Math.sin(now * .0009 + f.phase) * .55;
        f.y += f.vy + Math.cos(now * .0012 + f.phase) * .45;
        if (f.x < 0) f.x = cw; if (f.x > cw) f.x = 0;
        if (f.y < 0) f.y = ch; if (f.y > ch) f.y = 0;
        const glow = .25 + Math.sin(now * .0018 + f.phase) * .22;
        ctx.save(); ctx.globalAlpha = glow;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color; ctx.shadowBlur = 14;
        ctx.fill(); ctx.restore();
      });

      /* spark bursts */
      S.sparks.forEach(sp => {
        sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.038; sp.vy += 0.04;
        ctx.save(); ctx.globalAlpha = Math.max(0, sp.life) * .85;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color; ctx.shadowBlur = 9;
        ctx.fill(); ctx.restore();
      });
      S.sparks = S.sparks.filter(sp => sp.life > 0);

      /* drifting golden dust */
      S.dust.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.life -= 0.006;
        ctx.save(); ctx.globalAlpha = Math.max(0, d.life) * .55;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color; ctx.shadowBlur = 8;
        ctx.fill(); ctx.restore();
      });
      S.dust = S.dust.filter(d => d.life > 0);

      /* drifting golden petals/stars up */
      S.petals.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.003;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.isStar) {
          drawStar(0, 0, p.r * .6, p.color, Math.max(0, p.life) * .5);
        } else {
          drawHeart(0, 0, p.r * .5, p.color, Math.max(0, p.life) * .45);
        }
        ctx.restore();
      });
      S.petals = S.petals.filter(p => p.life > 0);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(starTimer); clearInterval(dustTimer);
      clearInterval(petalTimer); clearInterval(ringTimer);
      clearInterval(sparkTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", buildTree);
    };
  }, []);

  return (
    <canvas ref={cvRef} style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

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

      {/* Golden Tree background */}
      <GoldenTree />

      <PulseRings theme={theme} />
      <FloatingParticles theme={theme} />
      <SparkleTrail color={theme.primary} />

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
