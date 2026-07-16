import { useState, useEffect, useRef, useCallback } from "react";

const POLL_MS = 3000;

const QUICK = {
  surya:   ["Hi Sadhana 💙", "I love you 💖", "Missing you 🥺", "Good morning ☀️", "Good night 🌙", "Thinking of you 💭"],
  sadhana: ["Hi Surya 💗",   "I love you too 💖", "Miss you 🥺", "Good morning ☀️", "Good night 🌙", "💗"],
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
  const [msgs,      setMsgs]      = useState([]);
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [online,    setOnline]    = useState(true);
  const [loading,   setLoading]   = useState(true);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const allIdsRef  = useRef(new Set()); // track all received _id to avoid duplicates

  const senderName = user === "surya" ? "Surya 💙" : "Sadhana 💗";
  const otherName  = user === "surya" ? "Sadhana 💗" : "Surya 💙";

  /* ── helpers ── */
  const mergeMessages = (prev, incoming) => {
    const result = [...prev];
    for (const m of incoming) {
      const key = String(m._id);
      if (!allIdsRef.current.has(key)) {
        allIdsRef.current.add(key);
        result.push(m);
      } else {
        // update existing (e.g. read flag changed)
        const idx = result.findIndex(r => String(r._id) === key);
        if (idx !== -1) result[idx] = m;
      }
    }
    return result.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  /* ── initial full load ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
        const data = await res.json();
        if (Array.isArray(data)) {
          allIdsRef.current = new Set(data.map(m => String(m._id)));
          setMsgs(data.sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt)));
          // mark as read
          fetch("/api/chat", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ reader: user }) });
        }
        setOnline(true);
      } catch { setOnline(false); }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── polling — fetch everything, merge ── */
  const poll = useCallback(async () => {
    try {
      const res  = await fetch("/api/chat?since=1970-01-01T00:00:00.000Z");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMsgs(prev => mergeMessages(prev, data));
        // mark new messages from other user as read
        const hasNew = data.some(m => m.sender !== user && !m.read);
        if (hasNew) {
          fetch("/api/chat", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ reader: user }) });
        }
      }
      setOnline(true);
    } catch { setOnline(false); }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  /* ── auto scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs]);

  /* ── send ── */
  const send = async (text) => {
    const txt = (text || input).trim();
    if (!txt || sending) return;
    setInput("");
    setSending(true);
    setShowEmoji(false);

    const tempId = "tmp_" + Date.now();
    const tempMsg = { _id: tempId, text: txt, sender: user, senderName, createdAt: new Date().toISOString(), read: false, pending: true };
    setMsgs(prev => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify({ text: txt, sender: user, senderName }),
      });
      if (res.ok) {
        const { msg } = await res.json();
        if (msg) {
          allIdsRef.current.add(String(msg._id));
          setMsgs(prev => [
            ...prev.filter(m => m._id !== tempId),
            { ...msg, pending: false }
          ].sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt)));
        } else {
          setMsgs(prev => prev.filter(m => m._id !== tempId));
          await poll();
        }
      }
    } catch {
      setMsgs(prev => prev.filter(m => m._id !== tempId));
    }
    setSending(false);
    inputRef.current?.focus();
  };

  /* ── group by date ── */
  const grouped = msgs.reduce((acc, m) => {
    const label = fmtDate(m.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(m);
    return acc;
  }, {});

  return (
    <div className="wachat-page">
      {/* Header */}
      <div className="wachat-header">
        <div className="wachat-avatar">{user === "surya" ? "💗" : "💙"}</div>
        <div className="wachat-header-info">
          <span className="wachat-name">{otherName}</span>
          <span className="wachat-status">
            {online ? <><span className="wachat-online-dot" />online</> : "connecting..."}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="wachat-messages" onClick={() => setShowEmoji(false)}>
        <div className="wachat-bg" />

        {loading && (
          <div className="wachat-empty">
            <div className="wachat-empty-icon">💌</div>
            <p>Loading messages...</p>
          </div>
        )}

        {!loading && Object.entries(grouped).map(([date, ms]) => (
          <div key={date}>
            <div className="wachat-date-chip">{date}</div>
            {ms.map((m, i) => {
              const isMine = m.sender === user;
              return (
                <div key={String(m._id)+i} className={`wachat-msg-row ${isMine?"mine":"theirs"}`}>
                  <div className={`wachat-bubble ${isMine?"bubble-mine":"bubble-theirs"} ${m.pending?"bubble-pending":""}`}>
                    {!isMine && <span className="wachat-sender-name">{m.senderName}</span>}
                    <p className="wachat-text">{m.text}</p>
                    <div className="wachat-meta">
                      <span className="wachat-time">{fmtTime(m.createdAt)}</span>
                      {isMine && <span className="wachat-ticks">{m.pending ? "🕐" : m.read ? "✅" : "✔✔"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {!loading && msgs.length === 0 && (
          <div className="wachat-empty">
            <div className="wachat-empty-icon">💌</div>
            <p>No messages yet</p>
            <p>Say hello to {otherName} 👋</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="wachat-quick">
        {QUICK[user || "surya"].map(q => (
          <button key={q} className="wachat-quick-btn" onClick={() => send(q)}>{q}</button>
        ))}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="wachat-emoji-picker">
          {EMOJIS.map(e => (
            <button key={e} className="wachat-emoji-btn" onClick={() => setInput(i => i+e)}>{e}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="wachat-input-bar">
        <button className="wachat-emoji-toggle" onClick={e => { e.stopPropagation(); setShowEmoji(v=>!v); }}>😊</button>
        <input
          ref={inputRef}
          className="wachat-input"
          placeholder={`Message ${otherName}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
        />
        <button className="wachat-send-btn" onClick={() => send()} disabled={!input.trim()||sending}>
          ➤
        </button>
      </div>
    </div>
  );
}
