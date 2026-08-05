import { useEffect, useRef, useState, useCallback } from "react";

/* ══════════════════════════════════════════════════
   TREE OF LIFE — Heart-shaped canopy
   Tall straight trunk + dense mini-heart canopy
   (pink, hot pink, gold, cream, white)
   Matches reference image exactly
══════════════════════════════════════════════════ */

const PI2 = Math.PI * 2;
const rand  = (a, b) => a + Math.random() * (b - a);
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ── Heart canopy colour palette — pink & green ── */
const PALETTE = [
  '#FF1493','#FF69B4','#FFB6C1','#ff82b0',   // hot pink, pink, blush, medium pink
  '#ff3d9a','#e91e8c','#c0106a','#f472b6',   // deep pinks
  '#00d97e','#34ffaa','#4ade80','#86efac',   // neon green, mint green, light green
  '#00916e','#059669','#6ee7b7','#a7f3d0',   // emerald, sage green
  '#ffffff','#FFF0F5','#f0fff4',             // white, cream, mint white
];

/* ── Is point inside parametric heart? ── */
function insideHeart(px, py, cx, cy, rx, ry) {
  const nx = (px - cx) / rx;
  const ny = (py - cy) / ry;
  return Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny <= 0.15;
}

export default function TreeOfLife({ onDone }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const [done, setDone] = useState(false);

  /* mouse parallax */
  useEffect(() => {
    const h = e => { mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }; };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");

    /* ── resize ── */
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.width, H = () => canvas.height;
    const CX = () => W() / 2;

    /* ── state ── */
    let tick = 0;
    let trunkProgress = 0;   // 0→1
    let bloomProgress = 0;   // 0→1
    let phase = "trunk";     // trunk | bloom | wind
    let doneFired = false;

    /* ── trunk segments ── */
    const trunk = [];
    const TRUNK_SEGS = 24;

    function buildTrunk() {
      trunk.length = 0;
      const cx   = CX();
      const base = H() * 0.87;
      /* trunk top = bottom of heart canopy */
      const top  = H() * 0.62;
      const w    = Math.max(7, W() * 0.013);
      for (let i = 0; i < TRUNK_SEGS; i++) {
        const t0 = i / TRUNK_SEGS, t1 = (i + 1) / TRUNK_SEGS;
        trunk.push({
          x1: cx, y1: lerp(base, top, t0),
          x2: cx, y2: lerp(base, top, t1),
          w: w * (1 - t0 * 0.4),
        });
      }
    }

    /* ── mini-heart canopy ── */
    const miniHearts = [];

    function buildCanopy() {
      miniHearts.length = 0;
      const cx    = CX();
      /* canopy centre — sits above the trunk top */
      const cy    = H() * 0.38;
      /* scale: canopy fills ~80% of screen */
      const rx    = Math.min(W(), H()) * 0.36;
      const ry    = Math.min(W(), H()) * 0.34;
      const TOTAL = 900;

      const xMin = cx - rx * 1.08, xMax = cx + rx * 1.08;
      const yMin = cy - ry * 1.08, yMax = cy + ry * 1.08;

      let tries = 0;
      while (miniHearts.length < TOTAL && tries < TOTAL * 14) {
        tries++;
        const px = rand(xMin, xMax);
        const py = rand(yMin, yMax);
        if (!insideHeart(px, py, cx, cy, rx, ry)) continue;

        /* bigger hearts near center */
        const dx = (px - cx) / rx, dy = (py - cy) / ry;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const sz = rand(lerp(18, 7, dist) * 0.75, lerp(18, 7, dist) * 1.4);

        miniHearts.push({
          x: px, y: py, r: sz,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          angle: rand(-0.5, 0.5),
          alpha: 0, scale: 0,
          delay: rand(0, 0.6),
          sway: rand(-0.009, 0.009),
          swaySpd: rand(0.012, 0.03),
        });
      }
      /* sort center-first for bloom effect */
      const cc = CX(), ccY = H() * 0.38;
      miniHearts.sort((a, b) =>
        Math.hypot(a.x - cc, a.y - ccY) - Math.hypot(b.x - cc, b.y - ccY)
      );
    }

    buildTrunk();
    buildCanopy();

    /* ── ambient particles ── */
    const particles = Array.from({ length: 55 }, () => ({
      x: rand(0, 1), y: rand(0, 1), r: rand(0.6, 2.4),
      vx: rand(-0.0004, 0.0004), vy: rand(-0.0007, -0.0002),
      alpha: rand(0.15, 0.55), hue: rand(330, 360), phase: rand(0, PI2),
    }));

    /* floating hearts — pink & green */
    const floaters = Array.from({ length: 32 }, () => ({
      x: rand(0, 1), y: rand(0.7, 1.3), r: rand(4, 10),
      vx: rand(-0.0004, 0.0004), vy: rand(-0.001, -0.0003),
      alpha: rand(0.2, 0.65),
      hue: Math.random() < 0.5 ? rand(330, 360) : rand(140, 165), // pink or green
      angle: rand(0, PI2), spin: rand(-0.02, 0.02), phase: rand(0, PI2),
    }));

    /* ── draw helpers ── */
    function drawBg() {
      const g = ctx.createLinearGradient(0, 0, 0, H());
      g.addColorStop(0, "#fdf6ee");
      g.addColorStop(0.35, "#fce8d0");
      g.addColorStop(0.65, "#f9d5a8");
      g.addColorStop(1, "#f5c07a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H());

      /* parallax stars */
      const mx = (mouseRef.current.x - 0.5) * 16;
      const my = (mouseRef.current.y - 0.5) * 10;
      particles.forEach(p => {
        p.phase += 0.018; p.x += p.vx; p.y += p.vy;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        const a = p.alpha * (0.45 + Math.sin(p.phase) * 0.45);
        ctx.beginPath();
        ctx.arc(p.x * W() + mx * ((p.r > 1.5) ? 1 : 0.4), p.y * H() + my * 0.5, p.r, 0, PI2);
        ctx.fillStyle = `hsla(${p.hue},80%,75%,${a})`; ctx.fill();
      });
    }

    function drawTrunk(prog) {
      const vis  = Math.floor(prog * trunk.length);
      const frac = (prog * trunk.length) - vis;
      trunk.forEach((seg, i) => {
        if (i > vis) return;
        const f  = i === vis ? frac : 1;
        const y2 = lerp(seg.y1, seg.y2, f);
        ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, y2);
        const bk = ctx.createLinearGradient(seg.x1 - seg.w, 0, seg.x1 + seg.w, 0);
        bk.addColorStop(0, "#2d0800");
        bk.addColorStop(0.45, "#6b1a0a");
        bk.addColorStop(0.75, "#8B2500");
        bk.addColorStop(1, "#2d0800");
        ctx.strokeStyle = bk; ctx.lineWidth = seg.w; ctx.lineCap = "round"; ctx.stroke();
        /* highlight */
        ctx.beginPath(); ctx.moveTo(seg.x1 + seg.w * 0.15, seg.y1); ctx.lineTo(seg.x2 + seg.w * 0.15, y2);
        ctx.strokeStyle = "rgba(180,80,30,0.18)"; ctx.lineWidth = seg.w * 0.25; ctx.stroke();
      });
    }

    function drawMiniHeart(cx, cy, r, color, alpha, angle) {
      if (alpha < 0.01 || r < 0.5) return;
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.translate(cx, cy); ctx.rotate(angle);
      const s = r / 10;
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.bezierCurveTo(5, -8, 12, -2, 0,  5);
      ctx.bezierCurveTo(-12, -2, -5, -8, 0, -2);
      ctx.fillStyle = color; ctx.fill();
      /* glint */
      ctx.beginPath(); ctx.arc(-2.5, -4.5, 1.8, 0, PI2);
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill();
      ctx.restore();
    }

    function drawCanopy(bp, t) {
      /* soft glow first */
      const cc = CX(), cy = H() * 0.38;
      const glowR = Math.min(W(), H()) * 0.45;
      const grd = ctx.createRadialGradient(cc, cy, 0, cc, cy, glowR);
      grd.addColorStop(0, `rgba(255,200,200,${bp * 0.22})`);
      grd.addColorStop(0.5, `rgba(255,230,150,${bp * 0.10})`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W(), H());

      miniHearts.forEach((h, i) => {
        const lp = clamp((bp - h.delay) / (1 - h.delay + 0.02), 0, 1);
        const ease = 1 - Math.pow(1 - lp, 3); // cubic ease-out
        h.scale = clamp(h.scale + ease * 0.07, 0, 1);
        h.alpha = clamp(h.alpha + ease * 0.055, 0, 1);
        const sway = Math.sin(t * h.swaySpd * 55 + i * 0.3) * h.sway;
        drawMiniHeart(h.x, h.y, h.r * h.scale, h.color, h.alpha, h.angle + sway);
      });
    }

    function drawFloaters(t) {
      floaters.forEach(p => {
        p.phase += 0.015; p.x += p.vx; p.y += p.vy; p.angle += p.spin;
        if (p.y < -0.08) { p.y = 1.05; p.x = rand(0.05, 0.95); }
        const a = p.alpha * (0.4 + Math.sin(p.phase) * 0.4);
        drawMiniHeart(p.x * W(), p.y * H(), p.r, `hsl(${p.hue},85%,68%)`, a, p.angle);
      });
    }

    /* ── main loop ── */
    const loop = () => {
      animRef.current = requestAnimationFrame(loop);
      tick++;
      const t = tick * 0.016;

      drawBg();
      drawFloaters(t);

      if (phase === "trunk") {
        trunkProgress = Math.min(trunkProgress + 0.018, 1);
        drawTrunk(trunkProgress);
        if (trunkProgress >= 1) { phase = "bloom"; }

      } else if (phase === "bloom") {
        drawTrunk(1);
        bloomProgress = Math.min(bloomProgress + 0.007, 1);
        drawCanopy(bloomProgress, t);
        if (bloomProgress >= 0.88 && !doneFired) {
          doneFired = true;
          setDone(true);
          setTimeout(() => { if (onDone) onDone(); }, 1400);
        }

      } else if (phase === "wind") {
        drawTrunk(1);
        drawCanopy(1, t);
      }
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []); // eslint-disable-line

  const skip = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    setDone(true);
    setTimeout(() => { if (onDone) onDone(); }, 600);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9980,
      opacity: done ? 0 : 1,
      transition: "opacity 1.4s ease",
      pointerEvents: done ? "none" : "all",
    }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* Skip button */}
      <button
        onClick={skip}
        style={{
          position: "absolute", bottom: 28, right: 28,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,182,193,0.4)",
          color: "rgba(100,30,60,0.7)",
          borderRadius: 50, padding: "8px 22px",
          fontFamily: "'Inter',sans-serif", fontSize: "0.78rem",
          cursor: "pointer", backdropFilter: "blur(10px)",
          letterSpacing: "0.5px", transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,182,193,0.25)"; e.currentTarget.style.color = "#c0106a"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(100,30,60,0.7)"; }}
      >
        Skip →
      </button>

      {/* Bottom label */}
      <div style={{
        position: "absolute", bottom: 34, left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'Dancing Script',cursive",
        fontSize: "1.1rem", color: "rgba(160,60,90,0.55)",
        letterSpacing: "2px", pointerEvents: "none",
        opacity: done ? 0 : 1, transition: "opacity 0.6s",
      }}>
        Tree of Life — Dharya 💍
      </div>
    </div>
  );
}
