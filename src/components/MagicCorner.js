import { useState, useEffect } from "react";

/* ══════════════════════════════════════════
   1. STORY BOOK
══════════════════════════════════════════ */
const PAGES = [
  {
    art: "🌅",
    title: "Chapter 1 — The Beginning",
    text: "It was 19 June 2023. Just an ordinary Tuesday at tuition. And then — there she was. Sadhana walked in, and something inside Surya shifted forever. He didn't know it yet, but his whole story was about to change.",
    bg: "linear-gradient(135deg, #fff9c4, #fffde7)",
    accent: "#f59e0b",
  },
  {
    art: "💭",
    title: "Chapter 2 — The Waiting",
    text: "For months, he watched from a distance. Too nervous to speak. Too afraid to ruin what hadn't even started. But every time she smiled, every time she laughed — he knew. He just knew.",
    bg: "linear-gradient(135deg, #fce4ec, #fff9fb)",
    accent: "#ec4899",
  },
  {
    art: "🌙",
    title: "Chapter 3 — The Midnight",
    text: "17 May 2026. Midnight. The whole world was asleep. But Surya was wide awake — heart pounding — typing the three words he had held inside for almost three years. 'I love you, Sadhana.' Send.",
    bg: "linear-gradient(135deg, #e8eaf6, #f3e5f5)",
    accent: "#7c3aed",
  },
  {
    art: "💗",
    title: "Chapter 4 — She Wrote Back",
    text: "18 May 2026. Evening. Her message came. And in it — love. Real, brave, beautiful love. She proposed right back. Surya read those words and felt the world stand still. She chose him too.",
    bg: "linear-gradient(135deg, #fce4ec, #fff0f5)",
    accent: "#c71585",
  },
  {
    art: "🥂",
    title: "Chapter 5 — Together",
    text: "19 May 2026. They both said yes — to each other, to the future, to forever. No ceremony, no crowd. Just two hearts choosing the same direction at the same time. That was enough. That was everything.",
    bg: "linear-gradient(135deg, #e0f2f1, #f1f8e9)",
    accent: "#10b981",
  },
  {
    art: "🌸",
    title: "Chapter 6 — The Journey Begins",
    text: "From 20 May 2026 onwards, every ordinary day became extraordinary. Every morning had a reason. Every night had a name. Sadhana. The one who turned Surya's whole world into something worth waking up for.",
    bg: "linear-gradient(135deg, #fff0f5, #fce4f0)",
    accent: "#c71585",
  },
  {
    art: "💍",
    title: "Chapter 7 — What Comes Next",
    text: "The story isn't finished. Not even close. There are cities to explore, dreams to chase, mornings to wake up next to each other. The best chapters are still being written — together, one day at a time.",
    bg: "linear-gradient(135deg, #fffde7, #fff9c4)",
    accent: "#f59e0b",
  },
];

