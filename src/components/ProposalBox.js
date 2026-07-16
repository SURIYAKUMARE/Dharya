import { useState, useRef, useEffect } from "react";
import { dbGet } from "../api";

const WISHES = [
  "May every day with you be more beautiful than the last 🌟",
  "I wish for a lifetime of your laughter 💖",
  "May our love grow stronger with every sunrise 🌅",
  "I wish for a future full of us 💍",
  "May you always know how deeply you are loved 🌸",
];

export default function ProposalBox({ opened, setOpened, setPage }) {
  const [letterOpen,   setLetterOpen]   = useState(false);
  const [noPos,        setNoPos]        = useState({ x: null, y: null });
  const [noClicks,     setNoClicks]     = useState(0);
  const [showWish,     setShowWish]     = useState(false);
  const [wishIdx,      setWishIdx]      = useState(0);
  const [stars,        setStars]        = useState([]);
  const [letterTitle,  setLetterTitle]  = useState("My Dearest Moon,");
  const [letterBody,   setLetterBody]   = useState("Every moment with you has been magical ✨\nYou are the reason I smile every day 🌸\nMy heart beats only for you 💓");
  const [propQuestion, setPropQuestion] = useState("Will You Marry Me? 💍");
  const [yesBtnText,   setYesBtnText]   = useState("💍 Yes, I Will!");
  const noBtnRef = useRef(null);

  // Load custom text from MongoDB (written by Surya in edit panel)
  useEffect(() => {
    dbGet("prop_title",    "My Dearest Moon,").then(v => { if (v) setLetterTitle(v); });
    dbGet("prop_body",     "").then(v => { if (v) setLetterBody(v); });
    dbGet("prop_question", "Will You Marry Me? 💍").then(v => { if (v) setPropQuestion(v); });
    dbGet("prop_yes_btn",  "💍 Yes, I Will!").then(v => { if (v) setYesBtnText(v); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <h2 className="letter-title">{letterTitle}</h2>
          <p className="letter-body" style={{ whiteSpace:"pre-line" }}>
            {letterBody}
          </p>
          <div className="proposal-question">{propQuestion}</div>
          <div className="proposal-btns">
            <button className="yes-btn" onClick={handleYes}>
              {yesBtnText}
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
