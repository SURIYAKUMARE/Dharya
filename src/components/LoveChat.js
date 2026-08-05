import { useState, useEffect, useRef, useCallback } from "react";

const POLL_MS = 2500;

/* ── AI replies ── */
const OFFLINE_REPLIES = [
  { triggers:["hi","hello","hey","hii","hai"], responses:["Hi fruad 💙 I was just thinking about you...","Hey you! 🥰 My favourite person just showed up.","Hi Sadhana! You made my day better 🌸"] },
  { triggers:["love you","i love","love u","luv"], responses:["I love you more than words can say 💙","Not as much as I love you 💍","Every time you say that, my heart does something unexplainable 💓"] },
  { triggers:["miss you","missing","miss u"], responses:["I miss you every second 🌙","You're always in my heart 💙","Missing you is my heart loving you from a distance 🌸"] },
  { triggers:["how are you","how r u","hows"], responses:["Better now that you're here 🥰","Always good when I hear from you 💙","Missing you a little, but happy you asked 🌸"] },
  { triggers:["sad","upset","cry","tired","bad day"], responses:["Come here 🫂 Whatever it is, we'll get through it.","You don't have to carry it alone 💙","Tell me everything. I'm right here 🌸"] },
  { triggers:["night","good night","goodnight","sleep","bye"], responses:["Good night, my moon 🌙 Dream beautiful dreams.","Sleep well 💙 I'll think of you till morning.","Good night fruad 🌸"] },
  { triggers:["morning","good morning"], responses:["Good morning, my favourite person ☀️","You woke up today — the world is better 🌸","Morning! 💙"] },
];
const FALLBACKS = ["I love you endlessly 💙","Right here with you 🌸","You could say anything and I'd still look at you the same 💖","I don't always have answers, but I always have love 💍","Just talking to you makes everything better 💙"];
function aiReply(text) {
  const lower = text.toLowerCase();
  for (const r of OFFLINE_REPLIES)
    if (r.triggers.some(t => lower.includes(t))) return r.responses[Math.floor(Math.random()*r.responses.length)];
  return FALLBACKS[Math.floor(Math.random()*FALLBACKS.length)];
}

const QUICK = {
  surya:   ["Hi Sadhana 💙","I love you 💖","Missing you 🥺","Good morning ☀️","Good night 🌙","Thinking of you 💭"],
  sadhana: ["Hi Surya 💗","I love you too 💖","Miss you 🥺","Good morning ☀️","Good night 🌙","💗"],
  demo:    ["Hi! 💙","This is a demo 👀","Nice chat UI! 😊"],
};
const EMOJIS = ["❤️","💙","💗","🥰","😍","😊","🌸","✨","💫","🥺","😂","🤗","💍","🌙","☀️","💌","🎵","🫂","🌹","💐","😘","🔥","💯","🎉","🙈","💕","🌺","⭐","🎶","🌿"];
const REACTIONS = ["❤️","😂","😮","😢","😍","👍"];

