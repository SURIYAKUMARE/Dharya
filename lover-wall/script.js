/* ═══════════════════════════════════════════════════════════
   DHARYA LOVE WALL — script.js  (Premium Edition)
   Pure HTML/CSS/JS — No frameworks
═══════════════════════════════════════════════════════════ */
'use strict';

/* ── CONFIG ─────────────────────────────────────────────── */
const CFG = {
  startDate:  new Date('2026-05-20T00:00:00'),
  password:   'iloveyou',
  secret:     `From the very first moment I saw you, I knew my life had changed forever.\n\nYou are the poem I never knew I needed — the melody living in every heartbeat, the reason I smile before I even open my eyes each morning.\n\nI love you beyond what words can hold, and I will keep loving you in every lifetime we are given.\n\nThis wall, these memories, this love — it is all yours. Always and forever.`,
  letter:     `From the moment you came into my life, everything changed. The world became warmer, brighter, and infinitely more beautiful.\n\nI think about you in quiet moments — when the sun sets and the sky turns gold, when a song plays that reminds me of your laugh, when I close my eyes and feel grateful beyond measure.\n\nYou are my safest place. My greatest adventure. My forever person.\n\nThank you for choosing me, day after day. I will spend every one of those days making sure you never forget how deeply, completely, and endlessly you are loved.`,
  quotes: [
    'In all the world, there is no heart for me like yours.',
    'I love you not only for what you are, but for what I am when I am with you.',
    'You are my today and all of my tomorrows.',
    'Every love story is beautiful, but ours is my favourite.',
    'I carry your heart with me, I carry it in my heart.',
    'You are the finest, loveliest person I have ever known.',
  ],
  swatchColors: ['#ffe0ea','#fff0c0','#d4f5e0','#d0eaff','#ecd5ff','#ffe0c8','#c8f5e8'],
  playlist: [
    { title:'Nenjame',        artist:'Sid Sriram',     src:'' },
    { title:'Munbe Vaa',      artist:'A.R. Rahman',    src:'' },
    { title:'Kannazhaga',     artist:'Dhibu Ninan',    src:'' },
    { title:'Oru Adaar Love', artist:'Omar Lulu',      src:'' },
  ],
};

/* ── TIMELINE DATA ───────────────────────────────────────── */
const TIMELINE = [
  { date:'19 June 2023',    title:'We First Met',        msg:'At the tuition — a smile that changed my entire universe.',  emoji:'💫', img:'' },
  { date:'17 May 2026',     title:'The Proposal',        msg:'At midnight, under stars, with all my trembling heart.',     emoji:'💍', img:'' },
  { date:'18 May 2026',     title:'She Proposed Back',   msg:'She looked at me and said yes with her whole beautiful soul.',emoji:'💗', img:'' },
  { date:'19 May 2026',     title:'We Both Said Yes',    msg:'The most precious evening of my entire life.',               emoji:'💑', img:'' },
  { date:'20 May 2026',     title:'Our Journey Begins',  msg:'From this day forward — together, always and forever.',      emoji:'🌸', img:'' },
];

/* ── GALLERY DATA ────────────────────────────────────────── */
const GALLERY = [
  { src:'/images/photo1.jpg.jpg',   cap:'The day we first met 💫'       },
  { src:'/images/photo2.jpg.jpeg',  cap:'Midnight proposal 💍'          },
  { src:'/images/photo3.jpg.jpeg',  cap:'She said yes 💖'               },
  { src:'/images/photo4.jpg.jpeg',  cap:'We both said yes 💕'           },
  { src:'/images/photo5.jpg.jpeg',  cap:'Our journey begins 🌸'         },
  { src:'/images/photo11.jpg.jpg',  cap:'Every smile is gold 😊'        },
  { src:'/images/photo12.jpg.png',  cap:'You make life beautiful 🌷'    },
  { src:'/images/photo13.jpg.jpg',  cap:'My favourite person 💓'        },
  { src:'/images/photo16.jpg.jpg',  cap:'You are my everything ✨'      },
  { src:'/images/photo17.jpg.jpg',  cap:'Forever and always 💒'         },
  { src:'/images/1000111741.jpg',   cap:'Sadhana, my love 🌹'          },
];

