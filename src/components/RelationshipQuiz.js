import { useState, useEffect } from "react";

function Countdown({ setPage }) {
  const target = new Date("2027-05-20T00:00:00");

  const [time, setTime] = useState({
    days:    Math.floor((new Date("2027-05-20T00:00:00") - new Date()) / (1000 * 60 * 60 * 24)),
    hours:   Math.floor(((new Date("2027-05-20T00:00:00") - new Date()) / (1000 * 60 * 60)) % 24),
    minutes: Math.floor(((new Date("2027-05-20T00:00:00") - new Date()) / (1000 * 60)) % 60),
    seconds: Math.floor(((new Date("2027-05-20T00:00:00") - new Date()) / 1000) % 60),
  });

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTime({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(t);
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

export default function RelationshipQuiz({ setPage }) {
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const questions = [
    {
      q: "What should I call you? 🥰",
      options: ["Chellam", "Pattu", "Thangoo", "Thanga Pulla"],
      correct: 1,
    },
    {
      q: "How much do I love you? ❤️",
      options: ["100", "0", "999+", "Infinity ♾️"],
      correct: 3,
    },
    {
      q: "How much do I miss you? 💖",
      options: ["A little", "Sometimes", "A lot", "Every second 💖"],
      correct: 3,
    },
    {
      q: "Who is strong? 💪",
      options: ["Sadhana", "You", "Everyone", "Me"],
      correct: 0,
    },
  ];

  const handleAnswer = (idx) => {
    const correct = questions[qIndex].correct;
    setIsCorrect(idx === correct);
    setAnswered(true);
    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setQIndex(qIndex + 1);
        setAnswered(false);
        setIsCorrect(null);
      } else {
        launchConfetti();
        setQIndex(-1);
      }
    }, 1200);
  };
  const launchConfetti = () => {
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
      c.style.animationDuration = Math.random() * 2 + 2 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5000);
    }
  };
  if (qIndex === -1) {
    return <Countdown setPage={setPage} />;
  }
  return (
    <div className="quiz-page">
      <h1>Prove you know our love</h1>
      <div
        className="progress"
        style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
      ></div>
      <p className="question">{questions[qIndex].q}</p>
      <div className="options">
        {questions[qIndex].options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(i)} disabled={answered}>
            {opt}
          </button>
        ))}
      </div>
      {answered && (
        <p className={isCorrect ? "correct" : "wrong"}>
          {isCorrect ? "Perfect 💓 " : "Close, but i still love you"}
        </p>
      )}
    </div>
  );
}
