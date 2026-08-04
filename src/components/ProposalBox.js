import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet } from "../api";
import { useTilt } from "../App";

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
  /* 3D mouse parallax state */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const boxRef   = useRef(null);
  const noBtnRef = useRef(null);
  const letterTilt = useTilt(8);

  useEffect(() => {
    dbGet("prop_title",    "My Dearest Moon,").then(v => { if (v) setLetterTitle(v); });
    dbGet("prop_body",     "").then(v => { if (v) setLetterBody(v); });
    dbGet("prop_question", "Will You Marry Me? 💍").then(v => { if (v) setPropQuestion(v); });
    dbGet("prop_yes_btn",  "💍 Yes, I Will!").then(v => { if (v) setYesBtnText(v); });
  }, []); // eslint-disable-line

  /* Mouse parallax for 3D gift box */
  const handleMouseMove = useCallback((e) => {
    const el = boxRef.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    setMouse({
      x: ((e.clientX - cx) / (window.innerWidth  / 2)) * 18,
      y: ((e.clientY - cy) / (window.innerHeight / 2)) * 14,
    });
  }, []);
  const handleMouseLeave = useCallback(() => {
    setMouse({ x: 0, y: 0 });
  }, []);

  const handleOpen = () => {
    if (!opened) { setOpened(true); setTimeout(() => setLetterOpen(true), 900); }
  };

  const handleYes = () => {
    setWishIdx(Math.floor(Math.random() * WISHES.length));
    setStars(Array.from({ length: 8 }, (_, i) => ({ id: i, top: `${10 + Math.random() * 60}%`, delay: `${i * 0.2}s` })));
    setShowWish(true);
    setTimeout(() => { setShowWish(false); setStars([]); setPage("journey"); }, 2800);
  };

  const moveNoBtn = (e) => {
    e.stopPropagation();
    setNoClicks(c => c + 1);
    setNoPos({ x: Math.random() * (window.innerWidth - 140), y: Math.random() * (window.innerHeight - 60) });
  };

  const noMessages = ["Nope! 😜","Too slow! 💨","Try again! 😂","Not a chance! 💖","Say YES! 🥺","I'm watching! 👀","You can't escape! ❤️"];

  return (
    <div
      className="proposal-page"
      onMouseMove={!opened ? handleMouseMove : undefined}
      onMouseLeave={!opened ? handleMouseLeave : undefined}
    >
      {/* Shooting stars */}
      {stars.map(s => (
        <div key={s.id} className="shooting-star" style={{ top: s.top, animationDelay: s.delay }} />
      ))}

      {/* Wish overlay */}
      <AnimatePresence>
        {showWish && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(16px)" }}
          >
            <motion.div
              initial={{ scale: 0.7, rotateY: -20, opacity: 0 }}
              animate={{ scale: 1,   rotateY: 0,   opacity: 1 }}
              transition={{ type:"spring", stiffness:200, damping:20 }}
              style={{ textAlign:"center", padding:"48px 36px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"32px", backdropFilter:"blur(24px)", boxShadow:"0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(236,72,153,0.2)", transformPerspective:900 }}
            >
              <div style={{ fontSize:"3rem", marginBottom:"16px", animation:"floatEmoji 2s ease-in-out infinite alternate" }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.4rem", fontWeight:800, color:"#fff", margin:"0 0 12px", letterSpacing:"-0.3px" }}>{WISHES[wishIdx]}</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.5)", margin:0 }}>Taking you to our story... 💕</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Gift Box with mouse parallax */}
      <motion.div
        ref={boxRef}
        className={`proposal-container ${opened ? "opened" : ""}`}
        onClick={handleOpen}
        style={{ cursor: opened ? "default" : "pointer" }}
        animate={{
          rotateX: opened ? 5 : -mouse.y,
          rotateY: opened ? 0 :  mouse.x,
          scale:   opened ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <motion.div
          className="gift-box"
          whileHover={!opened ? { scale: 1.04 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="lid">
            <div className="bow" />
          </div>
          <div className="body" />
          <div className="ribbon-horizontal" />
          <div className="ribbon-vertical" />
          {!opened && (
            <motion.div
              className="box-label"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Open Me 🎁
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Letter Card with 3D tilt */}
      <AnimatePresence>
        {letterOpen && (
          <motion.div
            ref={letterTilt.ref}
            onMouseMove={letterTilt.onMouseMove}
            onMouseLeave={letterTilt.onMouseLeave}
            onMouseEnter={letterTilt.onMouseEnter}
            className="letter-card tilt-card"
            initial={{ opacity: 0, rotateX: 14, y: 60, scale: 0.93 }}
            animate={{ opacity: 1, rotateX: 0,  y: 0,  scale: 1   }}
            exit={{    opacity: 0, rotateX: -8,  y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            style={{ transformPerspective: 900 }}
          >
            <div className="tilt-shine" style={{ borderRadius: "32px" }} />
            <div className="letter-envelope-top" />
            <div className="letter-hearts">
              {["💖","✨","💕","🌸","💗"].map((e, i) => (
                <span key={i} className="float-emoji" style={{ animationDelay:`${i*0.4}s`, left:`${8+i*18}%` }}>{e}</span>
              ))}
            </div>
            <h2 className="letter-title">{letterTitle}</h2>
            <p className="letter-body" style={{ whiteSpace:"pre-line" }}>{letterBody}</p>
            <motion.div
              className="proposal-question"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              {propQuestion}
            </motion.div>
            <div className="proposal-btns">
              <motion.button
                className="yes-btn"
                whileHover={{ scale: 1.08, translateY: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYes}
              >
                {yesBtnText}
              </motion.button>
              <button
                ref={noBtnRef}
                className="no-btn"
                style={noPos.x !== null ? { position:"fixed", left:noPos.x, top:noPos.y, zIndex:9999 } : {}}
                onMouseEnter={moveNoBtn}
                onClick={moveNoBtn}
              >
                {noClicks === 0 ? "No 😅" : noMessages[Math.min(noClicks-1, noMessages.length-1)]}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
