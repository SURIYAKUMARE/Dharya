import { useState, useEffect, useRef, useCallback } from "react";

const POLL_MS = 2000;
/* ── ICE servers ── */
const ICE = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  { urls: "stun:stun.relay.metered.ca:80" },
  { urls: "turn:global.relay.metered.ca:80",             username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:global.relay.metered.ca:443",            username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
];

/* ─── AI ─── */
const AI_REPLIES = [
  { t:["hi","hello","hey","hii"], r:["Hi fruad 💙","Hey you 🥰","Hi! You made my day 🌸"] },
  { t:["love","luv"], r:["I love you more 💙","Love you endlessly 💍","My heart 💓"] },
  { t:["miss"], r:["Miss you every second 🌙","Always in my heart 💙","Missing you too 🌸"] },
  { t:["how are"], r:["Better now that you're here 🥰","Always good when I hear from you 💙"] },
  { t:["sad","tired","cry"], r:["Come here 🫂","You don't carry it alone 💙","Right here 🌸"] },
  { t:["night","sleep","bye"], r:["Good night 🌙","Dream beautiful dreams 💙","Night fruad 🌸"] },
  { t:["morning"], r:["Good morning ☀️","Morning! 💙","You woke up — world is better 🌸"] },
];
const FALLBACKS = ["I love you endlessly 💙","Right here 🌸","You could say anything 💖","Always love 💍","Talking to you makes everything better 💙"];
function aiReply(t) {
  const l = t.toLowerCase();
  for (const r of AI_REPLIES) if (r.t.some(x=>l.includes(x))) return r.r[Math.floor(Math.random()*r.r.length)];
  return FALLBACKS[Math.floor(Math.random()*FALLBACKS.length)];
}

const QUICK = {
  surya:   ["Hi Sadhana 💙","I love you 💖","Missing you 🥺","Good morning ☀️","Good night 🌙","Thinking of you 💭"],
  sadhana: ["Hi Surya 💗","I love you too 💖","Miss you 🥺","Good morning ☀️","Good night 🌙","💗"],
  demo:    ["Hi! 💙","This is demo 👀","Nice app! 😊"],
};
const EMOJIS = ["❤️","😂","😍","😊","🥰","😘","🤗","😢","😮","🔥","💯","👍","👎","🙏","💪","🎉","🌸","✨","💫","💙","💗","💖","💍","🌙","☀️","💌","🎵","🫂","🌹","💐","😂","🤣","😅","😭","😤","😡","🥺","😳","🤩","🎊"];
const REACTIONS = ["❤️","😂","😮","😢","😍","👍","🙏"];

