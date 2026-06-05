import { useState, useRef } from "react";

export default function ProposalBox({ opened, setOpened, setPage }) {
  const [letterOpen, setLetterOpen] = useState(false);
  const [noPos, setNoPos] = useState({ x: null, y: null });
  const [noClicks, setNoClicks] = useState(0);
  const noBtnRef = useRef(null);

  const handleOpen = () => {
    if (!opened) {
      setOpened(true);
      setTimeout(() => setLetterOpen(true), 900);
    }
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
              <span
                key={i}
                className="float-emoji"
                style={{ animationDelay: `${i * 0.4}s`, left: `${8 + i * 18}%` }}
              >
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
            <button className="yes-btn" onClick={() => setPage("journey")}>
              💍 Yes, I Will!
            </button>
            <button
              ref={noBtnRef}
              className="no-btn"
              style={
                noPos.x !== null
                  ? { position: "fixed", left: noPos.x, top: noPos.y, zIndex: 9999 }
                  : {}
              }
              onMouseEnter={moveNoBtn}
              onClick={moveNoBtn}
            >
              {noClicks === 0
                ? "No 😅"
                : noMessages[Math.min(noClicks - 1, noMessages.length - 1)]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