function StoryBook() {
  const [page,    setPage]    = useState(0);
  const [turning, setTurning] = useState(false);
  const [dir,     setDir]     = useState("next");

  const go = (direction) => {
    if (turning) return;
    const next = direction === "next" ? page + 1 : page - 1;
    if (next < 0 || next >= PAGES.length) return;
    setDir(direction);
    setTurning(true);
    setTimeout(() => { setPage(next); setTurning(false); }, 350);
  };

  const p = PAGES[page];
  return (
    <div className="book-wrap">
      <h3 className="book-heading">📖 Our Story Book</h3>
      <p className="book-sub">The story of Surya &amp; Sadhana, told chapter by chapter 🌸</p>
      <div
        className={`book-page ${turning ? (dir === "next" ? "book-flip-out" : "book-flip-in") : ""}`}
        style={{ background: p.bg, borderColor: p.accent }}
      >
        <div className="book-art">{p.art}</div>
        <div className="book-page-num" style={{ color: p.accent }}>Page {page + 1} of {PAGES.length}</div>
        <h4 className="book-chapter-title" style={{ color: p.accent }}>{p.title}</h4>
        <p className="book-text">{p.text}</p>
      </div>
      <div className="book-controls">
        <button className="book-btn" onClick={() => go("prev")} disabled={page === 0 || turning}>← Prev</button>
        <div className="book-dots">
          {PAGES.map((_, i) => (
            <span key={i} className={`book-dot ${i === page ? "active" : ""}`} style={i === page ? { background: p.accent } : {}} onClick={() => { setDir(i > page ? "next" : "prev"); setTurning(true); setTimeout(() => { setPage(i); setTurning(false); }, 350); }} />
          ))}
        </div>
        <button className="book-btn" onClick={() => go("next")} disabled={page === PAGES.length - 1 || turning}>Next →</button>
      </div>
      {page === PAGES.length - 1 && (
        <div className="book-end">
          <p>🌟 "And they lived — not happily ever after — but bravely, lovingly, together ever after." 💍</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   2. FLOWER GARDEN
══════════════════════════════════════════ */
const FLOWER_TYPES = ["🌸","🌺","🌻","🌹","🌷","💐","🌼","🪷"];
const GROWTH_STAGES = ["🌱","🌿","🪴","🌸"];

function FlowerGarden() {
  const [garden, setGarden] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fg_garden") || "[]"); } catch { return []; }
  });
  const [watered, setWatered] = useState(false);
  const [newFlower, setNewFlower] = useState(null);

  const todayKey = new Date().toDateString();
  const lastVisit = localStorage.getItem("fg_lastvisit");
  const alreadyWatered = lastVisit === todayKey;

  const water = () => {
    if (alreadyWatered) return;
    const flower = {
      id: Date.now(),
      type: FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)],
      stage: 0,
      date: new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short" }),
    };
    // grow existing flowers
    const grown = garden.map(f => ({ ...f, stage: Math.min(f.stage + 1, GROWTH_STAGES.length - 1) }));
    const updated = [...grown, flower];
    setGarden(updated);
    setNewFlower(flower.id);
    setWatered(true);
    localStorage.setItem("fg_garden", JSON.stringify(updated));
    localStorage.setItem("fg_lastvisit", todayKey);
    setTimeout(() => setNewFlower(null), 1500);
  };

  const bloomed = garden.filter(f => f.stage === GROWTH_STAGES.length - 1).length;

  return (
    <div className="garden-wrap">
      <h3 className="garden-heading">🌺 Our Flower Garden</h3>
      <p className="garden-sub">Visit every day to grow a new flower 🌱 — {garden.length} flowers planted so far!</p>

      <div className="garden-stats">
        <div className="garden-stat"><span>{garden.length}</span><p>Planted</p></div>
        <div className="garden-stat"><span>{bloomed}</span><p>Bloomed 🌸</p></div>
        <div className="garden-stat"><span>{Math.max(0, garden.length - bloomed)}</span><p>Growing 🌿</p></div>
      </div>

      <div className="garden-bed">
        {garden.length === 0 && (
          <div className="garden-empty">Press the button below to plant your first flower 🌱</div>
        )}
        {garden.map(f => (
          <div key={f.id} className={`garden-flower ${newFlower === f.id ? "garden-new" : ""}`}>
            <div className="garden-flower-emoji">{GROWTH_STAGES[f.stage] === "🌸" ? f.type : GROWTH_STAGES[f.stage]}</div>
            <div className="garden-flower-date">{f.date}</div>
          </div>
        ))}
      </div>

      {alreadyWatered && !watered ? (
        <div className="garden-done-today">✅ You watered the garden today! Come back tomorrow 🌸</div>
      ) : watered ? (
        <div className="garden-done-today">🌱 A new flower was planted! See you tomorrow 💕</div>
      ) : (
        <button className="garden-water-btn" onClick={water}>
          💧 Water the Garden Today
        </button>
      )}
      <p className="garden-note">"Every day you visit, our garden grows — just like our love 💙" — Surya</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   3. TIME CAPSULE
══════════════════════════════════════════ */
function TimeCapsule() {
  const [msg,      setMsg]      = useState(() => localStorage.getItem("tc_msg") || "");
  const [openDate, setOpenDate] = useState(() => localStorage.getItem("tc_date") || "");
  const [sealed,   setSealed]   = useState(() => !!localStorage.getItem("tc_sealed"));
  const [canOpen,  setCanOpen]  = useState(false);
  const [opened,   setOpened]   = useState(false);

  useEffect(() => {
    if (!sealed || !openDate) return;
    const check = () => {
      const now = new Date();
      const target = new Date(openDate);
      setCanOpen(now >= target);
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [sealed, openDate]);

  const seal = () => {
    if (!msg.trim() || !openDate) return;
    localStorage.setItem("tc_msg",    msg);
    localStorage.setItem("tc_date",   openDate);
    localStorage.setItem("tc_sealed", "1");
    setSealed(true);
  };

  const open = () => { setOpened(true); };

  const reset = () => {
    localStorage.removeItem("tc_msg");
    localStorage.removeItem("tc_date");
    localStorage.removeItem("tc_sealed");
    setMsg(""); setOpenDate(""); setSealed(false); setOpened(false); setCanOpen(false);
  };

  const daysLeft = openDate ? Math.max(0, Math.ceil((new Date(openDate) - new Date()) / 86400000)) : null;

  if (opened) return (
    <div className="tc-opened">
      <div className="tc-open-stars">{["⭐","💫","✨","🌟","💖"].map((s,i) => <span key={i} style={{animationDelay:`${i*0.2}s`}}>{s}</span>)}</div>
      <h4 className="tc-open-title">💌 Time Capsule Opened!</h4>
      <div className="tc-open-msg">
        <pre className="tc-msg-text">{msg}</pre>
        <p className="tc-open-from">— Sealed on {new Date(localStorage.getItem("tc_date") ? localStorage.getItem("tc_date")+"_old" : openDate).toDateString()}</p>
      </div>
      <button className="tc-btn" onClick={reset}>Create New Capsule 💌</button>
    </div>
  );

  if (sealed) return (
    <div className="tc-sealed-view">
      <div className="tc-seal-icon">🔒</div>
      <h4 className="tc-seal-title">Time Capsule Sealed!</h4>
      <p className="tc-seal-msg">A message is waiting for you inside...</p>
      {canOpen ? (
        <>
          <p className="tc-open-ready">🎉 It's time! Your capsule is ready to open!</p>
          <button className="tc-btn tc-open-btn" onClick={open}>Open Capsule 💌</button>
        </>
      ) : (
        <>
          <p className="tc-days-left">Opens in <strong>{daysLeft}</strong> day{daysLeft !== 1 ? "s" : ""}</p>
          <p className="tc-open-date">📅 {new Date(openDate).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}</p>
        </>
      )}
    </div>
  );

  return (
    <div className="tc-form">
      <h3 className="tc-heading">⏳ Time Capsule</h3>
      <p className="tc-sub">Write a message to be opened on a special future date 💌</p>
      <textarea
        className="tc-textarea"
        placeholder="Write your message here... it will stay sealed until the date you choose 🔒"
        value={msg}
        onChange={e => setMsg(e.target.value)}
        rows={5}
      />
      <label className="tc-date-label">📅 Open on this date:</label>
      <input
        type="date"
        className="tc-date-input"
        value={openDate}
        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
        onChange={e => setOpenDate(e.target.value)}
      />
      <button
        className="tc-btn"
        onClick={seal}
        disabled={!msg.trim() || !openDate}
      >
        Seal the Capsule 🔒
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function MagicCorner({ setPage }) {
  const [tab, setTab] = useState("story");

  const TABS = [
    { key: "story",  label: "📖 Story" },
    { key: "garden", label: "🌺 Garden" },
    { key: "capsule",label: "⏳ Capsule" },
  ];

  return (
    <div className="magic-page">
      <div className="magic-hero">
        <h1 className="magic-title">Magic Corner ✨</h1>
        <p className="magic-sub">Three special things Surya made only for you 🌸</p>
      </div>
      <div className="games-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`games-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="games-content">
        {tab === "story"   && <StoryBook />}
        {tab === "garden"  && <FlowerGarden />}
        {tab === "capsule" && <TimeCapsule />}
      </div>
      <div className="dream-footer" style={{ marginTop: "50px" }}>
        <p>"Every corner of my world has your name in it 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
