import { useEffect, useRef, useState, useCallback } from "react";

/* ══════════════════════════════════════════════════════
   TREE OF LIFE — Cinematic canvas animation
   Sequence: particles → seed drop → roots → trunk →
   branches → leaves → flowers → wind → done
══════════════════════════════════════════════════════ */

const PI2 = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ── colour helpers ── */
const gold   = (a=1) => `rgba(212,175,55,${a})`;
const emerald= (a=1) => `rgba(52,211,153,${a})`;
const brown  = (a=1) => `rgba(101,67,33,${a})`;

export default function TreeOfLife({ onDone }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    phase: "particles", // particles|seed|roots|trunk|branches|leaves|flowers|wind|done
    tick: 0,
    mouse: { x: 0.5, y: 0.5 },
    scroll: 0,
  });
  const animRef   = useRef(null);
  const [done, setDone] = useState(false);

  /* ── responsive canvas size ── */
  const resize = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  /* ── mouse / scroll ── */
  useEffect(() => {
    const onMove = e => {
      stateRef.current.mouse.x = e.clientX / window.innerWidth;
      stateRef.current.mouse.y = e.clientY / window.innerHeight;
    };
    const onScroll = () => { stateRef.current.scroll = window.scrollY; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll",    onScroll, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);

  /* ══════════════════════════════
     MAIN DRAW ENGINE
  ══════════════════════════════ */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");

    /* ── world ── */
    let W = canvas.width, H = canvas.height;
    const cx = () => W / 2;
    const ground = () => H * 0.72;

    /* ── ambient particles ── */
    const NPART = 55;
    const particles = Array.from({ length: NPART }, () => ({
      x: rand(0, 1), y: rand(0, 1),
      r: rand(0.5, 2.5), speed: rand(0.0002, 0.0008),
      angle: rand(0, PI2), drift: rand(-0.001, 0.001),
      alpha: rand(0.1, 0.55), color: Math.random() < 0.5 ? "gold" : "emerald",
    }));

    /* ── fireflies ── */
    const NFLY = 18;
    const fireflies = Array.from({ length: NFLY }, () => ({
      x: rand(0.1, 0.9), y: rand(0.3, 0.9),
      phase: rand(0, PI2), speed: rand(0.012, 0.028),
      r: rand(1.5, 3.5), alpha: 0,
    }));

    /* ── seed ── */
    const seed = { x: cx(), y: -30, vy: 0, ay: 0.18, landed: false, glow: 0, scale: 1 };

    /* ── roots ── */
    const roots = [];
    const ROOT_COUNT = 5;

    /* ── trunk segments ── */
    const trunk = [];  // { x1,y1,x2,y2,w,progress,done }
    const TRUNK_SEGS = 14;

    /* ── branches ── */
    const branches = []; // { x1,y1,x2,y2,w,progress,depth,done,angle }

    /* ── leaves ── */
    const leaves = []; // { x,y,size,angle,sway,bloom,alpha,hue,swaySpeed }

    /* ── flowers ── */
    const flowers = []; // { x,y,r,bloom,alpha }

    /* ── pollen ── */
    const pollen = [];

    /* ── light rays ── */
    let rayAlpha = 0;

    /* ── phase timings (ticks at 60fps) ── */
    const PHASE_TICK = {
      particles: 80,
      seed:      60,
      roots:     90,
      trunk:     120,
      branches:  140,
      leaves:    160,
      flowers:   80,
      wind:      999999,
    };
    let phaseTick = 0;

    /* ── build root paths ── */
    function buildRoots() {
      for (let i = 0; i < ROOT_COUNT; i++) {
        const angle = (Math.PI * 0.15) + (Math.PI * 0.7 / (ROOT_COUNT - 1)) * i;
        roots.push({ segs: [], angle, built: false });
        // each root = array of {x,y} points
        let rx = cx(), ry = ground();
        const segs = [{ x: rx, y: ry }];
        const len = rand(60, 130);
        for (let s = 0; s < 12; s++) {
          const a = angle + Math.PI / 2 + rand(-0.25, 0.25);
          const d = rand(8, 18);
          rx += Math.cos(a) * d;
          ry += Math.sin(a) * d;
          segs.push({ x: rx, y: ry });
          if (segs.length * 12 > len) break;
        }
        roots[i].segs = segs;
        roots[i].progress = 0;
        roots[i].w = rand(1.5, 3);
      }
    }

    /* ── build trunk ── */
    function buildTrunk() {
      let tx = cx(), ty = ground();
      let angle = -Math.PI / 2;
      let w = 16;
      for (let i = 0; i < TRUNK_SEGS; i++) {
        const len = rand(18, 32);
        angle += rand(-0.04, 0.04);
        const nx = tx + Math.cos(angle) * len;
        const ny = ty + Math.sin(angle) * len;
        trunk.push({ x1:tx, y1:ty, x2:nx, y2:ny, w: w * (1 - i/TRUNK_SEGS * 0.6), progress:0, done:false });
        tx = nx; ty = ny;
        w *= 0.91;
      }
    }

    /* ── build branches recursively ── */
    function addBranch(x1, y1, angle, w, depth) {
      if (depth > 4 || w < 1.2) return;
      const len = rand(30, 65) * (1 - depth * 0.15);
      const a = angle + rand(-0.35, 0.35);
      const x2 = x1 + Math.cos(a) * len;
      const y2 = y1 + Math.sin(a) * len;
      branches.push({ x1, y1, x2, y2, w, a, depth, progress: 0, done: false });
      // spawn leaves near tips
      if (depth >= 2) {
        for (let i = 0; i < rand(3, 7); i++) {
          const t = rand(0.4, 1);
          leaves.push({
            x: lerp(x1, x2, t) + rand(-12, 12),
            y: lerp(y1, y2, t) + rand(-10, 10),
            size: rand(6, 16),
            angle: rand(0, PI2),
            sway: rand(-0.03, 0.03),
            swaySpeed: rand(0.018, 0.035),
            bloom: 0,
            alpha: 0,
            hue: rand(130, 160),
          });
        }
        if (depth >= 3 && Math.random() < 0.35) {
          flowers.push({ x: x2, y: y2, r: rand(3, 7), bloom: 0, alpha: 0 });
        }
      }
      // recurse
      if (Math.random() < 0.7) addBranch(x2, y2, a - rand(0.3, 0.6), w * 0.65, depth + 1);
      if (Math.random() < 0.7) addBranch(x2, y2, a + rand(0.3, 0.6), w * 0.65, depth + 1);
    }

    function buildBranches() {
      // spawn from top trunk segments
      const tops = trunk.slice(TRUNK_SEGS - 6);
      tops.forEach((seg, i) => {
        const baseAngle = -Math.PI / 2 + rand(-0.2, 0.2);
        addBranch(seg.x2, seg.y2, baseAngle - 0.5 - i * 0.04, 5, 1);
        addBranch(seg.x2, seg.y2, baseAngle + 0.5 + i * 0.04, 5, 1);
      });
    }

    /* ── build pollen ── */
    function spawnPollen(x, y) {
      for (let i = 0; i < 5; i++) {
        pollen.push({ x, y, vx: rand(-1.2, 1.2), vy: rand(-2, -0.5), alpha: 1, r: rand(1, 2.5), life: 1 });
      }
    }

    /* ──────────────────────────────────
       DRAW FUNCTIONS
    ────────────────────────────────── */
    function drawBg() {
      W = canvas.width; H = canvas.height;
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0,   "#050816");
      grd.addColorStop(0.5, "#0B1120");
      grd.addColorStop(1,   "#111827");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // parallax stars
      const mx = stateRef.current.mouse.x - 0.5;
      const my = stateRef.current.mouse.y - 0.5;
      ctx.save();
      ctx.translate(mx * 18, my * 12);
      for (let i = 0; i < 120; i++) {
        const sx = ((i * 137.508 + 17) % 1) * W;
        const sy = ((i * 97.3 + 7) % 1) * H * 0.75;
        const sr = (i % 3 === 0) ? 1.2 : 0.5;
        const sa = 0.15 + (i % 7) * 0.05;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, PI2);
        ctx.fillStyle = `rgba(255,255,255,${sa})`; ctx.fill();
      }
      ctx.restore();

      // ground glow
      const gg = ctx.createRadialGradient(cx(), ground(), 0, cx(), ground(), 300);
      gg.addColorStop(0, "rgba(52,211,153,0.07)");
      gg.addColorStop(1, "transparent");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);

      // ground line
      const gl = ctx.createLinearGradient(0, ground(), 0, ground() + 8);
      gl.addColorStop(0, "rgba(52,211,153,0.18)");
      gl.addColorStop(1, "transparent");
      ctx.fillStyle = gl; ctx.fillRect(0, ground(), W, 8);
    }

    function drawParticles() {
      particles.forEach(p => {
        p.angle += p.drift;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed * 0.5 - 0.0004;
        if (p.y < 0) p.y = 1; if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        const col = p.color === "gold" ? gold(p.alpha) : emerald(p.alpha);
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, PI2);
        ctx.fillStyle = col; ctx.fill();
      });
    }

    function drawFireflies(t) {
      fireflies.forEach((f, i) => {
        f.phase += f.speed;
        const pulse = (Math.sin(f.phase) + 1) / 2;
        f.alpha = pulse * 0.7;
        f.x += Math.sin(f.phase * 0.4 + i) * 0.0008;
        f.y += Math.cos(f.phase * 0.3 + i) * 0.0005;
        f.x = clamp(f.x, 0.05, 0.95); f.y = clamp(f.y, 0.05, 0.95);
        const grd = ctx.createRadialGradient(f.x*W, f.y*H, 0, f.x*W, f.y*H, f.r*4);
        grd.addColorStop(0, gold(f.alpha)); grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd; ctx.fillRect(f.x*W-f.r*4, f.y*H-f.r*4, f.r*8, f.r*8);
        ctx.beginPath(); ctx.arc(f.x*W, f.y*H, f.r, 0, PI2);
        ctx.fillStyle = gold(f.alpha * 1.4); ctx.fill();
      });
    }

    function drawSeed(progress) {
      const t = clamp(progress, 0, 1);
      const sy = lerp(-30, ground(), t < 0.85 ? t / 0.85 : 1);
      const bounce = t > 0.85 ? Math.sin((t - 0.85) / 0.15 * Math.PI) * 12 : 0;
      const fy = sy - bounce;
      const glowR = 20 + seed.glow * 60;
      const grd = ctx.createRadialGradient(cx(), fy, 0, cx(), fy, glowR);
      grd.addColorStop(0, gold(0.9)); grd.addColorStop(0.4, gold(0.3)); grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd; ctx.fillRect(cx()-glowR, fy-glowR, glowR*2, glowR*2);
      const s = 5 * clamp(seed.scale, 0.5, 1.4);
      ctx.save(); ctx.translate(cx(), fy);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.7, s, 0, 0, PI2);
      const sg = ctx.createRadialGradient(0, -s*0.2, 0, 0, 0, s);
      sg.addColorStop(0, "#fff8dc"); sg.addColorStop(0.5, gold(1)); sg.addColorStop(1, "#8B6914");
      ctx.fillStyle = sg; ctx.fill();
      ctx.restore();
      seed.glow = lerp(seed.glow, t > 0.88 ? 1 : 0, 0.06);
    }
    return () => { cancelAnimationFrame(animRef.current); };
  }, []); // returned early — real engine below

  /* ══ REAL ENGINE (separate useEffect so the return above is valid) ══ */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width, H = canvas.height;
    const cx = () => W / 2;
    const ground = () => H * 0.72;
    let tick = 0, phaseTick = 0;
    let phase = "particles";

    const PI2 = Math.PI * 2;
    const rand = (a, b) => a + Math.random() * (b - a);
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* particles */
    const particles = Array.from({ length: 55 }, () => ({
      x: rand(0,1), y: rand(0,1), r: rand(0.5,2.5),
      speed: rand(0.0003,0.0009), angle: rand(0, PI2),
      drift: rand(-0.001,0.001), alpha: rand(0.1,0.5),
      color: Math.random()<0.5?"gold":"emerald",
    }));
    const fireflies = Array.from({ length: 20 }, () => ({
      x: rand(0.05,0.95), y: rand(0.3,0.9), phase: rand(0,PI2),
      speed: rand(0.01,0.025), r: rand(1.5,3.5),
    }));

    /* seed */
    let seedY = -40, seedVy = 0, seedGlow = 0, seedLanded = false, seedProgress = 0;

    /* roots */
    const roots = [];
    let rootProgress = 0;

    /* trunk */
    const trunk = [];
    let trunkIdx = 0, trunkSeg = 0;

    /* branches */
    const branches = [];
    let branchIdx = 0, branchSeg = 0;

    /* leaves */
    const leaves = [];
    let leafIdx = 0;

    /* flowers */
    const flowers = [];
    let flowerIdx = 0;

    /* pollen */
    const pollen = [];

    /* light rays */
    let rayAlpha = 0;

    /* wind */
    let windAngle = 0;

    /* ── build ── */
    const buildRoots = () => {
      for (let i = 0; i < 6; i++) {
        const base = Math.PI * 0.2 + (Math.PI * 0.6 / 5) * i;
        let rx = cx(), ry = ground();
        const pts = [{ x:rx, y:ry }];
        let angle = base + Math.PI / 2;
        for (let s = 0; s < 14; s++) {
          angle += rand(-0.2, 0.2);
          const d = rand(9, 20);
          rx += Math.cos(angle) * d;
          ry += Math.sin(angle) * d;
          pts.push({ x:rx, y:ry });
        }
        roots.push({ pts, progress:0, w: rand(1.5, 3.5), color: `hsl(${rand(20,35)},${rand(40,60)}%,${rand(25,40)}%)` });
      }
    };

    const buildTrunk = () => {
      let tx = cx(), ty = ground(), angle = -Math.PI/2, w = 14;
      for (let i = 0; i < 16; i++) {
        angle += rand(-0.045, 0.045);
        const len = rand(18, 30);
        const nx = tx + Math.cos(angle)*len, ny = ty + Math.sin(angle)*len;
        trunk.push({ x1:tx,y1:ty, x2:nx,y2:ny, w:w*(1-i/16*0.55), progress:0, angle });
        tx=nx; ty=ny; w*=0.92;
      }
    };

    const addBranch = (x1,y1,angle,w,depth) => {
      if (depth>5||w<1) return;
      const len = rand(28,60)*(1-depth*0.12);
      const a = angle + rand(-0.4,0.4);
      const x2=x1+Math.cos(a)*len, y2=y1+Math.sin(a)*len;
      branches.push({ x1,y1,x2,y2, w, a, depth, progress:0, done:false });
      if (depth>=2) {
        for (let i=0;i<rand(3,8);i++) {
          const t=rand(0.3,1);
          leaves.push({
            x: lerp(x1,x2,t)+rand(-14,14), y: lerp(y1,y2,t)+rand(-12,12),
            size:rand(5,15), angle:rand(0,PI2), sway:rand(-0.04,0.04),
            swaySpeed:rand(0.015,0.04), bloom:0, alpha:0, hue:rand(128,158),
            sat:rand(55,85), lit:rand(30,55),
          });
        }
        if (depth>=3&&Math.random()<0.3) flowers.push({ x:x2, y:y2, r:rand(3,6), bloom:0, alpha:0 });
      }
      if (Math.random()<0.75) addBranch(x2,y2, a-rand(0.3,0.65), w*0.62, depth+1);
      if (Math.random()<0.75) addBranch(x2,y2, a+rand(0.3,0.65), w*0.62, depth+1);
    };

    const buildBranches = () => {
      trunk.slice(10).forEach((seg,i) => {
        addBranch(seg.x2, seg.y2, seg.angle-0.55-i*0.03, 5.5, 1);
        addBranch(seg.x2, seg.y2, seg.angle+0.55+i*0.03, 5.5, 1);
      });
    };

    buildRoots(); buildTrunk(); buildBranches();

    /* ─── DRAW HELPERS ─── */
    const drawBg = () => {
      W=canvas.width; H=canvas.height;
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,"#050816"); g.addColorStop(0.55,"#0B1120"); g.addColorStop(1,"#111827");
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

      // parallax stars
      const mx=(stateRef.current.mouse.x-0.5)*20, my=(stateRef.current.mouse.y-0.5)*14;
      for (let i=0;i<140;i++) {
        const sx=((i*137.5+i*i*0.03)%1)*W+mx*((i%3)+1)/3;
        const sy=((i*83.7+i*0.7)%0.7)*H+my*((i%2)+1)/2;
        ctx.beginPath(); ctx.arc(sx,sy,(i%5===0)?1.1:0.45,0,PI2);
        ctx.fillStyle=`rgba(255,255,255,${0.12+(i%7)*0.04})`; ctx.fill();
      }

      // ground glow
      const gg=ctx.createRadialGradient(cx(),ground(),0,cx(),ground(),W*0.45);
      gg.addColorStop(0,"rgba(52,211,153,0.09)"); gg.addColorStop(1,"transparent");
      ctx.fillStyle=gg; ctx.fillRect(0,0,W,H);

      // ground line
      const gl=ctx.createLinearGradient(0,ground(),0,ground()+6);
      gl.addColorStop(0,"rgba(52,211,153,0.22)"); gl.addColorStop(1,"transparent");
      ctx.fillStyle=gl; ctx.fillRect(0,ground(),W,6);
    };

    const drawParticles = () => {
      particles.forEach(p => {
        p.angle+=p.drift; p.x+=Math.cos(p.angle)*p.speed; p.y+=Math.sin(p.angle)*p.speed*0.4-0.0003;
        if(p.y<-0.02)p.y=1.02; if(p.x<-0.02)p.x=1.02; if(p.x>1.02)p.x=-0.02;
        ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r,0,PI2);
        ctx.fillStyle=p.color==="gold"?`rgba(212,175,55,${p.alpha})`:`rgba(52,211,153,${p.alpha})`; ctx.fill();
      });
    };

    const drawFireflies = () => {
      fireflies.forEach((f,i) => {
        f.phase+=f.speed;
        const pulse=(Math.sin(f.phase)+1)/2;
        f.x+=Math.sin(f.phase*0.4+i*1.3)*0.0007; f.y+=Math.cos(f.phase*0.3+i)*0.0004;
        f.x=clamp(f.x,0.05,0.95); f.y=clamp(f.y,0.1,0.9);
        const alpha=pulse*0.75;
        if(alpha<0.05) return;
        const grd=ctx.createRadialGradient(f.x*W,f.y*H,0,f.x*W,f.y*H,f.r*5);
        grd.addColorStop(0,`rgba(212,175,55,${alpha})`); grd.addColorStop(1,"transparent");
        ctx.fillStyle=grd; ctx.fillRect(f.x*W-f.r*5,f.y*H-f.r*5,f.r*10,f.r*10);
        ctx.beginPath(); ctx.arc(f.x*W,f.y*H,f.r,0,PI2);
        ctx.fillStyle=`rgba(255,248,200,${alpha*1.3})`; ctx.fill();
      });
    };

    const drawSeed = (t) => {
      const fy = lerp(-40, ground(), clamp(t/0.8,0,1));
      const bounce = t>0.8 ? Math.sin((t-0.8)/0.2*Math.PI)*14*(1-(t-0.8)/0.2*0.5) : 0;
      const sy = fy - bounce;
      const glowR = 18 + seedGlow*55;
      const grd=ctx.createRadialGradient(cx(),sy,0,cx(),sy,glowR);
      grd.addColorStop(0,"rgba(212,175,55,0.9)"); grd.addColorStop(0.5,"rgba(212,175,55,0.25)"); grd.addColorStop(1,"transparent");
      ctx.fillStyle=grd; ctx.fillRect(cx()-glowR,sy-glowR,glowR*2,glowR*2);
      ctx.save(); ctx.translate(cx(),sy);
      ctx.beginPath(); ctx.ellipse(0,0,5,8,0,0,PI2);
      const sg=ctx.createRadialGradient(0,-2,0,0,0,8);
      sg.addColorStop(0,"#fffde7"); sg.addColorStop(0.4,`rgba(212,175,55,1)`); sg.addColorStop(1,"#7a5c10");
      ctx.fillStyle=sg; ctx.fill();
      ctx.restore();
    };

    const drawRoots = (progress) => {
      roots.forEach((r,ri) => {
        const rp = clamp((progress - ri*0.12)*1.8, 0, 1);
        if(rp<=0) return;
        const maxIdx = Math.floor(rp * (r.pts.length-1));
        ctx.beginPath(); ctx.moveTo(r.pts[0].x, r.pts[0].y);
        for(let i=1;i<=maxIdx;i++) {
          const partial = i===maxIdx ? (rp*(r.pts.length-1)-Math.floor(rp*(r.pts.length-1))) : 1;
          if(partial===0) break;
          const px=lerp(r.pts[i-1].x, r.pts[i].x, partial);
          const py=lerp(r.pts[i-1].y, r.pts[i].y, partial);
          ctx.lineTo(px,py);
        }
        ctx.strokeStyle=r.color; ctx.lineWidth=r.w*(1-rp*0.3);
        ctx.lineCap="round"; ctx.lineJoin="round";
        ctx.globalAlpha=0.7; ctx.stroke(); ctx.globalAlpha=1;
      });
    };

    const drawTrunk = (idx, segProg) => {
      trunk.forEach((seg,i) => {
        if(i>idx) return;
        const t = i===idx ? segProg : 1;
        if(t<=0) return;
        const x2=lerp(seg.x1,seg.x2,t), y2=lerp(seg.y1,seg.y2,t);
        ctx.beginPath(); ctx.moveTo(seg.x1,seg.y1); ctx.lineTo(x2,y2);
        const bark=ctx.createLinearGradient(seg.x1-seg.w,0,seg.x1+seg.w,0);
        bark.addColorStop(0,"rgba(60,30,10,1)"); bark.addColorStop(0.5,"rgba(101,67,33,1)"); bark.addColorStop(1,"rgba(70,40,15,1)");
        ctx.strokeStyle=bark; ctx.lineWidth=seg.w; ctx.lineCap="round"; ctx.stroke();
        // bark highlight
        ctx.beginPath(); ctx.moveTo(seg.x1+seg.w*0.2,seg.y1); ctx.lineTo(x2+seg.w*0.2,y2);
        ctx.strokeStyle="rgba(160,110,60,0.18)"; ctx.lineWidth=seg.w*0.25; ctx.stroke();
      });
    };

    const drawBranches = (idx, segProg) => {
      branches.forEach((b,i) => {
        if(i>idx) return;
        const t=i===idx?segProg:1;
        if(t<=0) return;
        const x2=lerp(b.x1,b.x2,t), y2=lerp(b.y1,b.y2,t);
        ctx.beginPath(); ctx.moveTo(b.x1,b.y1); ctx.lineTo(x2,y2);
        const cl=`hsl(${25+b.depth*3},${60-b.depth*5}%,${28+b.depth*3}%)`;
        ctx.strokeStyle=cl; ctx.lineWidth=Math.max(0.7,b.w*(1-b.depth*0.05));
        ctx.lineCap="round"; ctx.stroke();
      });
    };

    const drawLeaf = (l) => {
      if(l.alpha<=0.01) return;
      ctx.save(); ctx.translate(l.x, l.y);
      const sw = Math.sin(tick*l.swaySpeed)*l.sway + windAngle*0.4;
      ctx.rotate(l.angle + sw);
      ctx.scale(l.bloom, l.bloom);
      const s=l.size;
      ctx.beginPath();
      ctx.moveTo(0,0); ctx.bezierCurveTo(s*0.5,-s*0.8,s,-s*0.3,0,-s*1.6);
      ctx.bezierCurveTo(-s,-s*0.3,-s*0.5,-s*0.8,0,0);
      const lg=ctx.createLinearGradient(0,0,0,-s*1.6);
      lg.addColorStop(0,`hsla(${l.hue},${l.sat}%,${l.lit}%,${l.alpha})`);
      lg.addColorStop(0.5,`hsla(${l.hue+8},${l.sat-5}%,${l.lit+10}%,${l.alpha})`);
      lg.addColorStop(1,`hsla(${l.hue-5},${l.sat}%,${l.lit-5}%,${l.alpha*0.8})`);
      ctx.fillStyle=lg; ctx.fill();
      // vein
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-s*1.5);
      ctx.strokeStyle=`rgba(34,139,34,${l.alpha*0.3})`; ctx.lineWidth=0.6; ctx.stroke();
      ctx.restore();
    };

    const drawFlower = (f) => {
      if(f.alpha<=0.01||f.bloom<=0.01) return;
      ctx.save(); ctx.translate(f.x, f.y); ctx.scale(f.bloom, f.bloom);
      const PETALS=5, R=f.r;
      for(let i=0;i<PETALS;i++) {
        const a=(PI2/PETALS)*i;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a)*R*0.9, Math.sin(a)*R*0.9, R*0.55, R*0.35, a, 0, PI2);
        ctx.fillStyle=`rgba(255,182,193,${f.alpha*0.85})`; ctx.fill();
      }
      // center
      ctx.beginPath(); ctx.arc(0,0,R*0.45,0,PI2);
      const cg=ctx.createRadialGradient(0,0,0,0,0,R*0.45);
      cg.addColorStop(0,"rgba(255,230,50,1)"); cg.addColorStop(1,"rgba(212,175,55,0.8)");
      ctx.fillStyle=cg; ctx.fill();
      ctx.restore();
    };

    const drawPollen = () => {
      pollen.forEach((p,i) => {
        p.x+=p.vx*0.4; p.y+=p.vy*0.4; p.vy+=0.04; p.life-=0.018; p.alpha=p.life;
        if(p.life<=0){pollen.splice(i,1);return;}
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,PI2);
        ctx.fillStyle=`rgba(255,245,150,${p.alpha*0.7})`; ctx.fill();
      });
    };

    const drawRays = () => {
      if(rayAlpha<=0.005) return;
      const topX=cx(), topY=ground()-200;
      for(let i=0;i<6;i++) {
        const a=-Math.PI/2 + (i-2.5)*0.22;
        const len=H*0.55;
        const grd=ctx.createLinearGradient(topX,topY,topX+Math.cos(a)*len,topY+Math.sin(a)*len);
        grd.addColorStop(0,`rgba(212,175,55,${rayAlpha*0.18})`);
        grd.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.moveTo(topX,topY);
        ctx.lineTo(topX+Math.cos(a-0.04)*len,topY+Math.sin(a-0.04)*len);
        ctx.lineTo(topX+Math.cos(a+0.04)*len,topY+Math.sin(a+0.04)*len);
        ctx.closePath();
        ctx.fillStyle=grd; ctx.fill();
      }
    };

    const drawAura = () => {
      const aura=ctx.createRadialGradient(cx(),ground(),0,cx(),ground(),H*0.38);
      aura.addColorStop(0,`rgba(52,211,153,${0.06*rayAlpha})`);
      aura.addColorStop(0.4,`rgba(212,175,55,${0.04*rayAlpha})`);
      aura.addColorStop(1,"transparent");
      ctx.fillStyle=aura; ctx.fillRect(0,0,W,H);
    };

    /* ─── MAIN LOOP ─── */
    const loop = () => {
      animRef.current = requestAnimationFrame(loop);
      tick++; phaseTick++;
      W = canvas.width; H = canvas.height;

      drawBg();
      drawParticles();
      drawFireflies();

      /* ── phase machine ── */
      if (phase === "particles") {
        if (phaseTick >= 90) { phase="seed"; phaseTick=0; }

      } else if (phase === "seed") {
        const t = clamp(phaseTick/55, 0, 1);
        seedGlow = clamp(phaseTick/55, 0, 1);
        drawSeed(t);
        if (phaseTick >= 70) { phase="roots"; phaseTick=0; seedLanded=true; }

      } else if (phase === "roots") {
        // draw seed glow on ground
        const grd=ctx.createRadialGradient(cx(),ground(),0,cx(),ground(),seedGlow*70);
        grd.addColorStop(0,`rgba(212,175,55,${0.45*seedGlow})`); grd.addColorStop(1,"transparent");
        ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
        rootProgress = clamp(phaseTick/80, 0, 1);
        drawRoots(rootProgress);
        if (phaseTick >= 95) { phase="trunk"; phaseTick=0; trunkIdx=0; trunkSeg=0; }

      } else if (phase === "trunk") {
        drawRoots(1);
        trunkSeg = clamp(phaseTick/7, 0, 1);
        if (trunkSeg >= 1) { trunkIdx++; phaseTick=0; trunkSeg=0; }
        if (trunkIdx >= trunk.length) { trunkIdx=trunk.length-1; trunkSeg=1; phase="branches"; phaseTick=0; branchIdx=0; branchSeg=0; }
        drawTrunk(trunkIdx, trunkSeg);

      } else if (phase === "branches") {
        drawRoots(1); drawTrunk(trunk.length-1,1);
        branchSeg = clamp(phaseTick/5, 0, 1);
        if (branchSeg >= 1) { branchIdx++; phaseTick=0; branchSeg=0; }
        if (branchIdx >= branches.length) { branchIdx=branches.length-1; branchSeg=1; phase="leaves"; phaseTick=0; leafIdx=0; }
        drawBranches(branchIdx, branchSeg);

      } else if (phase === "leaves") {
        drawRoots(1); drawTrunk(trunk.length-1,1); drawBranches(branches.length-1,1);
        // bloom leaves progressively
        const batchPerTick = 2;
        if (phaseTick % 2 === 0 && leafIdx < leaves.length) {
          for(let i=0;i<batchPerTick && leafIdx<leaves.length;i++) leafIdx++;
        }
        leaves.forEach((l,i) => {
          if (i < leafIdx) { l.bloom = clamp(l.bloom+0.06, 0, 1); l.alpha = clamp(l.alpha+0.05, 0, 1); }
          drawLeaf(l);
        });
        if (leafIdx >= leaves.length && leaves.every(l=>l.bloom>=0.98)) {
          phase="flowers"; phaseTick=0; flowerIdx=0;
        }

      } else if (phase === "flowers") {
        drawRoots(1); drawTrunk(trunk.length-1,1); drawBranches(branches.length-1,1);
        leaves.forEach(l => drawLeaf(l));
        if (phaseTick % 4 === 0 && flowerIdx < flowers.length) flowerIdx++;
        flowers.forEach((f,i) => {
          if (i < flowerIdx) { f.bloom = clamp(f.bloom+0.05,0,1); f.alpha=clamp(f.alpha+0.05,0,1); }
          drawFlower(f);
        });
        rayAlpha = clamp(rayAlpha+0.012, 0, 1);
        drawRays(); drawAura();
        if (flowerIdx >= flowers.length && flowers.every(f=>f.bloom>=0.95)) {
          phase="wind"; phaseTick=0;
        }

      } else if (phase === "wind") {
        // full tree with wind animation
        windAngle = Math.sin(tick*0.018)*0.06 + (stateRef.current.mouse.x-0.5)*0.12;
        drawRays(); drawAura();
        drawRoots(1); drawTrunk(trunk.length-1,1); drawBranches(branches.length-1,1);

        // sway trunk slightly
        ctx.save();
        const sway = windAngle * 0.5;
        ctx.translate(cx(), ground());
        ctx.rotate(sway * 0.03);
        ctx.translate(-cx(), -ground());

        leaves.forEach(l => {
          l.angle += (Math.sin(tick*l.swaySpeed + l.x)*0.001);
          drawLeaf(l);
        });
        flowers.forEach(f => {
          f.r = 4 + Math.sin(tick*0.02+f.x)*0.4;
          drawFlower(f);
        });
        ctx.restore();

        // random pollen spawn
        if (Math.random()<0.08 && leaves.length>0) {
          const l=leaves[Math.floor(Math.random()*leaves.length)];
          pollen.push({x:l.x,y:l.y,vx:rand(-0.8,0.8)+windAngle*3,vy:rand(-1.5,-0.3),r:rand(0.8,2),alpha:1,life:1});
        }
        drawPollen();

        // if user has been on wind phase for 3s, call done
        if (phaseTick >= 180 && !done) {
          setDone(true);
          setTimeout(() => { if (onDone) onDone(); }, 1200);
        }
      }
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // eslint-disable-line

  /* ── leaf click → pollen burst ── */
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    // dispatch custom event for pollen at click point
    canvas.dispatchEvent(new CustomEvent("leafclick", { detail: { x:mx, y:my } }));
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9980,
      opacity: done ? 0 : 1,
      transition: "opacity 1.2s ease",
      pointerEvents: done ? "none" : "all",
      cursor: "crosshair",
    }}>
      <canvas
        ref={canvasRef}
        style={{ display:"block", width:"100%", height:"100%" }}
        onClick={handleClick}
      />
      {/* Skip button */}
      <button
        onClick={() => { setDone(true); setTimeout(()=>onDone&&onDone(), 800); }}
        style={{
          position:"absolute", bottom:28, right:28,
          background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)",
          color:"rgba(255,255,255,0.45)", borderRadius:50, padding:"8px 20px",
          fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", cursor:"pointer",
          backdropFilter:"blur(10px)", letterSpacing:"0.5px",
          transition:"all 0.2s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(255,255,255,0.45)";}}
      >
        Skip →
      </button>

      {/* Phase label — cinematic bottom text */}
      <div style={{
        position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)",
        fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", fontStyle:"italic",
        color:"rgba(212,175,55,0.55)", letterSpacing:"2px", pointerEvents:"none",
        opacity: done ? 0 : 1, transition:"opacity 0.6s",
        textShadow:"0 0 20px rgba(212,175,55,0.3)",
      }}>
        Tree of Life — Dharya 💍
      </div>
    </div>
  );
}
