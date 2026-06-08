import { useState, useEffect } from "react";

/* ══════════════════════════════════════════
   Thoughts mapped to time of day
══════════════════════════════════════════ */
const THOUGHTS_BY_TIME = {
  morning: [
    "Good morning, Sadhana... I wonder if she's awake yet ☀️",
    "I hope her day starts beautifully — she deserves nothing less 🌸",
    "The first thing I thought of when I opened my eyes was her face 💙",
    "I should text her something nice this morning... let me think of the perfect words 💭",
    "She's probably still sleeping. I love that she gets rest 🌙",
    "Every morning feels different since she's in my life ✨",
  ],
  afternoon: [
    "I wonder what she's doing right now 💭",
    "I hope she ate something good today 🍱",
    "Somewhere in this city, she's going about her day — and I think about that a lot 💙",
    "I keep thinking about the future we're building together 🏡",
    "She's probably smiling at something right now. I love her smile 🌸",
    "I was in the middle of something and her name just appeared in my head again 💗",
  ],
  evening: [
    "The day is ending and she's the highlight of it 🌅",
    "I want to tell her how much I appreciate her — I should say it more 💙",
    "The sky tonight looks beautiful. I wish she could see it too 🌇",
    "I'm already looking forward to tomorrow just because she'll be in it 🌟",
    "Today was good. But everything is better when she's around 💗",
    "I keep replaying our last conversation and smiling at random 😊",
  ],
  night: [
    "Goodnight, Sadhana... wherever you are, I hope you feel safe and loved 🌙",
    "The stars are out. I named my favourite one after her 💫",
    "I wonder if she's thinking about me too right now 💭",
    "It's late and I'm still thinking about the future with her 💍",
    "She has no idea how often she crosses my mind 💙",
    "I fall asleep most nights with her name being the last thing I think of 🌸",
  ],
};

const SURYA_FACTS = [
  { emoji: "📖", fact: "Surya has mentally planned their wedding 47+ times" },
  { emoji: "🌙", fact: "He checks the time at night just to wonder if she's awake" },
  { emoji: "💭", fact: "Her name appears in his thoughts at least once every few minutes" },
  { emoji: "🎵", fact: "He can't hear certain songs without thinking of her" },
  { emoji: "📝", fact: "He once wrote her name 200+ times in his notebook without realising" },
  { emoji: "🌟", fact: "He has a list of things he wants to show her someday" },
  { emoji: "☕", fact: "Every time he has tea he wonders if she'd like the same kind" },
  { emoji: "🌅", fact: "He looks at sunsets and imagines watching them with her" },
];

function getTimeSlot() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export default function SuryaMind() {
  const [slot,       setSlot]       = useState(getTimeSlot()); // eslint-disable-line no-unused-vars
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const [fadeIn,     setFadeIn]     = useState(true);
  const [factIdx,    setFactIdx]    = useState(0);

  // rotate thought every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setThoughtIdx(i => (i + 1) % THOUGHTS_BY_TIME[slot].length);
        setFadeIn(true);
      }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, [slot]); // eslint-disable-line react-hooks/exhaustive-deps

  // rotate fact every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setFactIdx(i => (i + 1) % SURYA_FACTS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const thoughts = THOUGHTS_BY_TIME[slot];
  const slotEmoji = { morning:"☀️", afternoon:"🌤️", evening:"🌅", night:"🌙" }[slot];
  const slotLabel = { morning:"Morning", afternoon:"Afternoon", evening:"Evening", night:"Night" }[slot];

  return (
    <div className="mind-page">
      <div className="mind-hero">
        <h1 className="mind-title">💭 Surya's Mind</h1>
        <p className="mind-sub">A window into what Surya is thinking right now 🌸</p>
      </div>

      {/* Time indicator */}
      <div className="mind-time-badge">
        <span>{slotEmoji}</span>
        <span>{slotLabel} thoughts</span>
      </div>

      {/* Main thought bubble */}
      <div className="mind-bubble-wrap">
        <div className="mind-bubble-tail" />
        <div className="mind-bubble">
          <div className="mind-avatar">💙</div>
          <p
            className="mind-thought"
            style={{ opacity: fadeIn ? 1 : 0, transition: "opacity 0.4s" }}
          >
            {thoughts[thoughtIdx]}
          </p>
          <p className="mind-name">— Surya</p>
        </div>
        {/* Dot trail */}
        <div className="mind-dots">
          <span /><span /><span />
        </div>
      </div>

      {/* Thought navigation */}
      <div className="mind-nav">
        {thoughts.map((_, i) => (
          <button
            key={i}
            className={`mind-nav-dot ${i === thoughtIdx ? "active" : ""}`}
            onClick={() => {
              setFadeIn(false);
              setTimeout(() => { setThoughtIdx(i); setFadeIn(true); }, 300);
            }}
          />
        ))}
      </div>

      {/* Fun facts ticker */}
      <div className="mind-fact-card">
        <h3 className="mind-fact-heading">🧠 Did you know?</h3>
        <div className="mind-fact-body">
          <span className="mind-fact-emoji">{SURYA_FACTS[factIdx].emoji}</span>
          <p className="mind-fact-text">{SURYA_FACTS[factIdx].fact}</p>
        </div>
        <div className="mind-fact-dots">
          {SURYA_FACTS.map((_, i) => (
            <span key={i} className={`mind-fact-dot ${i === factIdx ? "active" : ""}`} />
          ))}
        </div>
      </div>

      {/* Thought count visual */}
      <div className="mind-count-wrap">
        <h3 className="mind-count-heading">Thoughts about Sadhana today...</h3>
        <ThoughtCounter />
      </div>

      <div className="dream-footer" style={{ marginTop: "50px" }}>
        <p>"You live rent-free in my mind — and I never want you to leave 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}

function ThoughtCounter() {
  const [count, setCount] = useState(() => {
    const base = new Date(); base.setHours(0,0,0,0);
    const secsSinceMidnight = (new Date() - base) / 1000;
    return Math.floor(secsSinceMidnight / 90); // ~1 thought per 90 seconds
  });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }, 90000); // every 90s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="thought-counter">
      <div className={`thought-num ${pulse ? "thought-pulse" : ""}`}>{count.toLocaleString("en-IN")}</div>
      <p className="thought-label">...and counting 💙</p>
    </div>
  );
}