/* ════════════════════════════════════════════════════════════
   1.  PARTICLE CANVAS
════════════════════════════════════════════════════════════ */
(function Canvas() {
  const cv  = document.getElementById('ambientCanvas');
  const ctx = cv.getContext('2d');
  let W, H;
  const pts = [];

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  addEventListener('resize', resize, { passive:true });
  resize();

  const COLORS = ['#e8305a','#c9932a','#e8bb6e','#ff6b8e','#a0005a','#ffffff'];

  function mkPt() {
    const t = ['heart','star','petal','spark'][Math.random()*4|0];
    return {
      t, x: Math.random()*W, y: H + Math.random()*60,
      r: 2 + Math.random()*6,
      vy: 0.25 + Math.random()*0.7,
      vx: (Math.random()-0.5)*0.5,
      rot: Math.random()*Math.PI*2,
      rv: (Math.random()-0.5)*0.02,
      a: 0.08 + Math.random()*0.38,
      c: COLORS[Math.random()*COLORS.length|0],
    };
  }
  for (let i = 0; i < 90; i++) { const p = mkPt(); p.y = Math.random()*H; pts.push(p); }

  function heart(x,y,s) {
    ctx.save(); ctx.translate(x,y); ctx.scale(s/10,s/10);
    ctx.beginPath();
    ctx.moveTo(0,-3);
    ctx.bezierCurveTo(3,-7,8,-3,8,0);
    ctx.bezierCurveTo(8,4,0,9,0,11);
    ctx.bezierCurveTo(0,9,-8,4,-8,0);
    ctx.bezierCurveTo(-8,-3,-3,-7,0,-3);
    ctx.fill(); ctx.restore();
  }

  function frame() {
    ctx.clearRect(0,0,W,H);
    pts.forEach((p,i) => {
      p.y -= p.vy; p.x += p.vx; p.rot += p.rv;
      if (p.y < -20) pts[i] = mkPt();
      ctx.globalAlpha = p.a;
      ctx.fillStyle   = p.c;
      if (p.t === 'heart') {
        heart(p.x, p.y, p.r*1.6);
      } else {
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.beginPath(); ctx.arc(0,0,p.r*0.55,0,Math.PI*2);
        ctx.fill(); ctx.restore();
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ════════════════════════════════════════════════════════════
   2.  CUSTOM CURSOR
════════════════════════════════════════════════════════════ */
(function Cursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx=0,my=0, rx=0,ry=0;

  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

  function loop() {
    rx += (mx-rx)*0.14; ry += (my-ry)*0.14;
    dot.style.left  = mx+'px'; dot.style.top  = my+'px';
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(loop);
  }
  loop();

  /* micro hearts on click */
  document.addEventListener('click', e => {
    const h = document.createElement('span');
    h.textContent = ['❤','♡','✦'][Math.random()*3|0];
    h.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;pointer-events:none;z-index:9997;font-size:${10+Math.random()*14}px;color:hsl(${340+Math.random()*40},80%,65%);transform:translate(-50%,-50%);animation:clickHeart 0.7s ease forwards;`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 700);
  });

  const ks = document.createElement('style');
  ks.textContent = `@keyframes clickHeart{from{opacity:1;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(-50%,-180%) scale(0.4)}}`;
  document.head.appendChild(ks);
})();

/* ════════════════════════════════════════════════════════════
   3.  NAVIGATION
════════════════════════════════════════════════════════════ */
(function Nav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');
  const dClose = document.getElementById('drawerClose');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 60);
  }, { passive:true });

  burger.addEventListener('click', () => { drawer.classList.add('open'); });
  dClose.addEventListener('click', () => drawer.classList.remove('open'));
  document.addEventListener('click', e => {
    if (!drawer.contains(e.target) && !burger.contains(e.target)) drawer.classList.remove('open');
  });
})();
window.closeDrawer = () => document.getElementById('navDrawer').classList.remove('open');

/* ════════════════════════════════════════════════════════════
   4.  TYPEWRITER HERO QUOTE
════════════════════════════════════════════════════════════ */
(function Typewriter() {
  const el = document.getElementById('heroQuoteText');
  const qs = CFG.quotes;
  let qi=0, ci=0, del=false;

  function tick() {
    const q = qs[qi];
    if (!del) {
      el.textContent = q.slice(0, ci+1); ci++;
      if (ci === q.length) { del=true; setTimeout(tick,2600); return; }
      setTimeout(tick, 44);
    } else {
      el.textContent = q.slice(0, ci-1); ci--;
      if (ci === 0) { del=false; qi=(qi+1)%qs.length; setTimeout(tick,500); return; }
      setTimeout(tick, 20);
    }
  }
  setTimeout(tick, 1400);
})();

/* ════════════════════════════════════════════════════════════
   5.  HERO DAYS STAT
════════════════════════════════════════════════════════════ */
(function HeroStat() {
  const el = document.getElementById('heroStat');
  const d  = Math.max(0, Math.floor((Date.now()-CFG.startDate)/86400000));
  /* count-up animation */
  let n=0; const step = Math.ceil(d/80);
  const iv = setInterval(() => {
    n = Math.min(n+step, d);
    el.textContent = n;
    if (n >= d) clearInterval(iv);
  }, 20);
})();

/* ════════════════════════════════════════════════════════════
   6.  SCROLL REVEAL
════════════════════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });
  document.querySelectorAll('.reveal,.tl-item,.gallery-item,.mem-note,.cd-unit,.love-meter-wrap').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════════
   7.  TIMELINE
════════════════════════════════════════════════════════════ */
(function Timeline() {
  const wrap = document.getElementById('timelineWrap');
  TIMELINE.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'tl-item';
    const cardHtml = `
      <div class="tl-card">
        ${item.img ? `<img src="${item.img}" alt="${item.title}" loading="lazy"/>` : ''}
        <span class="tl-emoji">${item.emoji}</span>
        <div class="tl-date">${item.date}</div>
        <h3 class="tl-title">${item.title}</h3>
        <p class="tl-msg">${item.msg}</p>
      </div>`;
    if (i % 2 === 0) {
      div.innerHTML = `${cardHtml}<div class="tl-center"><div class="tl-dot"></div></div><div></div>`;
    } else {
      div.innerHTML = `<div></div><div class="tl-center"><div class="tl-dot"></div></div>${cardHtml}`;
    }
    /* add 3D tilt to card */
    const card = div.querySelector('.tl-card');
    card.addEventListener('mousemove', e => tilt(e, card));
    card.addEventListener('mouseleave', () => untilt(card));
    wrap.appendChild(div);
  });
})();

/* ════════════════════════════════════════════════════════════
   8.  GALLERY + LIGHTBOX
════════════════════════════════════════════════════════════ */
(function Gallery() {
  const grid  = document.getElementById('galleryGrid');
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  const lbBg  = document.getElementById('lbBg');
  const lbCl  = document.getElementById('lbClose');
  const lbPr  = document.getElementById('lbPrev');
  const lbNx  = document.getElementById('lbNext');
  let cur = 0;

  const items = GALLERY.filter(g => g.src);

  function open(i) {
    cur = i; lbImg.src = items[i].src; lbCap.textContent = items[i].cap;
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  function prev()  { cur=(cur-1+items.length)%items.length; open(cur); }
  function next()  { cur=(cur+1)%items.length; open(cur); }

  lbCl.addEventListener('click', close);
  lbBg.addEventListener('click', close);
  lbPr.addEventListener('click', prev);
  lbNx.addEventListener('click', next);
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key==='Escape') close();
    if (e.key==='ArrowLeft') prev();
    if (e.key==='ArrowRight') next();
  });

  if (!items.length) {
    /* placeholder cards */
    const pls = ['First glance 💫','At midnight 💍','She said yes 💖','Our forever 💕','New chapter 🌸','Every smile 😊'];
    pls.forEach((cap,i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      const h = 300+Math.random()*180|0;
      div.innerHTML = `
        <div style="height:${h}px;background:linear-gradient(135deg,hsl(${320+i*15},40%,${12+i*2}%),hsl(${270+i*18},35%,${10+i*2}%));display:flex;align-items:center;justify-content:center;font-size:3rem">
          ${'💫💍💖💕🌸😊'[i]}
        </div>
        <div class="gallery-cap"><span>${cap}</span></div>`;
      div.addEventListener('click', () => {});
      grid.appendChild(div);
    });
    return;
  }

  items.forEach((item,idx) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `<img src="${item.src}" alt="${item.cap}" loading="lazy"/><div class="gallery-cap"><span>${item.cap}</span></div>`;
    div.addEventListener('click', () => open(idx));
    /* 3D tilt */
    div.addEventListener('mousemove', e => tilt(e, div, 10));
    div.addEventListener('mouseleave', () => untilt(div));
    grid.appendChild(div);
  });
})();

/* ════════════════════════════════════════════════════════════
   9.  LOVE LETTER
════════════════════════════════════════════════════════════ */
(function Letter() {
  const wrap  = document.getElementById('envelopeWrap');
  const env   = document.getElementById('envelope');
  const paper = document.getElementById('letterPaper');
  const close = document.getElementById('letterClose');
  const body  = document.getElementById('paperBody');
  const date  = document.getElementById('paperDate');

  body.textContent = CFG.letter;
  date.textContent = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });

  let opened = false;

  function openLetter() {
    if (opened) return; opened=true;
    document.getElementById('envFlap').style.transform = 'rotateX(-180deg)';
    env.classList.add('open');
    wrap.style.pointerEvents = 'none';
    setTimeout(() => {
      wrap.style.opacity    = '0';
      wrap.style.transform  = 'scale(0.82) translateY(-20px)';
      wrap.style.transition = 'all 0.4s ease';
      paper.classList.add('open');
    }, 550);
  }

  function closeLetter() {
    paper.classList.remove('open');
    setTimeout(() => {
      wrap.style.opacity   = '1';
      wrap.style.transform = '';
      wrap.style.pointerEvents = 'auto';
      document.getElementById('envFlap').style.transform = '';
      env.classList.remove('open');
      opened = false;
    }, 440);
  }

  wrap.addEventListener('click', openLetter);
  close.addEventListener('click', closeLetter);
})();

/* ════════════════════════════════════════════════════════════
   10. MEMORY WALL
════════════════════════════════════════════════════════════ */
(function Memories() {
  const wall    = document.getElementById('memoryWall');
  const addBtn  = document.getElementById('addMemBtn');
  const overlay = document.getElementById('modalOverlay');
  const mxBtn   = document.getElementById('modalX');
  const saveBtn = document.getElementById('mSave');
  const canBtn  = document.getElementById('mCancel');
  const titleIn = document.getElementById('memTitle');
  const bodyIn  = document.getElementById('memBody');
  const colors  = document.getElementById('mColors');

  let memories = JSON.parse(localStorage.getItem('dharya_memories') || '[]');
  let editId   = null;
  let selColor = CFG.swatchColors[0];

  CFG.swatchColors.forEach(c => {
    const s = document.createElement('div');
    s.className = `m-swatch${c===selColor?' on':''}`;
    s.style.background = c;
    s.addEventListener('click', () => {
      selColor = c;
      colors.querySelectorAll('.m-swatch').forEach(x => x.classList.remove('on'));
      s.classList.add('on');
    });
    colors.appendChild(s);
  });

  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function now() { return new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }

  function renderCard(m) {
    const d = document.createElement('div');
    d.className = 'mem-note'; d.dataset.id = m.id;
    d.style.background = m.color;
    d.innerHTML = `
      <h4 class="note-title">${esc(m.title)}</h4>
      <p class="note-body">${esc(m.body).replace(/\n/g,'<br>')}</p>
      <p class="note-date">${m.date}</p>
      <div class="note-actions">
        <button class="note-btn edit-n" data-id="${m.id}">✏️ Edit</button>
        <button class="note-btn del del-n" data-id="${m.id}">🗑 Delete</button>
      </div>`;
    d.querySelector('.edit-n').addEventListener('click', () => startEdit(m.id));
    d.querySelector('.del-n').addEventListener('click',  () => deleteCard(m.id));
    /* 3D tilt */
    d.addEventListener('mousemove', e => tilt(e, d, 8));
    d.addEventListener('mouseleave', () => untilt(d));
    wall.appendChild(d);
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('in')));
  }

  function renderAll() {
    wall.innerHTML = '';
    memories = JSON.parse(localStorage.getItem('dharya_memories') || '[]');
    if (!memories.length) {
      memories = [
        { id:Date.now()-3, title:'First Smile',  body:'I still remember the way you smiled at me that day. Everything changed.', date:now(), color:'#ffe0ea' },
        { id:Date.now()-2, title:'Our Song',     body:'Every time I hear it, I think of you. Always.',                           date:now(), color:'#fff0c0' },
        { id:Date.now()-1, title:'The Midnight', body:'Proposing at midnight was the best decision of my entire life.',          date:now(), color:'#d4f5e0' },
      ];
      localStorage.setItem('dharya_memories', JSON.stringify(memories));
    }
    memories.forEach(renderCard);
    initReveal();
  }

  function openModal()  { overlay.classList.add('open'); titleIn.focus(); }
  function closeModal() { overlay.classList.remove('open'); titleIn.value=''; bodyIn.value=''; editId=null; }

  function startEdit(id) {
    const m = memories.find(x=>x.id===id); if (!m) return;
    editId=id; titleIn.value=m.title; bodyIn.value=m.body; selColor=m.color;
    colors.querySelectorAll('.m-swatch').forEach(s=>s.classList.toggle('on',s.style.background===m.color));
    openModal();
  }

  function deleteCard(id) {
    const el = wall.querySelector(`[data-id="${id}"]`);
    if (el) { el.style.opacity='0'; el.style.transform='scale(0.8)'; el.style.transition='all 0.3s'; setTimeout(()=>el.remove(),300); }
    memories = memories.filter(x=>x.id!==id);
    localStorage.setItem('dharya_memories', JSON.stringify(memories));
  }

  saveBtn.addEventListener('click', () => {
    const t = titleIn.value.trim(), b = bodyIn.value.trim();
    if (!t) { titleIn.focus(); return; }
    if (editId) {
      memories = memories.map(x=>x.id===editId?{...x,title:t,body:b,color:selColor}:x);
      localStorage.setItem('dharya_memories', JSON.stringify(memories));
      wall.querySelector(`[data-id="${editId}"]`)?.remove();
      renderCard(memories.find(x=>x.id===editId));
    } else {
      const m={id:Date.now(),title:t,body:b,date:now(),color:selColor};
      memories.push(m); localStorage.setItem('dharya_memories',JSON.stringify(memories));
      renderCard(m);
    }
    closeModal();
  });

  addBtn.addEventListener('click', openModal);
  mxBtn.addEventListener('click', closeModal);
  canBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if(e.target===overlay) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

  renderAll();
})();

/* ════════════════════════════════════════════════════════════
   11. COUNTDOWN
════════════════════════════════════════════════════════════ */
(function Countdown() {
  const els = {
    d: document.getElementById('cdD'),
    h: document.getElementById('cdH'),
    m: document.getElementById('cdM'),
    s: document.getElementById('cdS'),
  };
  function pad(n,l=2){return String(n).padStart(l,'0')}

  function flip(el, v) {
    if (el.textContent===v) return;
    el.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-10px)'}],{duration:180,easing:'ease-in'}).onfinish=()=>{
      el.textContent=v;
      el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
    };
  }

  function tick() {
    const ms = Date.now()-CFG.startDate;
    if (ms < 0) return;
    flip(els.d, pad(Math.floor(ms/86400000),3));
    flip(els.h, pad(Math.floor((ms%86400000)/3600000)));
    flip(els.m, pad(Math.floor((ms%3600000)/60000)));
    flip(els.s, pad(Math.floor((ms%60000)/1000)));
  }
  tick(); setInterval(tick,1000);
})();

/* ════════════════════════════════════════════════════════════
   12. LOVE METER
════════════════════════════════════════════════════════════ */
(function LoveMeter() {
  const fill = document.getElementById('lmFill');
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      fill.style.animation = 'lmGrow 2s 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards, lmShimmer 4s 2.3s linear infinite';
      obs.disconnect();
    }
  },{threshold:0.5});
  obs.observe(fill);
})();

/* ════════════════════════════════════════════════════════════
   13. SECRET MESSAGE
════════════════════════════════════════════════════════════ */
(function Secret() {
  const lock    = document.getElementById('secretLock');
  const reveal  = document.getElementById('secretReveal');
  const hearts  = document.querySelectorAll('#secretHearts span');
  const msg     = document.getElementById('revealMsg');
  const pw      = document.getElementById('pwInput');
  const pwBtn   = document.getElementById('pwBtn');
  const lockBtn = document.getElementById('revealLock');
  let lit = new Set();

  msg.textContent = CFG.secret;

  function unlock() {
    lock.style.transition='all 0.4s ease';
    lock.style.opacity='0'; lock.style.transform='scale(0.85)';
    setTimeout(()=>{ lock.style.display='none'; reveal.classList.add('show'); confetti(); },400);
  }
  function relock() {
    reveal.classList.remove('show');
    lock.style.display=''; setTimeout(()=>{ lock.style.opacity='1'; lock.style.transform=''; },50);
    lit.clear(); hearts.forEach(h=>{h.textContent='🤍';h.classList.remove('lit');}); pw.value='';
  }

  hearts.forEach(h=>{
    h.addEventListener('click',()=>{
      const i=Number(h.dataset.i);
      if(lit.has(i)){lit.delete(i);h.textContent='🤍';h.classList.remove('lit');}
      else{lit.add(i);h.textContent='❤️';h.classList.add('lit');}
      if(lit.size===hearts.length) setTimeout(unlock,500);
    });
  });

  pwBtn.addEventListener('click',()=>{
    if(pw.value.toLowerCase().trim()===CFG.password){unlock();}
    else{
      pw.style.borderColor='#ef4444'; pw.style.boxShadow='0 0 0 3px rgba(239,68,68,0.15)'; pw.value='';
      setTimeout(()=>{pw.style.borderColor='';pw.style.boxShadow='';},900);
    }
  });
  pw.addEventListener('keypress',e=>{if(e.key==='Enter')pwBtn.click();});
  lockBtn.addEventListener('click', relock);

  /* confetti */
  function confetti() {
    const cs = ['#e8305a','#c9932a','#e8bb6e','#8B5CF6','#ff6b8e','#ffffff'];
    const ks = document.createElement('style');
    ks.textContent = `@keyframes cfFall{to{transform:translateY(110vh) rotate(${540+Math.random()*360|0}deg);opacity:0}}`;
    document.head.appendChild(ks);
    for(let i=0;i<55;i++){
      const c=document.createElement('div');
      const s=6+Math.random()*9;
      c.style.cssText=`position:fixed;pointer-events:none;z-index:9990;left:${Math.random()*100}vw;top:-12px;width:${s}px;height:${s}px;background:${cs[Math.random()*cs.length|0]};border-radius:${Math.random()>.5?'50%':'2px'};animation:cfFall ${1.6+Math.random()*2}s ${Math.random()*.6}s ease-in forwards;`;
      document.body.appendChild(c);
      setTimeout(()=>c.remove(),3500);
    }
  }
})();

/* ════════════════════════════════════════════════════════════
   14. MUSIC PLAYER
════════════════════════════════════════════════════════════ */
(function Music() {
  const vinyl    = document.getElementById('mpVinyl');
  const play     = document.getElementById('mpPlay');
  const playIcon = document.getElementById('mpPlayIcon');
  const prev     = document.getElementById('mpPrev');
  const next     = document.getElementById('mpNext');
  const vol      = document.getElementById('mpVolume');
  const name     = document.getElementById('mpTrackName');
  const artist   = document.getElementById('mpArtist');
  let cur=0, playing=false, audio=null;

  const PLAY_PATH  = 'M8 5v14l11-7z';
  const PAUSE_PATH = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

  function load(i) {
    if(audio){audio.pause();audio.src='';}
    const t=CFG.playlist[i]; name.textContent=t.title; artist.textContent=t.artist;
    if(t.src){
      audio=new Audio(t.src); audio.volume=parseFloat(vol.value);
      audio.addEventListener('ended',()=>nextTrack());
      if(playing) audio.play().catch(()=>{});
    }
  }

  function toggle() {
    playing=!playing;
    playIcon.setAttribute('d', playing?PAUSE_PATH:PLAY_PATH);
    vinyl.classList.toggle('spinning',playing);
    if(!audio&&CFG.playlist[cur].src)load(cur);
    if(audio) playing?audio.play().catch(()=>{}):audio.pause();
  }
  function nextTrack(){cur=(cur+1)%CFG.playlist.length;load(cur);}
  function prevTrack(){cur=(cur-1+CFG.playlist.length)%CFG.playlist.length;load(cur);}

  play.addEventListener('click',toggle);
  next.addEventListener('click',nextTrack);
  prev.addEventListener('click',prevTrack);
  vol.addEventListener('input',()=>{if(audio)audio.volume=parseFloat(vol.value);});
  document.addEventListener('click',()=>{if(!playing&&CFG.playlist[cur].src)toggle();},{once:true});
  load(0);
})();

/* ════════════════════════════════════════════════════════════
   15. FOOTER HEARTS
════════════════════════════════════════════════════════════ */
(function Footer() {
  const wrap = document.getElementById('footerHearts');
  '❤️ 💗 💕 💖 💓 ✨ 🌹 💍 🌸 💫'.split(' ').forEach((s,i) => {
    const el = document.createElement('span');
    el.className='f-heart'; el.textContent=s;
    el.style.animationDelay   = `${i*0.22}s`;
    el.style.animationDuration= `${2.8+i*0.28}s`;
    wrap.appendChild(el);
  });
})();

/* ════════════════════════════════════════════════════════════
   16. PARALLAX ON SCROLL
════════════════════════════════════════════════════════════ */
(function Parallax() {
  const content = document.querySelector('.hero-content');
  window.addEventListener('scroll',()=>{
    const y=scrollY;
    if(!content) return;
    content.style.transform=`translateY(${y*0.22}px)`;
    content.style.opacity=Math.max(0,1-y/520);
  },{passive:true});
})();

/* ════════════════════════════════════════════════════════════
   17. 3D TILT UTILITY
════════════════════════════════════════════════════════════ */
function tilt(e, el, strength=12) {
  const r = el.getBoundingClientRect();
  const x = ((e.clientX-r.left)/r.width -0.5)*2;
  const y = ((e.clientY-r.top) /r.height-0.5)*2;
  el.style.transition='transform 0.1s ease';
  el.style.transform =`perspective(900px) rotateX(${-y*strength*0.55}deg) rotateY(${x*strength}deg) scale3d(1.02,1.02,1.02)`;
}
function untilt(el) {
  el.style.transition='transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
  el.style.transform ='perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
}

/* ════════════════════════════════════════════════════════════
   18. INIT ALL REVEALS
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* mark section headers for reveal */
  document.querySelectorAll('.section-head, .music-player').forEach(el => el.classList.add('reveal'));
  initReveal();
});
