import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════
   CINEMATIC GARDEN  — 4-Act Canvas Experience
   Act 1 : Cupid's bow — drag to aim & release
   Act 2 : Arrow flies → heart jolts → rose flood
   Act 3 : Kinetic wish, glyph by glyph, cinema bars
   Act 4 : Gold bloom → hand-lettered tree of hearts
══════════════════════════════════════════ */

const W = () => window.innerWidth;
const H = () => window.innerHeight;

/* ── palette ── */
const ROSE   = "#e8194b";
const GOLD   = "#f5c842";
const CREAM  = "#fff8f0";
const DARK   = "#0a0005";

/* ── wish text ── */
const WISH = "Every heartbeat is yours, Sadhana 💗";

/* ── inject keyframes once ── */
function injectCSS() {
  if (document.getElementById("cg-css")) return;
  const s = document.createElement("style");
  s.id = "cg-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Cormorant+Garamond:ital,wght@1,600&display=swap');
    @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} 56%{transform:scale(1)} }
    @keyframes roseFlood { 0%{transform:scaleY(0);transform-origin:bottom} 100%{transform:scaleY(1);transform-origin:bottom} }
    @keyframes glyphIn   { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes barSlide  { 0%{transform:scaleY(0)} 100%{transform:scaleY(1)} }
    @keyframes goldPulse { 0%,100%{opacity:.7} 50%{opacity:1} }
    @keyframes petalDrift{
      0%  {transform:translateY(0) rotate(0deg);   opacity:1}
      100%{transform:translateY(-160px) rotate(45deg); opacity:0}
    }
    @keyframes treeBranch{ 0%{stroke-dashoffset:400} 100%{stroke-dashoffset:0} }
    @keyframes heartPop  { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.25) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
    @keyframes nameWrite { 0%{clip-path:inset(0 100% 0 0)} 100%{clip-path:inset(0 0% 0 0)} }
    @keyframes camPush   { 0%{transform:scale(1)} 100%{transform:scale(1.06)} }
    @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `;
  document.head.appendChild(s);
}

/* ══ ACT 1 — BOW CANVAS ══ */
function BowScene({ onFire }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef({ dragging: false, pull: 0, angle: -Math.PI / 2 });
  const rafRef     = useRef(null);
  const startRef   = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    const { pull, angle } = stateRef.current;

    ctx.clearRect(0, 0, w, h);

    /* — starfield bg — */
    ctx.fillStyle = DARK;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 137.5 + 11) % w);
      const sy = ((i * 79.3  + 37) % h);
      const r  = 0.6 + (i % 3) * 0.4;
      ctx.globalAlpha = 0.3 + (i % 4) * 0.12;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
    ctx.restore();

    /* — heart target — */
    const hx = w / 2, hy = h * 0.22;
    const hs = 34;
    ctx.save();
    ctx.globalAlpha = 0.9;
    const beatScale = 1 + Math.sin(Date.now() / 350) * 0.06;
    ctx.translate(hx, hy);
    ctx.scale(beatScale, beatScale);
    drawHeart(ctx, 0, 0, hs, ROSE, ROSE);
    ctx.restore();

    /* — instruction label — */
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = CREAM;
    ctx.font = "13px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("↑ aim here", hx, hy + hs + 22);
    ctx.restore();

    /* — bow body — */
    const bx = w / 2, by = h * 0.72;
    const bowR = 90;
    const maxPull = 70;
    const pd = pull * maxPull;          // pull distance px

    /* bow arc */
    ctx.save();
    ctx.strokeStyle = "#c8a05a";
    ctx.lineWidth   = 5;
    ctx.lineCap     = "round";
    ctx.shadowColor = GOLD;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(bx, by, bowR, Math.PI * 0.55, Math.PI * 1.45);
    ctx.stroke();
    ctx.restore();

    /* bow tips */
    const tip1 = { x: bx + bowR * Math.cos(Math.PI * 0.55), y: by + bowR * Math.sin(Math.PI * 0.55) };
    const tip2 = { x: bx + bowR * Math.cos(Math.PI * 1.45), y: by + bowR * Math.sin(Math.PI * 1.45) };

    /* string anchor (pull point) */
    const midStr = { x: bx - pd, y: by };

    /* string */
    ctx.save();
    ctx.strokeStyle = CREAM;
    ctx.lineWidth   = 2;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(tip1.x, tip1.y);
    ctx.lineTo(midStr.x, midStr.y);
    ctx.lineTo(tip2.x, tip2.y);
    ctx.stroke();
    ctx.restore();

    /* arrow */
    if (pull > 0.02) {
      const arrowTip = { x: bx + pd * 0.4, y: by };
      const arrowTail= { x: midStr.x - 30,  y: by };
      ctx.save();
      ctx.strokeStyle = "#e0c06a";
      ctx.lineWidth   = 3;
      ctx.lineCap     = "round";
      ctx.shadowColor = GOLD;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.moveTo(arrowTail.x, arrowTail.y);
      ctx.lineTo(arrowTip.x,  arrowTip.y);
      ctx.stroke();
      /* arrowhead */
      ctx.fillStyle = "#e0c06a";
      ctx.beginPath();
      ctx.moveTo(arrowTip.x + 10, arrowTip.y);
      ctx.lineTo(arrowTip.x - 6,  arrowTip.y - 6);
      ctx.lineTo(arrowTip.x - 6,  arrowTip.y + 6);
      ctx.closePath();
      ctx.fill();
      /* fletching */
      ctx.strokeStyle = ROSE;
      ctx.lineWidth = 2;
      for (let f = 0; f < 3; f++) {
        ctx.beginPath();
        ctx.moveTo(arrowTail.x + f * 8, arrowTail.y);
        ctx.lineTo(arrowTail.x + f * 8 - 6, arrowTail.y - 8 + f * 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* — pull indicator — */
    if (pull > 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = GOLD;
      ctx.font = "bold 14px 'Inter',sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(pull * 100)}%`, bx, by + bowR + 28);
      ctx.restore();
    }

    /* — hint — */
    if (pull < 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.45 + Math.sin(Date.now() / 600) * 0.15;
      ctx.fillStyle = CREAM;
      ctx.font = "14px 'Inter',sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("drag down to pull · release to fire", w / 2, by + bowR + 30);
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    injectCSS();
    const cv = canvasRef.current; if (!cv) return;
    cv.width  = W();
    cv.height = H();
    const onResize = () => { cv.width = W(); cv.height = H(); };
    window.addEventListener("resize", onResize);
    rafRef.current = requestAnimationFrame(draw);

    /* pointer events */
    const getY = e => (e.touches ? e.touches[0].clientY : e.clientY);
    const onDown = e => { stateRef.current.dragging = true; startRef.current = getY(e); };
    const onMove = e => {
      if (!stateRef.current.dragging) return;
      const dy = Math.max(0, getY(e) - startRef.current);
      stateRef.current.pull = Math.min(dy / 160, 1);
    };
    const onUp = () => {
      if (!stateRef.current.dragging) return;
      stateRef.current.dragging = false;
      if (stateRef.current.pull > 0.15) { onFire(stateRef.current.pull); }
      stateRef.current.pull = 0;
    };
    /* keyboard */
    const onKey = e => {
      if (e.code === "Space" || e.code === "ArrowDown") {
        stateRef.current.pull = Math.min(stateRef.current.pull + 0.12, 1);
      }
      if ((e.code === "Space" || e.code === "ArrowUp") && stateRef.current.pull > 0.15) {
        onFire(stateRef.current.pull); stateRef.current.pull = 0;
      }
    };
    cv.addEventListener("mousedown",  onDown);
    cv.addEventListener("mousemove",  onMove);
    cv.addEventListener("mouseup",    onUp);
    cv.addEventListener("touchstart", onDown, { passive: true });
    cv.addEventListener("touchmove",  onMove, { passive: true });
    cv.addEventListener("touchend",   onUp);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",  onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [draw, onFire]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", cursor: "crosshair", touchAction: "none" }}
    />
  );
}

