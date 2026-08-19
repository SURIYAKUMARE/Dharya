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
  "Forever is not long enough when I'm with you 💫",
];

const NO_MESSAGES = [
  "Nope! 😜", "Too slow! 💨", "Try again! 😂", "Not a chance! 💖",
  "Say YES! 🥺", "I'm watching! 👀", "You can't escape! ❤️",
  "WRONG BUTTON! 😤", "Come on! 🥹", "Really?! 😭",
];

/* ── floating petals + hearts ── */
function FloatingPetals() {
  const items = ["💖","💗","💕","✨","🌸","💫","🌺","💗","🌟","💖","🌷","✨","💝","🌸","💫"];
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {[...Array(18)].map((_,i) => (
        <span key={i} style={{
          position:"absolute", bottom:"-60px",
          left:`${(i*5.8+1.5)%96}%`,
          fontSize:`${10+(i%5)*5}px`,
          opacity: 0.10 + (i%4)*0.05,
          animation:`floatUp ${10+(i%6)*2.5}s linear ${i*0.7}s infinite`,
          filter:"drop-shadow(0 0 5px rgba(255,26,110,0.35))",
        }}>{items[i%items.length]}</span>
      ))}
    </div>
  );
}

/* ── ambient particle dots ── */
function ParticleDots() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {[...Array(30)].map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          width: `${1+(i%3)}px`, height:`${1+(i%3)}px`,
          borderRadius:"50%",
          top:`${Math.random()*100}%`, left:`${(i*3.3)%100}%`,
          background:`rgba(255,${80+(i%3)*60},${150+(i%4)*26},${0.12+(i%5)*0.08})`,
          animation:`twinkleP ${3+(i%5)}s ease-in-out ${i*0.3}s infinite alternate`,
        }}/>
      ))}
    </div>
  );
}

