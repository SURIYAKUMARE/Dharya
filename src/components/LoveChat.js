import { useState, useEffect, useRef, useCallback } from "react";

const POLL_MS = 3000;

/* ── Offline AI replies ── */
const OFFLINE_REPLIES = [
  { triggers:["hi","hello","hey","hii","hai"], responses:["Hi fruad 💙 I was just thinking about you...","Hey you! 🥰 My favourite person just showed up.","Hi Sadhana! You made my day better 🌸"] },
  { triggers:["love you","i love","love u","luv"], responses:["I love you more than words can say 💙","Not as much as I love you 💍","Every time you say that, my heart does something unexplainable 💓"] },
  { triggers:["miss you","missing","miss u"], responses:["I miss you every second 🌙","You're always in my heart 💙","Missing you is my heart loving you from a distance 🌸"] },
  { triggers:["how are you","how r u","hows"], responses:["Better now that you're here 🥰","Always good when I hear from you 💙","Missing you a little, but happy you asked 🌸"] },
  { triggers:["sad","upset","cry","tired","bad day"], responses:["Come here 🫂 Whatever it is, we'll get through it.","You don't have to carry it alone 💙","Tell me everything. I'm right here 🌸"] },
  { triggers:["night","good night","goodnight","sleep","bye"], responses:["Good night, my moon 🌙 Dream beautiful dreams.","Sleep well 💙 I'll think of you till morning.","Good night fruad 🌸"] },
  { triggers:["morning","good morning"], responses:["Good morning, my favourite person ☀️","You woke up today — the world is better 🌸","Morning! 💙"] },
];
const FALLBACKS = [
  "I love you endlessly 💙","Right here with you 🌸","You could say anything and I'd still look at you the same 💖","I don't always have answers, but I always have love 💍","Just talking to you makes everything better 💙",
];
function aiReply(text) {
  const lower = text.toLowerCase();
  for (const r of OFFLINE_REPLIES)
    if (r.triggers.some(t => lower.includes(t))) return r.responses[Math.floor(Math.random()*r.responses.length)];
  return FALLBACKS[Math.floor(Math.random()*FALLBACKS.length)];
}

const QUICK = {
  surya:   ["Hi Sadhana 💙","I love you 💖","Missing you 🥺","Good morning ☀️","Good night 🌙","Thinking of you 💭"],
  sadhana: ["Hi Surya 💗","I love you too 💖","Miss you 🥺","Good morning ☀️","Good night 🌙","💗"],
};
const EMOJIS = ["❤️","💙","💗","🥰","😍","😊","🌸","✨","💫","🥺","😂","🤗","💍","🌙","☀️","💌","🎵","🫂","🌹","💐"];

function fmtTime(d) { return new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}); }
function fmtDate(d) {
  const dt = new Date(d), today = new Date(), yest = new Date();
  today.setHours(0,0,0,0); yest.setHours(0,0,0,0); yest.setDate(yest.getDate()-1);
  if (dt >= today) return "Today";
  if (dt >= yest)  return "Yesterday";
  return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}

