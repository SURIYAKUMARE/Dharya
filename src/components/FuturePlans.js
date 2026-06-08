import { useState } from "react";

const PLAN_CATEGORIES = [
  {
    icon: "✈️",
    title: "Places to Visit Together",
    color: "#3b82f6",
    plans: [
      "Watch the sunrise from a hilltop 🌄",
      "Walk on a beach at sunset 🌅",
      "Visit Ooty together 🏔️",
      "Take a train journey through mountains 🚂",
      "Watch the stars from an open field 🌌",
      "Explore a new city we've never been to 🗺️",
    ],
  },
  {
    icon: "💑",
    title: "Things to Do Together",
    color: "#ec4899",
    plans: [
      "Cook a meal together from scratch 🍳",
      "Plant something and watch it grow 🌱",
      "Watch the full moon rise together 🌕",
      "Write letters to our future selves 📝",
      "Have a picnic with no phones 🧺",
      "Stay up all night just talking 💬",
    ],
  },
  {
    icon: "🏡",
    title: "Our Life Goals",
    color: "#10b981",
    plans: [
      "Build a home that feels like peace 🏠",
      "Have a garden full of flowers 🌺",
      "Adopt a pet together 🐾",
      "Celebrate every anniversary with something special 🥂",
      "Build a life where neither of us ever feels alone 💙",
      "Grow old together, still in love 👴👵",
    ],
  },
  {
    icon: "💍",
    title: "Our Milestones",
    color: "#c71585",
    plans: [
      "Celebrate our first proper anniversary 🎉",
      "Get engaged officially 💍",
      "Meet each other's families ❤️",
      "Take our first trip together ✈️",
      "Start a new chapter — just the two of us 🌸",
      "Stand at the altar and say forever out loud 💒",
    ],
  },
];

const STORAGE_KEY = "fp_checked";

function loadChecked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export default function FuturePlans() {
  const [checked, setChecked] = useState(loadChecked);
  const [active,  setActive]  = useState(0);

  const toggle = (catIdx, planIdx) => {
    const key = `${catIdx}_${planIdx}`;
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const total     = PLAN_CATEGORIES.reduce((s, c) => s + c.plans.length, 0);
  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct       = Math.round((doneCount / total) * 100);

  const cat = PLAN_CATEGORIES[active];

  return (
    <div className="fp-page">
      <div className="fp-hero">
        <h1 className="fp-title">Our Future Plans 🗺️</h1>
        <p className="fp-sub">Everything Surya wants to do with you — tick them off as they happen 💙</p>
      </div>

      {/* Overall progress */}
      <div className="fp-progress-wrap">
        <div className="fp-progress-bar">
          <div className="fp-progress-fill" style={{ width:`${pct}%` }} />
        </div>
        <p className="fp-progress-label">
          <strong>{doneCount}</strong> of <strong>{total}</strong> plans ticked off 🌟 ({pct}%)
        </p>
      </div>

      {/* Category tabs */}
      <div className="fp-tabs">
        {PLAN_CATEGORIES.map((c, i) => {
          const catDone = c.plans.filter((_, j) => checked[`${i}_${j}`]).length;
          return (
            <button
              key={i}
              className={`fp-tab ${active === i ? "fp-tab-active" : ""}`}
              style={active === i ? { borderColor: c.color, color: c.color } : {}}
              onClick={() => setActive(i)}
            >
              <span>{c.icon}</span>
              <span className="fp-tab-label">{c.title}</span>
              <span className="fp-tab-count" style={active === i ? { background: c.color } : {}}>
                {catDone}/{c.plans.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plan list */}
      <div className="fp-list">
        {cat.plans.map((plan, j) => {
          const key  = `${active}_${j}`;
          const done = !!checked[key];
          return (
            <div
              key={j}
              className={`fp-item ${done ? "fp-done" : ""}`}
              onClick={() => toggle(active, j)}
              style={{ borderColor: done ? cat.color : "#f9a8c9" }}
            >
              <div className="fp-checkbox" style={{ borderColor: cat.color, background: done ? cat.color : "white" }}>
                {done && <span className="fp-check">✓</span>}
              </div>
              <span className="fp-plan-text" style={{ textDecoration: done ? "line-through" : "none", color: done ? "#aaa" : "#444" }}>
                {plan}
              </span>
              {done && <span className="fp-done-badge" style={{ background: cat.color }}>Done 💖</span>}
            </div>
          );
        })}
      </div>

      {doneCount === total && (
        <div className="fp-complete">
          <p>🎉 You've done everything on the list! Time to add more adventures 💙</p>
        </div>
      )}

      <div className="dream-footer" style={{ marginTop:"50px" }}>
        <p>"Every plan I make has you in it — always 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