/* ══ ACT 2 — ARROW FLIGHT + HEART BURST ══ */
function ArrowFlight({ power, onDone }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const stateRef  = useRef({ t: 0, phase: "fly" }); // fly → jolt → flood

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width  = W();
    cv.height = H();

    const bx = cv.width  / 2;
    const by = cv.height * 0.72;
    const tx = cv.width  / 2;
    const ty = cv.height * 0.22;

    const roses = [];
    let floodH = 0;
    let joltScale = 1;
    let joltDir   = 1;
    let joltCount = 0;

    const spawnRoses = () => {
      for (let i = 0; i < 80; i++) {
        roses.push({
          x:   Math.random() * cv.width,
          y:   cv.height + Math.random() * 40,
          vx:  (Math.random() - 0.5) * 3,
          vy:  -(4 + Math.random() * 6),
          r:   8 + Math.random() * 14,
          rot: Math.random() * Math.PI * 2,
          vr:  (Math.random() - 0.5) * 0.12,
          alpha: 1,
        });
      }
    };

    const tick = () => {
      const { t, phase } = stateRef.current;
      ctx.clearRect(0, 0, cv.width, cv.height);

      /* bg */
      ctx.fillStyle = DARK;
      ctx.fillRect(0, 0, cv.width, cv.height);

      if (phase === "fly") {
        /* arrow travelling upward */
        const prog  = Math.min(t / 0.6, 1);
        const eased = 1 - Math.pow(1 - prog, 3);
        const ax = bx + (tx - bx) * eased;
        const ay = by + (ty - by) * eased - Math.sin(prog * Math.PI) * 40;

        /* draw arrow */
        ctx.save();
        ctx.strokeStyle = "#e0c06a";
        ctx.lineWidth   = 4;
        ctx.shadowColor = GOLD;
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.moveTo(ax - 20, ay + 20);
        ctx.lineTo(ax + 10, ay - 10);
        ctx.stroke();
        ctx.fillStyle = "#e0c06a";
        ctx.beginPath();
        ctx.moveTo(ax + 10, ay - 10);
        ctx.lineTo(ax - 2,  ay + 2);
        ctx.lineTo(ax + 2,  ay - 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        /* heart — normal */
        ctx.save();
        ctx.translate(tx, ty);
        drawHeart(ctx, 0, 0, 34, ROSE, ROSE);
        ctx.restore();

        if (prog >= 1) { stateRef.current.phase = "jolt"; stateRef.current.t = 0; spawnRoses(); }

      } else if (phase === "jolt") {
        /* heart jolts then breaks */
        joltCount++;
        joltScale += joltDir * 0.06;
        if (joltScale > 1.4 || joltScale < 0.7) joltDir *= -1;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.scale(joltScale, joltScale);
        const alpha = Math.max(0, 1 - (t / 0.5));
        drawHeart(ctx, 0, 0, 34, ROSE, ROSE, alpha);
        ctx.restore();

        /* rose flood rises */
        floodH = Math.min((t / 0.5) * cv.height * 1.3, cv.height * 1.3);
        ctx.save();
        const grad = ctx.createLinearGradient(0, cv.height - floodH, 0, cv.height);
        grad.addColorStop(0, "#ff4d78");
        grad.addColorStop(0.5, "#e8194b");
        grad.addColorStop(1,   "#8b0028");
        ctx.fillStyle = grad;
        ctx.fillRect(0, cv.height - floodH, cv.width, floodH);
        ctx.restore();

        /* floating rose petals */
        roses.forEach(r => {
          r.x   += r.vx; r.y += r.vy; r.rot += r.vr;
          ctx.save();
          ctx.translate(r.x, r.y);
          ctx.rotate(r.rot);
          ctx.globalAlpha = Math.max(0, r.alpha - t * 0.5);
          ctx.font = `${r.r * 2}px serif`;
          ctx.textAlign = "center";
          ctx.fillText("🌹", 0, 0);
          ctx.restore();
        });

        if (t > 0.55) { stateRef.current.phase = "done"; }

      } else {
        /* final rose-flooded frame — hold 300ms then done */
        const grad = ctx.createLinearGradient(0, 0, 0, cv.height);
        grad.addColorStop(0, "#ff4d78");
        grad.addColorStop(0.5, "#e8194b");
        grad.addColorStop(1,   "#5c0018");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cv.width, cv.height);
        if (t > 0.35) { cancelAnimationFrame(rafRef.current); onDone(); return; }
      }

      stateRef.current.t += 0.016;
      rafRef.current = requestAnimationFrame(tick);
    };

    const ctx = cv.getContext("2d");
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone, power]);

  return (
    <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
  );
}