/* ── WhatsApp-style CSS injected once ── */
const WA_STYLE = `
.wa-page {
  display: flex; flex-direction: column; height: calc(100vh - 130px);
  background: #0b0b13; position: relative; border-radius: 20px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
}
.wa-header {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; background: rgba(9,4,21,0.97);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0; z-index: 10;
}
.wa-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg,#ff1a6e,#8b3fc8);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255,26,110,0.35);
}
.wa-header-info { flex: 1; min-width: 0; }
.wa-call-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: none; cursor: pointer; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
  flex-shrink: 0;
}
.wa-call-btn.voice { background: rgba(37,211,102,0.12); color: #25d366; border: 1px solid rgba(37,211,102,0.3); }
.wa-call-btn.video { background: rgba(255,26,110,0.10); color: #ff1a6e;  border: 1px solid rgba(255,26,110,0.3); }
.wa-call-btn:hover { transform: scale(1.15) translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
.wa-call-btn.voice:hover { background: rgba(37,211,102,0.22); box-shadow: 0 6px 18px rgba(37,211,102,0.3); }
.wa-call-btn.video:hover { background: rgba(255,26,110,0.20); box-shadow: 0 6px 18px rgba(255,26,110,0.3); }

/* ── CALL SCREEN ── */
.call-screen {
  position: fixed; inset: 0; z-index: 9990;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 30% 20%, rgba(37,211,102,0.14) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 80%, rgba(255,26,110,0.14) 0%, transparent 60%),
              #050810;
  backdrop-filter: blur(2px);
}
.call-screen-video {
  background: #050810;
  justify-content: stretch;
}
.call-bg-pulse {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  pointer-events: none;
}
.call-bg-pulse span {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  border-radius: 50%; border: 1px solid rgba(37,211,102,0.2);
  animation: callRipple 2.4s ease-out infinite;
}
.call-bg-pulse span:nth-child(1) { width: 220px; height: 220px; animation-delay: 0s; }
.call-bg-pulse span:nth-child(2) { width: 320px; height: 320px; animation-delay: 0.7s; }
.call-bg-pulse span:nth-child(3) { width: 430px; height: 430px; animation-delay: 1.4s; }
@keyframes callRipple {
  0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.8; }
  100% { transform: translate(-50%,-50%) scale(1.2); opacity: 0; }
}
.call-avatar {
  width: 110px; height: 110px; border-radius: 50%;
  background: linear-gradient(135deg, #ff1a6e, #8b3fc8);
  display: flex; align-items: center; justify-content: center;
  font-size: 3.2rem; position: relative; z-index: 1;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5);
  animation: floatEmoji 3s ease-in-out infinite alternate;
}
.call-avatar.ringing { animation: callAvatarPulse 1s ease-in-out infinite; }
@keyframes callAvatarPulse {
  0%,100% { box-shadow: 0 0 0 4px rgba(37,211,102,0.3), 0 20px 60px rgba(0,0,0,0.5); }
  50%     { box-shadow: 0 0 0 14px rgba(37,211,102,0.12), 0 20px 60px rgba(0,0,0,0.5); }
}
.call-name {
  font-family: 'Cormorant Garamond', serif; font-size: 2rem;
  font-weight: 600; font-style: italic; color: #fff;
  margin: 18px 0 6px; text-shadow: 0 0 30px rgba(255,26,110,0.3); z-index: 1;
}
.call-status {
  font-family: 'Inter', sans-serif; font-size: 0.88rem;
  color: rgba(255,255,255,0.5); z-index: 1; display: flex; align-items: center; gap: 6px;
}
.call-status .dot { width: 7px; height: 7px; border-radius: 50%; background: #25d366; animation: dotBlink2 1.2s ease-in-out infinite; }
.call-timer {
  font-family: 'Inter', sans-serif; font-size: 1.1rem; font-weight: 600;
  color: rgba(255,255,255,0.7); z-index: 1; margin-top: 4px;
  letter-spacing: 2px; font-variant-numeric: tabular-nums;
}

/* video panels */
.call-video-remote {
  flex: 1; width: 100%; background: #000; object-fit: cover;
  display: block;
}
.call-video-local {
  position: absolute; bottom: 120px; right: 16px;
  width: 110px; height: 150px; border-radius: 14px;
  object-fit: cover; border: 2px solid rgba(255,255,255,0.15);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  background: #111; z-index: 2;
}
.call-video-off {
  flex: 1; width: 100%; display: flex; align-items: center; justify-content: center;
  font-size: 4rem;
}

/* action buttons */
.call-actions {
  display: flex; gap: 18px; align-items: center; justify-content: center;
  padding: 28px 20px 36px; z-index: 2; position: relative;
  flex-shrink: 0;
}
.call-act-btn {
  width: 58px; height: 58px; border-radius: 50%; border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}
.call-act-btn:hover { transform: scale(1.12) translateY(-3px); }
.call-act-btn.mute   { background: rgba(255,255,255,0.12); color: #fff; }
.call-act-btn.cam    { background: rgba(255,255,255,0.12); color: #fff; }
.call-act-btn.end    { background: linear-gradient(135deg,#ef4444,#b91c1c); color: #fff; width: 68px; height: 68px; font-size: 1.6rem; box-shadow: 0 8px 28px rgba(239,68,68,0.55); }
.call-act-btn.speaker { background: rgba(255,255,255,0.12); color: #fff; }
.call-act-btn.active { background: rgba(37,211,102,0.2); color: #25d366; border: 1px solid rgba(37,211,102,0.4); }

/* incoming call toast */
.incoming-call-toast {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
  z-index: 9995; background: rgba(9,4,21,0.97);
  border: 1.5px solid rgba(37,211,102,0.4);
  border-radius: 20px; padding: 16px 20px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 16px 50px rgba(0,0,0,0.6), 0 0 30px rgba(37,211,102,0.15);
  backdrop-filter: blur(20px); min-width: 280px;
  animation: slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0); opacity: 1; }
}
.incoming-info { flex: 1; }
.incoming-type { font-size: 0.68rem; font-weight: 700; color: #25d366; text-transform: uppercase; letter-spacing: 1px; }
.incoming-name { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-style: italic; color: #fff; margin: 2px 0 0; }
.incoming-btns { display: flex; gap: 10px; }
.incoming-btns button { width: 44px; height: 44px; border-radius: 50%; border: none; font-size: 1.3rem; cursor: pointer; transition: all 0.2s; }
.incoming-btns .accept { background: linear-gradient(135deg,#25d366,#128c7e); box-shadow: 0 4px 14px rgba(37,211,102,0.5); animation: callAvatarPulse 1.2s ease-in-out infinite; }
.incoming-btns .decline { background: linear-gradient(135deg,#ef4444,#b91c1c); box-shadow: 0 4px 14px rgba(239,68,68,0.4); }
.wa-name { font-family: 'Inter',sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wa-status { font-family: 'Inter',sans-serif; font-size: 0.72rem; color: rgba(255,255,255,0.45); display: flex; align-items: center; gap: 5px; }
.wa-online-dot { width: 6px; height: 6px; border-radius: 50%; background: #25d366; display: inline-block; animation: dotBlink2 2s ease-in-out infinite; }
@keyframes dotBlink2 { 0%,100%{opacity:1} 50%{opacity:0.4} }

.wa-bg {
  position: absolute; inset: 0; opacity: 0.025; pointer-events: none; z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8305a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.wa-messages {
  flex: 1; overflow-y: auto; padding: 16px 12px;
  display: flex; flex-direction: column; gap: 3px;
  position: relative; z-index: 1;
  scroll-behavior: smooth;
}
.wa-messages::-webkit-scrollbar { width: 3px; }
.wa-messages::-webkit-scrollbar-thumb { background: rgba(232,48,90,0.3); border-radius: 2px; }

.wa-date-chip {
  text-align: center; margin: 10px 0 6px;
  display: flex; align-items: center; justify-content: center;
}
.wa-date-chip span {
  font-family: 'Inter',sans-serif; font-size: 0.68rem; color: rgba(255,255,255,0.45);
  background: rgba(255,255,255,0.07); padding: 3px 12px; border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.07);
}

.wa-row { display: flex; margin-bottom: 2px; padding: 0 4px; }
.wa-row.mine    { justify-content: flex-end; }
.wa-row.theirs  { justify-content: flex-start; }

.wa-bubble {
  max-width: 72%; padding: 9px 12px 6px;
  border-radius: 18px; position: relative;
  word-break: break-word; cursor: default;
  transition: opacity 0.2s;
}
.wa-bubble.mine {
  background: linear-gradient(135deg,#e8305a,#8b0040);
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(232,48,90,0.35);
  color: #fff;
}
.wa-bubble.theirs {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
  border-bottom-left-radius: 4px;
  backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.9);
}
.wa-bubble.pending { opacity: 0.65; }
.wa-sender { font-family: 'Inter',sans-serif; font-size: 0.65rem; font-weight: 700; color: #e8bb6e; display: block; margin-bottom: 3px; }
.wa-text { font-family: 'Inter',sans-serif; font-size: 0.92rem; line-height: 1.45; margin: 0; }
.wa-deleted { font-family: 'Inter',sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.35); font-style: italic; margin: 0; }
.wa-img { max-width: 200px; border-radius: 10px; display: block; margin-bottom: 4px; cursor: pointer; }
.wa-meta {
  display: flex; align-items: center; justify-content: flex-end; gap: 4px;
  margin-top: 3px;
}
.wa-time { font-family: 'Inter',sans-serif; font-size: 0.62rem; opacity: 0.55; }
.wa-edited { font-family: 'Inter',sans-serif; font-size: 0.6rem; opacity: 0.5; font-style: italic; }
.wa-ticks { font-size: 0.7rem; }
.wa-menu {
  position: absolute; right: 0; top: calc(100% + 4px);
  background: rgba(9,4,21,0.98); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 6px; z-index: 50;
  display: flex; flex-direction: column; gap: 2px; min-width: 130px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
}
.wa-menu button {
  padding: 8px 14px; border-radius: 8px; border: none; background: transparent;
  color: rgba(255,255,255,0.75); font-family: 'Inter',sans-serif; font-size: 0.82rem;
  cursor: pointer; text-align: left; transition: background 0.15s; display: flex; align-items: center; gap: 6px;
}
.wa-menu button:hover { background: rgba(255,255,255,0.08); }
.wa-edit-wrap { display: flex; flex-direction: column; gap: 6px; }
.wa-edit-input {
  padding: 6px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-family: 'Inter',sans-serif; font-size: 0.88rem; outline: none; width: 100%; box-sizing: border-box;
}
.wa-edit-btns { display: flex; gap: 6px; }
.wa-edit-btns button {
  padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer;
  font-family: 'Inter',sans-serif; font-size: 0.78rem; font-weight: 700;
}
.wa-edit-btns button:first-child { background: #25d366; color: #fff; }
.wa-edit-btns button:last-child  { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }

.wa-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 10px; color: rgba(255,255,255,0.35); font-family: 'Inter',sans-serif; font-size: 0.9rem; padding: 40px; text-align: center; }
.wa-empty-icon { font-size: 3rem; }

.wa-img-preview {
  flex-shrink: 0; padding: 8px 12px;
  background: rgba(9,4,21,0.95); border-top: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; gap: 10px; z-index: 10;
}
.wa-img-preview img { height: 52px; border-radius: 8px; object-fit: cover; }
.wa-img-preview button { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 0.85rem; flex-shrink: 0; }

.wa-quick {
  flex-shrink: 0; display: flex; gap: 6px; overflow-x: auto;
  padding: 6px 10px; background: rgba(9,4,21,0.9);
  border-top: 1px solid rgba(255,255,255,0.05); z-index: 10;
}
.wa-quick::-webkit-scrollbar { display: none; }
.wa-quick-btn {
  flex-shrink: 0; padding: 5px 12px; border-radius: 50px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.65); font-family: 'Inter',sans-serif; font-size: 0.75rem;
  cursor: pointer; white-space: nowrap; transition: all 0.18s;
}
.wa-quick-btn:hover { background: rgba(232,48,90,0.15); border-color: rgba(232,48,90,0.3); color: #ff6b8e; }

.wa-emoji-picker {
  flex-shrink: 0; display: flex; flex-wrap: wrap; gap: 4px;
  padding: 10px 12px; background: rgba(9,4,21,0.95);
  border-top: 1px solid rgba(255,255,255,0.07); z-index: 10;
  max-height: 130px; overflow-y: auto;
}
.wa-emoji-btn { font-size: 1.35rem; background: none; border: none; cursor: pointer; padding: 3px; border-radius: 6px; transition: transform 0.15s; }
.wa-emoji-btn:hover { transform: scale(1.3); }

.wa-input-bar {
  flex-shrink: 0; display: flex; align-items: flex-end; gap: 8px;
  padding: 10px 12px 10px; background: rgba(9,4,21,0.97);
  border-top: 1px solid rgba(255,255,255,0.07); z-index: 10;
}
.wa-attach-btn {
  width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
  flex-shrink: 0; transition: all 0.18s;
}
.wa-attach-btn:hover { background: rgba(232,48,90,0.15); border-color: rgba(232,48,90,0.3); }
.wa-emoji-toggle {
  width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
  flex-shrink: 0; transition: all 0.18s;
}
.wa-emoji-toggle:hover { background: rgba(232,48,90,0.15); }
.wa-input {
  flex: 1; padding: 10px 16px; border-radius: 22px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; font-family: 'Inter',sans-serif; font-size: 0.92rem;
  outline: none; resize: none; max-height: 100px; line-height: 1.45;
  transition: border-color 0.2s, background 0.2s;
}
.wa-input::placeholder { color: rgba(255,255,255,0.35); }
.wa-input:focus { border-color: rgba(232,48,90,0.4); background: rgba(255,255,255,0.09); }
.wa-send-btn {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg,#e8305a,#8b0040); border: none;
  color: #fff; font-size: 1.1rem; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(232,48,90,0.5); transition: all 0.2s;
}
.wa-send-btn:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 6px 20px rgba(232,48,90,0.65); }
.wa-send-btn:disabled { opacity: 0.4; cursor: default; }
.wa-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; font-family: 'Inter',sans-serif; font-size: 0.8rem; padding: 8px 12px; border-radius: 10px; margin-bottom: 8px; }
`;