function fmtTime(d) { return new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); }
function fmtDate(d) {
  const dt=new Date(d),today=new Date(),yest=new Date();
  today.setHours(0,0,0,0); yest.setHours(0,0,0,0); yest.setDate(yest.getDate()-1);
  if(dt>=today) return "Today"; if(dt>=yest) return "Yesterday";
  return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function fmtTimer(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }

/* ── formatText: WhatsApp-style text formatting ── */
function formatText(text) {
  if (!text) return text;
  const parts = [];
  // regex: bold *x*, italic _x_, strike ~x~, code `x`
  const re = /(\*[^*]+\*|_[^_]+_|~[^~]+~|`[^`]+`)/g;
  let last = 0, m, idx = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const raw = m[0];
    const inner = raw.slice(1, -1);
    if (raw[0] === '*') parts.push(<strong key={idx++} className="wa2-bold">{inner}</strong>);
    else if (raw[0] === '_') parts.push(<em key={idx++} className="wa2-italic">{inner}</em>);
    else if (raw[0] === '~') parts.push(<span key={idx++} className="wa2-strike">{inner}</span>);
    else if (raw[0] === '`') parts.push(<code key={idx++} className="wa2-code">{inner}</code>);
    last = m.index + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

/* ── highlight search terms in text ── */
function highlightText(text, q) {
  if (!q || !text) return formatText(text);
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  const raw = String(text).split(re);
  return raw.map((part, i) =>
    re.test(part)
      ? <mark key={i} className="wa2-highlight">{part}</mark>
      : part
  );
}

/* ── SVG icon helpers ── */
const Ico = {
  phone: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>`,
  phoneOff: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.9 4.1L4.7 1.3c.4-.4 1-.4 1.4 0L9.3 4.5c.4.4.4 1 0 1.4l-2 2c1.2 2.3 3 4.1 5.3 5.3l2-2c.4-.4 1-.4 1.4 0l3.2 3.2c.4.4.4 1 0 1.4l-2.8 2.8c-.4.4-1 .5-1.4.1C8.1 15.9 4 9.5 1.8 5.5c-.4-.4-.3-1 .1-1.4zM20.71 3.29l-1.42 1.42L21 6.41V10h2V6a2 2 0 00-.59-1.41l-1.7-1.3z"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/></svg>`,
  videoOff: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>`,
  micOff: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>`,
  speaker: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  speakerOff: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  flip: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm3.2-5H13v2.2l-3.2-3.2 3.2-3.2V11h2.2l3.2 3.2-3.2 3.2z"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
  smile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  attach: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>`,
};

const I = (key, size = 22, style = {}) => (
  <span style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style }}
    dangerouslySetInnerHTML={{ __html: Ico[key].replace('<svg', `<svg width="${size}" height="${size}"`) }}
  />
);

/* ══════════════════════════════════════════
   WHATSAPP-STYLE CSS
══════════════════════════════════════════ */
const WA_CSS = `
.wa2 {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border-radius: 16px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  background: #0b141a;
}
.wa2-hdr { display:flex; align-items:center; gap:10px; padding:10px 14px 10px 12px; background:#1f2c34; border-bottom:1px solid #2a3942; flex-shrink:0; z-index:20; }
.wa2-av { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0; }
.wa2-av.pink { background:linear-gradient(135deg,#ff1a6e,#8b3fc8); box-shadow:0 0 0 2px rgba(255,26,110,0.35); }
.wa2-av.green { background:linear-gradient(135deg,#00d97e,#059669); box-shadow:0 0 0 2px rgba(0,217,126,0.35); }
.wa2-hdr-info { flex:1; min-width:0; cursor:pointer; }
.wa2-hdr-name { font-size:0.97rem; font-weight:600; color:#e9edef; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wa2-hdr-status { font-size:0.72rem; color:#8696a0; margin-top:1px; }
.wa2-hdr-btn { width:36px; height:36px; border-radius:50%; border:none; background:transparent; color:#aebac1; font-size:1.15rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.18s; flex-shrink:0; }
.wa2-hdr-btn:hover { background:rgba(255,255,255,0.08); }
.wa2-hdr-btn.call { color:#00a884; }
.wa2-hdr-btn.video { color:#00a884; }
.wa2-bg { position:absolute; inset:0; background:#0b141a; z-index:0; }
.wa2-bg::before { content:''; position:absolute; inset:0; opacity:0.06; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ctext y='50' font-size='32' opacity='0.5'%3E💙%3C/text%3E%3C/svg%3E"); background-size:100px 100px; }
.wa2-msgs { flex:1; min-height:0; overflow-y:auto; padding:12px 10px 8px; display:flex; flex-direction:column; gap:2px; position:relative; z-index:1; scroll-behavior:smooth; }
.wa2-msgs::-webkit-scrollbar { width:4px; }
.wa2-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:2px; }
.wa2-date { display:flex; justify-content:center; margin:10px 0 6px; }
.wa2-date span { font-size:0.7rem; color:#8696a0; background:#1d282f; padding:4px 14px; border-radius:8px; border:1px solid #2a3942; }
.wa2-row { display:flex; padding:0 6px; }
.wa2-row.out { justify-content:flex-end; }
.wa2-row.in  { justify-content:flex-start; }
.wa2-row + .wa2-row.out { margin-top:1px; }
.wa2-row + .wa2-row.in  { margin-top:1px; }
.wa2-bub { max-width:68%; padding:6px 10px 4px; border-radius:8px; position:relative; word-break:break-word; animation:waBubIn 0.15s ease-out; }
@keyframes waBubIn { from{transform:scale(0.95);opacity:0} to{transform:scale(1);opacity:1} }
.wa2-bub.out { background:#005c4b; border-radius:8px 8px 2px 8px; box-shadow:0 1px 2px rgba(0,0,0,0.35); color:#e9edef; }
.wa2-bub.in  { background:#202c33; border-radius:8px 8px 8px 2px; box-shadow:0 1px 2px rgba(0,0,0,0.35); color:#e9edef; }
.wa2-bub.out.surya-bub { background:#003d30; }
.wa2-bub.pending { opacity:0.7; }
.wa2-bub.out::after { content:''; position:absolute; bottom:0; right:-8px; border:8px solid transparent; border-bottom-color:#005c4b; border-right:0; border-bottom-left-radius:2px; }
.wa2-bub.out.surya-bub::after { border-bottom-color:#003d30; }
.wa2-bub.in::after  { content:''; position:absolute; bottom:0; left:-8px; border:8px solid transparent; border-bottom-color:#202c33; border-left:0; border-bottom-right-radius:2px; }
.wa2-sender { font-size:0.72rem; font-weight:700; color:#53bdeb; display:block; margin-bottom:3px; }
.wa2-text { font-size:0.9rem; line-height:1.5; margin:0; white-space:pre-wrap; }
.wa2-deleted { font-size:0.86rem; color:#8696a0; font-style:italic; margin:0; display:flex; align-items:center; gap:5px; }
.wa2-img { max-width:100%; border-radius:6px; display:block; margin-bottom:4px; cursor:pointer; max-height:280px; object-fit:cover; }
.wa2-doc { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.07); border-radius:6px; padding:8px 10px; margin-bottom:4px; cursor:pointer; }
.wa2-doc-icon { font-size:1.4rem; }
.wa2-doc-name { font-size:0.82rem; color:#e9edef; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wa2-meta { display:flex; align-items:center; justify-content:flex-end; gap:4px; margin-top:2px; float:right; margin-left:8px; }
.wa2-time { font-size:0.65rem; color:#8696a0; }
.wa2-ticks { font-size:0.72rem; }
.wa2-tick-sent { color:#8696a0; }
.wa2-tick-read { color:#53bdeb; }
.wa2-edited { font-size:0.6rem; color:#8696a0; font-style:italic; }
.wa2-reply-quote { background:rgba(255,255,255,0.07); border-left:3px solid #00a884; border-radius:4px; padding:5px 8px; margin-bottom:5px; cursor:pointer; }
.wa2-reply-author { font-size:0.68rem; font-weight:700; color:#00a884; margin-bottom:2px; }
.wa2-reply-preview { font-size:0.78rem; color:#8696a0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wa2-reacts { display:flex; flex-wrap:wrap; gap:2px; margin-top:3px; }
.wa2-react { font-size:0.9rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:50px; padding:2px 6px; cursor:pointer; display:flex; align-items:center; gap:3px; transition:transform 0.15s; }
.wa2-react:hover { transform:scale(1.15); }
.wa2-react-count { font-size:0.68rem; color:#8696a0; }
.wa2-react-picker { position:absolute; background:#233138; border:1px solid #2a3942; border-radius:50px; padding:6px 12px; z-index:100; display:flex; gap:8px; box-shadow:0 4px 20px rgba(0,0,0,0.6); animation:waBubIn 0.15s ease-out; }
.wa2-row.out .wa2-react-picker { bottom:calc(100% + 6px); right:0; }
.wa2-row.in  .wa2-react-picker { bottom:calc(100% + 6px); left:0; }
.wa2-react-picker span { font-size:1.4rem; cursor:pointer; transition:transform 0.15s; }
.wa2-react-picker span:hover { transform:scale(1.3); }
.wa2-menu { position:absolute; background:#233138; border:1px solid #2a3942; border-radius:10px; padding:4px; z-index:100; min-width:160px; box-shadow:0 6px 24px rgba(0,0,0,0.6); animation:waBubIn 0.15s ease-out; }
.wa2-row.out .wa2-menu { right:0; bottom:calc(100%+4px); }
.wa2-row.in  .wa2-menu { left:0; bottom:calc(100%+4px); }
.wa2-menu-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:7px; cursor:pointer; font-size:0.85rem; color:#e9edef; transition:background 0.15s; }
.wa2-menu-item:hover { background:rgba(255,255,255,0.08); }
.wa2-menu-item.red { color:#ef4444; }
.wa2-menu-sep { height:1px; background:#2a3942; margin:3px 0; }
.wa2-edit-wrap { display:flex; flex-direction:column; gap:5px; }
.wa2-edit-inp { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:6px 10px; color:#e9edef; font-family:'Inter',sans-serif; font-size:0.88rem; outline:none; width:100%; box-sizing:border-box; }
.wa2-edit-row { display:flex; gap:6px; }
.wa2-edit-row button { padding:5px 12px; border-radius:6px; border:none; cursor:pointer; font-size:0.78rem; font-weight:600; }
.wa2-edit-row button:first-child { background:#00a884; color:#fff; }
.wa2-edit-row button:last-child  { background:rgba(255,255,255,0.1); color:#8696a0; }
.wa2-reply-bar { flex-shrink:0; display:flex; align-items:center; gap:10px; padding:8px 12px; background:#1f2c34; border-top:1px solid #2a3942; z-index:10; }
.wa2-reply-bar-content { flex:1; border-left:3px solid #00a884; padding:4px 8px; background:rgba(255,255,255,0.05); border-radius:4px; }
.wa2-reply-bar-name { font-size:0.7rem; font-weight:700; color:#00a884; }
.wa2-reply-bar-text { font-size:0.78rem; color:#8696a0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wa2-reply-close { color:#8696a0; cursor:pointer; font-size:1.1rem; }
.wa2-typing-bub { background:#202c33; border-radius:8px 8px 8px 2px; padding:8px 12px; display:inline-flex; gap:4px; align-items:center; margin-left:6px; }
.wa2-typ-dot { width:6px; height:6px; border-radius:50%; background:#8696a0; animation:waTyp 1.2s ease-in-out infinite; }
.wa2-typ-dot:nth-child(2){animation-delay:0.2s} .wa2-typ-dot:nth-child(3){animation-delay:0.4s}
@keyframes waTyp { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }
.wa2-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:40px; text-align:center; color:#8696a0; }
.wa2-empty-lock { font-size:2rem; background:rgba(0,168,132,0.12); border:1px solid rgba(0,168,132,0.25); border-radius:50%; width:56px; height:56px; display:flex; align-items:center; justify-content:center; }
.wa2-img-pre { flex-shrink:0; display:flex; align-items:center; gap:10px; padding:8px 12px; background:#1f2c34; border-top:1px solid #2a3942; z-index:10; }
.wa2-img-pre img { height:52px; width:52px; border-radius:6px; object-fit:cover; }
.wa2-img-pre-x { color:#8696a0; cursor:pointer; font-size:1.1rem; margin-left:auto; }
.wa2-attach-menu { position:absolute; bottom:70px; left:12px; background:#233138; border:1px solid #2a3942; border-radius:14px; padding:8px; z-index:50; display:flex; flex-direction:column; gap:2px; box-shadow:0 6px 24px rgba(0,0,0,0.6); animation:waBubIn 0.18s ease-out; min-width:160px; }
.wa2-attach-item { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; cursor:pointer; color:#e9edef; font-size:0.85rem; transition:background 0.15s; }
.wa2-attach-item:hover { background:rgba(255,255,255,0.08); }
.wa2-attach-item .icon { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
.wa2-quick { flex-shrink:0; display:flex; gap:6px; overflow-x:auto; padding:5px 10px; background:#1f2c34; border-top:1px solid #2a3942; z-index:10; }
.wa2-quick::-webkit-scrollbar { display:none; }
.wa2-quick-btn { flex-shrink:0; padding:5px 13px; border-radius:50px; font-size:0.75rem; cursor:pointer; white-space:nowrap; transition:all 0.18s; background:rgba(0,168,132,0.1); border:1px solid rgba(0,168,132,0.25); color:#00a884; }
.wa2-quick-btn:hover { background:rgba(0,168,132,0.2); }
.wa2-emoji-wrap { flex-shrink:0; background:#1f2c34; border-top:1px solid #2a3942; z-index:10; }
.wa2-emoji-search { padding:8px 12px; }
.wa2-emoji-search input { width:100%; background:rgba(255,255,255,0.07); border:1px solid #2a3942; border-radius:8px; padding:7px 12px; color:#e9edef; font-size:0.85rem; outline:none; box-sizing:border-box; }
.wa2-emoji-search input::placeholder { color:#8696a0; }
.wa2-emoji-grid { display:flex; flex-wrap:wrap; gap:2px; padding:0 10px 10px; max-height:140px; overflow-y:auto; }
.wa2-emoji-grid::-webkit-scrollbar { width:2px; }
.wa2-emoji-btn { font-size:1.45rem; background:none; border:none; cursor:pointer; padding:4px; border-radius:8px; transition:transform 0.15s; }
.wa2-emoji-btn:hover { transform:scale(1.3); background:rgba(255,255,255,0.08); }
.wa2-bar { flex-shrink:0; display:flex; align-items:flex-end; gap:8px; padding:8px 10px; background:#1f2c34; border-top:1px solid #2a3942; z-index:10; }
.wa2-bar-btn { width:40px; height:40px; border-radius:50%; border:none; background:transparent; color:#8696a0; font-size:1.25rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color 0.18s; flex-shrink:0; }
.wa2-bar-btn:hover { color:#00a884; }
.wa2-bar-btn.active { color:#00a884; }
.wa2-inp { flex:1; background:#2a3942; border:none; border-radius:22px; padding:9px 16px; color:#e9edef; font-family:'Inter',sans-serif; font-size:0.92rem; outline:none; resize:none; max-height:100px; line-height:1.5; }
.wa2-inp::placeholder { color:#8696a0; }
.wa2-send { width:44px; height:44px; border-radius:50%; border:none; background:#00a884; color:#fff; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,168,132,0.4); }
.wa2-send:hover:not(:disabled) { background:#02b396; transform:scale(1.07); }
.wa2-send:disabled { opacity:0.4; cursor:default; transform:none; }
.wa2-scroll-btn { position:absolute; bottom:10px; right:10px; width:36px; height:36px; border-radius:50%; background:#233138; border:1px solid #2a3942; color:#8696a0; font-size:0.9rem; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:15; box-shadow:0 2px 8px rgba(0,0,0,0.4); transition:all 0.18s; }
.wa2-scroll-btn:hover { background:#2a3942; color:#e9edef; }
.wa2-unread-badge { position:absolute; top:-5px; right:-3px; background:#00a884; color:#fff; font-size:0.62rem; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; }
@keyframes waStarPop { 0%{background:rgba(0,168,132,0.3)} 100%{background:transparent} }
.wa2-bub.starred { animation:waStarPop 1.5s ease; }
.wa2-highlight { background:rgba(255,214,0,0.35); border-radius:3px; }
/* pinned bar */
.wa2-pinned-bar { display:flex; align-items:center; gap:10px; padding:8px 14px; background:#1d282f; border-bottom:1px solid #2a3942; cursor:pointer; flex-shrink:0; z-index:10; }
.wa2-pinned-icon { color:#00a884; font-size:0.85rem; }
.wa2-pinned-text { flex:1; font-size:0.78rem; color:#8696a0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wa2-pinned-count { font-size:0.68rem; color:#00a884; background:rgba(0,168,132,0.12); border:1px solid rgba(0,168,132,0.25); border-radius:50px; padding:2px 8px; }
/* search bar */
.wa2-search-bar { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#1f2c34; border-bottom:1px solid #2a3942; flex-shrink:0; z-index:10; }
.wa2-search-inp { flex:1; background:rgba(255,255,255,0.07); border:1px solid #2a3942; border-radius:8px; padding:7px 12px; color:#e9edef; font-size:0.85rem; outline:none; }
.wa2-search-count { font-size:0.72rem; color:#8696a0; white-space:nowrap; }
.wa2-search-nav { display:flex; gap:4px; }
.wa2-search-nav button { background:none; border:none; color:#8696a0; cursor:pointer; font-size:0.9rem; padding:4px; border-radius:6px; transition:color 0.15s; }
.wa2-search-nav button:hover { color:#e9edef; }
/* disappear chip */
.wa2-system-chip { display:flex; justify-content:center; margin:8px 0; }
.wa2-system-chip span { font-size:0.7rem; color:#8696a0; background:#1d282f; padding:4px 14px; border-radius:8px; border:1px solid #2a3942; }
/* recording UI */
.wa2-recording { display:flex; align-items:center; gap:10px; padding:8px 14px; background:#1f2c34; border-top:1px solid #2a3942; flex-shrink:0; z-index:10; }
.wa2-rec-dot { width:10px; height:10px; border-radius:50%; background:#ef4444; animation:waRecPulse 1s ease-in-out infinite; }
@keyframes waRecPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
.wa2-rec-timer { font-size:0.9rem; color:#e9edef; font-variant-numeric:tabular-nums; flex:1; }
.wa2-rec-btn { padding:6px 14px; border:none; border-radius:8px; cursor:pointer; font-size:0.82rem; font-weight:600; }
.wa2-rec-cancel { background:rgba(239,68,68,0.15); color:#ef4444; }
.wa2-rec-send { background:#00a884; color:#fff; }
/* audio bubble */
.wa2-audio { width:100%; max-width:220px; height:32px; border-radius:16px; accent-color:#00a884; }
/* view once overlay */
.wa2-view-once { position:relative; cursor:pointer; }
.wa2-view-once-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.55); border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; color:#fff; font-size:0.78rem; }
.wa2-view-once-icon { font-size:1.6rem; }
/* info panel */
.wa2-info-panel { position:absolute; top:0; right:-300px; bottom:0; width:280px; background:#111b21; border-left:1px solid #2a3942; z-index:50; transition:right 0.28s ease; overflow-y:auto; display:flex; flex-direction:column; }
.wa2-info-panel.open { right:0; }
.wa2-info-header { padding:16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid #2a3942; }
.wa2-info-close { background:none; border:none; color:#8696a0; cursor:pointer; font-size:1.1rem; }
.wa2-info-body { padding:16px; display:flex; flex-direction:column; gap:16px; }
.wa2-info-av { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 8px; }
.wa2-info-name { text-align:center; font-size:1.05rem; font-weight:600; color:#e9edef; }
.wa2-info-badge { display:flex; align-items:center; gap:8px; background:rgba(0,168,132,0.08); border:1px solid rgba(0,168,132,0.2); border-radius:10px; padding:10px 14px; color:#8696a0; font-size:0.78rem; }
.wa2-info-badge .lock { color:#00a884; font-size:1rem; }
.wa2-info-opt { display:flex; align-items:center; gap:12px; padding:12px 4px; border-bottom:1px solid #1f2c34; cursor:pointer; color:#e9edef; font-size:0.88rem; transition:color 0.15s; }
.wa2-info-opt:hover { color:#00a884; }
.wa2-info-opt.red { color:#ef4444; }
/* format */
.wa2-bold { font-weight:700; }
.wa2-italic { font-style:italic; }
.wa2-strike { text-decoration:line-through; }
.wa2-code { font-family:monospace; background:rgba(255,255,255,0.1); padding:1px 5px; border-radius:4px; font-size:0.85em; }
/* disappear badge */
.wa2-disappear-badge { font-size:0.6rem; color:#00a884; background:rgba(0,168,132,0.12); border:1px solid rgba(0,168,132,0.2); border-radius:50px; padding:2px 7px; margin-left:4px; }
`;

/* ══ CALL CSS ══ */
const CALL_CSS = `
.wac { position:fixed; inset:0; z-index:9990; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:60px 0 40px; }
.wac-bg { position:absolute; inset:0; background:linear-gradient(180deg,#1a2e2a 0%,#0d1f1a 50%,#080d0b 100%); }
.wac-blur { position:absolute; inset:0; backdrop-filter:blur(40px); }
.wac-ripple-wrap { position:absolute; top:38%; left:50%; transform:translate(-50%,-50%); }
.wac-ripple { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); border-radius:50%; border:2px solid rgba(0,168,132,0.25); animation:wacRipple 2.5s ease-out infinite; }
.wac-ripple:nth-child(1){width:170px;height:170px;} .wac-ripple:nth-child(2){width:260px;height:260px;animation-delay:0.75s;} .wac-ripple:nth-child(3){width:360px;height:360px;animation-delay:1.5s;}
@keyframes wacRipple { 0%{transform:translate(-50%,-50%) scale(0.9);opacity:1} 100%{transform:translate(-50%,-50%) scale(1.1);opacity:0} }
.wac-top { display:flex; flex-direction:column; align-items:center; z-index:1; gap:0; }
.wac-av { width:110px; height:110px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:3.5rem; box-shadow:0 0 0 3px rgba(255,255,255,0.1),0 20px 60px rgba(0,0,0,0.5); animation:wacPulse 2.2s ease-in-out infinite; }
@keyframes wacPulse { 0%,100%{box-shadow:0 0 0 3px rgba(0,168,132,0.3),0 0 0 14px rgba(0,168,132,0.06),0 20px 60px rgba(0,0,0,0.5)} 50%{box-shadow:0 0 0 3px rgba(0,168,132,0.6),0 0 0 26px rgba(0,168,132,0.04),0 20px 60px rgba(0,0,0,0.5)} }
.wac-av.connected { animation:none; box-shadow:0 0 0 3px rgba(0,168,132,0.4),0 20px 50px rgba(0,0,0,0.5); }
.wac-name { font-family:'Cormorant Garamond',serif; font-size:2.2rem; font-weight:600; font-style:italic; color:#e9edef; margin:20px 0 8px; letter-spacing:-0.3px; }
.wac-status { font-size:0.85rem; color:#8696a0; display:flex; align-items:center; gap:6px; }
.wac-timer { font-size:1.3rem; font-weight:600; color:#e9edef; letter-spacing:3px; margin-top:4px; font-variant-numeric:tabular-nums; }
.wac-actions { z-index:1; width:100%; max-width:320px; }
.wac-btns { display:flex; justify-content:space-around; align-items:center; }
.wac-btn { display:flex; flex-direction:column; align-items:center; gap:8px; border:none; background:transparent; cursor:pointer; padding:0; }
.wac-btn-ic { width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.wac-btn-ic:hover { transform:scale(1.1); }
.wac-btn-lbl { font-size:0.65rem; color:#8696a0; font-weight:600; letter-spacing:0.3px; }
.wac-ic-mute { background:rgba(255,255,255,0.1); color:#e9edef; }
.wac-ic-spk  { background:rgba(255,255,255,0.1); color:#e9edef; }
.wac-ic-end  { background:#ef4444; color:#fff; width:66px; height:66px; font-size:1.5rem; box-shadow:0 6px 20px rgba(239,68,68,0.5); }
.wac-ic-add  { background:rgba(255,255,255,0.1); color:#e9edef; }
.wac-ic-on   { background:rgba(0,168,132,0.25); color:#00a884; }
.wavc { position:fixed; inset:0; z-index:9990; background:#000; display:flex; flex-direction:column; }
.wavc-remote { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; }
.wavc-no-vid { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#111; z-index:1; }
.wavc-no-vid-av { width:120px; height:120px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:3.5rem; background:linear-gradient(135deg,#1a3b2e,#0d2a1f); }
.wavc-local { position:absolute; top:16px; right:16px; z-index:3; width:105px; height:155px; border-radius:14px; overflow:hidden; border:2px solid rgba(255,255,255,0.2); box-shadow:0 6px 20px rgba(0,0,0,0.7); cursor:pointer; transition:all 0.2s; }
.wavc-local:hover { transform:scale(1.04); box-shadow:0 10px 30px rgba(0,0,0,0.8); }
.wavc-local video { width:100%; height:100%; object-fit:cover; }
.wavc-local-off { width:100%; height:100%; background:#1a2e2a; display:flex; align-items:center; justify-content:center; font-size:2.2rem; }
.wavc-overlay { position:absolute; inset:0; z-index:4; display:flex; flex-direction:column; justify-content:space-between; pointer-events:none; }
.wavc-top { padding:16px 20px; display:flex; flex-direction:column; align-items:center; background:linear-gradient(0deg,transparent,rgba(0,0,0,0.7)); pointer-events:none; }
.wavc-name { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-style:italic; color:#fff; text-shadow:0 2px 8px rgba(0,0,0,0.5); }
.wavc-status { font-size:0.8rem; color:rgba(255,255,255,0.6); margin-top:4px; }
.wavc-timer { font-size:1.1rem; font-weight:600; color:#fff; letter-spacing:2px; }
.wavc-badge { font-size:0.68rem; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.12); border-radius:50px; padding:4px 12px; color:rgba(255,255,255,0.5); margin-top:6px; pointer-events:none; }
.wavc-bottom { padding:20px 20px 36px; display:flex; justify-content:space-around; align-items:center; background:linear-gradient(180deg,transparent,rgba(0,0,0,0.85)); pointer-events:all; }
.wavc-btn { display:flex; flex-direction:column; align-items:center; gap:7px; border:none; background:transparent; cursor:pointer; padding:0; }
.wavc-btn-ic { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.wavc-btn-ic:hover { transform:scale(1.1); }
.wavc-btn-lbl { font-size:0.62rem; color:rgba(255,255,255,0.6); font-weight:600; }
.wavc-ic-base { background:rgba(255,255,255,0.18); color:#fff; backdrop-filter:blur(8px); }
.wavc-ic-end  { background:#ef4444; color:#fff; width:62px; height:62px; font-size:1.4rem; box-shadow:0 4px 18px rgba(239,68,68,0.55); }
.wavc-ic-on   { background:rgba(0,168,132,0.3); color:#00a884; border:1px solid rgba(0,168,132,0.4); }
.wavc-effect-bar { position:absolute; bottom:100px; left:50%; transform:translateX(-50%); z-index:5; display:flex; gap:10px; pointer-events:all; }
.wavc-effect-btn { width:44px; height:44px; border-radius:50%; border:none; background:rgba(255,255,255,0.15); color:#fff; font-size:1.1rem; cursor:pointer; backdrop-filter:blur(8px); transition:all 0.2s; }
.wavc-effect-btn:hover { background:rgba(255,255,255,0.25); transform:scale(1.08); }
.wa-incoming { position:fixed; top:0; left:0; right:0; z-index:9995; }
.wa-incoming-full { min-height:100vh; background:linear-gradient(180deg,#1a2e2a,#0d1f1a); display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:80px 20px 60px; }
.wa-inc-top { display:flex; flex-direction:column; align-items:center; gap:14px; }
.wa-inc-badge { font-size:0.75rem; color:#00a884; font-weight:700; letter-spacing:1px; text-transform:uppercase; background:rgba(0,168,132,0.12); padding:5px 16px; border-radius:50px; border:1px solid rgba(0,168,132,0.25); }
.wa-inc-av { width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:3rem; background:linear-gradient(135deg,#ff1a6e,#8b3fc8); box-shadow:0 0 0 3px rgba(0,168,132,0.3),0 0 0 16px rgba(0,168,132,0.06); animation:wacPulse 1.8s ease-in-out infinite; }
.wa-inc-name { font-family:'Cormorant Garamond',serif; font-size:2.4rem; font-style:italic; color:#e9edef; }
.wa-inc-sub { font-size:0.85rem; color:#8696a0; }
.wa-inc-btns { display:flex; justify-content:space-around; width:100%; max-width:280px; }
.wa-inc-btn { display:flex; flex-direction:column; align-items:center; gap:10px; border:none; background:transparent; cursor:pointer; padding:0; }
.wa-inc-ic { width:65px; height:65px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.6rem; transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.wa-inc-ic:hover { transform:scale(1.1); }
.wa-inc-accept { background:#00a884; box-shadow:0 4px 18px rgba(0,168,132,0.5); animation:wacPulse 1.8s ease-in-out infinite; }
.wa-inc-decline { background:#ef4444; box-shadow:0 4px 18px rgba(239,68,68,0.4); }
.wa-inc-lbl { font-size:0.7rem; color:#8696a0; font-weight:600; }
`;

function injectCSS() {
  if (!document.getElementById("wa2-css")) {
    const s = document.createElement("style"); s.id="wa2-css";
    s.textContent = WA_CSS + CALL_CSS; document.head.appendChild(s);
  }
}

/* ══ WebRTC signaling ══ */
const SIGNAL_POLL_MS = 200; // fast polling for call signaling

function useSignal(room, onSig) {
  const since   = useRef(new Date().toISOString());
  const sendRef = useRef(null);
  // Keep a stable ref to onSig so the polling interval never needs to restart
  const onSigRef = useRef(onSig);
  useEffect(() => { onSigRef.current = onSig; }, [onSig]);

  const send = useCallback(async (from, type, data) => {
    try {
      await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, from, type, data }),
      });
    } catch {}
  }, [room]);

  // keep sendRef always current so handleSig can call it synchronously
  sendRef.current = send;

  useEffect(() => {
    // reset timestamp when the hook mounts for a new call session
    since.current = new Date().toISOString();
    const id = setInterval(async () => {
      try {
        const r = await fetch(
          `/api/signal?room=${encodeURIComponent(room)}&since=${encodeURIComponent(since.current)}`,
          { cache: "no-store" }
        );
        if (!r.ok) return;
        const items = await r.json();
        if (Array.isArray(items) && items.length) {
          since.current = items[items.length - 1].createdAt;
          items.forEach(sig => onSigRef.current(sig));
        }
      } catch {}
    }, SIGNAL_POLL_MS);
    return () => clearInterval(id);
  }, [room]); // ← only restarts when room changes, NOT on every render

  return { send, sendRef };
}

/* ── Call Avatar ── */
function CallAvatar({ name, color1, color2, size = 110 }) {
  const initials = name ? name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() : '♥';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 0 0 3px rgba(255,255,255,0.12), 0 20px 60px rgba(0,0,0,0.5)`,
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: size * 0.32, fontWeight: 600, fontStyle: 'italic',
        color: '#fff', letterSpacing: '1px', lineHeight: 1,
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>{initials}</span>
    </div>
  );
}

/* ══ VOICE CALL SCREEN ══ */
function VoiceCall({ user, otherName, onEnd, isInitiator }) {
  const [state,   setState]   = useState("ringing");
  const [muted,   setMuted]   = useState(false);
  const [spk,     setSpk]     = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const pc         = useRef(null);
  const lStream    = useRef(null);
  const timer      = useRef(null);
  const remAudio   = useRef(null);
  const iceQueue   = useRef([]);
  const remDescSet = useRef(false);
  const room = "dharya_call_v1";

  // keep stable refs so callbacks never go stale
  const userRef        = useRef(user);
  const isInitiatorRef = useRef(isInitiator);
  const onEndRef       = useRef(onEnd);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { isInitiatorRef.current = isInitiator; }, [isInitiator]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const drainIceQueue = useCallback(async (p) => {
    while (iceQueue.current.length > 0) {
      const c = iceQueue.current.shift();
      try { await p.addIceCandidate(new RTCIceCandidate(c)); } catch(e) { console.warn("ICE drain voice:", e.message); }
    }
  }, []);

  const handleSig = useCallback(async sig => {
    if (sig.from === userRef.current) return;
    const p = pc.current; if (!p) return;
    try {
      if (sig.type === "offer") {
        if (p.signalingState !== "stable") {
          console.warn("Voice: unexpected offer in state", p.signalingState);
          return;
        }
        await p.setRemoteDescription(new RTCSessionDescription(sig.data));
        remDescSet.current = true;
        await drainIceQueue(p);
        const ans = await p.createAnswer();
        await p.setLocalDescription(ans);
        sendRef.current(userRef.current, "answer", ans);
      } else if (sig.type === "answer") {
        if (p.signalingState === "have-local-offer") {
          await p.setRemoteDescription(new RTCSessionDescription(sig.data));
          remDescSet.current = true;
          await drainIceQueue(p);
        }
      } else if (sig.type === "ice") {
        if (remDescSet.current && p.remoteDescription) {
          try { await p.addIceCandidate(new RTCIceCandidate(sig.data)); } catch(e) { console.warn("ICE voice:", e.message); }
        } else {
          iceQueue.current.push(sig.data);
        }
      } else if (sig.type === "call_end") {
        cleanup();
        onEndRef.current();
      }
    } catch(e) { console.warn("VoiceCall handleSig:", e.message); }
  }, [drainIceQueue]); // eslint-disable-line

  const { send, sendRef } = useSignal(room, handleSig);

  const cleanup = useCallback(() => {
    clearInterval(timer.current);
    lStream.current?.getTracks().forEach(t => t.stop());
    if (remAudio.current) { remAudio.current.srcObject = null; }
    try { pc.current?.close(); } catch {} pc.current = null;
    remDescSet.current = false;
    iceQueue.current = [];
    fetch(`/api/signal?room=${encodeURIComponent(room)}`, { method: "DELETE" }).catch(() => {});
  }, [room]);

  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (gone) { stream.getTracks().forEach(t => t.stop()); return; }
        lStream.current = stream;

        const p = new RTCPeerConnection({
          iceServers: ICE,
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          iceCandidatePoolSize: 10,
        });
        pc.current = p;
        stream.getTracks().forEach(t => p.addTrack(t, stream));

        // attach remote audio stream
        p.ontrack = e => {
          if (remAudio.current) {
            remAudio.current.srcObject = e.streams[0];
            remAudio.current.play().catch(() => {});
          }
        };

        p.onicecandidate = e => {
          if (e.candidate) send(userRef.current, "ice", e.candidate.toJSON());
        };

        p.oniceconnectionstatechange = () => {
          console.log("Voice ICE state:", p.iceConnectionState);
          if (p.iceConnectionState === "failed") {
            p.restartIce();
          }
        };

        p.onconnectionstatechange = () => {
          console.log("Voice connection state:", p.connectionState);
          if (p.connectionState === "connected") {
            setState("connected");
            timer.current = setInterval(() => setElapsed(s => s + 1), 1000);
          }
          if (["disconnected", "failed", "closed"].includes(p.connectionState)) {
            cleanup();
            setTimeout(() => onEndRef.current(), 600);
          }
        };

        if (isInitiatorRef.current) {
          const off = await p.createOffer({ offerToReceiveAudio: true });
          await p.setLocalDescription(off);
          send(userRef.current, "offer", off);
        }
      } catch(e) { console.warn("Voice media:", e.message); }
    })();
    return () => { gone = true; cleanup(); };
  }, []); // eslint-disable-line

  const toggleMute = () => {
    lStream.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };
  const endCall = () => {
    send(userRef.current, "call_end", {});
    cleanup();
    onEnd();
  };
  const conn = state === "connected";

  return (
    <div className="wac">
      <audio ref={remAudio} autoPlay playsInline style={{ display: "none" }} />
      <div className="wac-bg" />
      <div className="wac-ripple-wrap">
        <div className="wac-ripple" /><div className="wac-ripple" /><div className="wac-ripple" />
      </div>
      <div className="wac-top">
        <div className={"wac-av" + (conn ? " connected" : "")}>
          <CallAvatar name={otherName} color1="#ff1a6e" color2="#8b3fc8" size={110} />
        </div>
        <div className="wac-name">{otherName}</div>
        {conn
          ? <div className="wac-timer">{fmtTimer(elapsed)}</div>
          : <div className="wac-status">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00a884", display: "inline-block", animation: "waTyp 1.2s infinite" }} />
              {state === "ringing" ? "Ringing..." : "Connecting..."}
            </div>
        }
      </div>
      <div className="wac-actions">
        <div className="wac-btns">
          <button className={"wac-btn" + (muted ? "" : " active")} onClick={toggleMute}>
            <div className={"wac-btn-ic " + (muted ? "wac-ic-on" : "wac-ic-mute")}>{I(muted ? "micOff" : "mic", 24)}</div>
            <span className="wac-btn-lbl">{muted ? "Unmute" : "Mute"}</span>
          </button>
          <button className="wac-btn" onClick={endCall}>
            <div className="wac-btn-ic wac-ic-end">{I("phoneOff", 26)}</div>
            <span className="wac-btn-lbl">End</span>
          </button>
          <button className="wac-btn" onClick={() => setSpk(v => !v)}>
            <div className={"wac-btn-ic " + (spk ? "wac-ic-on" : "wac-ic-spk")}>{I(spk ? "speaker" : "speakerOff", 24)}</div>
            <span className="wac-btn-lbl">Speaker</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ VIDEO CALL SCREEN ══ */
function VideoCall({ user, otherName, onEnd, isInitiator }) {
  const [state,    setState]    = useState("ringing");
  const [muted,    setMuted]    = useState(false);
  const [camOff,   setCamOff]   = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [remReady, setRemReady] = useState(false);
  const [swapped,  setSwapped]  = useState(false);
  const pc         = useRef(null);
  const lStream    = useRef(null);
  const timer      = useRef(null);
  const remVid     = useRef(null);
  const locVid     = useRef(null);
  const iceQueue   = useRef([]);
  const remDescSet = useRef(false);
  const room = "dharya_call_v1";

  // stable refs so callbacks never close over stale values
  const userRef        = useRef(user);
  const isInitiatorRef = useRef(isInitiator);
  const onEndRef       = useRef(onEnd);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { isInitiatorRef.current = isInitiator; }, [isInitiator]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const drainIceQueue = useCallback(async (p) => {
    while (iceQueue.current.length > 0) {
      const c = iceQueue.current.shift();
      try { await p.addIceCandidate(new RTCIceCandidate(c)); } catch(e) { console.warn("ICE drain video:", e.message); }
    }
  }, []);

  const handleSig = useCallback(async sig => {
    if (sig.from === userRef.current) return;
    const p = pc.current; if (!p) return;
    try {
      if (sig.type === "offer") {
        if (p.signalingState !== "stable") {
          console.warn("Video: unexpected offer in state", p.signalingState);
          return;
        }
        await p.setRemoteDescription(new RTCSessionDescription(sig.data));
        remDescSet.current = true;
        await drainIceQueue(p);
        const ans = await p.createAnswer();
        await p.setLocalDescription(ans);
        sendRef.current(userRef.current, "answer", ans);
      } else if (sig.type === "answer") {
        if (p.signalingState === "have-local-offer") {
          await p.setRemoteDescription(new RTCSessionDescription(sig.data));
          remDescSet.current = true;
          await drainIceQueue(p);
        }
      } else if (sig.type === "ice") {
        if (remDescSet.current && p.remoteDescription) {
          try { await p.addIceCandidate(new RTCIceCandidate(sig.data)); } catch(e) { console.warn("ICE video:", e.message); }
        } else {
          iceQueue.current.push(sig.data);
        }
      } else if (sig.type === "call_end") {
        cleanup();
        onEndRef.current();
      }
    } catch(e) { console.warn("VideoCall handleSig:", e.message); }
  }, [drainIceQueue]); // eslint-disable-line

  const { send, sendRef } = useSignal(room, handleSig);

  const cleanup = useCallback(() => {
    clearInterval(timer.current);
    lStream.current?.getTracks().forEach(t => t.stop());
    if (remVid.current) { remVid.current.srcObject = null; }
    if (locVid.current) { locVid.current.srcObject = null; }
    try { pc.current?.close(); } catch {} pc.current = null;
    remDescSet.current = false;
    iceQueue.current = [];
    fetch(`/api/signal?room=${encodeURIComponent(room)}`, { method: "DELETE" }).catch(() => {});
  }, [room]);

  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (gone) { stream.getTracks().forEach(t => t.stop()); return; }
        lStream.current = stream;
        if (locVid.current) {
          locVid.current.srcObject = stream;
          locVid.current.play().catch(() => {});
        }

        const p = new RTCPeerConnection({
          iceServers: ICE,
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          iceCandidatePoolSize: 10,
        });
        pc.current = p;
        stream.getTracks().forEach(t => p.addTrack(t, stream));

        p.ontrack = e => {
          if (remVid.current) {
            remVid.current.srcObject = e.streams[0];
            remVid.current.play().catch(() => {});
            setRemReady(true);
          }
        };

        p.onicecandidate = e => {
          if (e.candidate) send(userRef.current, "ice", e.candidate.toJSON());
        };

        p.oniceconnectionstatechange = () => {
          console.log("Video ICE state:", p.iceConnectionState);
          if (p.iceConnectionState === "failed") {
            p.restartIce();
          }
        };

        p.onconnectionstatechange = () => {
          console.log("Video connection state:", p.connectionState);
          if (p.connectionState === "connected") {
            setState("connected");
            timer.current = setInterval(() => setElapsed(s => s + 1), 1000);
          }
          if (["disconnected", "failed", "closed"].includes(p.connectionState)) {
            cleanup();
            setTimeout(() => onEndRef.current(), 600);
          }
        };

        if (isInitiatorRef.current) {
          const off = await p.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await p.setLocalDescription(off);
          send(userRef.current, "offer", off);
        }
      } catch(e) { console.warn("Video media:", e.message); }
    })();
    return () => { gone = true; cleanup(); };
  }, []); // eslint-disable-line

  const toggleMute = () => { lStream.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; }); setMuted(m => !m); };
  const toggleCam  = () => { lStream.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; }); setCamOff(c => !c); };
  const endCall    = () => { send(userRef.current, "call_end", {}); cleanup(); onEnd(); };
  const conn = state === "connected";

  return (
    <div className="wavc">
      <video ref={remVid} className="wavc-remote" autoPlay playsInline style={{ display: remReady ? "block" : "none" }} />
      {!remReady && (
        <div className="wavc-no-vid">
          <CallAvatar name={otherName} color1="#ff1a6e" color2="#8b3fc8" size={120} />
        </div>
      )}
      <div className="wavc-local" onClick={() => setSwapped(v => !v)} title="Tap to swap">
        {camOff
          ? <div className="wavc-local-off">🙈</div>
          : <video ref={locVid} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: swapped ? "scaleX(-1)" : "none" }} />
        }
      </div>
      <div className="wavc-overlay">
        <div className="wavc-top">
          <div className="wavc-name">{otherName}</div>
          {conn
            ? <div className="wavc-timer">{fmtTimer(elapsed)}</div>
            : <div className="wavc-status">{state === "ringing" ? "Ringing..." : "Connecting..."}</div>
          }
          <div className="wavc-badge">Video Call</div>
        </div>
        <div className="wavc-bottom">
          <button className="wavc-btn" onClick={toggleMute}>
            <div className={"wavc-btn-ic " + (muted ? "wavc-ic-on" : "wavc-ic-base")}>{I(muted ? "micOff" : "mic", 24)}</div>
            <span className="wavc-btn-lbl">{muted ? "Unmute" : "Mute"}</span>
          </button>
          <button className="wavc-btn" onClick={toggleCam}>
            <div className={"wavc-btn-ic " + (camOff ? "wavc-ic-on" : "wavc-ic-base")}>{I(camOff ? "videoOff" : "video", 24)}</div>
            <span className="wavc-btn-lbl">{camOff ? "Cam On" : "Cam Off"}</span>
          </button>
          <button className="wavc-btn" onClick={endCall}>
            <div className="wavc-btn-ic wavc-ic-end">{I("phoneOff", 26)}</div>
            <span className="wavc-btn-lbl">End</span>
          </button>
          <button className="wavc-btn" onClick={() => setSwapped(v => !v)}>
            <div className="wavc-btn-ic wavc-ic-base">{I("flip", 24)}</div>
            <span className="wavc-btn-lbl">Flip</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ INCOMING CALL SCREEN ══ */
function IncomingCall({ otherName, mode, onAccept, onDecline }) {
  return (
    <div className="wa-incoming">
      <div className="wa-incoming-full">
        <div className="wa-inc-top">
          <div className="wa-inc-badge">{mode==="video"?"Video Call":"Voice Call"}</div>
          <div className="wa-inc-av">
            <CallAvatar name={otherName} color1="#ff1a6e" color2="#8b3fc8" size={100}/>
          </div>
          <div className="wa-inc-name">{otherName}</div>
          <div className="wa-inc-sub">Dharya</div>
        </div>
        <div className="wa-inc-btns">
          <button className="wa-inc-btn" onClick={onDecline}>
            <div className="wa-inc-ic wa-inc-decline">{I("phoneOff",28)}</div>
            <span className="wa-inc-lbl">Decline</span>
          </button>
          <button className="wa-inc-btn" onClick={onAccept}>
            <div className="wa-inc-ic wa-inc-accept">{I("phone",28)}</div>
            <span className="wa-inc-lbl">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN CHAT ══ */
export default function LoveChat({ user }) {
  /* ── existing state ── */
  const [msgs,       setMsgs]       = useState([]);
  const [input,      setInput]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [emojiQ,     setEmojiQ]     = useState("");
  const [online,     setOnline]     = useState(true);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [editId,     setEditId]     = useState(null);
  const [editText,   setEditText]   = useState("");
  const [menuId,     setMenuId]     = useState(null);
  const [reactId,    setReactId]    = useState(null);
  const [imgPrev,    setImgPrev]    = useState(null);
  const [replyTo,    setReplyTo]    = useState(null);
  const [showAttach, setShowAttach] = useState(false);
  const [typing,     setTyping]     = useState(false);
  const [unread,     setUnread]     = useState(0);
  const [atBottom,   setAtBottom]   = useState(true);
  const [starred,    setStarred]    = useState(new Set());
  const [callMode,   setCallMode]   = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [incoming,   setIncoming]   = useState(null);
  const [isInitiator,setIsInitiator]= useState(false); // FIX: track who started the call

  /* ── new state: pinned messages ── */
  const [pinned,     setPinned]     = useState([]);
  const [pinnedIdx,  setPinnedIdx]  = useState(0);

  /* ── new state: search ── */
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQ,       setSearchQ]       = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchIdx,     setSearchIdx]     = useState(0);

  /* ── new state: disappearing messages ── */
  const [disappear, setDisappear] = useState(null); // null | "24h" | "7d" | "30d"

  /* ── new state: voice recording ── */
  const [recording,   setRecording]   = useState(false);
  const [recSeconds,  setRecSeconds]  = useState(0);
  const mediaRec      = useRef(null);
  const recChunks     = useRef([]);
  const recTimer      = useRef(null);

  /* ── new state: view once toggle ── */
  const [viewOnceMode, setViewOnceMode] = useState(false);

  /* ── new state: chat info panel ── */
  const [infoOpen, setInfoOpen] = useState(false);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const fileRef     = useRef(null);
  const msgsRef     = useRef(null);
  const msgRefs     = useRef({});
  const allIds      = useRef(new Set());
  const typTimer    = useRef(null);
  const incSince    = useRef(new Date().toISOString());
  const callRoom    = "dharya_call_v1";

  injectCSS();

  const isSurya  = user === "surya";
  const isDemo   = user === "demo";
  const me       = isSurya ? "surya"   : isDemo ? "demo"   : "sadhana";
  const myName   = isSurya ? "Surya 💚" : isDemo ? "Demo 👀" : "Sadhana 💗";
  const other    = isSurya ? "Sadhana" : "Surya";
  const otherFull= isSurya ? "Sadhana 💗" : "Surya 💚";

  /* ── merge helper ── */
  const merge = useCallback((prev, inc) => {
    const result = [...prev];
    for (const m of inc) {
      const k = String(m._id);
      if (!allIds.current.has(k)) { allIds.current.add(k); result.push(m); }
      else { const i = result.findIndex(r=>String(r._id)===k); if(i!==-1) result[i]=m; }
    }
    return result.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  }, []);

  /* ── initial load ── */
  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        if (Array.isArray(data)) {
          allIds.current = new Set(data.map(m=>String(m._id)));
          setMsgs(data.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)));
          fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({reader:me})});
        }
        setOnline(true);
      } catch {
        setOnline(false);
        const w = {_id:"offline_w",text:`Hey ${other} 💙 (Offline mode — messages sync when reconnected)`,sender:isSurya?"sadhana":"surya",senderName:otherFull,createdAt:new Date().toISOString(),read:true,edited:false,deleted:false,reactions:{}};
        allIds.current.add("offline_w"); setMsgs([w]);
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  /* ── poll messages ── */
  const poll = useCallback(async () => {
    if (isDemo) return;
    try {
      const res = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMsgs(prev => {
          const merged = merge(prev, data);
          if (!atBottom) setUnread(merged.filter(m=>m.sender!==me&&!m.read).length);
          return merged;
        });
        setOnline(true);
      }
    } catch { setOnline(false); }
  }, [isDemo, merge, atBottom, me]);

  useEffect(() => { const id=setInterval(poll,POLL_MS); return ()=>clearInterval(id); }, [poll]);

  /* ── poll incoming calls ── */
  useEffect(() => {
    if (isDemo || callActive) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/signal?room=${encodeURIComponent(callRoom)}&since=${encodeURIComponent(incSince.current)}`,
          { cache: "no-store" }
        );
        const items = await res.json();
        for (const s of (Array.isArray(items)?items:[])) {
          incSince.current = s.createdAt;
          if (s.from !== me && s.type === "incoming_call" && !callActive) {
            setIncoming({ mode: s.data?.mode||"voice" });
            setTimeout(()=>setIncoming(null), 30000);
          }
          if (s.from !== me && s.type === "call_end") { setCallActive(false); setCallMode(null); }
        }
      } catch {}
    }, 500);
    return () => clearInterval(id);
  }, [me, callActive, callRoom, isDemo]);

  /* ── scroll tracking ── */
  useEffect(() => {
    const el = msgsRef.current; if (!el) return;
    const onScroll = () => {
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(bottom < 80);
      if (bottom < 80) setUnread(0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, atBottom]);

  /* ── search: update results when query or msgs change ── */
  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); setSearchIdx(0); return; }
    const q = searchQ.toLowerCase();
    const ids = msgs
      .filter(m => !m.deleted && m.text && m.text.toLowerCase().includes(q))
      .map(m => String(m._id));
    setSearchResults(ids);
    setSearchIdx(0);
  }, [searchQ, msgs]);

  /* ── scroll to search result ── */
  useEffect(() => {
    if (!searchResults.length) return;
    const id = searchResults[searchIdx];
    const el = msgRefs.current[id];
    if (el) el.scrollIntoView({ behavior:"smooth", block:"center" });
  }, [searchIdx, searchResults]);

  /* ── disappear window filter helper ── */
  function disappearCutoff() {
    if (!disappear) return null;
    const now = Date.now();
    if (disappear === "24h") return now - 24*60*60*1000;
    if (disappear === "7d")  return now - 7*24*60*60*1000;
    if (disappear === "30d") return now - 30*24*60*60*1000;
    return null;
  }

  function cycleDisappear() {
    setDisappear(d => {
      if (d === null) return "24h";
      if (d === "24h") return "7d";
      if (d === "7d") return "30d";
      return null;
    });
  }

  /* ── send ── */
  const sendMsg = async (text) => {
    const txt = (text || input).trim();
    if (!txt && !imgPrev) return;
    if (sending) return;
    setInput(""); setSending(true); setShowEmoji(false); setShowAttach(false);
    const img = imgPrev; setImgPrev(null);
    if (fileRef.current) fileRef.current.value = "";
    const reply = replyTo ? { id: String(replyTo._id), text: replyTo.text, sender: replyTo.senderName } : null;
    setReplyTo(null);
    const tempId = "tmp_" + Date.now();
    const temp = {
      _id:tempId, text:txt, image:img, sender:me, senderName:myName,
      createdAt:new Date().toISOString(), read:false, pending:true,
      edited:false, deleted:false, reactions:{}, replyTo:reply,
      viewOnce: viewOnceMode && !!img,
    };
    setMsgs(prev=>[...prev, temp]);
    setAtBottom(true);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);

    if (!online || isDemo) {
      setTimeout(()=>{
        const ai = {_id:"ai_"+Date.now(),text:aiReply(txt),image:null,sender:isSurya?"sadhana":"surya",senderName:otherFull,createdAt:new Date().toISOString(),read:true,pending:false,edited:false,deleted:false,reactions:{}};
        setMsgs(prev=>[...prev.map(m=>m._id===tempId?{...m,pending:false}:m),ai]);
        setSending(false);
        setTyping(true); setTimeout(()=>setTyping(false),900+Math.random()*500);
      },700+Math.random()*500);
      return;
    }
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:txt,sender:me,senderName:myName,image:img,replyTo:reply,viewOnce:viewOnceMode&&!!img})});
      if (!res.ok) { setError("Failed to send"); setMsgs(prev=>prev.filter(m=>m._id!==tempId)); setSending(false); return; }
      const data = await res.json(); const msg = data?.msg;
      if (msg) { allIds.current.add(String(msg._id)); setMsgs(prev=>[...prev.filter(m=>m._id!==tempId),{...msg,pending:false}].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))); }
      else { setMsgs(prev=>prev.filter(m=>m._id!==tempId)); await poll(); }
      setError("");
    } catch(e) { setError(e.message); setMsgs(prev=>prev.filter(m=>m._id!==tempId)); }
    setSending(false); inputRef.current?.focus();
  };

  const submitEdit = async () => {
    if (!editText.trim() || !editId) return;
    try {
      await fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editId,text:editText})});
      setMsgs(prev=>prev.map(m=>String(m._id)===editId?{...m,text:editText.trim(),edited:true,editedAt:new Date().toISOString()}:m));
    } catch {}
    setEditId(null); setEditText("");
  };

  const deleteMsg = async id => {
    try { await fetch(`/api/chat?id=${id}`,{method:"DELETE"}); setMsgs(prev=>prev.map(m=>String(m._id)===id?{...m,deleted:true,text:"",image:null}:m)); } catch {}
    setMenuId(null);
  };

  const addReaction = (id, emoji) => {
    setMsgs(prev=>prev.map(m=>{
      if (String(m._id)!==id) return m;
      const r = {...(m.reactions||{})}; r[emoji]=(r[emoji]||0)+1; return {...m,reactions:r};
    }));
    setReactId(null);
  };

  const startCall = async (mode) => {
    if (isDemo) { alert("Calls not available in demo."); return; }
    // Clear stale signals from previous calls before starting
    try { await fetch(`/api/signal?room=${encodeURIComponent(callRoom)}`, { method: "DELETE" }); } catch {}
    // Advance the incoming-call poll timestamp BEFORE posting the signal
    // so we never pick up our own incoming_call notification
    incSince.current = new Date().toISOString();
    setIsInitiator(true);
    setCallMode(mode);
    setCallActive(true);
    // Post the ring signal after updating incSince so it won't be consumed by our own poll
    try {
      await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: callRoom, from: me, type: "incoming_call", data: { mode } }),
      });
    } catch {}
  };

  const acceptCall = () => {
    if(!incoming) return;
    setIsInitiator(false); // FIX: callee is never the initiator
    setIncoming(null); setCallMode(incoming.mode); setCallActive(true);
  };
  const declineCall = () => {
    fetch("/api/signal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({room:callRoom,from:me,type:"call_end",data:{}})}).catch(()=>{});
    setIncoming(null);
  };

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size>5*1024*1024){alert("Max 5MB");return;}
    const r=new FileReader(); r.onload=ev=>setImgPrev(ev.target.result); r.readAsDataURL(f);
    setShowAttach(false);
  };

  const handleInput = val => {
    setInput(val);
    clearTimeout(typTimer.current);
    typTimer.current = setTimeout(()=>{}, 1500);
  };

  /* ── pin / unpin ── */
  const pinMsg = (m) => {
    setPinned(prev => {
      const id = String(m._id);
      if (prev.find(p => String(p._id) === id)) return prev.filter(p => String(p._id) !== id);
      if (prev.length >= 3) return [...prev.slice(1), m];
      return [...prev, m];
    });
    setMenuId(null);
  };

  const isPinned = (id) => pinned.some(p => String(p._id) === id);

  /* ── pinned bar click: cycle or scroll ── */
  const handlePinnedBarClick = () => {
    if (pinned.length === 0) return;
    const idx = pinnedIdx % pinned.length;
    const target = pinned[idx];
    const el = msgRefs.current[String(target._id)];
    if (el) el.scrollIntoView({ behavior:"smooth", block:"center" });
    setPinnedIdx(i => (i + 1) % pinned.length);
  };

  /* ── voice recording ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) recChunks.current.push(e.data); };
      mr.start();
      mediaRec.current = mr;
      setRecording(true);
      setRecSeconds(0);
      recTimer.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch(e) { console.warn("Mic:", e.message); }
  };

  const cancelRecording = () => {
    clearInterval(recTimer.current);
    mediaRec.current?.stream?.getTracks().forEach(t => t.stop());
    try { mediaRec.current?.stop(); } catch {}
    mediaRec.current = null; recChunks.current = [];
    setRecording(false); setRecSeconds(0);
  };

  const sendVoiceNote = () => {
    clearInterval(recTimer.current);
    const mr = mediaRec.current;
    if (!mr) return;
    mr.onstop = () => {
      const blob = new Blob(recChunks.current, { type:"audio/webm" });
      const reader = new FileReader();
      reader.onload = async ev => {
        const b64 = ev.target.result;
        const tempId = "tmp_vn_" + Date.now();
        const temp = { _id:tempId, text:"", sender:me, senderName:myName, createdAt:new Date().toISOString(), read:false, pending:true, edited:false, deleted:false, reactions:{}, voiceNote:b64 };
        setMsgs(prev=>[...prev, temp]);
        setAtBottom(true);
        setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
        if (!online || isDemo) {
          setTimeout(()=>setMsgs(prev=>prev.map(m=>m._id===tempId?{...m,pending:false}:m)),700);
          return;
        }
        try {
          const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:"",sender:me,senderName:myName,voiceNote:b64})});
          const data = await res.json(); const msg = data?.msg;
          if (msg) { allIds.current.add(String(msg._id)); setMsgs(prev=>[...prev.filter(m=>m._id!==tempId),{...msg,pending:false}].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))); }
          else { setMsgs(prev=>prev.filter(m=>m._id!==tempId)); await poll(); }
        } catch {}
      };
      mr.stream?.getTracks().forEach(t => t.stop());
      mr.stop();
      mediaRec.current = null; recChunks.current = [];
    };
    try { mr.stop(); } catch {}
    setRecording(false); setRecSeconds(0);
  };

  /* ── view once: mark viewed ── */
  const markViewed = (id) => {
    setMsgs(prev => prev.map(m => String(m._id) === id ? {...m, viewed: true} : m));
  };

  /* ── computed values ── */
  const filteredEmoji = emojiQ ? EMOJIS.filter(e=>e.includes(emojiQ)) : EMOJIS;

  // apply disappear filter
  const cutoff = disappearCutoff();
  const visibleMsgs = cutoff
    ? msgs.filter(m => new Date(m.createdAt).getTime() >= cutoff)
    : msgs;

  const grouped = visibleMsgs.reduce((acc,m)=>{ const l=fmtDate(m.createdAt); if(!acc[l])acc[l]=[]; acc[l].push(m); return acc; },{});
  const quick = QUICK[user] || QUICK.sadhana;
  const disappearLabel = disappear ? { "24h":"24 Hours", "7d":"7 Days", "30d":"30 Days" }[disappear] : null;

  const closeAll = () => { setMenuId(null); setReactId(null); setShowEmoji(false); setShowAttach(false); };

  /* ── edit time check helper (15 min window) ── */
  const canEdit = (m) => Date.now() - new Date(m.createdAt).getTime() < 15 * 60 * 1000;

  /* ── edited meta label ── */
  const editedLabel = (m) => {
    if (!m.editedAt) return "edited";
    const mins = Math.round((Date.now() - new Date(m.editedAt).getTime()) / 60000);
    return `edited • ${mins < 1 ? "just now" : mins + " min ago"}`;
  };

  return (
    <div className="wa2" onClick={closeAll}>

      {/* ── Active calls ── */}
      {callActive && callMode==="voice" && <VoiceCall user={me} otherName={otherFull} isInitiator={isInitiator} onEnd={()=>{setCallActive(false);setCallMode(null);setIsInitiator(false);}}/>}
      {callActive && callMode==="video" && <VideoCall user={me} otherName={otherFull} isInitiator={isInitiator} onEnd={()=>{setCallActive(false);setCallMode(null);setIsInitiator(false);}}/>}

      {/* ── Incoming ── */}
      {incoming && !callActive && <IncomingCall otherName={otherFull} mode={incoming.mode} onAccept={acceptCall} onDecline={declineCall}/>}

      {/* ── Chat info panel ── */}
      <div className={"wa2-info-panel " + (infoOpen?"open":"")} onClick={e=>e.stopPropagation()}>
        <div className="wa2-info-header">
          <button className="wa2-info-close" onClick={()=>setInfoOpen(false)}>✕</button>
          <span style={{color:"#e9edef",fontWeight:600,fontSize:"0.95rem"}}>Contact Info</span>
        </div>
        <div className="wa2-info-body">
          <div>
            <div className="wa2-info-av" style={{background:isSurya?"linear-gradient(135deg,#ff1a6e,#8b3fc8)":"linear-gradient(135deg,#00d97e,#059669)"}}>
              <CallAvatar name={other} color1={isSurya?"#ff1a6e":"#00d97e"} color2={isSurya?"#8b3fc8":"#059669"} size={72}/>
            </div>
            <div className="wa2-info-name">{otherFull}</div>
            <div style={{textAlign:"center",fontSize:"0.75rem",color:"#8696a0",marginTop:4}}>{online?"online":"last seen recently"}</div>
          </div>
          <div className="wa2-info-badge">
            <span className="lock">🔒</span>
            <span>End-to-end encrypted. Only you and {other} can read this chat.</span>
          </div>
          <div>
            <div className="wa2-info-opt" onClick={cycleDisappear}>
              <span>⏱️</span>
              <span>Disappearing messages{disappear ? " (" + disappearLabel + ")" : ""}</span>
            </div>
            <div className="wa2-info-opt" onClick={()=>{setMsgs([]);allIds.current=new Set();setInfoOpen(false);}}>
              <span>🗑️</span><span>Clear chat</span>
            </div>
            <div className="wa2-info-opt red">
              <span>🚫</span><span>Block {other}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="wa2-hdr">
        <div className={"wa2-av " + (isSurya?"pink":"green")} style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setInfoOpen(v=>!v);}}>
          <CallAvatar name={other} color1={isSurya?"#ff1a6e":"#00d97e"} color2={isSurya?"#8b3fc8":"#059669"} size={40}/>
        </div>
        <div className="wa2-hdr-info" onClick={e=>{e.stopPropagation();setInfoOpen(v=>!v);}}>
          <div className="wa2-hdr-name">
            {otherFull}
            {disappear && <span className="wa2-disappear-badge">{disappear}</span>}
          </div>
          <div className="wa2-hdr-status">{online ? "online" : "connecting..."}</div>
        </div>
        <button className="wa2-hdr-btn" title="Search" onClick={e=>{e.stopPropagation();setSearchOpen(v=>!v);setSearchQ("");}} style={{fontSize:"1rem"}}>🔍</button>
        <button className="wa2-hdr-btn" title="Disappearing messages" onClick={e=>{e.stopPropagation();cycleDisappear();}} style={{fontSize:"1rem"}}>⏱️</button>
        <button className="wa2-hdr-btn call" title="Voice call" onClick={e=>{e.stopPropagation();startCall("voice");}}>{I("phone",20)}</button>
        <button className="wa2-hdr-btn video" title="Video call" onClick={e=>{e.stopPropagation();startCall("video");}}>{I("video",20)}</button>
      </div>

      {/* ── Search bar ── */}
      {searchOpen && (
        <div className="wa2-search-bar" onClick={e=>e.stopPropagation()}>
          <input
            className="wa2-search-inp"
            placeholder="Search messages…"
            value={searchQ}
            onChange={e=>setSearchQ(e.target.value)}
            autoFocus
          />
          {searchResults.length > 0 && (
            <span className="wa2-search-count">{searchIdx+1}/{searchResults.length}</span>
          )}
          <div className="wa2-search-nav">
            <button onClick={()=>setSearchIdx(i=>i>0?i-1:searchResults.length-1)} title="Previous">↑</button>
            <button onClick={()=>setSearchIdx(i=>(i+1)%searchResults.length)} title="Next">↓</button>
          </div>
          <button className="wa2-hdr-btn" style={{fontSize:"0.9rem",color:"#8696a0"}} onClick={()=>{setSearchOpen(false);setSearchQ("");}}>✕</button>
        </div>
      )}

      {/* ── Pinned bar ── */}
      {pinned.length > 0 && (
        <div className="wa2-pinned-bar" onClick={e=>{e.stopPropagation();handlePinnedBarClick();}}>
          <span className="wa2-pinned-icon">📌</span>
          <span className="wa2-pinned-text">{pinned[pinnedIdx % pinned.length]?.text || "📷 Photo"}</span>
          {pinned.length > 1 && <span className="wa2-pinned-count">{pinned.length} pinned</span>}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="wa2-msgs" ref={msgsRef}>
        <div className="wa2-bg"/>
        {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171",padding:"8px 12px",borderRadius:"8px",fontSize:"0.8rem",margin:"4px 0"}}>⚠️ {error}</div>}
        {loading && (
          <div className="wa2-empty">
            <div className="wa2-empty-lock">💌</div>
            <div style={{fontSize:"0.9rem"}}>Loading messages…</div>
          </div>
        )}
        {!loading && visibleMsgs.length===0 && (
          <div className="wa2-empty">
            <div className="wa2-empty-lock">🔒</div>
            <div style={{fontWeight:600,color:"#e9edef",fontSize:"0.95rem"}}>Messages are private</div>
            <div style={{fontSize:"0.8rem",lineHeight:1.6}}>Only Surya & Sadhana can read this chat.<br/>Say hello to {otherFull} 👋</div>
          </div>
        )}

        {/* Disappearing chip */}
        {disappear && !loading && (
          <div className="wa2-system-chip">
            <span>⏱️ Disappearing messages: {disappearLabel}</span>
          </div>
        )}

        {!loading && Object.entries(grouped).map(([date, ms]) => (
          <div key={date}>
            <div className="wa2-date"><span>{date}</span></div>
            {ms.map((m, i) => {
              const isMine = m.sender === me;
              const key = String(m._id)+i;
              const isStarred = starred.has(String(m._id));
              const isSearchHit = searchResults[searchIdx] === String(m._id) && searchQ;
              return (
                <div
                  key={key}
                  className={"wa2-row " + (isMine?"out":"in")}
                  style={{position:"relative"}}
                  ref={el => { if (el) msgRefs.current[String(m._id)] = el; }}
                >
                  <div
                    className={"wa2-bub " + (isMine?"out":"in") + (isMine&&isSurya?" surya-bub":"") + (m.pending?" pending":"") + (isStarred?" starred":"")}
                    style={isSearchHit ? {outline:"2px solid rgba(0,168,132,0.6)"} : {}}
                    onContextMenu={e=>{e.preventDefault();e.stopPropagation();setMenuId(String(m._id));setReactId(null);}}
                    onDoubleClick={e=>{e.stopPropagation();setReactId(r=>r===String(m._id)?null:String(m._id));}}
                    onClick={e=>{ if(menuId===String(m._id)||reactId===String(m._id))e.stopPropagation(); }}
                  >
                    {/* Reply quote */}
                    {m.replyTo && (
                      <div className="wa2-reply-quote" onClick={e=>{e.stopPropagation();}}>
                        <div className="wa2-reply-author">{m.replyTo.sender}</div>
                        <div className="wa2-reply-preview">{m.replyTo.text||"📷 Photo"}</div>
                      </div>
                    )}
                    {!isMine && <span className="wa2-sender">{m.senderName}</span>}

                    {m.deleted ? (
                      <p className="wa2-deleted">🚫 This message was deleted</p>
                    ) : editId===String(m._id) ? (
                      <div className="wa2-edit-wrap" onClick={e=>e.stopPropagation()}>
                        <input className="wa2-edit-inp" value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitEdit()} autoFocus/>
                        <div className="wa2-edit-row">
                          <button onClick={submitEdit}>✓ Save</button>
                          <button onClick={()=>{setEditId(null);setEditText("");}}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Voice note */}
                        {m.voiceNote && (
                          <audio className="wa2-audio" controls src={m.voiceNote} style={{display:"block",marginBottom:4}}/>
                        )}
                        {/* View once image */}
                        {m.image && m.viewOnce ? (
                          m.viewed ? (
                            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0",color:"#8696a0",fontSize:"0.82rem"}}>
                              👁️ Opened
                            </div>
                          ) : !isMine ? (
                            <div className="wa2-view-once" onClick={e=>{e.stopPropagation();markViewed(String(m._id));}}>
                              <img src={m.image} alt="view once" className="wa2-img"/>
                              <div className="wa2-view-once-overlay">
                                <span className="wa2-view-once-icon">👁️</span>
                                <span>Tap to view</span>
                              </div>
                            </div>
                          ) : (
                            <div style={{position:"relative",display:"inline-block"}}>
                              <img src={m.image} alt="sent" className="wa2-img" onClick={e=>{e.stopPropagation();window.open(m.image);}}/>
                              <span style={{position:"absolute",top:4,right:4,fontSize:"0.7rem",background:"rgba(0,0,0,0.55)",borderRadius:4,padding:"2px 5px",color:"#fff"}}>👁️</span>
                            </div>
                          )
                        ) : m.image ? (
                          <img src={m.image} alt="sent" className="wa2-img" onClick={e=>{e.stopPropagation();window.open(m.image);}}/>
                        ) : null}
                        {/* Text with formatting and search highlight */}
                        {m.text && (
                          <p className="wa2-text">
                            {searchQ && m.text.toLowerCase().includes(searchQ.toLowerCase())
                              ? highlightText(m.text, searchQ)
                              : formatText(m.text)
                            }
                          </p>
                        )}
                      </>
                    )}

                    {/* Reactions */}
                    {m.reactions && Object.keys(m.reactions).length>0 && (
                      <div className="wa2-reacts">
                        {Object.entries(m.reactions).map(([e,c])=>(
                          <span key={e} className="wa2-react">{e}{c>1&&<span className="wa2-react-count">{c}</span>}</span>
                        ))}
                      </div>
                    )}
                    {/* Meta */}
                    <div className="wa2-meta">
                      {m.edited&&!m.deleted&&<span className="wa2-edited">{editedLabel(m)}</span>}
                      {m.viewOnce && <span style={{fontSize:"0.65rem"}}>👁️</span>}
                      {isStarred&&<span style={{fontSize:"0.65rem"}}>⭐</span>}
                      <span className="wa2-time">{fmtTime(m.createdAt)}</span>
                      {isMine&&<span className={"wa2-ticks " + (m.read?"wa2-tick-read":"wa2-tick-sent")}>{m.pending?"🕐":m.read?"✓✓":"✓✓"}</span>}
                    </div>

                    {/* Reaction picker */}
                    {reactId===String(m._id) && (
                      <div className="wa2-react-picker" onClick={e=>e.stopPropagation()}>
                        {REACTIONS.map(e=><span key={e} title={e} onClick={()=>addReaction(String(m._id),e)}>{e}</span>)}
                      </div>
                    )}

                    {/* Context menu */}
                    {menuId===String(m._id) && !m.deleted && (
                      <div className="wa2-menu" onClick={e=>e.stopPropagation()}>
                        <div className="wa2-menu-item" onClick={()=>{setReactId(String(m._id));setMenuId(null);}}>😊 React</div>
                        <div className="wa2-menu-item" onClick={()=>{setReplyTo(m);setMenuId(null);inputRef.current?.focus();}}>↩️ Reply</div>
                        {isMine && !m.image && canEdit(m) && (
                          <div className="wa2-menu-item" onClick={()=>{setEditId(String(m._id));setEditText(m.text);setMenuId(null);}}>✏️ Edit</div>
                        )}
                        <div className="wa2-menu-item" onClick={()=>{navigator.clipboard?.writeText(m.text||"");setMenuId(null);}}>📋 Copy</div>
                        <div className="wa2-menu-item" onClick={()=>{setStarred(s=>{const n=new Set(s);n.has(String(m._id))?n.delete(String(m._id)):n.add(String(m._id));return n;});setMenuId(null);}}>⭐ {starred.has(String(m._id))?"Unstar":"Star"}</div>
                        <div className="wa2-menu-item" onClick={()=>pinMsg(m)}>
                          📌 {isPinned(String(m._id)) ? "Unpin" : "Pin"}
                        </div>
                        {isMine&&<><div className="wa2-menu-sep"/><div className="wa2-menu-item red" onClick={()=>deleteMsg(String(m._id))}>🗑️ Delete</div></>}
                        <div className="wa2-menu-sep"/>
                        <div className="wa2-menu-item" onClick={()=>setMenuId(null)}>✕ Cancel</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing */}
        {typing && (
          <div className="wa2-row in" style={{marginLeft:6}}>
            <div className="wa2-typing-bub">
              <div className="wa2-typ-dot"/><div className="wa2-typ-dot"/><div className="wa2-typ-dot"/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
        {/* Scroll to bottom — anchored inside msgs container */}
        {!atBottom && (
          <button className="wa2-scroll-btn" onClick={()=>{setAtBottom(true);setUnread(0);bottomRef.current?.scrollIntoView({behavior:"smooth"});}}>
            {unread>0 && <span className="wa2-unread-badge">{unread}</span>}
            ↓
          </button>
        )}
      </div>

      {/* Attach menu */}
      {showAttach && (
        <div className="wa2-attach-menu" onClick={e=>e.stopPropagation()}>
          <label className="wa2-attach-item">
            <div className="wa2-attach-item .icon" style={{background:"rgba(189,81,245,0.15)"}}>🖼️</div> Photos & Videos
            <input ref={fileRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={handleFile}/>
          </label>
          <label className="wa2-attach-item">
            <div className="wa2-attach-item .icon" style={{background:"rgba(0,168,132,0.15)"}}>📄</div> Document
            <input type="file" accept=".pdf,.doc,.docx" style={{display:"none"}} onChange={handleFile}/>
          </label>
          <label className="wa2-attach-item">
            <div className="wa2-attach-item .icon" style={{background:"rgba(255,26,110,0.15)"}}>📷</div> Camera
            <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
          </label>
        </div>
      )}

      {/* Reply bar */}
      {replyTo && (
        <div className="wa2-reply-bar">
          <div className="wa2-reply-bar-content">
            <div className="wa2-reply-bar-name">{replyTo.senderName}</div>
            <div className="wa2-reply-bar-text">{replyTo.text||"📷 Photo"}</div>
          </div>
          <span className="wa2-reply-close" onClick={()=>setReplyTo(null)}>✕</span>
        </div>
      )}

      {/* Image preview */}
      {imgPrev && (
        <div className="wa2-img-pre">
          <img src={imgPrev} alt="preview"/>
          <span style={{flex:1,fontSize:"0.8rem",color:"#8696a0",paddingLeft:8}}>Ready to send{viewOnceMode?" (View Once)":""}</span>
          <span className="wa2-img-pre-x" onClick={()=>{setImgPrev(null);if(fileRef.current)fileRef.current.value="";}}>✕</span>
        </div>
      )}

      {/* Quick replies */}
      <div className="wa2-quick">
        {quick.map(q=><button key={q} className="wa2-quick-btn" onClick={()=>sendMsg(q)}>{q}</button>)}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="wa2-emoji-wrap" onClick={e=>e.stopPropagation()}>
          <div className="wa2-emoji-search">
            <input placeholder="Search emoji…" value={emojiQ} onChange={e=>setEmojiQ(e.target.value)} autoFocus/>
          </div>
          <div className="wa2-emoji-grid">
            {filteredEmoji.map(e=><button key={e} className="wa2-emoji-btn" onClick={()=>setInput(v=>v+e)}>{e}</button>)}
          </div>
        </div>
      )}

      {/* Voice recording UI */}
      {recording && (
        <div className="wa2-recording" onClick={e=>e.stopPropagation()}>
          <div className="wa2-rec-dot"/>
          <span className="wa2-rec-timer">{fmtTimer(recSeconds)}</span>
          <button className="wa2-rec-btn wa2-rec-cancel" onClick={cancelRecording}>🗑️ Cancel</button>
          <button className="wa2-rec-btn wa2-rec-send" onClick={sendVoiceNote}>✅ Send</button>
        </div>
      )}

      {/* Input bar */}
      {!recording && (
        <div className="wa2-bar">
          <button className={"wa2-bar-btn " + (showEmoji?"active":"")} onClick={e=>{e.stopPropagation();setShowEmoji(v=>!v);setShowAttach(false);}}>{I("smile",22)}</button>
          <button className={"wa2-bar-btn " + (showAttach?"active":"")} onClick={e=>{e.stopPropagation();setShowAttach(v=>!v);setShowEmoji(false);}}>{I("attach",22)}</button>
          {/* View once toggle (only visible when image selected) */}
          {imgPrev && (
            <button
              className={"wa2-bar-btn " + (viewOnceMode?"active":"")}
              title="View Once"
              onClick={e=>{e.stopPropagation();setViewOnceMode(v=>!v);}}
              style={{fontSize:"1.1rem"}}
            >👁️</button>
          )}
          <textarea
            ref={inputRef}
            className="wa2-inp"
            rows={1}
            placeholder={imgPrev?"Add a caption…":"Message"}
            value={input}
            onChange={e=>{handleInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,96)+"px";}}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),sendMsg())}
            style={{height:"auto"}}
          />
          {input.trim() || imgPrev ? (
            <button className="wa2-send" onClick={()=>sendMsg()} disabled={(!input.trim()&&!imgPrev)||sending}>
              {sending ? I("send",18) : I("send",20)}
            </button>
          ) : (
            <button
              className="wa2-send"
              style={{background:"#1f2c34",boxShadow:"none",border:"1px solid #2a3942"}}
              title="Hold to record voice note"
              onClick={e=>{e.stopPropagation();startRecording();}}
            >
              {I("mic",20,{color:"#00a884"})}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