/* ══ ACT 3 — KINETIC WISH ══ */
function WishScene({ onDone }) {
  const [chars, setChars] = useState([]);
  const [done,  setDone]  = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < WISH.length) {
        setChars(c => [...c, WISH[i]]);
        i++;
      } else {
        clearInterval(id);
        setTimeout(() => setDone(true),  800);
        setTimeout(() => onDone(),       2200);
      }
    }, 55);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0a0005",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 10,
    }}>
      {/* cinema bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "13%", background: "#000",
        transform: "scaleY(1)", transformOrigin: "top", animation: "barSlide .4s ease forwards" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "13%", background: "#000",
        transform: "scaleY(1)", transformOrigin: "bottom", animation: "barSlide .4s ease forwards" }} />

      {/* slow camera push on content */}
      <div style={{ animation: "camPush 4s ease forwards", textAlign: "center", padding: "0 32px" }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize:   "clamp(1.5rem, 5vw, 2.6rem)",
          fontStyle:  "italic",
          fontWeight: 600,
          color:      CREAM,
          lineHeight: 1.5,
          letterSpacing: "-0.3px",
          textShadow: `0 0 60px ${ROSE}88, 0 2px 20px rgba(0,0,0,0.8)`,
          margin:     0,
        }}>
          {chars.map((ch, i) => (
            <span key={i} style={{
              display:   "inline-block",
              animation: `glyphIn 0.3s ease ${i * 0.01}s both`,
              color:     ch === "💗" ? ROSE : CREAM,
            }}>{ch}</span>
          ))}
          <span style={{ opacity: done ? 0 : 1, transition: "opacity .3s", marginLeft: 2 }}>|</span>
        </p>

        {done && (
          <div style={{ marginTop: 32, animation: "glyphIn 0.6s ease both" }}>
            <div style={{ width: 56, height: 2, background: `linear-gradient(90deg,transparent,${ROSE},transparent)`, margin: "0 auto" }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ ACT 4 — GOLD BLOOM + HEART TREE ══ */
function TreeScene({ user, onSkip }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);
  const hearts    = useRef([]);
  const petals    = useRef([]);

  const name = user === "sadhana" ? "Sadhana" : user === "surya" ? "Surya" : "Dharya";

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width  = W();
    cv.height = H();
    const ctx = cv.getContext("2d");
    const cx  = cv.width  / 2;
    const cy  = cv.height * 0.88;

    /* pre-generate heart positions on tree */
    const treeHearts = [];
    function branch(x, y, len, ang, depth) {
      if (depth === 0 || len < 8) return;
      const ex = x + Math.cos(ang) * len;
      const ey = y + Math.sin(ang) * len;
      if (depth <= 2) {
        for (let k = 0; k < 2 + depth; k++) {
          treeHearts.push({
            x:    ex + (Math.random() - 0.5) * 28,
            y:    ey + (Math.random() - 0.5) * 28,
            r:    6 + Math.random() * 9,
            t:    0.3 + Math.random() * 0.6,   // spawn time
            color: [ROSE, "#ff6fa0", "#ffd0e0", GOLD, "#ffe08a"][Math.floor(Math.random() * 5)],
            sway: Math.random() * Math.PI * 2,
          });
        }
      }
      branch(ex, ey, len * 0.72, ang - 0.4 + Math.random() * 0.1, depth - 1);
      branch(ex, ey, len * 0.72, ang + 0.4 - Math.random() * 0.1, depth - 1);
      if (depth > 2) branch(ex, ey, len * 0.55, ang + (Math.random() - 0.5) * 0.3, depth - 2);
    }
    branch(cx, cy, cv.height * 0.28, -Math.PI / 2, 7);

    /* ── draw tree branches via recursive path (fixed, not animated path) ── */
    function drawBranches(x, y, len, ang, depth, alpha) {
      if (depth === 0 || len < 8) return;
      const ex = x + Math.cos(ang) * len;
      const ey = y + Math.sin(ang) * len;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = depth > 3
        ? `rgba(120,60,20,${alpha})`
        : `rgba(160,100,40,${alpha})`;
      ctx.lineWidth   = Math.max(1, depth * 1.6);
      ctx.stroke();
      drawBranches(ex, ey, len * 0.72, ang - 0.4, depth - 1, alpha);
      drawBranches(ex, ey, len * 0.72, ang + 0.4, depth - 1, alpha);
      if (depth > 2) drawBranches(ex, ey, len * 0.55, ang, depth - 2, alpha);
    }

    /* spawn petals periodically */
    const petalTimer = setInterval(() => {
      if (tRef.current > 0.6) {
        petals.current.push({
          x:   cx + (Math.random() - 0.5) * cv.width * 0.5,
          y:   cv.height * 0.15 + Math.random() * cv.height * 0.4,
          vx:  (Math.random() - 0.5) * 1.5,
          vy:  -(1 + Math.random() * 2),
          r:   10 + Math.random() * 10,
          rot: Math.random() * Math.PI * 2,
          vr:  (Math.random() - 0.5) * 0.08,
          life: 1,
        });
      }
    }, 200);

    const tick = () => {
      tRef.current += 0.008;
      const t = tRef.current;
      ctx.clearRect(0, 0, cv.width, cv.height);

      /* — warm background — */
      const bgGrad = ctx.createLinearGradient(0, 0, 0, cv.height);
      bgGrad.addColorStop(0, "#1a0008");
      bgGrad.addColorStop(0.5, "#2d0010");
      bgGrad.addColorStop(1, "#0d0005");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, cv.width, cv.height);

      /* — gold bloom glow — */
      const bloomAlpha = Math.min(t * 1.5, 1) * 0.6;
      const glow = ctx.createRadialGradient(cx, cy * 0.6, 0, cx, cy * 0.6, cv.width * 0.5);
      glow.addColorStop(0,   `rgba(245,200,66,${bloomAlpha})`);
      glow.addColorStop(0.4, `rgba(232,25,75,${bloomAlpha * 0.5})`);
      glow.addColorStop(1,   "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, cv.width, cv.height);

      /* — trunk grows — */
      const trunkAlpha = Math.min(t * 3, 1);
      drawBranches(cx, cy, cv.height * 0.28 * Math.min(t * 2.5, 1), -Math.PI / 2, 7, trunkAlpha);

      /* — hearts bloom onto branches — */
      treeHearts.forEach(h => {
        if (t < h.t) return;
        const localT = Math.min((t - h.t) / 0.3, 1);
        const sc = localT < 0.6
          ? localT / 0.6
          : 1 + Math.sin((localT - 0.6) / 0.4 * Math.PI) * 0.15;
        const sway = Math.sin(Date.now() / 1800 + h.sway) * 3;
        ctx.save();
        ctx.translate(h.x + sway, h.y);
        ctx.scale(sc, sc);
        ctx.globalAlpha = localT;
        drawHeart(ctx, 0, 0, h.r, h.color, h.color);
        ctx.restore();
      });

      /* — drifting petals — */
      petals.current.forEach(p => {
        p.x   += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.006;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life) * 0.7;
        ctx.font = `${p.r}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("🌸", 0, 0);
        ctx.restore();
      });
      petals.current = petals.current.filter(p => p.life > 0);

      /* — hand-lettered name — */
      if (t > 0.7) {
        const nameAlpha = Math.min((t - 0.7) / 0.4, 1);
        ctx.save();
        ctx.globalAlpha = nameAlpha;
        ctx.font        = `bold ${Math.min(cv.width * 0.1, 52)}px 'Dancing Script', cursive`;
        ctx.fillStyle   = GOLD;
        ctx.textAlign   = "center";
        ctx.shadowColor = GOLD;
        ctx.shadowBlur  = 24;
        ctx.fillText(name, cx, cv.height * 0.92);
        ctx.restore();
      }

      /* — "with love" subtitle — */
      if (t > 1.0) {
        const subAlpha = Math.min((t - 1.0) / 0.4, 1);
        ctx.save();
        ctx.globalAlpha = subAlpha * 0.6;
        ctx.font        = `italic ${Math.min(cv.width * 0.038, 20)}px 'Cormorant Garamond', serif`;
        ctx.fillStyle   = CREAM;
        ctx.textAlign   = "center";
        ctx.fillText("— with all my love, always 💗 —", cx, cv.height * 0.96);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(petalTimer);
    };
  }, [name]);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }} />
      <button
        onClick={onSkip}
        style={{
          position: "fixed", bottom: 28, right: 24, zIndex: 20,
          padding: "10px 22px", borderRadius: 50,
          background: "rgba(255,255,255,0.1)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          color: CREAM, fontFamily: "'Inter',sans-serif",
          fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
          backdropFilter: "blur(8px)",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
      >
        Skip →
      </button>
    </>
  );
}

/* ── helper: draw heart shape ── */
function drawHeart(ctx, x, y, size, fill, stroke, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.25);
  ctx.bezierCurveTo(x, y - size * 0.25,  x - size, y - size * 0.25,  x - size, y + size * 0.25);
  ctx.bezierCurveTo(x - size, y + size * 0.75, x, y + size * 1.1,    x, y + size * 1.5);
  ctx.bezierCurveTo(x, y + size * 1.1,   x + size, y + size * 0.75, x + size, y + size * 0.25);
  ctx.bezierCurveTo(x + size, y - size * 0.25, x, y - size * 0.25,  x, y + size * 0.25);
  ctx.closePath();
  ctx.fillStyle   = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = 1.5;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/* ══ MAIN EXPORT ══ */
export default function FlowerGarden({ user }) {
  const [act, setAct]   = useState(1); // 1 2 3 4 done
  const [power, setPower] = useState(0.8);
  const [done, setDone]   = useState(false);

  const handleFire = useCallback((p) => {
    setPower(p);
    setAct(2);
  }, []);

  if (done) {
    /* garden complete — simple thank you card */
    return (
      <div style={{
        maxWidth: 480, margin: "0 auto", padding: "60px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>💗</div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "2rem", fontStyle: "italic", fontWeight: 600,
          color: "#fff", margin: "0 0 12px",
        }}>
          Our Garden of Hearts
        </h2>
        <p style={{
          fontFamily: "'Inter',sans-serif", fontSize: "0.9rem",
          color: "rgba(255,255,255,0.5)", lineHeight: 1.7,
        }}>
          Every arrow I shoot is aimed straight at you. 🏹
        </p>
        <button
          onClick={() => { setAct(1); setDone(false); }}
          style={{
            marginTop: 28, padding: "12px 32px", borderRadius: 50,
            background: `linear-gradient(135deg,${ROSE},#c2005c)`,
            border: "none", color: "#fff", fontFamily: "'Inter',sans-serif",
            fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
            boxShadow: `0 8px 28px rgba(232,25,75,0.4)`,
          }}
        >
          🏹 Play again
        </button>
      </div>
    );
  }

  return (
    <>
      {act === 1 && <BowScene onFire={handleFire} />}
      {act === 2 && <ArrowFlight power={power} onDone={() => setAct(3)} />}
      {act === 3 && <WishScene onDone={() => setAct(4)} />}
      {act === 4 && <TreeScene user={user} onSkip={() => setDone(true)} />}
    </>
  );
}