function injectWaStyles() {
  if (document.getElementById("wa-chat-styles")) return;
  const s = document.createElement("style"); s.id = "wa-chat-styles"; s.textContent = WA_STYLE;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════
   WEBRTC CALL HOOK
══════════════════════════════════════ */
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function useCallSignal(room, onSignal) {
  const sinceRef = useRef(new Date().toISOString());
  const timerRef = useRef(null);

  const send = useCallback(async (from, type, data) => {
    try {
      await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, from, type, data }),
      });
    } catch (e) { console.warn("signal send failed", e); }
  }, [room]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/signal?room=${room}&since=${sinceRef.current}`);
        if (!res.ok) return;
        const items = await res.json();
        if (items.length) {
          sinceRef.current = items[items.length - 1].createdAt;
          items.forEach(onSignal);
        }
      } catch {}
    };
    timerRef.current = setInterval(poll, 1500);
    return () => clearInterval(timerRef.current);
  }, [room, onSignal]);

  return { send };
}

/* ══════════════════════════════════════
   CALL SCREEN COMPONENT
══════════════════════════════════════ */
function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function CallScreen({ user, otherName, mode, onEnd }) {
  const [callState, setCallState]   = useState("ringing"); // ringing | connected | ended
  const [muted,     setMuted]       = useState(false);
  const [camOff,    setCamOff]      = useState(false);
  const [speaker,   setSpeaker]     = useState(true);
  const [elapsed,   setElapsed]     = useState(0);

  const pcRef        = useRef(null);
  const localRef     = useRef(null); // eslint-disable-line no-unused-vars
  const remoteRef    = useRef(null);
  const localStream  = useRef(null);
  const remoteVidRef = useRef(null);
  const localVidRef  = useRef(null);
  const timerRef     = useRef(null);

  const room = "call_dharya_2026";

  const handleSignal = useCallback(async (sig) => {
    if (sig.from === user) return;
    const pc = pcRef.current;
    if (!pc) return;

    if (sig.type === "offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send(user, "answer", answer);
    } else if (sig.type === "answer") {
      if (pc.signalingState !== "stable")
        await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
    } else if (sig.type === "ice") {
      try { await pc.addIceCandidate(new RTCIceCandidate(sig.data)); } catch {}
    } else if (sig.type === "end") {
      cleanup(); onEnd();
    }
  }, [user]); // eslint-disable-line

  const { send } = useCallSignal(room, handleSignal);

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
    if (pcRef.current) { try { pcRef.current.close(); } catch {} pcRef.current = null; }
    fetch(`/api/signal?room=${room}`, { method: "DELETE" }).catch(() => {});
  }, [room]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const constraints = mode === "video"
          ? { audio: true, video: { facingMode: "user" } }
          : { audio: true, video: false };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        localStream.current = stream;

        if (localVidRef.current && mode === "video") {
          localVidRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          remoteRef.current = e.streams[0];
          if (remoteVidRef.current) remoteVidRef.current.srcObject = e.streams[0];
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) send(user, "ice", e.candidate);
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setCallState("connected");
            timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
          }
          if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
            setCallState("ended");
            cleanup(); setTimeout(onEnd, 800);
          }
        };

        // Caller creates offer
        if (user === "surya") {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send(user, "offer", offer);
        }

        setCallState("ringing");
      } catch (err) {
        console.warn("Media error:", err.message);
        // No camera/mic — still show UI
        setCallState("ringing");
      }
    })();
    return () => { cancelled = true; cleanup(); };
  }, []); // eslint-disable-line

  const toggleMute = () => {
    if (localStream.current)
      localStream.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };
  const toggleCam = () => {
    if (localStream.current)
      localStream.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOff(c => !c);
  };
  const endCall = () => {
    send(user, "end", {});
    cleanup(); onEnd();
  };

  const isVideo = mode === "video";
  const isConnected = callState === "connected";

  return (
    <div className={`call-screen ${isVideo ? "call-screen-video" : ""}`}>
      {/* Background pulse rings — voice only */}
      {!isVideo && (
        <div className="call-bg-pulse">
          <span/><span/><span/>
        </div>
      )}

      {isVideo ? (
        /* ── Video layout ── */
        <>
          {remoteRef.current
            ? <video ref={remoteVidRef} className="call-video-remote" autoPlay playsInline />
            : <div className="call-video-off" style={{ background:"#050810" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"4rem", marginBottom:12 }}>
                    {user === "surya" ? "💗" : "💚"}
                  </div>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>
                    {isConnected ? "Camera off" : "Connecting..."}
                  </p>
                </div>
              </div>
          }
          {mode === "video" && <video ref={localVidRef} className="call-video-local" autoPlay muted playsInline />}
          {/* Overlay name + timer */}
          <div style={{ position:"absolute", top:20, left:0, right:0, textAlign:"center", zIndex:3 }}>
            <div className="call-name" style={{ fontSize:"1.4rem" }}>{otherName}</div>
            {isConnected
              ? <div className="call-timer">{fmt(elapsed)}</div>
              : <div className="call-status"><span className="dot"/>{callState === "ringing" ? "Ringing..." : "Connecting..."}</div>
            }
          </div>
        </>
      ) : (
        /* ── Voice layout ── */
        <>
          <div className={`call-avatar ${callState === "ringing" ? "ringing" : ""}`}>
            {user === "surya" ? "💗" : "💚"}
          </div>
          <div className="call-name">{otherName}</div>
          {isConnected
            ? <div className="call-timer">{fmt(elapsed)}</div>
            : <div className="call-status">
                <span className="dot"/>
                {callState === "ringing" ? "Ringing..." : "Connecting..."}
              </div>
          }
        </>
      )}

      {/* Action buttons */}
      <div className="call-actions">
        <button className={`call-act-btn mute ${muted ? "active" : ""}`} onClick={toggleMute} title={muted?"Unmute":"Mute"}>
          {muted ? "🔇" : "🎤"}
        </button>
        {isVideo && (
          <button className={`call-act-btn cam ${camOff ? "active" : ""}`} onClick={toggleCam} title={camOff?"Cam on":"Cam off"}>
            {camOff ? "📵" : "📹"}
          </button>
        )}
        <button className="call-act-btn end" onClick={endCall} title="End call">📵</button>
        {!isVideo && (
          <button className={`call-act-btn speaker ${speaker ? "active" : ""}`} onClick={()=>setSpeaker(v=>!v)} title="Speaker">
            {speaker ? "🔊" : "🔈"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoveChat({ user }) {
  const [msgs,      setMsgs]      = useState([]);
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [online,    setOnline]    = useState(true);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText,  setEditText]  = useState("");
  const [menuId,    setMenuId]    = useState(null);
  const [imgPreview,setImgPreview]= useState(null);
  // ── Call state ──
  const [callMode,    setCallMode]    = useState(null);      // null | "voice" | "video"
  const [incomingCall,setIncomingCall]= useState(null);      // { from, mode } | null
  const [callActive,  setCallActive]  = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const fileRef   = useRef(null);
  const allIds    = useRef(new Set());

  injectWaStyles();

  const senderName = user === "surya" ? "Surya 💙" : "Sadhana 💗";
  const otherName  = user === "surya" ? "Sadhana 💗" : "Surya 💙";
  const callRoom   = "call_dharya_2026";

  /* ── Start a call: signal the other person ── */
  const startCall = useCallback(async (mode) => {
    setCallMode(mode);
    setCallActive(true);
    // signal the other side
    try {
      await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: callRoom, from: user, type: "incoming_call", data: { mode } }),
      });
    } catch {}
  }, [user, callRoom]);

  /* ── Poll for incoming call signals (separate from WebRTC ICE signals) ── */
  const incomingSinceRef = useRef(new Date().toISOString());
  useEffect(() => {
    const id = setInterval(async () => {
      if (callActive) return; // already in call
      try {
        const res = await fetch(`/api/signal?room=${callRoom}&since=${incomingSinceRef.current}`);
        if (!res.ok) return;
        const items = await res.json();
        for (const sig of items) {
          incomingSinceRef.current = sig.createdAt;
          if (sig.from !== user && sig.type === "incoming_call" && !callActive) {
            setIncomingCall({ from: sig.from, mode: sig.data?.mode || "voice" });
            setTimeout(() => setIncomingCall(null), 30000); // auto-dismiss after 30s
          }
          if (sig.from !== user && sig.type === "end" && callActive) {
            setCallActive(false); setCallMode(null);
          }
        }
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [user, callActive, callRoom]);

  const merge = (prev, incoming) => {
    const result = [...prev];
    for (const m of incoming) {
      const key = String(m._id);
      if (!allIds.current.has(key)) { allIds.current.add(key); result.push(m); }
      else { const i = result.findIndex(r => String(r._id)===key); if (i!==-1) result[i]=m; }
    }
    return result.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  };

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          allIds.current = new Set(data.map(m=>String(m._id)));
          setMsgs(data.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)));
          fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({reader:user})});
        }
        setOnline(true);
      } catch {
        setOnline(false);
        const welcome = {
          _id:"offline_w", text: user==="surya"
            ? "Hey Surya 🌿 (Offline — messages sync when reconnected)"
            : "Hey Sadhana 💙 I was just thinking about you... (Offline mode)",
          sender: user==="surya"?"sadhana":"surya", senderName: user==="surya"?"Sadhana 💗":"Surya 💙",
          createdAt:new Date().toISOString(), read:true, edited:false, deleted:false,
        };
        allIds.current.add("offline_w");
        setMsgs([welcome]);
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  const poll = useCallback(async () => {
    try {
      const res  = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMsgs(prev => merge(prev, data));
        if (data.some(m=>m.sender!==user&&!m.read))
          fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({reader:user})});
      }
      setOnline(true);
    } catch { setOnline(false); }
  }, [user]); // eslint-disable-line

  useEffect(() => { const id=setInterval(poll,POLL_MS); return ()=>clearInterval(id); }, [poll]);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size>2*1024*1024){alert("Max 2MB");return;}
    const r=new FileReader(); r.onload=ev=>setImgPreview(ev.target.result); r.readAsDataURL(file);
  };

  const send = async (text) => {
    const txt=(text||input).trim();
    if(!txt&&!imgPreview) return;
    if(sending) return;
    setInput(""); setSending(true); setShowEmoji(false);
    const img=imgPreview||null; setImgPreview(null);
    if(fileRef.current) fileRef.current.value="";
    const tempId="tmp_"+Date.now();
    const tempMsg={_id:tempId,text:txt,image:img,sender:user,senderName,createdAt:new Date().toISOString(),read:false,pending:true,edited:false,deleted:false};
    setMsgs(prev=>[...prev,tempMsg]);

    if(!online){
      setTimeout(()=>{
        const ai={_id:"ai_"+Date.now(),text:aiReply(txt),image:null,sender:user==="surya"?"sadhana":"surya",
          senderName:user==="surya"?"Sadhana 💗":"Surya 💙",createdAt:new Date().toISOString(),read:true,pending:false,edited:false,deleted:false};
        setMsgs(prev=>[...prev.map(m=>m._id===tempId?{...m,pending:false}:m),ai]);
        setSending(false);
      },1200+Math.random()*800);
      return;
    }

    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:txt,sender:user,senderName,image:img})});
      if(!res.ok){const t=await res.text();setError(`Send failed: ${t}`);setMsgs(prev=>prev.filter(m=>m._id!==tempId));setSending(false);return;}
      const data=await res.json(); const msg=data?.msg;
      if(msg){allIds.current.add(String(msg._id));setMsgs(prev=>[...prev.filter(m=>m._id!==tempId),{...msg,pending:false}].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)));}
      else{setMsgs(prev=>prev.filter(m=>m._id!==tempId));await poll();}
      setError("");
    } catch(e){setError(`Error: ${e.message}`);setMsgs(prev=>prev.filter(m=>m._id!==tempId));}
    setSending(false); inputRef.current?.focus();
  };

  const submitEdit = async () => {
    if(!editText.trim()||!editingId) return;
    try{await fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editingId,text:editText})});
    setMsgs(prev=>prev.map(m=>String(m._id)===editingId?{...m,text:editText.trim(),edited:true}:m));}catch{}
    setEditingId(null);setEditText("");
  };

  const deleteMsg = async (id) => {
    try{await fetch(`/api/chat?id=${id}`,{method:"DELETE"});
    setMsgs(prev=>prev.map(m=>String(m._id)===id?{...m,deleted:true,text:"",image:null}:m));}catch{}
    setMenuId(null);
  };

  const grouped = msgs.reduce((acc,m)=>{
    const label=fmtDate(m.createdAt);
    if(!acc[label]) acc[label]=[];
    acc[label].push(m); return acc;
  },{});

  return (
    <div className="wa-page" onClick={()=>{setMenuId(null);setShowEmoji(false);}}>
      {/* ── Active call screen overlay ── */}
      {callActive && callMode && (
        <CallScreen
          user={user}
          otherName={otherName}
          mode={callMode}
          onEnd={() => { setCallActive(false); setCallMode(null); }}
        />
      )}

      {/* ── Incoming call toast ── */}
      {incomingCall && !callActive && (
        <div className="incoming-call-toast">
          <div style={{ fontSize:"2rem" }}>{incomingCall.mode === "video" ? "📹" : "📞"}</div>
          <div className="incoming-info">
            <div className="incoming-type">{incomingCall.mode === "video" ? "Video Call" : "Voice Call"}</div>
            <div className="incoming-name">{otherName}</div>
          </div>
          <div className="incoming-btns">
            <button className="accept" onClick={() => { setIncomingCall(null); setCallMode(incomingCall.mode); setCallActive(true); }}>📞</button>
            <button className="decline" onClick={() => { setIncomingCall(null); fetch("/api/signal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({room:callRoom,from:user,type:"end",data:{}})}); }}>📵</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="wa-header">
        <div className="wa-avatar">{user==="surya"?"💗":"💚"}</div>
        <div className="wa-header-info">
          <span className="wa-name">{otherName}</span>
          <span className="wa-status">
            {online?<><span className="wa-online-dot"/>online</>:"connecting..."}
          </span>
        </div>
        {/* Voice call button */}
        <button className="wa-call-btn voice" title="Voice call" onClick={() => startCall("voice")}>📞</button>
        {/* Video call button */}
        <button className="wa-call-btn video" title="Video call" onClick={() => startCall("video")}>📹</button>
      </div>

      {/* Messages */}
      <div className="wa-messages">
        <div className="wa-bg"/>
        {error && <div className="wa-error">⚠️ {error}</div>}
        {loading && <div className="wa-empty"><div className="wa-empty-icon">💌</div><p>Loading chat…</p></div>}

        {!loading && Object.entries(grouped).map(([date,ms])=>(
          <div key={date}>
            <div className="wa-date-chip"><span>{date}</span></div>
            {ms.map((m,i)=>{
              const isMine=m.sender===user;
              return (
                <div key={String(m._id)+i} className={`wa-row ${isMine?"mine":"theirs"}`}>
                  <div
                    className={`wa-bubble ${isMine?"mine":"theirs"} ${m.pending?"pending":""}`}
                    onContextMenu={e=>{e.preventDefault();if(isMine&&!m.pending)setMenuId(String(m._id));}}
                    onClick={e=>{if(menuId===String(m._id)){e.stopPropagation();}}}
                  >
                    {!isMine&&<span className="wa-sender">{m.senderName}</span>}
                    {m.deleted?(
                      <p className="wa-deleted">🚫 This message was deleted</p>
                    ):editingId===String(m._id)?(
                      <div className="wa-edit-wrap" onClick={e=>e.stopPropagation()}>
                        <input className="wa-edit-input" value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitEdit()} autoFocus/>
                        <div className="wa-edit-btns">
                          <button onClick={submitEdit}>✓ Save</button>
                          <button onClick={()=>{setEditingId(null);setEditText("");}}>✕</button>
                        </div>
                      </div>
                    ):(
                      <>
                        {m.image&&<img src={m.image} alt="sent" className="wa-img" onClick={e=>{e.stopPropagation();window.open(m.image);}}/>}
                        {m.text&&<p className="wa-text">{m.text}</p>}
                      </>
                    )}
                    <div className="wa-meta">
                      <span className="wa-time">{fmtTime(m.createdAt)}</span>
                      {m.edited&&!m.deleted&&<span className="wa-edited">edited</span>}
                      {isMine&&<span className="wa-ticks">{m.pending?"🕐":m.read?"✅":"✔✔"}</span>}
                    </div>
                    {menuId===String(m._id)&&isMine&&!m.deleted&&(
                      <div className="wa-menu" onClick={e=>e.stopPropagation()}>
                        {!m.image&&<button onClick={()=>{setEditingId(String(m._id));setEditText(m.text);setMenuId(null);}}>✏️ Edit</button>}
                        <button onClick={()=>deleteMsg(String(m._id))}>🗑️ Delete</button>
                        <button onClick={()=>setMenuId(null)}>✕ Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {!loading&&msgs.length===0&&<div className="wa-empty"><div className="wa-empty-icon">💌</div><p>No messages yet</p><p>Say hello to {otherName} 👋</p></div>}
        <div ref={bottomRef}/>
      </div>

      {imgPreview&&(
        <div className="wa-img-preview">
          <img src={imgPreview} alt="preview"/>
          <span style={{fontFamily:"'Inter',sans-serif",fontSize:"0.78rem",color:"rgba(255,255,255,0.5)",flex:1,paddingLeft:"8px"}}>Ready to send</span>
          <button onClick={()=>{setImgPreview(null);if(fileRef.current)fileRef.current.value="";}}>✕</button>
        </div>
      )}

      {/* Quick replies */}
      <div className="wa-quick">
        {QUICK[user||"surya"].map(q=>(
          <button key={q} className="wa-quick-btn" onClick={()=>send(q)}>{q}</button>
        ))}
      </div>

      {/* Emoji picker */}
      {showEmoji&&(
        <div className="wa-emoji-picker" onClick={e=>e.stopPropagation()}>
          {EMOJIS.map(e=>(
            <button key={e} className="wa-emoji-btn" onClick={()=>setInput(i=>i+e)}>{e}</button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="wa-input-bar">
        <button className="wa-emoji-toggle" onClick={e=>{e.stopPropagation();setShowEmoji(v=>!v);}}>😊</button>
        <label className="wa-attach-btn" title="Send photo">
          📷<input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
        </label>
        <input
          ref={inputRef}
          className="wa-input"
          placeholder={imgPreview?"Add a caption…":`Message ${otherName}…`}
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
        />
        <button className="wa-send-btn" onClick={()=>send()} disabled={(!input.trim()&&!imgPreview)||sending}>
          ➤
        </button>
      </div>
    </div>
  );
}
