import { useState, useEffect } from "react";

/* ── Countdown to Our Special Day ─────────── */
function Countdown({ setPage }) {
  const TARGET = new Date("2027-05-20T00:00:00");

  const calcTime = () => {
    const diff = Math.max(0, TARGET - new Date());
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calcTime);

  useEffect(() => {
    const id = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="countdown-wrap">
      <h1>Our Special Day 💍</h1>
      <p className="countdown-date">20 / 05 / 2027</p>
      <p className="countdown-label">Counting every second until forever begins...</p>
      <div className="countdown-boxes">
        {[
          { val: time.days,    label: "Days" },
          { val: time.hours,   label: "Hours" },
          { val: time.minutes, label: "Minutes" },
          { val: time.seconds, label: "Seconds" },
        ].map(({ val, label }) => (
          <div key={label} className="countdown-box">
            <span className="countdown-num">{String(val).padStart(2, "0")}</span>
            <span className="countdown-unit">{label}</span>
          </div>
        ))}
      </div>
      <p className="countdown-footer">You know our story so well ❤️</p>
      <button className="yes-btn" style={{ marginTop: "28px" }} onClick={() => setPage("dream")}>
        See Our Dreams 💫
      </button>
    </div>
  );
}

/* ── Quiz questions ────────────────────────── */
const QUESTIONS = [
  {
    q: "What should I call you? 🥰",
    options: ["Chellam", "Pattu", "Thangoo", "Thanga Pulla"],
    correct: 1,
    fun: "Pattu is my favourite name for you — always will be 💙",
  },
  {
    q: "How much do I love you? ❤️",
    options: ["100", "999+", "A million", "Infinity ♾️"],
    correct: 3,
    fun: "There's no number big enough. Infinity and beyond 💍",
  },
  {
    q: "When did we first meet? 📅",
    options: ["17/05/2026", "19/06/2023", "20/05/2026", "01/01/2024"],
    correct: 1,
    fun: "19 June 2023 — the day that changed everything 🌟",
  },
  {
    q: "What did Surya do at midnight on 17 May 2026? 🌙",
    options: ["Slept peacefully", "Watched a movie", "Proposed to you", "Ate midnight snacks"],
    correct: 2,
    fun: "Heart racing, hands shaking — three words that meant everything 💌",
  },
  {
    q: "Who is stronger? 💪",
    options: ["Sadhana", "Both of you", "Surya", "Nobody"],
    correct: 0,
    fun: "Sadhana — always. Her strength is one of the things I love most 🌸",
  },
  {
    q: "How much do I miss you when we're apart? 💖",
    options: ["A little", "Sometimes", "A lot", "Every single second 💖"],
    correct: 3,
    fun: "Every. Single. Second. No exaggeration 💙",
  },
  {
    q: "What is our song? 🎵",
    options: ["Nenjame", "Munbe Vaa", "Kannazhaga", "Oru Adaar Love"],
    correct: 1,
    fun: "Munbe Vaa — the song that plays every time I think of forever with you ✨",
  },
];

export default function RelationshipQuiz({ setPage }) {
  const [qIndex,   setQIndex]   = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct,  setCorrect]  = useState(null);
  const [score,    setScore]    = useState(0);
  const [done,     setDone]     = useState(false);

  const handleAnswer = (idx) => {
    if (answered) return;
    const isCorrect = idx === QUESTIONS[qIndex].correct;
    setCorrect(isCorrect);
    setAnswered(true);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(i => i + 1);
        setAnswered(false);
        setCorrect(null);
      } else {
        launchConfetti();
        setDone(true);
      }
    }, 1400);
  };

  const launchConfetti = () => {
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
      c.style.animationDuration = (Math.random() * 2 + 2) + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5000);
    }
  };

  const restart = () => {
    setQIndex(0); setAnswered(false); setCorrect(null); setScore(0); setDone(false);
  };

  /* ── Done screen ── */
  if (done) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const msg =
      pct === 100 ? "Perfect score! You know our love story by heart 💍🌟" :
      pct >= 70   ? "So close! You know me so well already 💙" :
                    "Keep reading our story — there's so much more to know 🌸";
    return (
      <div className="quiz-page" style={{ textAlign: "center", paddingTop: "40px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>
          {pct === 100 ? "🏆" : pct >= 70 ? "🌟" : "💗"}
        </div>
        <h1>You scored {score} / {QUESTIONS.length}</h1>
        <p style={{ color: "#c71585", fontSize: "1.2rem", margin: "12px 0 28px" }}>{msg}</p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="yes-btn" onClick={restart}>Try Again 💖</button>
          <button className="yes-btn" style={{ background: "linear-gradient(135deg,#4ade80,#15803d)" }}
            onClick={() => setDone(false) || setQIndex(-1)}>
            See Countdown 💍
          </button>
        </div>
      </div>
    );
  }

  /* ── Countdown screen (after done → countdown btn) ── */
  if (qIndex === -1) return <Countdown setPage={setPage} />;

  const q = QUESTIONS[qIndex];
  const progress = ((qIndex) / QUESTIONS.length) * 100;

  return (
    <div className="quiz-page">
      <h1>Our Love Quiz 💕</h1>

      {/* Progress bar */}
      <div style={{ background: "#fce4f0", borderRadius: "50px", height: "8px", marginBottom: "8px", overflow: "hidden" }}>
        <div className="progress" style={{ width: `${progress}%`, height: "100%", margin: 0, borderRadius: "50px" }} />
      </div>
      <p style={{ textAlign: "center", color: "#aaa", fontSize: "0.85rem", marginBottom: "24px" }}>
        Question {qIndex + 1} of {QUESTIONS.length} · Score: {score}
      </p>

      <p className="question">{q.q}</p>

      <div className="options">
        {q.options.map((opt, i) => {
          let style = {};
          if (answered) {
            if (i === q.correct) style = { background: "#dcfce7", borderColor: "#4ade80", color: "#15803d" };
            else if (i !== q.correct && correct === false && i === q.options.indexOf(q.options[i])) style = {};
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              style={style}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{
          background: correct ? "#dcfce7" : "#fff0f8",
          border: `1.5px solid ${correct ? "#4ade80" : "#f9a8c9"}`,
          borderRadius: "16px",
          padding: "16px 20px",
          marginTop: "16px",
          textAlign: "center",
        }}>
          <p className={correct ? "correct" : "wrong"}>
            {correct ? "✅ Correct!" : "❌ Not quite — but I still love you 💕"}
          </p>
          <p style={{ color: "#555", fontSize: "0.95rem", marginTop: "6px", fontStyle: "italic" }}>
            "{q.fun}"
          </p>
        </div>
      )}
    </div>
  );
}