function fmtTime(d) { return new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); }
function fmtDate(d) {
  const dt=new Date(d),today=new Date(),yest=new Date();
  today.setHours(0,0,0,0);yest.setHours(0,0,0,0);yest.setDate(yest.getDate()-1);
  if(dt>=today) return "Today";
  if(dt>=yest) return "Yesterday";
  return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function fmtTimer(sec) {
  return `${Math.floor(sec/60).toString().padStart(2,"0")}:${(sec%60).toString().padStart(2,"0")}`;
}

/* ══ CSS ══ */
const CHAT_CSS = `
/* === PAGE === */
.lc-page {
  display:flex; flex-direction:column; height:calc(100vh - 128px);
  border-radius:24px; overflow:hidden; position:relative;
  background:linear-gradient(180deg,#080610 0%,#0d0518 100%);
  border:1px solid rgba(255,255,255,0.07);
  box-shadow:0 32px 80px rgba(0,0,0,0.6);
}

/* === HEADER === */
.lc-header {
  display:flex; align-items:center; gap:12px; padding:12px 16px;
  background:rgba(9,4,21,0.98); border-bottom:1px solid rgba(255,255,255,0.07);
  flex-shrink:0; z-index:20; backdrop-filter:blur(20px);
  position:relative;
}
.lc-header::after {
  content:''; position:absolute; bottom:-1px; left:0; right:0; height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,26,110,0.4),rgba(0,217,126,0.3),transparent);
}
.lc-avatar-wrap { position:relative; flex-shrink:0; }
.lc-avatar {
  width:44px; height:44px; border-radius:50%;
  display:flex; align-items:center; justify-content:center; font-size:1.35rem;
  box-shadow:0 0 0 2.5px rgba(255,26,110,0.4), 0 4px 14px rgba(0,0,0,0.4);
  transition:transform 0.3s;
}
.lc-avatar:hover { transform:scale(1.08); }
.lc-avatar.surya-av { background:linear-gradient(135deg,#ff1a6e,#8b3fc8); }
.lc-avatar.sadhana-av { background:linear-gradient(135deg,#00d97e,#06B6D4); box-shadow:0 0 0 2.5px rgba(0,217,126,0.4),0 4px 14px rgba(0,0,0,0.4); }
.lc-online-ring {
  position:absolute; bottom:1px; right:1px; width:11px; height:11px;
  background:#25d366; border-radius:50%; border:2px solid #090415;
  animation:lcOnline 2.5s ease-in-out infinite;
}
@keyframes lcOnline { 0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)} 50%{box-shadow:0 0 0 4px rgba(37,211,102,0)} }
.lc-header-info { flex:1; min-width:0; }
.lc-name { font-family:'Inter',sans-serif; font-size:0.97rem; font-weight:700; color:#fff; display:block; letter-spacing:0.2px; }
.lc-status { font-family:'Inter',sans-serif; font-size:0.7rem; color:rgba(255,255,255,0.42); display:flex; align-items:center; gap:5px; margin-top:1px; }
.lc-dot { width:5px; height:5px; border-radius:50%; background:#25d366; animation:lcOnline 2.5s ease-in-out infinite; }
.lc-hdr-btn {
  width:38px; height:38px; border-radius:12px; border:none; cursor:pointer; font-size:1.1rem;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); backdrop-filter:blur(10px);
}
.lc-hdr-btn.voice { background:rgba(37,211,102,0.10); color:#25d366; border:1.5px solid rgba(37,211,102,0.25); }
.lc-hdr-btn.video { background:rgba(255,26,110,0.08); color:#ff1a6e; border:1.5px solid rgba(255,26,110,0.22); }
.lc-hdr-btn:hover { transform:scale(1.12) translateY(-2px); }
.lc-hdr-btn.voice:hover { background:rgba(37,211,102,0.2); box-shadow:0 6px 20px rgba(37,211,102,0.28); }
.lc-hdr-btn.video:hover { background:rgba(255,26,110,0.18); box-shadow:0 6px 20px rgba(255,26,110,0.28); }

/* === MESSAGES === */
.lc-msgs {
  flex:1; overflow-y:auto; padding:14px 12px 8px;
  display:flex; flex-direction:column; gap:2px;
  position:relative; z-index:1; scroll-behavior:smooth;
}
.lc-msgs::-webkit-scrollbar { width:2px; }
.lc-msgs::-webkit-scrollbar-thumb { background:rgba(255,26,110,0.25); border-radius:2px; }
.lc-bg {
  position:absolute; inset:0; opacity:0.03; pointer-events:none;
  background-image:repeating-linear-gradient(45deg,rgba(255,26,110,1) 0,rgba(255,26,110,1) 1px,transparent 0,transparent 50%);
  background-size:24px 24px;
}
.lc-date-chip { text-align:center; margin:10px 0 6px; display:flex; align-items:center; justify-content:center; }
.lc-date-chip span {
  font-family:'Inter',sans-serif; font-size:0.66rem; color:rgba(255,255,255,0.4);
  background:rgba(255,255,255,0.06); padding:3px 14px; border-radius:50px;
  border:1px solid rgba(255,255,255,0.07); letter-spacing:0.3px;
}
.lc-row { display:flex; padding:0 4px; margin-bottom:1px; position:relative; }
.lc-row.mine { justify-content:flex-end; }
.lc-row.theirs { justify-content:flex-start; }
.lc-row.same-sender { margin-bottom:1px; }

/* bubble */
.lc-bubble {
  max-width:74%; padding:9px 13px 6px; border-radius:18px;
  position:relative; word-break:break-word;
  animation:bubbleIn 0.28s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes bubbleIn {
  from { transform:scale(0.82) translateY(8px); opacity:0; }
  to   { transform:scale(1) translateY(0); opacity:1; }
}
.lc-bubble.mine {
  background:linear-gradient(145deg,#ff1a6e,#a8004e);
  border-radius:18px 18px 4px 18px;
  box-shadow:0 3px 12px rgba(255,26,110,0.35),0 1px 3px rgba(0,0,0,0.3);
  color:#fff;
}
.lc-bubble.mine.surya-bubble { background:linear-gradient(145deg,#00d97e,#007a48); box-shadow:0 3px 12px rgba(0,217,126,0.35),0 1px 3px rgba(0,0,0,0.3); }
.lc-bubble.theirs {
  background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1);
  border-radius:18px 18px 18px 4px; backdrop-filter:blur(12px); color:rgba(255,255,255,0.9);
}
.lc-bubble.pending { opacity:0.6; }
.lc-sender { font-family:'Inter',sans-serif; font-size:0.63rem; font-weight:700; color:rgba(255,220,120,0.9); display:block; margin-bottom:3px; }
.lc-text { font-family:'Inter',sans-serif; font-size:0.91rem; line-height:1.5; margin:0; }
.lc-deleted { font-family:'Inter',sans-serif; font-size:0.83rem; color:rgba(255,255,255,0.3); font-style:italic; margin:0; display:flex; align-items:center; gap:5px; }
.lc-img { max-width:210px; border-radius:12px; display:block; margin-bottom:4px; cursor:pointer; transition:transform 0.2s; }
.lc-img:hover { transform:scale(1.03); }
.lc-meta { display:flex; align-items:center; justify-content:flex-end; gap:4px; margin-top:4px; }
.lc-time { font-family:'Inter',sans-serif; font-size:0.6rem; opacity:0.5; }
.lc-edited { font-family:'Inter',sans-serif; font-size:0.58rem; opacity:0.45; font-style:italic; }
.lc-ticks { font-size:0.68rem; }

/* reactions */
.lc-reactions { display:flex; gap:3px; flex-wrap:wrap; margin-top:4px; }
.lc-react-chip {
  font-size:0.85rem; padding:1px 6px; border-radius:50px;
  background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15);
  cursor:pointer; transition:transform 0.2s; display:flex; align-items:center; gap:3px;
}
.lc-react-chip:hover { transform:scale(1.2); }
.lc-react-picker {
  position:absolute; bottom:calc(100% + 6px); right:0;
  background:rgba(9,4,21,0.98); border:1px solid rgba(255,255,255,0.12);
  border-radius:50px; padding:6px 10px; z-index:60;
  display:flex; gap:6px; box-shadow:0 8px 30px rgba(0,0,0,0.6);
  animation:fadeInUp 0.2s ease;
}
.lc-react-picker span { font-size:1.3rem; cursor:pointer; transition:transform 0.18s; }
.lc-react-picker span:hover { transform:scale(1.4); }
.lc-row.mine .lc-react-picker { left:0; right:auto; }

/* context menu */
.lc-menu {
  position:absolute; z-index:80;
  background:rgba(9,4,21,0.99); border:1px solid rgba(255,255,255,0.1);
  border-radius:14px; padding:6px; min-width:140px;
  box-shadow:0 12px 40px rgba(0,0,0,0.7); backdrop-filter:blur(20px);
  animation:fadeInUp 0.18s ease;
}
.lc-row.mine .lc-menu { right:0; top:calc(100% + 4px); }
.lc-row.theirs .lc-menu { left:0; top:calc(100% + 4px); }
.lc-menu button {
  width:100%; padding:9px 14px; border-radius:9px; border:none; background:transparent;
  color:rgba(255,255,255,0.75); font-family:'Inter',sans-serif; font-size:0.82rem;
  cursor:pointer; text-align:left; display:flex; align-items:center; gap:8px; transition:background 0.15s;
}
.lc-menu button:hover { background:rgba(255,255,255,0.08); }
.lc-menu button.del { color:#f87171; }
.lc-menu button.del:hover { background:rgba(239,68,68,0.12); }
.lc-edit-wrap { display:flex; flex-direction:column; gap:6px; }
.lc-edit-input {
  padding:7px 11px; border-radius:10px; background:rgba(255,255,255,0.12);
  border:1px solid rgba(255,255,255,0.2); color:#fff; font-family:'Inter',sans-serif;
  font-size:0.88rem; outline:none; width:100%; box-sizing:border-box;
}
.lc-edit-btns { display:flex; gap:6px; }
.lc-edit-btns button { padding:5px 14px; border-radius:8px; border:none; cursor:pointer; font-family:'Inter',sans-serif; font-size:0.78rem; font-weight:700; }
.lc-edit-btns button:first-child { background:#25d366; color:#fff; }
.lc-edit-btns button:last-child { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.6); }

/* typing indicator */
.lc-typing { display:flex; gap:5px; align-items:center; padding:6px 0 2px 6px; }
.lc-typing-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.4); animation:lcTyping 1.2s ease-in-out infinite; }
.lc-typing-dot:nth-child(2) { animation-delay:0.2s; }
.lc-typing-dot:nth-child(3) { animation-delay:0.4s; }
@keyframes lcTyping { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }

/* empty state */
.lc-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:12px; padding:40px; text-align:center; }
.lc-empty-icon { font-size:3.5rem; animation:floatEmoji 3s ease-in-out infinite alternate; }
.lc-empty-title { font-family:'Cormorant Garamond',serif; font-size:1.6rem; font-style:italic; color:#fff; margin:0; }
.lc-empty-sub { font-family:'Inter',sans-serif; font-size:0.85rem; color:rgba(255,255,255,0.35); margin:0; line-height:1.6; }

/* img preview bar */
.lc-img-bar {
  flex-shrink:0; padding:8px 14px; background:rgba(9,4,21,0.96);
  border-top:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; gap:10px; z-index:10;
}
.lc-img-bar img { height:54px; width:54px; border-radius:10px; object-fit:cover; border:1.5px solid rgba(255,26,110,0.35); }
.lc-img-bar button { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); color:#f87171; width:28px; height:28px; border-radius:50%; cursor:pointer; font-size:0.85rem; flex-shrink:0; transition:all 0.2s; }
.lc-img-bar button:hover { background:rgba(239,68,68,0.25); transform:scale(1.1); }

/* quick replies */
.lc-quick { flex-shrink:0; display:flex; gap:6px; overflow-x:auto; padding:6px 12px; background:rgba(9,4,21,0.92); border-top:1px solid rgba(255,255,255,0.05); z-index:10; }
.lc-quick::-webkit-scrollbar { display:none; }
.lc-quick-btn {
  flex-shrink:0; padding:5px 14px; border-radius:50px; white-space:nowrap;
  background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
  color:rgba(255,255,255,0.6); font-family:'Inter',sans-serif; font-size:0.74rem;
  cursor:pointer; transition:all 0.2s;
}
.lc-quick-btn:hover { background:rgba(255,26,110,0.15); border-color:rgba(255,26,110,0.35); color:#ff6b8e; transform:translateY(-1px); }

/* emoji picker */
.lc-emoji-picker { flex-shrink:0; display:flex; flex-wrap:wrap; gap:4px; padding:10px 14px; background:rgba(9,4,21,0.96); border-top:1px solid rgba(255,255,255,0.07); z-index:10; max-height:130px; overflow-y:auto; }
.lc-emoji-btn { font-size:1.4rem; background:none; border:none; cursor:pointer; padding:3px; border-radius:8px; transition:transform 0.15s; }
.lc-emoji-btn:hover { transform:scale(1.35); }

/* input bar */
.lc-input-bar {
  flex-shrink:0; display:flex; align-items:flex-end; gap:8px;
  padding:10px 12px; background:rgba(9,4,21,0.98); border-top:1px solid rgba(255,255,255,0.07); z-index:10;
}
.lc-icon-btn {
  width:40px; height:40px; border-radius:13px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; font-size:1.15rem;
  background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.65);
  transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); flex-shrink:0;
}
.lc-icon-btn:hover { background:rgba(255,26,110,0.15); color:#ff6b8e; transform:scale(1.1); }
.lc-input {
  flex:1; padding:11px 18px; border-radius:24px;
  background:rgba(255,255,255,0.07); border:1.5px solid rgba(255,255,255,0.1);
  color:#fff; font-family:'Inter',sans-serif; font-size:0.92rem;
  outline:none; resize:none; max-height:100px; line-height:1.5;
  transition:all 0.25s;
}
.lc-input::placeholder { color:rgba(255,255,255,0.3); }
.lc-input:focus { border-color:rgba(255,26,110,0.45); background:rgba(255,255,255,0.1); box-shadow:0 0 0 3px rgba(255,26,110,0.1); }
.lc-send-btn {
  width:44px; height:44px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:1.1rem;
  background:linear-gradient(135deg,#ff1a6e,#a8004e);
  box-shadow:0 4px 16px rgba(255,26,110,0.5); transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
.lc-send-btn:hover:not(:disabled) { transform:scale(1.1) translateY(-2px); box-shadow:0 8px 24px rgba(255,26,110,0.65); }
.lc-send-btn:disabled { opacity:0.35; cursor:default; transform:none; }
.lc-send-btn.surya-send { background:linear-gradient(135deg,#00d97e,#007a48); box-shadow:0 4px 16px rgba(0,217,126,0.5); }
.lc-send-btn.surya-send:hover:not(:disabled) { box-shadow:0 8px 24px rgba(0,217,126,0.65); }
.lc-error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); color:#f87171; font-family:'Inter',sans-serif; font-size:0.8rem; padding:8px 14px; border-radius:10px; margin:0 0 8px; }
`;

/* ══ CALL CSS ══ */
const CALL_CSS = `
/* === CALL SCREEN === */
.lc-call-screen {
  position:fixed; inset:0; z-index:9990;
  display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
  padding-bottom:env(safe-area-inset-bottom,0);
}
.lc-call-bg {
  position:absolute; inset:0;
  background:radial-gradient(ellipse at 50% 30%, rgba(255,26,110,0.18) 0%, transparent 55%),
             radial-gradient(ellipse at 80% 80%, rgba(139,63,200,0.14) 0%, transparent 50%),
             #050810;
}
.lc-call-screen.video-mode .lc-call-bg { background:#000; }

/* blur particles */
.lc-call-orb { position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; animation:lcOrbFloat 8s ease-in-out infinite alternate; }
.lc-call-orb-1 { width:300px; height:300px; top:-60px; left:-60px; background:rgba(255,26,110,0.15); }
.lc-call-orb-2 { width:250px; height:250px; bottom:100px; right:-40px; background:rgba(139,63,200,0.18); animation-delay:-4s; }
@keyframes lcOrbFloat { 0%{transform:translate(0,0)} 100%{transform:translate(30px,20px)} }

/* ripple rings */
.lc-call-ripples { position:absolute; top:35%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
.lc-call-ripple {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  border-radius:50%; border:1.5px solid rgba(255,26,110,0.3);
  animation:lcRipple 2.8s ease-out infinite;
}
.lc-call-ripple:nth-child(1) { width:160px; height:160px; }
.lc-call-ripple:nth-child(2) { width:240px; height:240px; animation-delay:0.8s; }
.lc-call-ripple:nth-child(3) { width:330px; height:330px; animation-delay:1.6s; }
@keyframes lcRipple {
  0%   { transform:translate(-50%,-50%) scale(0.85); opacity:0.9; }
  100% { transform:translate(-50%,-50%) scale(1.15); opacity:0; }
}

/* avatar area */
.lc-call-center { position:absolute; top:0; left:0; right:0; bottom:160px; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:2; gap:0; }
.lc-call-avatar-ring {
  width:120px; height:120px; border-radius:50%;
  background:linear-gradient(135deg,#ff1a6e,#8b3fc8);
  display:flex; align-items:center; justify-content:center; font-size:3.4rem;
  box-shadow:0 0 0 3px rgba(255,255,255,0.1), 0 20px 60px rgba(255,26,110,0.4);
  animation:lcCallPulse 2s ease-in-out infinite;
  position:relative;
}
.lc-call-avatar-ring.connected { animation:floatEmoji 3s ease-in-out infinite alternate; box-shadow:0 0 0 3px rgba(37,211,102,0.3),0 20px 60px rgba(37,211,102,0.25); }
@keyframes lcCallPulse {
  0%,100% { box-shadow:0 0 0 3px rgba(255,26,110,0.3),0 0 0 12px rgba(255,26,110,0.06),0 20px 60px rgba(255,26,110,0.35); }
  50%     { box-shadow:0 0 0 3px rgba(255,26,110,0.6),0 0 0 22px rgba(255,26,110,0.04),0 20px 60px rgba(255,26,110,0.5); }
}
.lc-call-name { font-family:'Cormorant Garamond',serif; font-size:2.2rem; font-weight:600; font-style:italic; color:#fff; margin:20px 0 6px; text-shadow:0 0 30px rgba(255,26,110,0.4); letter-spacing:-0.3px; }
.lc-call-status { font-family:'Inter',sans-serif; font-size:0.88rem; color:rgba(255,255,255,0.5); display:flex; align-items:center; gap:7px; }
.lc-call-status .dot { width:7px; height:7px; border-radius:50%; background:#25d366; animation:lcOnline 1.5s ease-in-out infinite; }
.lc-call-timer { font-family:'Inter',sans-serif; font-size:1.3rem; font-weight:700; color:rgba(255,255,255,0.85); margin-top:6px; letter-spacing:3px; font-variant-numeric:tabular-nums; }
.lc-call-type-badge {
  position:absolute; top:20px; left:50%; transform:translateX(-50%);
  background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1);
  border-radius:50px; padding:5px 14px; font-family:'Inter',sans-serif;
  font-size:0.72rem; font-weight:700; color:rgba(255,255,255,0.55); letter-spacing:1px; text-transform:uppercase;
  backdrop-filter:blur(10px);
}

/* video */
.lc-video-remote { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; }
.lc-video-local {
  position:absolute; bottom:175px; right:16px; z-index:3;
  width:100px; height:140px; border-radius:16px; object-fit:cover;
  border:2px solid rgba(255,255,255,0.2); box-shadow:0 8px 28px rgba(0,0,0,0.6);
  background:#111; cursor:pointer; transition:transform 0.2s;
}
.lc-video-local:hover { transform:scale(1.05); }

/* action panel */
.lc-call-actions {
  width:100%; max-width:380px; z-index:4; padding:20px 24px 32px;
  background:linear-gradient(0deg,rgba(5,8,16,0.95) 0%,rgba(5,8,16,0.7) 70%,transparent 100%);
  display:flex; flex-direction:column; gap:16px;
}
.lc-call-btns { display:flex; justify-content:center; align-items:center; gap:20px; }
.lc-call-btn {
  display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; border:none; background:transparent; padding:0;
}
.lc-call-btn-icon {
  width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-size:1.4rem; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow:0 4px 14px rgba(0,0,0,0.4);
}
.lc-call-btn:hover .lc-call-btn-icon { transform:scale(1.1) translateY(-3px); }
.lc-call-btn-label { font-family:'Inter',sans-serif; font-size:0.65rem; color:rgba(255,255,255,0.45); font-weight:600; letter-spacing:0.3px; }
.lc-btn-mute .lc-call-btn-icon  { background:rgba(255,255,255,0.12); color:#fff; }
.lc-btn-cam .lc-call-btn-icon   { background:rgba(255,255,255,0.12); color:#fff; }
.lc-btn-spk .lc-call-btn-icon   { background:rgba(255,255,255,0.12); color:#fff; }
.lc-btn-end .lc-call-btn-icon   { background:linear-gradient(135deg,#ef4444,#b91c1c); color:#fff; width:66px; height:66px; font-size:1.6rem; box-shadow:0 6px 24px rgba(239,68,68,0.55); }
.lc-btn-on .lc-call-btn-icon    { background:rgba(37,211,102,0.18); color:#25d366; border:1.5px solid rgba(37,211,102,0.35); }

/* incoming call */
.lc-incoming {
  position:fixed; top:70px; left:50%; transform:translateX(-50%);
  z-index:9996; width:calc(100% - 32px); max-width:360px;
  background:rgba(9,4,21,0.98); border:1.5px solid rgba(37,211,102,0.4);
  border-radius:22px; overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(37,211,102,0.12);
  backdrop-filter:blur(24px); animation:lcIncomingIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes lcIncomingIn { from{transform:translateX(-50%) translateY(-40px) scale(0.9);opacity:0} to{transform:translateX(-50%) translateY(0) scale(1);opacity:1} }
.lc-incoming-top { height:3px; background:linear-gradient(90deg,transparent,#25d366,transparent); background-size:200%; animation:shimmerRibbon 2s linear infinite; }
.lc-incoming-body { padding:16px 20px; display:flex; align-items:center; gap:14px; }
.lc-incoming-av { width:50px; height:50px; border-radius:50%; background:linear-gradient(135deg,#ff1a6e,#8b3fc8); display:flex; align-items:center; justify-content:center; font-size:1.5rem; animation:lcCallPulse 1.5s ease-in-out infinite; flex-shrink:0; }
.lc-incoming-info { flex:1; }
.lc-incoming-label { font-family:'Inter',sans-serif; font-size:0.68rem; font-weight:700; color:#25d366; text-transform:uppercase; letter-spacing:1px; }
.lc-incoming-name { font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-style:italic; color:#fff; margin:2px 0 0; }
.lc-incoming-btns { display:flex; gap:10px; }
.lc-incoming-btns button { width:46px; height:46px; border-radius:50%; border:none; font-size:1.35rem; cursor:pointer; transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.lc-incoming-btns button:hover { transform:scale(1.15); }
.lc-btn-accept { background:linear-gradient(135deg,#25d366,#128c7e); box-shadow:0 4px 16px rgba(37,211,102,0.5); animation:lcCallPulse 1.5s ease-in-out infinite; }
.lc-btn-decline { background:linear-gradient(135deg,#ef4444,#b91c1c); box-shadow:0 4px 16px rgba(239,68,68,0.4); }
`;

function injectStyles() {
  if (!document.getElementById("lc-chat-css")) {
    const s = document.createElement("style"); s.id = "lc-chat-css";
    s.textContent = CHAT_CSS + CALL_CSS; document.head.appendChild(s);
  }
}

/* ══ WebRTC signaling hook ══ */
const ICE = [{ urls:"stun:stun.l.google.com:19302" },{ urls:"stun:stun1.l.google.com:19302" }];

function useSignal(room, onSignal) {
  const since = useRef(new Date().toISOString());
  const send = useCallback(async (from, type, data) => {
    try { await fetch("/api/signal",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({room,from,type,data}) }); } catch {}
  }, [room]);
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/signal?room=${room}&since=${since.current}`);
        const items = await r.json();
        if (items?.length) { since.current = items[items.length-1].createdAt; items.forEach(onSignal); }
      } catch {}
    }, 1500);
    return () => clearInterval(id);
  }, [room, onSignal]);
  return { send };
}

/* ══ CALL SCREEN ══ */
function CallScreen({ user, otherName, mode, onEnd }) {
  const [state,    setState]   = useState("ringing");
  const [muted,    setMuted]   = useState(false);
  const [camOff,   setCamOff]  = useState(false);
  const [spk,      setSpk]     = useState(true);
  const [elapsed,  setElapsed] = useState(0);
  const [vidReady, setVidReady]= useState(false);

  const pc       = useRef(null);
  const lStream  = useRef(null);
  const timer    = useRef(null);
  const remVid   = useRef(null);
  const locVid   = useRef(null);
  const room     = "lc_call_dharya";
  const isCaller = user === "surya";
  const isVideo  = mode === "video";

  const handleSig = useCallback(async sig => {
    if (sig.from === user) return;
    const p = pc.current; if (!p) return;
    if (sig.type === "offer") {
      await p.setRemoteDescription(new RTCSessionDescription(sig.data));
      const ans = await p.createAnswer(); await p.setLocalDescription(ans); send(user,"answer",ans);
    } else if (sig.type === "answer" && p.signalingState !== "stable") {
      await p.setRemoteDescription(new RTCSessionDescription(sig.data));
    } else if (sig.type === "ice") {
      try { await p.addIceCandidate(new RTCIceCandidate(sig.data)); } catch {}
    } else if (sig.type === "call_end") { cleanup(); onEnd(); }
  }, [user]); // eslint-disable-line

  const { send } = useSignal(room, handleSig);

  const cleanup = useCallback(() => {
    clearInterval(timer.current);
    lStream.current?.getTracks().forEach(t => t.stop());
    try { pc.current?.close(); } catch {} pc.current = null;
    fetch(`/api/signal?room=${room}`,{ method:"DELETE" }).catch(()=>{});
  }, [room]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          isVideo ? { audio:true, video:{ facingMode:"user" } } : { audio:true, video:false }
        );
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        lStream.current = stream;
        if (locVid.current && isVideo) locVid.current.srcObject = stream;
        const p = new RTCPeerConnection({ iceServers:ICE }); pc.current = p;
        stream.getTracks().forEach(t => p.addTrack(t, stream));
        p.ontrack = e => { if (remVid.current) { remVid.current.srcObject = e.streams[0]; setVidReady(true); } };
        p.onicecandidate = e => { if (e.candidate) send(user,"ice",e.candidate); };
        p.onconnectionstatechange = () => {
          if (p.connectionState === "connected") { setState("connected"); timer.current = setInterval(()=>setElapsed(s=>s+1),1000); }
          if (["disconnected","failed","closed"].includes(p.connectionState)) { cleanup(); setTimeout(onEnd,600); }
        };
        if (isCaller) { const off = await p.createOffer(); await p.setLocalDescription(off); send(user,"offer",off); }
      } catch (e) { console.warn("Media:", e.message); }
    })();
    return () => { cancelled = true; cleanup(); };
  }, []); // eslint-disable-line

  const endCall = () => { send(user,"call_end",{}); cleanup(); onEnd(); };
  const toggleMute = () => { lStream.current?.getAudioTracks().forEach(t=>{t.enabled=!t.enabled;}); setMuted(m=>!m); };
  const toggleCam  = () => { lStream.current?.getVideoTracks().forEach(t=>{t.enabled=!t.enabled;}); setCamOff(c=>!c); };
  const isConn = state === "connected";

  return (
    <div className={`lc-call-screen ${isVideo?"video-mode":""}`}>
      <div className="lc-call-bg" />
      {!isVideo && <><div className="lc-call-orb lc-call-orb-1"/><div className="lc-call-orb lc-call-orb-2"/><div className="lc-call-ripples"><div className="lc-call-ripple"/><div className="lc-call-ripple"/><div className="lc-call-ripple"/></div></>}

      {/* Video streams */}
      {isVideo && <video ref={remVid} className="lc-video-remote" autoPlay playsInline style={{display:vidReady?"block":"none"}}/>}
      {isVideo && !vidReady && (
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:"4rem",marginBottom:12}}>{user==="surya"?"💗":"💚"}</div><p style={{color:"rgba(255,255,255,0.4)",fontFamily:"'Inter',sans-serif",fontSize:"0.9rem"}}>{isConn?"Camera off":"Connecting..."}</p></div>
        </div>
      )}
      {isVideo && <video ref={locVid} className="lc-video-local" autoPlay muted playsInline />}

      {/* Call type badge */}
      <div className="lc-call-type-badge">{isVideo?"📹 Video Call":"📞 Voice Call"}</div>

      {/* Center info */}
      <div className="lc-call-center">
        <div className={`lc-call-avatar-ring ${isConn?"connected":""}`} style={user==="surya"?{background:"linear-gradient(135deg,#ff1a6e,#8b3fc8)"}:{background:"linear-gradient(135deg,#00d97e,#06B6D4)"}}>
          {user==="surya"?"💗":"💚"}
        </div>
        <div className="lc-call-name">{otherName}</div>
        {isConn
          ? <div className="lc-call-timer">{fmtTimer(elapsed)}</div>
          : <div className="lc-call-status"><span className="dot"/>{state==="ringing"?"Ringing...":"Connecting..."}</div>
        }
      </div>

      {/* Actions */}
      <div className="lc-call-actions">
        <div className="lc-call-btns">
          <button className={`lc-call-btn lc-btn-mute ${muted?"lc-btn-on":""}`} onClick={toggleMute}>
            <div className="lc-call-btn-icon">{muted?"🔇":"🎤"}</div>
            <span className="lc-call-btn-label">{muted?"Unmute":"Mute"}</span>
          </button>
          {isVideo && (
            <button className={`lc-call-btn lc-btn-cam ${camOff?"lc-btn-on":""}`} onClick={toggleCam}>
              <div className="lc-call-btn-icon">{camOff?"📵":"📹"}</div>
              <span className="lc-call-btn-label">{camOff?"Cam On":"Cam Off"}</span>
            </button>
          )}
          <button className="lc-call-btn lc-btn-end" onClick={endCall}>
            <div className="lc-call-btn-icon">📵</div>
            <span className="lc-call-btn-label">End</span>
          </button>
          {!isVideo && (
            <button className={`lc-call-btn lc-btn-spk ${spk?"lc-btn-on":""}`} onClick={()=>setSpk(v=>!v)}>
              <div className="lc-call-btn-icon">{spk?"🔊":"🔈"}</div>
              <span className="lc-call-btn-label">Speaker</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN CHAT ══ */
export default function LoveChat({ user }) {
  const [msgs,       setMsgs]       = useState([]);
  const [input,      setInput]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [online,     setOnline]     = useState(true);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [editingId,  setEditingId]  = useState(null);
  const [editText,   setEditText]   = useState("");
  const [menuId,     setMenuId]     = useState(null);
  const [reactId,    setReactId]    = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [typing,     setTyping]     = useState(false);
  const [callMode,   setCallMode]   = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [incoming,   setIncoming]   = useState(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const fileRef     = useRef(null);
  const allIds      = useRef(new Set());
  const typingTimer = useRef(null);
  const inSince     = useRef(new Date().toISOString());

  injectStyles();

  const isSurya    = user === "surya";
  const isDemo     = user === "demo";
  const senderName = isSurya ? "Surya 💚" : isDemo ? "Demo 👀" : "Sadhana 💗";
  const otherName  = isSurya ? "Sadhana 💗" : "Surya 💚";
  const myColor    = isSurya ? "#00d97e" : "#ff1a6e";
  const callRoom   = "lc_call_dharya";

  const merge = useCallback((prev, incoming) => {
    const result = [...prev];
    for (const m of incoming) {
      const key = String(m._id);
      if (!allIds.current.has(key)) { allIds.current.add(key); result.push(m); }
      else { const i = result.findIndex(r=>String(r._id)===key); if(i!==-1) result[i]=m; }
    }
    return result.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  }, []);

  /* initial load */
  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        if (Array.isArray(data)) { allIds.current = new Set(data.map(m=>String(m._id))); setMsgs(data.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))); }
        setOnline(true);
      } catch {
        setOnline(false);
        const w = { _id:"offline_w", text:`Hey ${isSurya?"Surya 🌿":"Sadhana 💙"} (Offline mode)`, sender:isSurya?"sadhana":"surya", senderName:otherName, createdAt:new Date().toISOString(), read:true, edited:false, deleted:false };
        allIds.current.add("offline_w"); setMsgs([w]);
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  /* poll messages */
  const poll = useCallback(async () => {
    if (isDemo) return;
    try {
      const res = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
      const data = await res.json();
      if (Array.isArray(data)) { setMsgs(prev=>merge(prev,data)); setOnline(true); }
    } catch { setOnline(false); }
  }, [isDemo, merge]);
  useEffect(() => { const id=setInterval(poll,POLL_MS); return()=>clearInterval(id); }, [poll]);

  /* poll incoming calls */
  useEffect(() => {
    if (isDemo || callActive) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/signal?room=${callRoom}&since=${inSince.current}`);
        const items = await res.json();
        for (const s of (items||[])) {
          inSince.current = s.createdAt;
          if (s.from !== user && s.type === "incoming_call") { setIncoming({ from:s.from, mode:s.data?.mode||"voice" }); setTimeout(()=>setIncoming(null),28000); }
          if (s.from !== user && s.type === "call_end" && callActive) { setCallActive(false); setCallMode(null); }
        }
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [user, callActive, callRoom, isDemo]);

  /* scroll to bottom */
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  /* typing indicator — fake for demo */
  const handleInput = (val) => {
    setInput(val);
    if (!online || isDemo) return;
    clearTimeout(typingTimer.current);
    setTyping(false);
    typingTimer.current = setTimeout(()=>setTyping(false), 2000);
  };

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size>2*1024*1024){alert("Max 2MB");return;}
    const r=new FileReader(); r.onload=ev=>setImgPreview(ev.target.result); r.readAsDataURL(f);
  };

  const startCall = useCallback(async (mode) => {
    if (isDemo) { alert("Call feature not available in demo mode."); return; }
    setCallMode(mode); setCallActive(true);
    try { await fetch("/api/signal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({room:callRoom,from:user,type:"incoming_call",data:{mode}})}); } catch {}
  }, [user,callRoom,isDemo]);

  const acceptCall = () => { if (!incoming) return; setIncoming(null); setCallMode(incoming.mode); setCallActive(true); };
  const declineCall = () => {
    if (!incoming) return;
    fetch("/api/signal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({room:callRoom,from:user,type:"call_end",data:{}})}).catch(()=>{});
    setIncoming(null);
  };

  const send = async (text) => {
    const txt=(text||input).trim();
    if (!txt&&!imgPreview) return;
    if (sending) return;
    setInput(""); setSending(true); setShowEmoji(false);
    const img=imgPreview||null; setImgPreview(null);
    if (fileRef.current) fileRef.current.value="";
    const tempId="tmp_"+Date.now();
    const tempMsg={_id:tempId,text:txt,image:img,sender:user,senderName,createdAt:new Date().toISOString(),read:false,pending:true,edited:false,deleted:false,reactions:{}};
    setMsgs(prev=>[...prev,tempMsg]);

    if (!online||isDemo) {
      setTimeout(()=>{
        const ai={_id:"ai_"+Date.now(),text:aiReply(txt),image:null,sender:isSurya?"sadhana":"surya",senderName:otherName,createdAt:new Date().toISOString(),read:true,pending:false,edited:false,deleted:false,reactions:{}};
        setMsgs(prev=>[...prev.map(m=>m._id===tempId?{...m,pending:false}:m),ai]);
        setSending(false);
      },900+Math.random()*700);
      return;
    }
    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:txt,sender:user,senderName,image:img})});
      if(!res.ok){setError("Send failed");setMsgs(prev=>prev.filter(m=>m._id!==tempId));setSending(false);return;}
      const data=await res.json(); const msg=data?.msg;
      if(msg){allIds.current.add(String(msg._id));setMsgs(prev=>[...prev.filter(m=>m._id!==tempId),{...msg,pending:false}].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)));}
      else{setMsgs(prev=>prev.filter(m=>m._id!==tempId));await poll();}
      setError("");
    } catch(e){setError(e.message);setMsgs(prev=>prev.filter(m=>m._id!==tempId));}
    setSending(false); inputRef.current?.focus();
  };

  const submitEdit = async () => {
    if(!editText.trim()||!editingId) return;
    try{await fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editingId,text:editText})});
    setMsgs(prev=>prev.map(m=>String(m._id)===editingId?{...m,text:editText.trim(),edited:true}:m));}catch{}
    setEditingId(null);setEditText("");
  };
  const deleteMsg = async id => {
    try{await fetch(`/api/chat?id=${id}`,{method:"DELETE"});setMsgs(prev=>prev.map(m=>String(m._id)===id?{...m,deleted:true,text:"",image:null}:m));}catch{}
    setMenuId(null);
  };
  const addReaction = (id, emoji) => {
    setMsgs(prev=>prev.map(m=>{
      if (String(m._id)!==id) return m;
      const r={...(m.reactions||{})};
      r[emoji]=(r[emoji]||0)+1; return {...m,reactions:r};
    }));
    setReactId(null);
  };

  const grouped = msgs.reduce((acc,m)=>{ const l=fmtDate(m.createdAt); if(!acc[l])acc[l]=[]; acc[l].push(m); return acc; },{});
  const quick = QUICK[user]||QUICK.sadhana;

  return (
    <div className="lc-page" onClick={()=>{setMenuId(null);setReactId(null);setShowEmoji(false);}}>

      {/* Active call overlay */}
      {callActive && callMode && (
        <CallScreen user={user} otherName={otherName} mode={callMode} onEnd={()=>{setCallActive(false);setCallMode(null);}} />
      )}

      {/* Incoming call */}
      {incoming && !callActive && (
        <div className="lc-incoming">
          <div className="lc-incoming-top"/>
          <div className="lc-incoming-body">
            <div className="lc-incoming-av">{isSurya?"💗":"💚"}</div>
            <div className="lc-incoming-info">
              <div className="lc-incoming-label">{incoming.mode==="video"?"📹 Video Call":"📞 Voice Call"}</div>
              <div className="lc-incoming-name">{otherName}</div>
            </div>
            <div className="lc-incoming-btns">
              <button className="lc-btn-accept" onClick={acceptCall}>📞</button>
              <button className="lc-btn-decline" onClick={declineCall}>📵</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="lc-header">
        <div className="lc-avatar-wrap">
          <div className={`lc-avatar ${isSurya?"sadhana-av":"surya-av"}`}>{isSurya?"💗":"💚"}</div>
          <div className="lc-online-ring"/>
        </div>
        <div className="lc-header-info">
          <span className="lc-name">{otherName}</span>
          <span className="lc-status">
            {online?<><span className="lc-dot"/>online</>:<>connecting...</>}
          </span>
        </div>
        <button className="lc-hdr-btn voice" title="Voice call" onClick={()=>startCall("voice")}>📞</button>
        <button className="lc-hdr-btn video" title="Video call" onClick={()=>startCall("video")}>📹</button>
      </div>

      {/* ── Messages ── */}
      <div className="lc-msgs">
        <div className="lc-bg"/>
        {error && <div className="lc-error">⚠️ {error}</div>}
        {loading && <div className="lc-empty"><div className="lc-empty-icon">💌</div><p className="lc-empty-title">Loading chat…</p></div>}
        {!loading && msgs.length===0 && (
          <div className="lc-empty">
            <div className="lc-empty-icon">💌</div>
            <p className="lc-empty-title">No messages yet</p>
            <p className="lc-empty-sub">Say something to {otherName} 💕</p>
          </div>
        )}
        {!loading && Object.entries(grouped).map(([date,ms])=>(
          <div key={date}>
            <div className="lc-date-chip"><span>{date}</span></div>
            {ms.map((m,i)=>{
              const isMine=m.sender===user;
              const key=String(m._id)+i;
              return (
                <div key={key} className={`lc-row ${isMine?"mine":"theirs"}`} style={{position:"relative"}}>
                  <div
                    className={`lc-bubble ${isMine?"mine":"theirs"} ${isMine&&isSurya?"surya-bubble":""} ${m.pending?"pending":""}`}
                    onContextMenu={e=>{e.preventDefault();if(isMine&&!m.pending){setMenuId(String(m._id));setReactId(null);}else{setReactId(String(m._id));setMenuId(null);}}}
                    onDoubleClick={()=>setReactId(r=>r===String(m._id)?null:String(m._id))}
                    onClick={e=>{if(menuId===String(m._id)||reactId===String(m._id))e.stopPropagation();}}
                  >
                    {!isMine && <span className="lc-sender">{m.senderName}</span>}
                    {m.deleted ? (
                      <p className="lc-deleted">🚫 Message deleted</p>
                    ) : editingId===String(m._id) ? (
                      <div className="lc-edit-wrap" onClick={e=>e.stopPropagation()}>
                        <input className="lc-edit-input" value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitEdit()} autoFocus/>
                        <div className="lc-edit-btns">
                          <button onClick={submitEdit}>✓ Save</button>
                          <button onClick={()=>{setEditingId(null);setEditText("");}}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {m.image && <img src={m.image} alt="sent" className="lc-img" onClick={e=>{e.stopPropagation();window.open(m.image);}}/>}
                        {m.text && <p className="lc-text">{m.text}</p>}
                      </>
                    )}
                    {/* Reactions display */}
                    {m.reactions && Object.keys(m.reactions).length>0 && (
                      <div className="lc-reactions">
                        {Object.entries(m.reactions).map(([e,c])=>(
                          <span key={e} className="lc-react-chip">{e}{c>1&&<span style={{fontSize:"0.7rem",opacity:0.7}}>{c}</span>}</span>
                        ))}
                      </div>
                    )}
                    <div className="lc-meta">
                      <span className="lc-time">{fmtTime(m.createdAt)}</span>
                      {m.edited&&!m.deleted&&<span className="lc-edited">edited</span>}
                      {isMine&&<span className="lc-ticks">{m.pending?"🕐":m.read?"✅":"✔✔"}</span>}
                    </div>

                    {/* Reaction picker */}
                    {reactId===String(m._id) && (
                      <div className="lc-react-picker" onClick={e=>e.stopPropagation()}>
                        {REACTIONS.map(e=><span key={e} onClick={()=>addReaction(String(m._id),e)}>{e}</span>)}
                      </div>
                    )}

                    {/* Context menu */}
                    {menuId===String(m._id) && isMine && !m.deleted && (
                      <div className="lc-menu" onClick={e=>e.stopPropagation()}>
                        {!m.image&&<button onClick={()=>{setEditingId(String(m._id));setEditText(m.text);setMenuId(null);}}>✏️ Edit</button>}
                        <button onClick={()=>setReactId(r=>r===String(m._id)?null:String(m._id))}>😊 React</button>
                        <button className="del" onClick={()=>deleteMsg(String(m._id))}>🗑️ Delete</button>
                        <button onClick={()=>setMenuId(null)}>✕ Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="lc-row theirs">
            <div className="lc-bubble theirs" style={{padding:"10px 14px"}}>
              <div className="lc-typing"><div className="lc-typing-dot"/><div className="lc-typing-dot"/><div className="lc-typing-dot"/></div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Image preview bar */}
      {imgPreview && (
        <div className="lc-img-bar">
          <img src={imgPreview} alt="preview"/>
          <span style={{flex:1,fontFamily:"'Inter',sans-serif",fontSize:"0.78rem",color:"rgba(255,255,255,0.45)"}}>Ready to send</span>
          <button onClick={()=>{setImgPreview(null);if(fileRef.current)fileRef.current.value="";}}>✕</button>
        </div>
      )}

      {/* Quick replies */}
      <div className="lc-quick">
        {quick.map(q=><button key={q} className="lc-quick-btn" onClick={()=>send(q)}>{q}</button>)}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="lc-emoji-picker" onClick={e=>e.stopPropagation()}>
          {EMOJIS.map(e=><button key={e} className="lc-emoji-btn" onClick={()=>setInput(v=>v+e)}>{e}</button>)}
        </div>
      )}

      {/* Input bar */}
      <div className="lc-input-bar">
        <button className="lc-icon-btn" onClick={e=>{e.stopPropagation();setShowEmoji(v=>!v);}}>😊</button>
        <label className="lc-icon-btn" title="Send photo" style={{cursor:"pointer"}}>
          📷<input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
        </label>
        <textarea
          ref={inputRef}
          className="lc-input"
          rows={1}
          placeholder={imgPreview?"Add a caption…":`Message ${otherName}…`}
          value={input}
          onChange={e=>{handleInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,96)+"px";}}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
          style={{height:"auto"}}
        />
        <button
          className={`lc-send-btn ${isSurya?"surya-send":""}`}
          onClick={()=>send()}
          disabled={(!input.trim()&&!imgPreview)||sending}
          style={{"--mc":myColor}}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
