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

/* ── floating hearts background ── */
function FloatingHearts() {
  const hearts = ["💖","💗","💕","✨","🌸","💫","⭐","💗","🌟","💖"];
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {[...Array(16)].map((_,i) => (
        <span key={i} style={{
          position:"absolute",
          bottom:"-50px",
          left:`${(i*6.2+2)%96}%`,
          fontSize:`${12+(i%4)*6}px`,
          opacity:0.12+(i%3)*0.06,
          animation:`floatUp ${9+(i%5)*2}s linear ${i*0.8}s infinite`,
          filter:"drop-shadow(0 0 4px rgba(255,26,110,0.4))",
        }}>{hearts[i%hearts.length]}</span>
      ))}
    </div>
  );
}

/* ── shooting stars ── */
function ShootingStars() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {[...Array(6)].map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          top:`${5+i*14}%`,
          left:`${i*16}%`,
          width:`${60+i*20}px`, height:"1.5px",
          borderRadius:2,
          background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)",
          transform:"rotate(-20deg)",
          animation:`shootingStar ${4+i*1.5}s linear ${i*2.2}s infinite`,
          opacity:0,
        }}/>
      ))}
    </div>
  );
}

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
  const [mouse,        setMouse]        = useState({ x:0, y:0 });
  const [mounted,      setMounted]      = useState(false);
  const boxRef     = useRef(null);
  const noBtnRef   = useRef(null);
  const letterTilt = useTilt(8);

  useEffect(() => {
    dbGet("prop_title",    "My Dearest Moon,").then(v => { if (v) setLetterTitle(v); });
    dbGet("prop_body",     "").then(v => { if (v) setLetterBody(v); });
    dbGet("prop_question", "Will You Marry Me? 💍").then(v => { if (v) setPropQuestion(v); });
    dbGet("prop_yes_btn",  "💍 Yes, I Will!").then(v => { if (v) setYesBtnText(v); });
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const handleMouseMove = useCallback((e) => {
    const el = boxRef.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left - r.width/2)  / (window.innerWidth/2))  * 18,
      y: ((e.clientY - r.top  - r.height/2) / (window.innerHeight/2)) * 14,
    });
  }, []);
  const handleMouseLeave = useCallback(() => setMouse({ x:0, y:0 }), []);

  const handleOpen = () => {
    if (!opened) { setOpened(true); setTimeout(() => setLetterOpen(true), 900); }
  };

  const handleYes = () => {
    setWishIdx(Math.floor(Math.random() * WISHES.length));
    setStars(Array.from({ length:10 }, (_,i) => ({ id:i, top:`${8+Math.random()*65}%`, left:`${Math.random()*90}%`, delay:`${i*0.15}s` })));
    setShowWish(true);
    setTimeout(() => { setShowWish(false); setStars([]); setPage("journey"); }, 2800);
  };

  const moveNoBtn = (e) => {
    e.stopPropagation();
    setNoClicks(c => c+1);
    setNoPos({ x:Math.random()*(window.innerWidth-150), y:Math.random()*(window.innerHeight-60) });
  };
  const noMessages = ["Nope! 😜","Too slow! 💨","Try again! 😂","Not a chance! 💖","Say YES! 🥺","I'm watching! 👀","You can't escape! ❤️"];

  return (
    <div className="proposal-page" onMouseMove={!opened ? handleMouseMove : undefined} onMouseLeave={!opened ? handleMouseLeave : undefined}
      style={{ position:"relative", minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>

      <FloatingHearts />
      <ShootingStars />

      {/* Ambient orbs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(ellipse at 25% 35%, rgba(255,26,110,0.14) 0%, transparent 55%), radial-gradient(ellipse at 78% 70%, rgba(139,92,246,0.12) 0%, transparent 50%)" }}/>

      {/* Shooting stars on yes */}
      {stars.map(s => (
        <div key={s.id} className="shooting-star" style={{ top:s.top, left:s.left, animationDelay:s.delay }}/>
      ))}

      {/* Wish overlay */}
      <AnimatePresence>
        {showWish && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(18px)" }}>
            <motion.div
              initial={{ scale:0.7, rotateY:-20, opacity:0 }}
              animate={{ scale:1, rotateY:0, opacity:1 }}
              transition={{ type:"spring", stiffness:200, damping:20 }}
              style={{ textAlign:"center", padding:"52px 40px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:32, backdropFilter:"blur(24px)", boxShadow:"0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(236,72,153,0.25)" }}>
              <div style={{ fontSize:"3.2rem", marginBottom:18, animation:"floatEmoji 2s ease-in-out infinite alternate" }}>💍✨💍</div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 14px", lineHeight:1.4 }}>{WISHES[wishIdx]}</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", color:"rgba(255,255,255,0.45)", margin:0 }}>Taking you to our story… 💕</p>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:20 }}>
                {[...Array(5)].map((_,i) => (
                  <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#ff1a6e", animation:`dotPulse 1.2s ease-in-out ${i*0.15}s infinite alternate` }}/>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ GIFT BOX ═══ */}
      {!letterOpen && (
        <motion.div
          ref={boxRef}
          className={`proposal-container ${opened ? "opened" : ""}`}
          onClick={handleOpen}
          style={{ cursor:opened?"default":"pointer", position:"relative", zIndex:10 }}
          animate={{ rotateX:opened?5:-mouse.y, rotateY:opened?0:mouse.x, scale:opened?0.82:1 }}
          transition={{ type:"spring", stiffness:120, damping:18 }}
          initial={{ opacity:0, y:40, scale:0.9 }}
        >
          {/* Glow ring */}
          {!opened && (
            <motion.div
              animate={{ scale:[1,1.08,1], opacity:[0.4,0.7,0.4] }}
              transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
              style={{ position:"absolute", inset:-24, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,26,110,0.22) 0%,transparent 70%)", pointerEvents:"none" }}
            />
          )}

          <motion.div className="gift-box" whileHover={!opened?{scale:1.06}:{}} transition={{ type:"spring", stiffness:300, damping:20 }} style={{ transformStyle:"preserve-3d", position:"relative" }}>
            <div className="lid"><div className="bow"/></div>
            <div className="body"/>
            <div className="ribbon-horizontal"/>
            <div className="ribbon-vertical"/>
            {!opened && (
              <motion.div className="box-label" animate={{ scale:[1,1.07,1] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}>
                Open Me 🎁
              </motion.div>
            )}
          </motion.div>

          {/* Sparkle particles around box */}
          {!opened && (
            <div style={{ position:"absolute", inset:-20, pointerEvents:"none" }}>
              {["✨","💫","⭐","✨","💫"].map((s,i) => (
                <span key={i} style={{
                  position:"absolute",
                  top:`${10+i*18}%`, left:`${i%2===0?"-5%":"102%"}`,
                  fontSize:`${12+(i%2)*6}px`,
                  opacity:0.5+Math.sin(i)*0.3,
                  animation:`floatEmoji ${2+i*0.4}s ease-in-out ${i*0.3}s infinite alternate`,
                }}>{s}</span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Helper text when closed */}
      {!opened && !letterOpen && (
        <motion.p
          initial={{ opacity:0, y:16 }} animate={{ opacity:mounted?1:0, y:mounted?0:16 }} transition={{ delay:0.8 }}
          style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"rgba(255,255,255,0.35)", marginTop:28, fontStyle:"italic", textAlign:"center", position:"relative", zIndex:10 }}>
          Something special is waiting inside… tap to open 💌
        </motion.p>
      )}

      {/* ═══ LETTER CARD ═══ */}
      <AnimatePresence>
        {letterOpen && (
          <motion.div
            ref={letterTilt.ref}
            onMouseMove={letterTilt.onMouseMove}
            onMouseLeave={letterTilt.onMouseLeave}
            onMouseEnter={letterTilt.onMouseEnter}
            className="letter-card tilt-card"
            initial={{ opacity:0, rotateX:16, y:70, scale:0.92 }}
            animate={{ opacity:1, rotateX:0, y:0, scale:1 }}
            exit={{ opacity:0, rotateX:-8, y:-30, scale:0.95 }}
            transition={{ type:"spring", stiffness:160, damping:22 }}
            style={{ transformPerspective:900, position:"relative", zIndex:20, width:"100%", maxWidth:480, margin:"0 auto" }}
          >
            <div className="tilt-shine" style={{ borderRadius:"32px" }}/>

            {/* Top ribbon */}
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:"2px",
              background:"linear-gradient(90deg,transparent,#ff1a6e,#f59e0b,#ff1a6e,transparent)",
              borderRadius:"32px 32px 0 0",
              backgroundSize:"200% 100%",
              animation:"shimmerRibbon 2.5s linear infinite",
            }}/>

            <div className="letter-envelope-top"/>
            <div className="letter-hearts">
              {["💖","✨","💕","🌸","💗"].map((e,i) => (
                <span key={i} className="float-emoji" style={{ animationDelay:`${i*0.4}s`, left:`${8+i*18}%` }}>{e}</span>
              ))}
            </div>

            {/* Rose decoration */}
            <div style={{ textAlign:"center", fontSize:"2.2rem", marginBottom:8, animation:"floatEmoji 3s ease-in-out infinite alternate" }}>💍</div>

            <h2 className="letter-title" style={{ textAlign:"center" }}>{letterTitle}</h2>
            <p className="letter-body" style={{ whiteSpace:"pre-line", textAlign:"center" }}>{letterBody}</p>

            <motion.div
              className="proposal-question"
              animate={{ scale:[1,1.06,1] }}
              transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}
              style={{
                textAlign:"center",
                background:"linear-gradient(135deg,rgba(255,26,110,0.12),rgba(139,92,246,0.1))",
                border:"1.5px solid rgba(255,26,110,0.3)",
                borderRadius:20,
                padding:"20px 24px",
                margin:"20px 0",
                fontSize:"1.35rem",
                boxShadow:"0 0 40px rgba(255,26,110,0.15)",
              }}>
              {propQuestion}
            </motion.div>

            <div className="proposal-btns" style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <motion.button
                className="yes-btn"
                whileHover={{ scale:1.08, y:-4, boxShadow:"0 20px 50px rgba(255,26,110,0.5)" }}
                whileTap={{ scale:0.95 }}
                onClick={handleYes}
                style={{
                  padding:"16px 36px",
                  background:"linear-gradient(135deg,#ff1a6e,#f59e0b)",
                  border:"none", borderRadius:50, color:"#fff",
                  fontFamily:"'Manrope',sans-serif", fontSize:"1.1rem", fontWeight:800,
                  cursor:"pointer",
                  boxShadow:"0 12px 36px rgba(255,26,110,0.4)",
                  letterSpacing:"0.2px",
                }}>
                {yesBtnText}
              </motion.button>
              <button
                ref={noBtnRef}
                className="no-btn"
                style={noPos.x !== null ? { position:"fixed", left:noPos.x, top:noPos.y, zIndex:9999 } : {}}
                onMouseEnter={moveNoBtn}
                onClick={moveNoBtn}>
                {noClicks === 0 ? "No 😅" : noMessages[Math.min(noClicks-1, noMessages.length-1)]}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
