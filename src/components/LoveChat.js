import { useState, useEffect, useRef, useCallback } from "react";

const POLL_INTERVAL = 3000; // poll every 3 seconds for new messages

const QUICK = {
  surya:   ["Hi Sadhana 💙","I love you 💖","Missing you 🥺","Good morning ☀️","Good night 🌙","Thinking of you 💭"],
  sadhana: ["Hi Surya 💗","I love you too 💖","Miss you so much 🥺","Good morning ☀️","Good night 🌙","💗"],
};

const EMOJIS = ["❤️","💙","💗","🥰","😍","😊","🌸","✨","💫","🥺","😂","🤗","💍","🌙","☀️","💌","🎵","🫂"];

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
}
function formatDate(date) {
  const d = new Date(date);
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  if (d >= today) return "Today";
  if (d >= yesterday) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

export default function LoveChat({ user }) {
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [unread,     setUnread]     = useState(0);
  const [online,     setOnline]     = useState(true);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const lastFetch   = useRef(new Date(0));
  const pollRef     = useRef(null);

  const senderName = user === "surya" ? "Surya 💙" : "Sadhana 💗";
  const otherName  = user === "surya" ? "Sadhana 💗" : "Surya 💙";

  // ── Fetch new messages ──────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      const since = lastFetch.current.toISOString();
      const res   = await fetch(`/api/chat?since=${encodeURIComponent(since)}`);
      if (!res.ok) return;
      const newMsgs = await res.json();
      if (newMsgs.length > 0) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m._id));
          const added = newMsgs.filter(m => !ids.has(m._id));
          return [...prev, ...added];
        });
        lastFetch.current = new Date();
        // count unread from other user
        const unreadCount = newMsgs.filter(m => m.sender !== user && !m.read).length;
        setUnread(u => u + unreadCount);
      }
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, [user]);

  // Initial load — fetch all messages
  useEffect(() => {
    const loadAll = async () => {
      try {
        const res  = await fetch("/api/chat?since=1970-01-01");
        const msgs = await res.json();
        setMessages(msgs);
        lastFetch.current = new Date();
      } catch {}
    };
    loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling
  useEffect(() => {
    pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (unread > 0) {
      // mark as read
      fetch("/api/chat", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ reader: user }) });
      setUnread(0);
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send ────────────────────────────────────────────
  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    setShowEmoji(false);

    // Optimistic UI
    const temp = { _id: "tmp_"+Date.now(), text: msg, sender: user, senderName, createdAt: new Date(), read: false, pending: true };
    setMessages(prev => [...prev, temp]);

    try {
      await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: msg, sender: user, senderName }),
      });
      // refresh to get actual _id
      await fetchMessages();
      setMessages(prev => prev.filter(m => m._id !== temp._id));
    } catch {}
    setSending(false);
    inputRef.current?.focus();
  };

  // Group messages by date
  const grouped = messages.reduce((acc, m) => {
    const label = formatDate(m.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(m);
    return acc;
  }, {});

  return (
    <div className="wachat-page">
      {/* Header */}
      <div className="wachat-header">
        <div className="wachat-avatar">
          {user === "surya" ? "💗" : "💙"}
        </div>
        <div className="wachat-header-info">
          <span className="wachat-name">{otherName}</span>
          <span className="wachat-status">
            {online
              ? <><span className="wachat-online-dot" />online</>
              : "connecting..."}
          </span>
        </div>
        {unread > 0 && <div className="wachat-unread-badge">{unread}</div>}
      </div>

      {/* Message area */}
      <div className="wachat-messages" onClick={() => setShowEmoji(false)}>
        {/* Background pattern */}
        <div className="wachat-bg" />

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="wachat-date-chip">{date}</div>
            {msgs.map((m, i) => {
              const isMine = m.sender === user;
              return (
                <div key={m._id || i} className={`wachat-msg-row ${isMine ? "mine" : "theirs"}`}>
                  <div className={`wachat-bubble ${isMine ? "bubble-mine" : "bubble-theirs"} ${m.pending ? "bubble-pending" : ""}`}>
                    {!isMine && <span className="wachat-sender-name">{m.senderName}</span>}
                    <p className="wachat-text">{m.text}</p>
                    <div className="wachat-meta">
                      <span className="wachat-time">{formatTime(m.createdAt)}</span>
                      {isMine && (
                        <span className="wachat-ticks">
                          {m.pending ? "🕐" : m.read ? "✅" : "✔✔"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
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
        {QUICK[user].map(q => (
          <button key={q} className="wachat-quick-btn" onClick={() => send(q)}>{q}</button>
        ))}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="wachat-emoji-picker">
          {EMOJIS.map(e => (
            <button key={e} className="wachat-emoji-btn" onClick={() => setInput(i => i + e)}>{e}</button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="wachat-input-bar">
        <button className="wachat-emoji-toggle" onClick={e => { e.stopPropagation(); setShowEmoji(v => !v); }}>
          😊
        </button>
        <input
          ref={inputRef}
          className="wachat-input"
          placeholder={`Message ${otherName}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button
          className="wachat-send-btn"
          onClick={() => send()}
          disabled={!input.trim() || sending}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
