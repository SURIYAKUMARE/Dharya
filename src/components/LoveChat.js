import { useState, useEffect, useRef, useCallback } from "react";

const POLL_MS = 3000;

const QUICK = {
  surya:   ["Hi Sadhana 💙","I love you 💖","Missing you 🥺","Good morning ☀️","Good night 🌙","Thinking of you 💭"],
  sadhana: ["Hi Surya 💗","I love you too 💖","Miss you 🥺","Good morning ☀️","Good night 🌙","💗"],
};
const EMOJIS = ["❤️","💙","💗","🥰","😍","😊","🌸","✨","💫","🥺","😂","🤗","💍","🌙","☀️","💌","🎵","🫂"];

function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
}
function fmtDate(d) {
  const dt = new Date(d);
  const today = new Date(); today.setHours(0,0,0,0);
  const yest  = new Date(today); yest.setDate(today.getDate()-1);
  if (dt >= today) return "Today";
  if (dt >= yest)  return "Yesterday";
  return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

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
  const [menuId,     setMenuId]     = useState(null); // long-press menu
  const [imgPreview, setImgPreview] = useState(null); // base64 for pending image
  const [imgFile,    setImgFile]    = useState(null); // eslint-disable-line no-unused-vars

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const fileRef    = useRef(null);
  const allIdsRef  = useRef(new Set());

  const senderName = user === "surya" ? "Surya 💙" : "Sadhana 💗";
  const otherName  = user === "surya" ? "Sadhana 💗" : "Surya 💙";

  /* ── merge helper ── */
  const mergeMessages = (prev, incoming) => {
    const result = [...prev];
    for (const m of incoming) {
      const key = String(m._id);
      if (!allIdsRef.current.has(key)) {
        allIdsRef.current.add(key);
        result.push(m);
      } else {
        const idx = result.findIndex(r => String(r._id) === key);
        if (idx !== -1) result[idx] = m; // update (edited/deleted)
      }
    }
    return result.sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
  };

  /* ── initial load ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
        if (!res.ok) { const t=await res.text(); setError(`Error ${res.status}: ${t}`); setLoading(false); return; }
        const data = await res.json();
        if (Array.isArray(data)) {
          allIdsRef.current = new Set(data.map(m=>String(m._id)));
          setMsgs(data.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)));
          fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({reader:user})});
        }
        setOnline(true); setError("");
      } catch(e) { setError(`Cannot connect: ${e.message}`); setOnline(false); }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── polling ── */
  const poll = useCallback(async () => {
    try {
      const res  = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMsgs(prev => mergeMessages(prev, data));
        if (data.some(m=>m.sender!==user&&!m.read))
          fetch("/api/chat",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({reader:user})});
      }
      setOnline(true);
    } catch { setOnline(false); }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  /* ── scroll ── */
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  /* ── image pick ── */
  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) { alert("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => { setImgPreview(ev.target.result); setImgFile(file); };
    reader.readAsDataURL(file);
  };

  /* ── send ── */
  const send = async (text) => {
    const txt = (text || input).trim();
    if (!txt && !imgPreview) return;
    if (sending) return;
    setInput(""); setSending(true); setShowEmoji(false);

    // Convert file to base64 if needed
    let imageBase64 = imgPreview || null;
    setImgPreview(null); setImgFile(null);
    if (fileRef.current) fileRef.current.value = "";

    const tempId  = "tmp_"+Date.now();
    const tempMsg = { _id:tempId, text:txt, image:imageBase64, sender:user, senderName, createdAt:new Date().toISOString(), read:false, pending:true, edited:false, deleted:false };
    setMsgs(prev=>[...prev,tempMsg]);

    try {
      const res = await fetch("/api/chat",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ text:txt, sender:user, senderName, image:imageBase64 }),
      });
      if (!res.ok) { const t=await res.text(); setError(`Send failed: ${t}`); setMsgs(prev=>prev.filter(m=>m._id!==tempId)); setSending(false); return; }
      const data = await res.json();
      const msg  = data?.msg;
      if (msg) {
        allIdsRef.current.add(String(msg._id));
        setMsgs(prev=>[...prev.filter(m=>m._id!==tempId),{...msg,pending:false}].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)));
      } else {
        setMsgs(prev=>prev.filter(m=>m._id!==tempId));
        await poll();
      }
      setError("");
    } catch(e) { setError(`Error: ${e.message}`); setMsgs(prev=>prev.filter(m=>m._id!==tempId)); }
    setSending(false);
    inputRef.current?.focus();
  };

  /* ── edit message ── */
  const submitEdit = async () => {
    if (!editText.trim() || !editingId) return;
    try {
      await fetch("/api/chat",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:editingId,text:editText}) });
      setMsgs(prev=>prev.map(m=>String(m._id)===editingId?{...m,text:editText.trim(),edited:true}:m));
    } catch {}
    setEditingId(null); setEditText("");
  };

  /* ── delete message ── */
  const deleteMsg = async (id) => {
    try {
      await fetch(`/api/chat?id=${id}`,{method:"DELETE"});
      setMsgs(prev=>prev.map(m=>String(m._id)===id?{...m,deleted:true,text:"",image:null}:m));
    } catch {}
    setMenuId(null);
  };

  /* ── group by date ── */
  const grouped = msgs.reduce((acc,m) => {
    const label = fmtDate(m.createdAt);
    if (!acc[label]) acc[label]=[];
    acc[label].push(m);
    return acc;
  }, {});

  return (
    <div className="wachat-page" onClick={()=>{setMenuId(null);setShowEmoji(false);}}>
      {/* Header */}
      <div className="wachat-header">
        <div className="wachat-avatar">{user==="surya"?"💗":"💙"}</div>
        <div className="wachat-header-info">
          <span className="wachat-name">{otherName}</span>
          <span className="wachat-status">
            {online?<><span className="wachat-online-dot"/>online</>:"connecting..."}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="wachat-messages">
        <div className="wachat-bg"/>
        {error && <div className="wachat-error">⚠️ {error}</div>}
        {loading && <div className="wachat-empty"><div className="wachat-empty-icon">💌</div><p>Loading...</p></div>}

        {!loading && Object.entries(grouped).map(([date,ms])=>(
          <div key={date}>
            <div className="wachat-date-chip">{date}</div>
            {ms.map((m,i)=>{
              const isMine = m.sender===user;
              return (
                <div key={String(m._id)+i} className={`wachat-msg-row ${isMine?"mine":"theirs"}`}>
                  <div
                    className={`wachat-bubble ${isMine?"bubble-mine":"bubble-theirs"} ${m.pending?"bubble-pending":""}`}
                    onContextMenu={e=>{e.preventDefault();if(isMine&&!m.pending)setMenuId(String(m._id));}}
                    onClick={e=>{if(menuId===String(m._id)){e.stopPropagation();return;}}}
                  >
                    {!isMine&&<span className="wachat-sender-name">{m.senderName}</span>}

                    {/* Deleted message */}
                    {m.deleted ? (
                      <p className="wachat-deleted">🚫 This message was deleted</p>
                    ) : editingId===String(m._id) ? (
                      /* Edit inline */
                      <div className="wachat-edit-wrap" onClick={e=>e.stopPropagation()}>
                        <input className="wachat-edit-input" value={editText}
                          onChange={e=>setEditText(e.target.value)}
                          onKeyDown={e=>e.key==="Enter"&&submitEdit()}
                          autoFocus />
                        <div className="wachat-edit-btns">
                          <button onClick={submitEdit}>✓</button>
                          <button onClick={()=>{setEditingId(null);setEditText("");}}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {m.image && <img src={m.image} alt="sent" className="wachat-img" onClick={e=>{e.stopPropagation();window.open(m.image);}} />}
                        {m.text && <p className="wachat-text">{m.text}</p>}
                      </>
                    )}

                    <div className="wachat-meta">
                      <span className="wachat-time">{fmtTime(m.createdAt)}</span>
                      {m.edited&&!m.deleted&&<span className="wachat-edited">edited</span>}
                      {isMine&&<span className="wachat-ticks">{m.pending?"🕐":m.read?"✅":"✔✔"}</span>}
                    </div>

                    {/* Context menu */}
                    {menuId===String(m._id)&&isMine&&!m.deleted&&(
                      <div className="wachat-menu" onClick={e=>e.stopPropagation()}>
                        {!m.image&&(
                          <button onClick={()=>{setEditingId(String(m._id));setEditText(m.text);setMenuId(null);}}>✏️ Edit</button>
                        )}
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

        {!loading&&msgs.length===0&&(
          <div className="wachat-empty">
            <div className="wachat-empty-icon">💌</div>
            <p>No messages yet</p>
            <p>Say hello to {otherName} 👋</p>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Image preview before send */}
      {imgPreview&&(
        <div className="wachat-img-preview">
          <img src={imgPreview} alt="preview"/>
          <button onClick={()=>{setImgPreview(null);setImgFile(null);if(fileRef.current)fileRef.current.value="";}}>✕</button>
        </div>
      )}

      {/* Quick replies */}
      <div className="wachat-quick">
        {QUICK[user||"surya"].map(q=>(
          <button key={q} className="wachat-quick-btn" onClick={()=>send(q)}>{q}</button>
        ))}
      </div>

      {/* Emoji picker */}
      {showEmoji&&(
        <div className="wachat-emoji-picker" onClick={e=>e.stopPropagation()}>
          {EMOJIS.map(e=>(
            <button key={e} className="wachat-emoji-btn" onClick={()=>setInput(i=>i+e)}>{e}</button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="wachat-input-bar">
        <button className="wachat-emoji-toggle" onClick={e=>{e.stopPropagation();setShowEmoji(v=>!v);}}>😊</button>

        {/* Photo attach */}
        <label className="wachat-attach-btn" title="Send photo">
          📷
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImagePick}/>
        </label>

        <input
          ref={inputRef}
          className="wachat-input"
          placeholder={imgPreview?`Add a caption...`:`Message ${otherName}...`}
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
        />
        <button className="wachat-send-btn" onClick={()=>send()} disabled={(!input.trim()&&!imgPreview)||sending}>
          ➤
        </button>
      </div>
    </div>
  );
}