export default function ProposalBox({ opened, setOpened, setPage }) {
  const [letterOpen,   setLetterOpen]   = useState(false);
  const [noPos,        setNoPos]        = useState({ x:null, y:null });
  const [noClicks,     setNoClicks]     = useState(0);
  const [showWish,     setShowWish]     = useState(false);
  const [wishIdx,      setWishIdx]      = useState(0);
  const [stars,        setStars]        = useState([]);
  const [letterTitle,  setLetterTitle]  = useState("My Dearest Moon,");
  const [letterBody,   setLetterBody]   = useState(
    "From the very first moment I saw you, I knew you were someone special ✨\n\nEvery day with you feels like a gift — your laugh, your kindness, the way your eyes light up when you smile 🌸\n\nYou make every ordinary moment extraordinary.\nMy heart has chosen you, and it will keep choosing you — every single day 💓\n\nThis is just the beginning of our forever 🌹"
  );
  const [propQuestion, setPropQuestion] = useState("Will You Be Mine Forever? 💍");
  const [yesBtnText,   setYesBtnText]   = useState("💍 Yes, Always!");
  const [mouse,        setMouse]        = useState({ x:0, y:0 });
  const [mounted,      setMounted]      = useState(false);
  const [heartBurst,   setHeartBurst]   = useState([]);
  const boxRef     = useRef(null);
  const noBtnRef   = useRef(null);
  const letterTilt = useTilt(6);

  useEffect(() => {
    dbGet("prop_title",    "My Dearest Moon,").then(v => { if (v) setLetterTitle(v); });
    dbGet("prop_body",     "").then(v => { if (v && v.length > 5) setLetterBody(v); });
    dbGet("prop_question", "Will You Be Mine Forever? 💍").then(v => { if (v) setPropQuestion(v); });
    dbGet("prop_yes_btn",  "💍 Yes, Always!").then(v => { if (v) setYesBtnText(v); });
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const handleMouseMove = useCallback((e) => {
    const el = boxRef.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left  - r.width/2)  / (window.innerWidth/2))  * 16,
      y: ((e.clientY - r.top   - r.height/2) / (window.innerHeight/2)) * 12,
    });
  }, []);
  const handleMouseLeave = useCallback(() => setMouse({ x:0, y:0 }), []);

  const handleOpen = () => {
    if (!opened) {
      setOpened(true);
      setTimeout(() => setLetterOpen(true), 900);
    }
  };

  const handleYes = () => {
    setWishIdx(Math.floor(Math.random() * WISHES.length));
    const burst = Array.from({ length:22 }, (_,i) => ({
      id:i, sym:["💖","🌸","✨","💕","💫","🌟"][i%6],
      left:`${2+i*4.5}%`, delay:`${i*0.045}s`,
      dur:`${1.1+Math.random()*0.8}s`, size:`${16+(i%4)*8}px`,
    }));
    setHeartBurst(burst);
    setStars(Array.from({ length:12 }, (_,i) => ({
      id:i, top:`${5+Math.random()*70}%`, left:`${Math.random()*92}%`, delay:`${i*0.12}s`,
    })));
    setShowWish(true);
    setTimeout(() => { setShowWish(false); setStars([]); setHeartBurst([]); setPage("journey"); }, 3000);
  };

  const moveNoBtn = (e) => {
    e.stopPropagation();
    setNoClicks(c => c+1);
    const margin = 20;
    setNoPos({
      x: margin + Math.random() * (window.innerWidth  - 160 - margin*2),
      y: margin + Math.random() * (window.innerHeight -  60 - margin*2),
    });
  };

  return (
    <div
      className="proposal-page"
      onMouseMove={!opened ? handleMouseMove : undefined}
      onMouseLeave={!opened ? handleMouseLeave : undefined}
      style={{ position:"relative", minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}
    >
      <FloatingPetals />
      <ParticleDots />

      {/* Ambient radial glows */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(ellipse at 22% 30%,rgba(255,26,110,0.16) 0%,transparent 52%), radial-gradient(ellipse at 80% 72%,rgba(139,92,246,0.14) 0%,transparent 50%)" }}/>

      {/* Yes burst hearts */}
      {heartBurst.map(h => (
        <span key={h.id} style={{
          position:"fixed", bottom:"-60px", left:h.left,
          fontSize:h.size, pointerEvents:"none", zIndex:200,
          animation:`floatUp ${h.dur} ${h.delay} linear forwards`,
          filter:"drop-shadow(0 0 8px rgba(255,26,110,0.6))",
        }}>{h.sym}</span>
      ))}

      {/* Confetti stars on yes */}
      {stars.map(s => (
        <div key={s.id} className="shooting-star" style={{ top:s.top, left:s.left, animationDelay:s.delay }}/>
      ))}

      {/* ── WISH OVERLAY ── */}
      <AnimatePresence>
        {showWish && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:9999,
              display:"flex", alignItems:"center", justifyContent:"center",
              backdropFilter:"blur(22px)" }}>
            <motion.div
              initial={{ scale:0.6, rotateY:-25, opacity:0, y:30 }}
              animate={{ scale:1, rotateY:0, opacity:1, y:0 }}
              transition={{ type:"spring", stiffness:180, damping:18 }}
              style={{ textAlign:"center", padding:"56px 44px",
                background:"linear-gradient(135deg,rgba(255,26,110,0.12),rgba(139,92,246,0.08))",
                border:"1px solid rgba(255,26,110,0.25)", borderRadius:36,
                backdropFilter:"blur(28px)", maxWidth:440, width:"90%",
                boxShadow:"0 50px 120px rgba(0,0,0,0.6), 0 0 100px rgba(255,26,110,0.2)" }}>
              {/* top ribbon */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, borderRadius:"36px 36px 0 0",
                background:"linear-gradient(90deg,transparent,#ff1a6e,#f59e0b,#ff1a6e,transparent)" }}/>
              <motion.div
                animate={{ scale:[1,1.12,1], rotate:[0,5,-5,0] }}
                transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}
                style={{ fontSize:"3.8rem", marginBottom:20 }}>💍✨💍</motion.div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", fontWeight:600,
                fontStyle:"italic", color:"#fff", margin:"0 0 14px", lineHeight:1.45,
                textShadow:"0 0 40px rgba(255,26,110,0.4)" }}>{WISHES[wishIdx]}</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem",
                color:"rgba(255,255,255,0.45)", margin:"0 0 24px" }}>Taking you to our story… 💕</p>
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                {[...Array(5)].map((_,i) => (
                  <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:"#ff1a6e",
                    animation:`dotPulse 1.2s ease-in-out ${i*0.15}s infinite alternate` }}/>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ GIFT BOX ═══════════════ */}
      {!letterOpen && (
        <motion.div
          ref={boxRef}
          className={`proposal-container ${opened ? "opened" : ""}`}
          onClick={handleOpen}
          style={{ cursor:opened?"default":"pointer", position:"relative", zIndex:10 }}
          animate={{ rotateX:opened?4:-mouse.y, rotateY:opened?0:mouse.x, scale:opened?0.8:1 }}
          transition={{ type:"spring", stiffness:100, damping:18 }}
          initial={{ opacity:0, y:50, scale:0.88 }}
        >
          {/* Pulsing glow halo */}
          {!opened && (
            <>
              <motion.div
                animate={{ scale:[1,1.15,1], opacity:[0.3,0.6,0.3] }}
                transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }}
                style={{ position:"absolute", inset:-32, borderRadius:"50%",
                  background:"radial-gradient(circle,rgba(255,26,110,0.22) 0%,transparent 68%)",
                  pointerEvents:"none" }}/>
              <motion.div
                animate={{ scale:[1,1.25,1], opacity:[0.15,0.35,0.15] }}
                transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut", delay:0.4 }}
                style={{ position:"absolute", inset:-52, borderRadius:"50%",
                  background:"radial-gradient(circle,rgba(255,26,110,0.12) 0%,transparent 68%)",
                  pointerEvents:"none" }}/>
            </>
          )}

          <motion.div
            className="gift-box"
            whileHover={!opened ? { scale:1.07, y:-6 } : {}}
            transition={{ type:"spring", stiffness:260, damping:18 }}
            style={{ transformStyle:"preserve-3d", position:"relative" }}>
            <div className="lid"><div className="bow"/></div>
            <div className="body"/>
            <div className="ribbon-horizontal"/>
            <div className="ribbon-vertical"/>
            {!opened && (
              <motion.div
                className="box-label"
                animate={{ scale:[1,1.08,1], opacity:[0.85,1,0.85] }}
                transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}>
                Open Me 🎁
              </motion.div>
            )}
          </motion.div>

          {/* Orbiting sparkles */}
          {!opened && (
            <div style={{ position:"absolute", inset:-24, pointerEvents:"none" }}>
              {["✨","💫","⭐","💕","🌸","✨"].map((s,i) => (
                <span key={i} style={{
                  position:"absolute",
                  top:`${8+i*14}%`, left:`${i%2===0?"-8%":"104%"}`,
                  fontSize:`${11+(i%3)*5}px`,
                  opacity:0.55+(i%3)*0.12,
                  animation:`floatEmoji ${2.2+i*0.4}s ease-in-out ${i*0.28}s infinite alternate`,
                }}>{s}</span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Helper hint */}
      {!opened && !letterOpen && (
        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:mounted?1:0, y:mounted?0:16 }}
          transition={{ delay:0.9 }}
          style={{ marginTop:28, textAlign:"center", position:"relative", zIndex:10 }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem",
            color:"rgba(255,255,255,0.32)", fontStyle:"italic", margin:"0 0 8px" }}>
            Something special is waiting inside… tap to open 💌
          </p>
          <motion.div animate={{ y:[0,-4,0] }} transition={{ duration:1.6, repeat:Infinity, ease:"easeInOut" }}
            style={{ fontSize:"1.2rem" }}>👆</motion.div>
        </motion.div>
      )}

      {/* ═══════════════ LETTER CARD ═══════════════ */}
      <AnimatePresence>
        {letterOpen && (
          <motion.div
            ref={letterTilt.ref}
            onMouseMove={letterTilt.onMouseMove}
            onMouseLeave={letterTilt.onMouseLeave}
            onMouseEnter={letterTilt.onMouseEnter}
            className="letter-card tilt-card"
            initial={{ opacity:0, rotateX:20, y:80, scale:0.88 }}
            animate={{ opacity:1, rotateX:0, y:0, scale:1 }}
            exit={{ opacity:0, rotateX:-10, y:-30, scale:0.94 }}
            transition={{ type:"spring", stiffness:150, damping:20 }}
            style={{ transformPerspective:900, position:"relative", zIndex:20,
              width:"100%", maxWidth:500, margin:"0 auto" }}
          >
            <div className="tilt-shine" style={{ borderRadius:32 }}/>

            {/* Shimmer ribbon */}
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:3,
              background:"linear-gradient(90deg,transparent,#ff1a6e,#f59e0b,#c084fc,#ff1a6e,transparent)",
              borderRadius:"32px 32px 0 0", backgroundSize:"200% 100%",
              animation:"shimmerRibbon 2.8s linear infinite",
            }}/>

            <div className="letter-envelope-top"/>

            {/* Floating emoji row */}
            <div className="letter-hearts">
              {["💖","✨","💕","🌸","💗","🌺"].map((e,i) => (
                <span key={i} className="float-emoji" style={{ animationDelay:`${i*0.35}s`, left:`${6+i*16}%` }}>{e}</span>
              ))}
            </div>

            {/* Ring */}
            <motion.div
              animate={{ scale:[1,1.12,1], rotate:[0,8,-8,0] }}
              transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
              style={{ textAlign:"center", fontSize:"2.6rem", marginBottom:10 }}>💍</motion.div>

            {/* Title */}
            <h2 className="letter-title" style={{ textAlign:"center", fontSize:"1.6rem" }}>{letterTitle}</h2>

            {/* Divider */}
            <div style={{ height:1, margin:"12px auto 18px", maxWidth:200,
              background:"linear-gradient(90deg,transparent,rgba(255,26,110,0.5),transparent)" }}/>

            {/* Body */}
            <p className="letter-body" style={{ whiteSpace:"pre-line", textAlign:"center", lineHeight:1.85, fontSize:"0.96rem" }}>{letterBody}</p>

            {/* Quote */}
            <div style={{ margin:"20px 0 24px", padding:"16px 22px",
              background:"rgba(255,26,110,0.06)", borderLeft:"3px solid rgba(255,26,110,0.4)",
              borderRadius:"0 14px 14px 0" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", fontStyle:"italic",
                color:"rgba(255,255,255,0.6)", margin:0, lineHeight:1.6 }}>
                "You are my today and all of my tomorrows." 🌙
              </p>
            </div>

            {/* Question */}
            <motion.div
              animate={{ scale:[1,1.05,1], boxShadow:["0 0 30px rgba(255,26,110,0.1)","0 0 50px rgba(255,26,110,0.28)","0 0 30px rgba(255,26,110,0.1)"] }}
              transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
              style={{ textAlign:"center",
                background:"linear-gradient(135deg,rgba(255,26,110,0.13),rgba(139,92,246,0.1))",
                border:"1.5px solid rgba(255,26,110,0.35)", borderRadius:22,
                padding:"22px 26px", margin:"0 0 24px", fontSize:"1.4rem",
                fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", color:"#fff",
                fontWeight:600 }}>
              {propQuestion}
            </motion.div>

            {/* Buttons */}
            <div className="proposal-btns" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              <motion.button
                className="yes-btn"
                whileHover={{ scale:1.08, y:-5, boxShadow:"0 24px 56px rgba(255,26,110,0.55)" }}
                whileTap={{ scale:0.94 }}
                onClick={handleYes}
                style={{
                  padding:"17px 42px",
                  background:"linear-gradient(135deg,#ff1a6e,#c8005e,#f59e0b)",
                  border:"none", borderRadius:50, color:"#fff",
                  fontFamily:"'Manrope',sans-serif", fontSize:"1.12rem", fontWeight:800,
                  cursor:"pointer", letterSpacing:"0.3px",
                  boxShadow:"0 14px 42px rgba(255,26,110,0.45)",
                  position:"relative", overflow:"hidden",
                }}>
                {/* shimmer sweep */}
                <div style={{
                  position:"absolute", inset:0, borderRadius:50,
                  background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.22) 50%,transparent 65%)",
                  backgroundSize:"200% 100%", animation:"shimmerRibbon 2s linear infinite",
                }}/>
                <span style={{ position:"relative" }}>{yesBtnText}</span>
              </motion.button>

              <button
                ref={noBtnRef}
                className="no-btn"
                style={noPos.x !== null ? { position:"fixed", left:noPos.x, top:noPos.y, zIndex:9999 } : {}}
                onMouseEnter={moveNoBtn}
                onClick={moveNoBtn}>
                {noClicks === 0 ? "No 😅" : NO_MESSAGES[Math.min(noClicks-1, NO_MESSAGES.length-1)]}
              </button>
            </div>

            {/* Footer note */}
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.76rem",
              color:"rgba(255,255,255,0.22)", textAlign:"center", marginTop:20, fontStyle:"italic" }}>
              — with all my love, Surya 💙
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
