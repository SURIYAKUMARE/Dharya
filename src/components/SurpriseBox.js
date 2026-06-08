import { useState } from "react";

const SURPRISES = [
  {
    label: "Surprise #1",
    seal: "💝",
    hint: "Open when you feel like you need a hug",
    color: "#ff69b4",
    bg: "linear-gradient(135deg,#fff0f8,#fce4f0)",
    content: {
      title: "A Virtual Hug From Surya 🫂",
      body: `Close your eyes for a second.

Imagine my arms around you — tight, warm, not letting go.

That's exactly what this is. A hug I'm sending across every mile between us.

You don't have to be strong all the time, Sadhana. You can just be you — and that's more than enough for me.

I've got you. Always. 💙`,
      gift: "🫂 One unlimited hug — valid forever",
    },
  },
  {
    label: "Surprise #2",
    seal: "🎁",
    hint: "Open when you want to feel special",
    color: "#c71585",
    bg: "linear-gradient(135deg,#fce4f0,#fff0f8)",
    content: {
      title: "A List of Things I Love About You 💗",
      body: `1. The way you smile when you're embarrassed 🌸
2. How you care about everyone around you 💙
3. Your strength — even when you don't see it yourself 💪
4. The sound of your name — it's my favourite word
5. How you make ordinary moments feel magical ✨
6. Your dreams — every single one of them
7. The way you love — completely, honestly, beautifully
8. Everything you are, and everything you're becoming
9. The fact that you chose me back 💍
10. You. Just you. Exactly as you are.`,
      gift: "💗 10 reasons — and there are thousands more",
    },
  },
  {
    label: "Surprise #3",
    seal: "🌟",
    hint: "Open on a day when you miss me",
    color: "#f59e0b",
    bg: "linear-gradient(135deg,#fffde7,#fff9c4)",
    content: {
      title: "I'm Right Here 🌙",
      body: `Missing someone means they matter.
And you matter more to me than I can put into words.

So on this day — wherever you are, whatever you're doing —
know that I'm thinking of you too.

Same sky. Same stars. Same feeling.

The distance between us has never changed how close you are to my heart.

One day there won't be any distance at all. I promise. 💍`,
      gift: "🌙 One promise — we'll close every distance",
    },
  },
  {
    label: "Surprise #4",
    seal: "💌",
    hint: "Open when you need to hear something good",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#f3e5f5,#ede7f6)",
    content: {
      title: "Good Things About Your Future 🔮",
      body: `Here's what I know is coming for you, Sadhana:

✨ Days that feel like warm sunlight
🏡 A home that feels like peace
💍 A love that grows instead of fades
🌸 Dreams becoming real, one by one
😂 Laughter so genuine it surprises you
💙 Someone beside you who never gives up

I know this because I'm going to help make all of it happen.
Your future is so beautiful — I've already started building it for you.`,
      gift: "🔮 Your future — and I'm in every chapter",
    },
  },
  {
    label: "Surprise #5",
    seal: "🎀",
    hint: "Open just because you deserve it",
    color: "#ec4899",
    bg: "linear-gradient(135deg,#fdf2f8,#fce7f3)",
    content: {
      title: "Just Because You Deserve It 🌺",
      body: `You don't need a reason to be celebrated, Sadhana.

You exist — and that's reason enough.

You are not too much. You are not too little.
You are exactly right, exactly as you are.

I hope today you give yourself the grace you give everyone else.
I hope you look in the mirror and see what I see.

Someone remarkable.
Someone irreplaceable.
Someone I am incredibly lucky to love. 💙`,
      gift: "🌺 A reminder — you are worthy of everything good",
    },
  },
];

export default function SurpriseBox() {
  const [opened,  setOpened]  = useState({});
  const [active,  setActive]  = useState(null);
  const [shaking, setShaking] = useState(null);

  const tryOpen = (i) => {
    setShaking(i);
    setTimeout(() => {
      setShaking(null);
      setOpened(o => ({ ...o, [i]: true }));
      setActive(i);
    }, 600);
  };

  const close = () => setActive(null);

  return (
    <div className="surprise-box-page">
      <div className="sb-hero">
        <h1 className="sb-title">Surprise Box 🎁</h1>
        <p className="sb-sub">Surya hid 5 surprises — each one made just for you 💙</p>
      </div>

      <div className="sb-grid">
        {SURPRISES.map((s, i) => (
          <div
            key={i}
            className={`sb-item ${opened[i] ? "sb-opened" : ""} ${shaking === i ? "sb-shake" : ""}`}
            style={{ borderColor: s.color }}
            onClick={() => !opened[i] && tryOpen(i)}
          >
            <div className="sb-seal" style={{ background: s.color }}>{s.seal}</div>
            <div className="sb-label">{s.label}</div>
            <p className="sb-hint">"{s.hint}"</p>
            {opened[i]
              ? <button className="sb-read-btn" style={{ background: s.color }} onClick={(e) => { e.stopPropagation(); setActive(i); }}>Read Surprise 💕</button>
              : <div className="sb-lock">🔒 Tap to open</div>
            }
          </div>
        ))}
      </div>

      {/* Overlay */}
      {active !== null && (
        <div className="sb-overlay" onClick={close}>
          <div className="sb-modal" style={{ background: SURPRISES[active].bg, borderColor: SURPRISES[active].color }} onClick={e => e.stopPropagation()}>
            <div className="sb-modal-ribbon" style={{ background: SURPRISES[active].color }} />
            <div className="sb-modal-seal">{SURPRISES[active].seal}</div>
            <h2 className="sb-modal-title" style={{ color: SURPRISES[active].color }}>{SURPRISES[active].content.title}</h2>
            <pre className="sb-modal-body">{SURPRISES[active].content.body}</pre>
            <div className="sb-modal-gift" style={{ borderColor: SURPRISES[active].color }}>
              <span>🎁 </span>{SURPRISES[active].content.gift}
            </div>
            <p className="sb-modal-from">— Surya 💙</p>
            <button className="sb-modal-close" style={{ background: SURPRISES[active].color }} onClick={close}>Close 💕</button>
          </div>
        </div>
      )}

      <div className="dream-footer" style={{ marginTop: "50px" }}>
        <p>"Every surprise I plan has your smile in mind 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
