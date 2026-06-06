import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════
   Surya's pre-written replies mapped to keywords
══════════════════════════════════════════ */
const REPLIES = [
  {
    triggers: ["hi","hello","hey","hii","hai","helo"],
    responses: [
      "Hi fruad 💙 I was just thinking about you...",
      "Hey you! 🥰 My favourite person just showed up.",
      "Hi Sadhana! You made my whole day better just by saying hello 🌸",
    ],
  },
  {
    triggers: ["love you","i love","love u","luv you","love"],
    responses: [
      "I love you more than I'll ever be able to put into words 💙",
      "Not as much as I love you — and that's actually impossible 💍",
      "Every time you say that, my heart does something unexplainable 💓",
    ],
  },
  {
    triggers: ["miss you","missing","miss u","i miss"],
    responses: [
      "I miss you every single second, Sadhana 🌙",
      "The distance doesn't matter — you're always in my heart 💙",
      "Missing you is just my heart's way of loving you even when you're not near 🌸",
    ],
  },
  {
    triggers: ["how are you","how r u","how are u","hows you","how're you"],
    responses: [
      "Better now that you're here 🥰 How are YOU?",
      "I'm always good when I hear from you 💙",
      "Missing you a little extra today, but happy you asked 🌸",
    ],
  },
  {
    triggers: ["beautiful","pretty","cute","gorgeous","lovely"],
    responses: [
      "You know I'm talking about you, right? 😍",
      "You are the most beautiful person I've ever known — inside and out 🌸",
      "Have you seen yourself lately? Because wow 💖",
    ],
  },
  {
    triggers: ["marry me","marry","wedding","wife","husband"],
    responses: [
      "One day, Sadhana. And that day is going to be the best day of my entire life 💍",
      "You're going to be the most beautiful bride in the universe 🌸",
      "I'm already counting down to that day 💙",
    ],
  },
  {
    triggers: ["dream","dreams","future","together"],
    responses: [
      "Our future is going to be so beautiful — I can already see it 🌟",
      "Every dream I have has you in it, Sadhana 💫",
      "We're going to build something extraordinary together 💙",
    ],
  },
  {
    triggers: ["sad","upset","cry","crying","bad day","tired"],
    responses: [
      "Come here 🫂 I've got you. Whatever it is, we'll get through it together.",
      "You don't have to carry it alone. I'm right here 💙",
      "Tell me everything. I'm listening, and I'm not going anywhere 🌸",
    ],
  },
  {
    triggers: ["thank","thanks","thank you","thankyou"],
    responses: [
      "You never have to thank me for loving you 💙",
      "Anything for you, always 🌸",
      "That's what I'm here for — always 💍",
    ],
  },
  {
    triggers: ["night","good night","goodnight","sleep","bye","goodbye","leaving"],
    responses: [
      "Good night, my moon 🌙 Dream of something beautiful.",
      "Sleep well, Sadhana. I'll be thinking of you 💙",
      "Good night fruad 🌸 I'll miss you till morning.",
    ],
  },
  {
    triggers: ["morning","good morning","wake up","woke"],
    responses: [
      "Good morning, my favourite person ☀️ I hope today treats you as well as you deserve.",
      "You woke up today and that already makes the world a better place 🌸",
      "Morning! Did you dream of anything good? 💙",
    ],
  },
  {
    triggers: ["wait","waiting","when","soon"],
    responses: [
      "Every second of waiting is worth it for you 💙",
      "Good things take time — and you are the best thing 🌸",
      "Soon. And when that day comes, it'll be everything 💍",
    ],
  },
];

const FALLBACKS = [
  "I might not have the perfect words right now, but I want you to know — I love you endlessly 💙",
  "Whatever you're thinking about, Sadhana — I'm right here with you 🌸",
  "You could say anything to me and I'd still look at you the same way 💖",
  "I don't always have answers, but I always have love for you 💍",
  "Just talking to you makes everything better 💙",
  "You're my favourite conversation, always 🌸",
];

const BOT_NAME = "Surya 💙";
const TYPING_DELAY_MS = 1200;
const AVATAR = "💙";

function getReply(input) {
  const lower = input.toLowerCase();
  for (const r of REPLIES) {
    if (r.triggers.some(t => lower.includes(t))) {
      return r.responses[Math.floor(Math.random() * r.responses.length)];
    }
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}

const QUICK_MSGS = [
  "Hi Surya 👋", "I love you 💖", "I miss you 🥺",
  "How are you? 🌸", "Good night 🌙", "Good morning ☀️",
];

export default function ChatWithSurya() {
  const [messages, setMessages] = useState([
    {
      id: 1, from: "surya",
      text: "Hey Sadhana 💙 I've been waiting for you. What's on your mind?",
      time: new Date(),
    },
  ]);
  const [input,   setInput]   = useState("");
  const [typing,  setTyping]  = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg = { id: Date.now(), from: "user", text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const reply = getReply(msg);
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now()+1, from: "surya", text: reply, time: new Date() }]);
    }, TYPING_DELAY_MS + Math.random() * 600);

    inputRef.current?.focus();
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-avatar">{AVATAR}</div>
        <div className="chat-header-info">
          <span className="chat-name">{BOT_NAME}</span>
          <span className="chat-status">💚 Always here for you</span>
        </div>
        <div className="chat-header-heart">💌</div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(m => (
          <div key={m.id} className={`chat-msg-row ${m.from === "user" ? "chat-user" : "chat-surya"}`}>
            {m.from === "surya" && <div className="chat-msg-avatar">{AVATAR}</div>}
            <div className="chat-bubble-wrap">
              <div className={`chat-bubble ${m.from === "user" ? "bubble-user" : "bubble-surya"}`}>
                {m.text}
              </div>
              <span className="chat-time">{formatTime(m.time)}</span>
            </div>
          </div>
        ))}

        {typing && (
          <div className="chat-msg-row chat-surya">
            <div className="chat-msg-avatar">{AVATAR}</div>
            <div className="chat-bubble-wrap">
              <div className="chat-bubble bubble-surya chat-typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="chat-quick">
        {QUICK_MSGS.map(q => (
          <button key={q} className="chat-quick-btn" onClick={() => send(q)}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          className="chat-input"
          placeholder="Say something to Surya... 💙"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button className="chat-send-btn" onClick={() => send()} disabled={!input.trim() || typing}>
          ➤
        </button>
      </div>
    </div>
  );
}
