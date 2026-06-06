import { useState } from "react";

/* ══════════════════════════════════════════
   WOULD YOU RATHER
══════════════════════════════════════════ */
const WYR_QUESTIONS = [
  { a: "A surprise note left under your pillow 💌", b: "A surprise call at midnight 🌙" },
  { a: "Travel the world together ✈️", b: "Build a cozy home together 🏠" },
  { a: "Dance in the rain together 🌧️", b: "Watch the sunset together 🌅" },
  { a: "Surya cooks for you every day 👨‍🍳", b: "Surya surprises you with gifts every week 🎁" },
  { a: "Have a secret language only you two understand 🤫", b: "Have a song only you two know about 🎵" },
  { a: "Live by the ocean forever 🌊", b: "Live in the mountains forever 🏔️" },
  { a: "Read each other's minds 🧠", b: "Feel each other's emotions 💓" },
];

function WouldYouRather() {
  const [idx,     setIdx]     = useState(0);
  const [chosen,  setChosen]  = useState(null);
  const [answers, setAnswers] = useState([]);
  const [done,    setDone]    = useState(false);

  const pick = (choice) => {
    const ans = [...answers, { q: WYR_QUESTIONS[idx], choice }];
    setAnswers(ans);
    setChosen(choice);
    setTimeout(() => {
      if (idx + 1 >= WYR_QUESTIONS.length) {
        setDone(true);
      } else {
        setIdx(i => i + 1);
        setChosen(null);
      }
    }, 800);
  };

  const reset = () => { setIdx(0); setChosen(null); setAnswers([]); setDone(false); };

  if (done) return (
    <div className="wyr-done">
      <div className="wyr-done-icon">🥰</div>
      <h3>Your choices say a lot about you!</h3>
      <div className="wyr-summary">
        {answers.map((a, i) => (
          <div key={i} className="wyr-ans-item">
            <span className="wyr-ans-num">{i+1}</span>
            <span className="wyr-ans-text">{a.choice === "a" ? a.q.a : a.q.b}</span>
          </div>
        ))}
      </div>
      <p className="wyr-summary-note">"Every choice you make tells me who you are — and I love every bit of it 💙" — Surya</p>
      <button className="wyr-restart" onClick={reset}>Play Again 💖</button>
    </div>
  );

  const q = WYR_QUESTIONS[idx];
  return (
    <div className="wyr-wrap">
      <div className="wyr-progress-bar">
        <div className="wyr-progress-fill" style={{ width: `${((idx) / WYR_QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="wyr-counter">{idx + 1} / {WYR_QUESTIONS.length}</p>
      <h3 className="wyr-q">Would You Rather…? 💭</h3>
      <div className="wyr-options">
        <button
          className={`wyr-btn wyr-a ${chosen === "a" ? "wyr-selected" : ""} ${chosen && chosen !== "a" ? "wyr-faded" : ""}`}
          onClick={() => !chosen && pick("a")}
        >
          <span className="wyr-or-letter">A</span>
          {q.a}
        </button>
        <div className="wyr-or-badge">OR</div>
        <button
          className={`wyr-btn wyr-b ${chosen === "b" ? "wyr-selected" : ""} ${chosen && chosen !== "b" ? "wyr-faded" : ""}`}
          onClick={() => !chosen && pick("b")}
        >
          <span className="wyr-or-letter">B</span>
          {q.b}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TWO TRUTHS & A LIE
══════════════════════════════════════════ */
const TTL_ROUNDS = [
  {
    statements: [
      "I thought about you on the very first day we met",
      "I rehearsed my proposal 47 times before saying it",
      "I cried happy tears the day you proposed back",
    ],
    lie: 1,
    reveal: "I actually rehearsed it WAY more than 47 times 😂 — it was closer to 200!",
  },
  {
    statements: [
      "Your laugh is my favourite sound in the world",
      "I once wrote your name 100 times in my notebook",
      "I forgot your birthday once",
    ],
    lie: 2,
    reveal: "I would never forget your birthday — it's 29 February, the most special date 🎂",
  },
  {
    statements: [
      "I smile every time your name appears on my screen",
      "I've planned our future home in my head already",
      "I didn't feel nervous at all when I proposed",
    ],
    lie: 2,
    reveal: "I was absolutely terrified when I proposed — my heart was racing at 200bpm 💓",
  },
];

function TwoTruthsLie() {
  const [round,    setRound]    = useState(0);
  const [picked,   setPicked]   = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [done,     setDone]     = useState(false);

  const guess = (i) => {
    if (picked !== null) return;
    setPicked(i);
    setRevealed(true);
    if (i === TTL_ROUNDS[round].lie) setScore(s => s + 1);
  };

  const next = () => {
    if (round + 1 >= TTL_ROUNDS.length) { setDone(true); return; }
    setRound(r => r + 1);
    setPicked(null);
    setRevealed(false);
  };

  const reset = () => { setRound(0); setPicked(null); setRevealed(false); setScore(0); setDone(false); };

  if (done) return (
    <div className="ttl-done">
      <div className="ttl-done-icon">{score === TTL_ROUNDS.length ? "🏆" : score > 1 ? "🌟" : "💖"}</div>
      <h3>You got {score} / {TTL_ROUNDS.length}!</h3>
      <p className="ttl-done-msg">
        {score === TTL_ROUNDS.length
          ? "You know me so well, Sadhana! 💙"
          : score > 1
          ? "Pretty good! You know my heart 🌸"
          : "You'll know me better with every day together 💕"}
      </p>
      <button className="wyr-restart" onClick={reset}>Play Again 💖</button>
    </div>
  );

  const r = TTL_ROUNDS[round];
  return (
    <div className="ttl-wrap">
      <p className="ttl-round">Round {round + 1} of {TTL_ROUNDS.length}</p>
      <h3 className="ttl-q">Which one is the LIE? 🤔</h3>
      <p className="ttl-hint">Surya says three things — one is false!</p>
      {r.statements.map((s, i) => (
        <button
          key={i}
          className={`ttl-btn
            ${picked !== null && i === r.lie ? "ttl-lie" : ""}
            ${picked === i && i !== r.lie ? "ttl-wrong" : ""}
            ${picked !== null && i !== r.lie && i !== picked ? "ttl-truth" : ""}
          `}
          onClick={() => guess(i)}
          disabled={picked !== null}
        >
          <span className="ttl-num">{i + 1}</span> {s}
        </button>
      ))}
      {revealed && (
        <div className="ttl-reveal">
          <p className="ttl-reveal-title">{picked === r.lie ? "✅ Correct!" : "❌ Wrong!"}</p>
          <p className="ttl-reveal-text">"{r.reveal}"</p>
          <button className="wyr-restart" style={{ marginTop: "14px" }} onClick={next}>
            {round + 1 >= TTL_ROUNDS.length ? "See Results 🎉" : "Next Round →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function LoveGames({ setPage }) {
  const [tab, setTab] = useState("wyr");

  return (
    <div className="games-page">
      <div className="games-hero">
        <h1 className="games-title">Love Games 🎮</h1>
        <p className="games-sub">Fun little games Surya made just for you 💕</p>
      </div>
      <div className="games-tabs">
        <button className={`games-tab ${tab === "wyr" ? "active" : ""}`} onClick={() => setTab("wyr")}>
          💭 Would You Rather
        </button>
        <button className={`games-tab ${tab === "ttl" ? "active" : ""}`} onClick={() => setTab("ttl")}>
          🤔 Two Truths & A Lie
        </button>
      </div>
      <div className="games-content">
        {tab === "wyr" ? <WouldYouRather /> : <TwoTruthsLie />}
      </div>
      <div className="dream-footer" style={{ marginTop: "50px" }}>
        <p>"Every game with you is my favourite game 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
