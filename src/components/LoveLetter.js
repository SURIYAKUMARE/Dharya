import { useState, useEffect } from "react";
import { dbGet } from "../api";

const DEFAULT_LETTERS = [
  {
    title: "The First Time I Saw You", date: "19 June 2023",
    content: `My dearest Sadhana,\n\nI still remember the exact moment I first saw you at tuition. The way you smiled, the way your eyes lit up — something inside me knew you were going to change my life forever.\n\nI didn't dare speak to you that day. But every day after that, I found myself hoping I'd see you again. And every time I did, my heart did something it had never done before.\n\nYou were the reason I started looking forward to ordinary days.\n\nWith all my love,\nSurya 💙`,
  },
  {
    title: "The Night I Proposed", date: "17 May 2026",
    content: `My love,\n\nThat midnight felt different. The whole world was quiet, but inside my heart there was a storm — a beautiful one.\n\nI had rehearsed those words a thousand times. But when the moment came, all the rehearsals disappeared. What came out was just the truth — raw, real, and completely yours.\n\n"I love you, Sadhana."\n\nThree words. A lifetime of meaning.\n\nYours forever,\nSurya 💍`,
  },
  {
    title: "Why I Choose You Every Day", date: "Always",
    content: `Sadhana,\n\nPeople talk about falling in love like it's an accident. But I choose you — every single morning, every quiet evening, every difficult moment in between.\n\nI choose your laughter. I choose your strength. I choose the way you see the world.\n\nSome people spend their whole lives searching for what I already have — you.\n\nAlways choosing you,\nSurya 🌟`,
  },
  {
    title: "A Promise For Our Future", date: "Forever",
    content: `My Sadhana,\n\nI promise to be your calm when life gets loud. Your warmth when the world feels cold. Your reason to smile on the days when smiling feels hard.\n\nI promise to chase every dream with you — the ones you've written down and the ones still forming in your heart.\n\nYours, now and forever,\nSurya 💗`,
  },
];

export default function LoveLetter({ setPage, user }) {
  const [letters,   setLetters]   = useState(DEFAULT_LETTERS);
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [particles, setParticles] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Load custom letters written by Surya from MongoDB
  useEffect(() => {
    const keys = [1,2,3,4];
    Promise.all(
      keys.map(n => Promise.all([
        dbGet(`custom_letter_${n}_title`,   DEFAULT_LETTERS[n-1].title),
        dbGet(`custom_letter_${n}_content`, DEFAULT_LETTERS[n-1].content),
      ]))
    ).then(results => {
      setLetters(results.map(([title, content], i) => ({
        title:   title   || DEFAULT_LETTERS[i].title,
        date:    DEFAULT_LETTERS[i].date,
        content: content || DEFAULT_LETTERS[i].content,
      })));
      setLoading(false);
    });
    // petal rain on mount
    setParticles(Array.from({ length: 8 }, (_, i) => ({
      id: i, left:`${i*12+2}%`, delay:`${i*0.8}s`, dur:`${6+i}s`,
      emoji:["🌸","💮","🌺","💐"][i%4],
    })));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openLetter = (letter) => {
    setSelected(letter); setRevealed(false);
    setTimeout(() => setRevealed(true), 400);
    setParticles(Array.from({ length: 10 }, (_, i) => ({
      id:i, left:`${5+i*9}%`, delay:`${i*0.2}s`,
      dur:`${3+Math.random()*2}s`, emoji:["🌸","💖","✨","🌷","💗"][i%5],
    })));
  };
  const closeLetter = () => {
    setRevealed(false);
    setTimeout(() => { setSelected(null); setParticles([]); }, 400);
  };

  if (loading) return <div className="db-loading"><div className="db-loading-icon">💌</div><p>Loading letters...</p></div>;

  return (
    <div className="letter-page">
      {/* Falling petals bg */}
      <div className="petal-rain">
        {particles.map(p => (
          <span key={p.id} className="petal" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }}>
            {p.emoji}
          </span>
        ))}
      </div>

      <div className="letter-page-hero">
        <h1 className="letter-page-title">Letters For You 💌</h1>
        <p className="letter-page-sub">Words Surya wrote, just for Sadhana's eyes 🌸</p>
      </div>

      {/* Letter Cards Grid */}
      <div className="letter-cards-grid">
        {letters.map((l, i) => (
          <div key={i} className="letter-envelope-card" onClick={() => openLetter(l)}>
            <div className="envelope-flap" />
            <div className="envelope-body">
              <div className="envelope-heart">💌</div>
              <h3 className="envelope-title">{l.title}</h3>
              <p className="envelope-date">{l.date}</p>
              <button className="envelope-open-btn">Open Letter 💕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Read Letter Overlay */}
      {selected && (
        <div className="letter-read-overlay" onClick={closeLetter}>
          <div
            className={`letter-read-card ${revealed ? "letter-revealed" : ""}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="letter-read-ribbon" />
            <div className="letter-read-stamp">💌</div>
            <h2 className="letter-read-title">{selected.title}</h2>
            <p className="letter-read-date">{selected.date}</p>
            <div className="letter-read-divider" />
            <pre className="letter-read-body">{selected.content}</pre>
            <button className="letter-read-close" onClick={closeLetter}>Fold Letter 🌸</button>
          </div>
        </div>
      )}

      <div className="dream-footer" style={{ marginTop: "40px" }}>
        <p>"Every word I write is a piece of my heart 💙"</p>
        <p className="dream-names">Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
