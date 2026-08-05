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
  background: linear-gradient(135deg,#e8305a,#6b2fa0);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(232,48,90,0.35);
}
.wa-header-info { flex: 1; min-width: 0; }
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

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const fileRef   = useRef(null);
  const allIds    = useRef(new Set());

  injectWaStyles();

  const senderName = user === "surya" ? "Surya 💙" : "Sadhana 💗";
  const otherName  = user === "surya" ? "Sadhana 💗" : "Surya 💙";

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
      {/* Header */}
      <div className="wa-header">
        <div className="wa-avatar">{user==="surya"?"💗":"💙"}</div>
        <div className="wa-header-info">
          <span className="wa-name">{otherName}</span>
          <span className="wa-status">
            {online?<><span className="wa-online-dot"/>online</>:"connecting..."}
          </span>
        </div>
        <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.25)",fontFamily:"'Inter',sans-serif"}}>💑 Dharya</span>
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
