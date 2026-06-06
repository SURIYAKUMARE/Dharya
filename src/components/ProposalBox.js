import { useState, useRef } from "react";

const WISHES = [
  "May every day with you be more beautiful than the last 🌟",
  "I wish for a lifetime of your laughter 💖",
  "May our love grow stronger with every sunrise 🌅",
  "I wish for a future full of us 💍",
  "May you always know how deeply you are loved 🌸",
];

export default function ProposalBox({ opened, setOpened, setPage }) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [noPos, setNoPos] = useState({ x: null, y: null });
  const [noClicks, setNoClicks] = useState(0);
  const [showWish, setShowWish] = useState(false);
  const [wishIdx, setWishIdx] = useState(0);
  const [stars, setStars] = useState([]);
  const noBtnRef = useRef(null);

  const handleOpen = () => {
    if (!opened) {
      setOpened(true);
      setTimeout(() => setLetterOpen(true), 900);
    }
  };

  const handleYes = () => {
    // shooting star burst
    setWishIdx(Math.floor(Math.random() * WISHES.length));
    setStars(Array.from({ length: 8 }, (_, i) => ({
      id: i,
      top: `${10 + Math.random() * 60}%`,
      delay: `${i * 0.2}s`,
    })));
    setShowWish(true);
    setTimeout(() => {
      setShowWish(false);
      setStars([]);
      setPage("journey");
    }, 2800);
  };

  const moveNoBtn = (e) => {
    e.stopPropagation();
    const count = noClicks + 1;
    setNoClicks(count);
    const btnW = 140;
    const btnH = 60;
    const newX = Math.random() * (window.innerWidth - btnW);
    const newY = Math.random() * (window.innerHeight - btnH);
    setNoPos({ x: newX, y: newY });
  };

  const noMessages = [
    "Nope! 😜",
    "Too slow! 💨",
    "Try again! 😂",
    "Not a chance! 💖",
    "Say YES! 🥺",
    "I'm watching! 👀",
    "You can't escape! ❤️",
  ];

  return (
    <div className="proposal-page">
      {/* Shooting stars */}
      {stars.map(s => (
        <div key={s.id} className="shooting-star" style={{ top: s.top, animationDelay: s.delay }} />
      ))}

      {/* Wish overlay */}
      {showWish && (
        <div className="wish-overlay">
          <div className="wish-card">
            <div className="wish-stars-row">{"⭐".repeat(5)}</div>
            <p className="wish-text">{WISHES[wishIdx]}</p>
            <p className="wish-sub">Taking you to our story... 💕</p>
          </div>
        </div>
      )}

      {/* Gift Box */}
      <div
        className={`proposal-container ${opened ? "opened" : ""}`}
        onClick={handleOpen}
        style={{ cursor: opened ? "default" : "pointer" }}
      >
        <div className="gift-box">
          <div className="lid">
            <div className="bow"></div>
          </div>
          <div className="body"></div>
          <div className="ribbon-horizontal"></div>
          <div className="ribbon-vertical"></div>
          {!opened && <div className="box-label">Open Me 🎁</div>}
        </div>
      </div>

      {/* Letter Card */}
      {letterOpen && (
        <div className="letter-card">
          <div className="letter-envelope-top"></div>
          <div className="letter-hearts">
            {["💖", "✨", "💕", "🌸", "💗"].map((e, i) => (
              <span key={i} className="float-emoji" style={{ animationDelay: `${i * 0.4}s`, left: `${8 + i * 18}%` }}>
                {e}
              </span>
            ))}
          </div>
          <h2 className="letter-title">My Dearest Moon,</h2>
          <p className="letter-body">
            Every moment with you has been magical ✨<br />
            You are the reason I smile every day 🌸<br />
            My heart beats only for you 💓
          </p>
          <div className="proposal-question">Will You Marry Me? 💍</div>
          <div className="proposal-btns">
            <button className="yes-btn" onClick={handleYes}>
              💍 Yes, I Will!
            </button>
            <button
              ref={noBtnRef}
              className="no-btn"
              style={noPos.x !== null ? { position:"fixed", left:noPos.x, top:noPos.y, zIndex:9999 } : {}}
              onMouseEnter={moveNoBtn}
              onClick={moveNoBtn}
            >
              {noClicks === 0 ? "No 😅" : noMessages[Math.min(noClicks - 1, noMessages.length - 1)]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
