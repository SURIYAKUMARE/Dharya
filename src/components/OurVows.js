import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Unlock, Pen, X, Sparkles, CheckCircle } from "lucide-react";
import { dbGet, dbSet } from "../api";
import { useTilt } from "../App";

const DEFAULT_SURYA_VOW = `Sadhana,

I vow to love you not just on the easy days, but on the hard ones — when life is loud, when you are tired, when the world feels like too much.

I vow to be the person you call first, the one who shows up without being asked, the hand that reaches for yours before you even have to reach.

I vow to celebrate every version of you — the one who is thriving, and the one who is still finding her way.

I vow to be patient with your fears, honest with my heart, and present in every moment we are given.

I vow to spend the rest of my life trying to be worthy of your love — and never, not for a single day, taking it for granted.

You are my beginning, my present, and every future I have ever imagined.

I choose you, Sadhana.
Today, tomorrow, and in every lifetime after this.`;

const VOW_CARDS = [
  {
    id: 0, key: "surya",
    name: "Surya's Vow",
    from: "Written by Surya",
    accent: "#3b82f6",
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))",
    border: "rgba(59,130,246,0.25)",
    glow: "rgba(59,130,246,0.2)",
    avatar: "💙",
  },
  {
    id: 1, key: "sadhana",
    name: "Sadhana's Vow",
    from: "Written by Sadhana",
    accent: "#EC4899",
    gradient: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(139,92,246,0.08))",
    border: "rgba(236,72,153,0.25)",
    glow: "rgba(236,72,153,0.2)",
    avatar: "💗",
  },
];

export default function OurVows({ user }) {
  const [active,     setActive]     = useState(null);
  const [revealed,   setRevealed]   = useState(false);
  const [suryaVow,   setSuryaVow]   = useState(DEFAULT_SURYA_VOW);
  const [sadhanaVow, setSadhanaVow] = useState("");
  const [sealed,     setSealed]     = useState(false);
  const [sealing,    setSealing]    = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [particles,  setParticles]  = useState([]);

  useEffect(() => {
    dbGet("surya_vow_text","").then(v => { if (v?.trim()) setSuryaVow(v); });
    dbGet("vow_text","").then(v => { if (v) setSadhanaVow(v); });
    dbGet("vow_sealed",false).then(s => { if (s) setSealed(true); });
  }, []); // eslint-disable-line

  const openVow  = (i) => { setActive(i); setRevealed(false); setTimeout(()=>setRevealed(true),300); };
  const closeVow = ()  => { setRevealed(false); setTimeout(()=>setActive(null),300); };

  const sealVow = async () => {
    if (!sadhanaVow.trim()) return;
    setSealing(true);
    setParticles(Array.from({length:14},(_,i)=>i));
    await dbSet("vow_text", sadhanaVow);
    await dbSet("vow_sealed", true);
    setTimeout(() => { setSealed(true); setSealing(false); setEditMode(false); setParticles([]); }, 1600);
  };

  const unseal = async () => { await dbSet("vow_sealed",false); setSealed(false); setEditMode(true); };
  const getVowText = (i) => i===0 ? suryaVow : sadhanaVow;
  const card = (i) => VOW_CARDS[i];

  /* ── 3D tilt vow card ── */
  function VowCard({ c, i }) {
    const tilt = useTilt(7);
    return (
      <motion.div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onMouseEnter={tilt.onMouseEnter}
        initial={{opacity:0,y:24,rotateX:8}} animate={{opacity:1,y:0,rotateX:0}}
        transition={{delay:0.1+i*0.15,duration:0.55,type:"spring",bounce:0.35}}
        style={{ background:c.gradient, border:`1px solid ${c.border}`, borderRadius:"24px", padding:"28px", position:"relative", overflow:"hidden", transformPerspective:800 }}
      >
        {/* shine layer */}
        <div className="tilt-shine" style={{borderRadius:"24px"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${c.accent},transparent)`,opacity:0.8}}/>
        {/* floating glow orb */}
        <div style={{position:"absolute",top:"-40px",right:"-40px",width:"120px",height:"120px",background:`radial-gradient(circle,${c.glow} 0%,transparent 70%)`,borderRadius:"50%",pointerEvents:"none",filter:"blur(20px)"}}/>

        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{width:"52px",height:"52px",background:`linear-gradient(135deg,${c.accent},#8B5CF6)`,borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0,boxShadow:`0 8px 20px ${c.glow}`,animation:"avatarDepth 6s ease-in-out infinite alternate"}}>
              {c.avatar}
            </div>
            <div>
              <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"1.1rem",fontWeight:800,color:"#fff",margin:"0 0 4px",letterSpacing:"-0.2px"}}>{c.name}</h3>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"0.75rem",color:"rgba(255,255,255,0.4)",margin:0}}>{c.from}</p>
            </div>
          </div>
          <div style={{flexShrink:0}}>
            {i===0 ? (
              <button onClick={()=>openVow(0)}
                style={{display:"flex",alignItems:"center",gap:"7px",padding:"10px 18px",background:`linear-gradient(90deg,${c.accent},#8B5CF6)`,border:"none",borderRadius:"12px",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.8rem",fontWeight:700,color:"#fff",boxShadow:`0 6px 18px ${c.glow}`,transition:"transform 0.22s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.22s",whiteSpace:"nowrap"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.04)";e.currentTarget.style.boxShadow=`0 14px 32px ${c.glow}`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 6px 18px ${c.glow}`;}}>
                <Unlock size={13}/> Read Vow
              </button>
            ) : user==="surya" ? (
              sealed
                ? <button onClick={()=>openVow(1)} style={{display:"flex",alignItems:"center",gap:"7px",padding:"10px 18px",background:`linear-gradient(90deg,${c.accent},#8B5CF6)`,border:"none",borderRadius:"12px",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.8rem",fontWeight:700,color:"#fff",boxShadow:`0 6px 18px ${c.glow}`,whiteSpace:"nowrap"}}>
                    <Lock size={13}/> Read Sealed Vow
                  </button>
                : <div style={{padding:"8px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px"}}>
                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:"0.75rem",color:"rgba(255,255,255,0.3)",margin:0,fontStyle:"italic"}}>Not written yet 🌸</p>
                  </div>
            ) : (
              sealed && !editMode
                ? <button onClick={()=>openVow(1)} style={{display:"flex",alignItems:"center",gap:"7px",padding:"10px 18px",background:`linear-gradient(90deg,${c.accent},#8B5CF6)`,border:"none",borderRadius:"12px",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.8rem",fontWeight:700,color:"#fff",boxShadow:`0 6px 18px ${c.glow}`,whiteSpace:"nowrap"}}>
                    <Lock size={13}/> View My Vow
                  </button>
                : null
            )}
          </div>
        </div>

        {i===1 && user==="sadhana" && (!sealed||editMode) && (
          <div style={{marginTop:"20px"}}>
            <textarea placeholder="Write your vow to Surya here… from your heart 💗" value={sadhanaVow} onChange={e=>setSadhanaVow(e.target.value)}
              rows={5} disabled={sealing}
              style={{width:"100%",boxSizing:"border-box",padding:"14px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",color:"#fff",fontFamily:"'Inter',sans-serif",fontSize:"0.9rem",outline:"none",resize:"vertical",lineHeight:1.7,minHeight:"120px"}}/>
            <button onClick={sealVow} disabled={!sadhanaVow.trim()||sealing}
              style={{marginTop:"12px",display:"flex",alignItems:"center",gap:"8px",padding:"13px 28px",background:(!sadhanaVow.trim()||sealing)?"rgba(255,255,255,0.05)":`linear-gradient(90deg,${c.accent},#8B5CF6)`,border:"none",borderRadius:"13px",cursor:(!sadhanaVow.trim()||sealing)?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.88rem",fontWeight:700,color:"#fff",boxShadow:sadhanaVow.trim()?`0 8px 24px ${c.glow}`:"none",opacity:(!sadhanaVow.trim()||sealing)?0.4:1}}>
              {sealing?<><Sparkles size={14}/> Sealing…</>:<><Lock size={14}/> Seal with Love 💍</>}
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto", padding:"8px 4px 60px" }}>
      {/* Seal particles */}
      {particles.length>0 && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:500, overflow:"hidden" }}>
          {particles.map(i => (
            <span key={i} style={{ position:"absolute", bottom:"-60px", left:`${6+i*6.5}%`, fontSize:"1.4rem", animation:`floatUp ${1.4+i*0.07}s ${i*0.05}s linear forwards` }}>
              {["💍","💖","✨","🌸","💗","🌟","🦋"][i%7]}
            </span>
          ))}
        </div>
      )}

      {/* Header */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5}} style={{textAlign:"center",marginBottom:"40px"}}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"6px 18px", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(236,72,153,0.2)", borderRadius:"50px", marginBottom:"14px", fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:700, color:"#EC4899", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          <Heart size={11} fill="#EC4899" stroke="none"/> Our Vows
        </div>
        <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"2.2rem", fontWeight:800, color:"#fff", margin:"0 0 10px", letterSpacing:"-0.5px" }}>Our Promises 💒</h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", margin:0, lineHeight:1.6 }}>Words written from the heart — promises that last forever 🌸</p>

        {/* Ring ceremony visual */}
        <motion.div
          initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.3,type:"spring"}}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", marginTop:"24px", padding:"18px 28px", background:"rgba(9,4,21,0.8)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"20px", backdropFilter:"blur(16px)", boxShadow:"0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"2rem", lineHeight:1 }}>💙</div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.85rem", fontWeight:600, fontStyle:"italic", color:"rgba(100,160,255,0.85)", margin:"6px 0 0" }}>Surya</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
            <span style={{ fontSize:"1.6rem" }}>💍</span>
            <div style={{ width:"70px", height:"1.5px", background:"linear-gradient(90deg,#3b82f6,#EC4899)", borderRadius:"2px", boxShadow:"0 0 8px rgba(236,72,153,0.4)" }}/>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.6rem", fontWeight:700, color:"rgba(255,255,255,0.25)", letterSpacing:"2px", textTransform:"uppercase" }}>Forever</span>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"2rem", lineHeight:1 }}>💗</div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.85rem", fontWeight:600, fontStyle:"italic", color:"rgba(255,130,180,0.85)", margin:"6px 0 0" }}>Sadhana</p>
          </div>
        </motion.div>

        {/* Sadhana vow sealed status */}
        {sealed && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
            style={{ display:"inline-flex", alignItems:"center", gap:"6px", marginTop:"12px", padding:"5px 14px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:"50px" }}>
            <CheckCircle size={12} style={{color:"#10B981"}}/>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:700, color:"#10B981" }}>Sadhana's vow is sealed 💍</span>
          </motion.div>
        )}
      </motion.div>

      {/* Vow Cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:"20px", marginBottom:"40px" }}>
        {VOW_CARDS.map((c,i) => <VowCard key={c.id} c={c} i={i}/>)}
      </div>

      {/* Footer */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6,duration:0.5}}
        style={{ textAlign:"center", padding:"28px", background:"linear-gradient(135deg,rgba(59,130,246,0.06),rgba(236,72,153,0.06))", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"24px" }}>
        <div style={{ fontSize:"1.8rem", marginBottom:"10px" }}>💍</div>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", color:"rgba(255,255,255,0.5)", margin:"0 0 8px", fontStyle:"italic" }}>"A vow isn't just words — it's a direction, a promise, a life 💙"</p>
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"1.05rem", fontWeight:800, color:"#fff", margin:0, letterSpacing:"-0.2px" }}>Surya &amp; Sadhana — Forever 💍</p>
      </motion.div>

      {/* Vow Modal — 3D flip entrance */}
      <AnimatePresence>
        {active !== null && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",backdropFilter:"blur(18px)"}}
            onClick={closeVow}>
            <motion.div
              initial={{opacity:0,rotateX:20,scale:0.85,y:40}}
              animate={{opacity:revealed?1:0,rotateX:revealed?0:20,scale:revealed?1:0.85,y:revealed?0:40}}
              exit={{opacity:0,rotateX:-12,scale:0.88,y:20}}
              transition={{type:"spring",stiffness:200,damping:22}}
              style={{background:"rgba(10,5,18,0.98)",border:`1px solid ${card(active).border}`,borderRadius:"28px",padding:"40px 32px",maxWidth:"520px",width:"100%",position:"relative",boxShadow:`0 40px 100px rgba(0,0,0,0.7),0 0 80px ${card(active).glow},inset 0 1px 0 rgba(255,255,255,0.07)`,maxHeight:"80vh",overflowY:"auto",transformPerspective:900,transformStyle:"preserve-3d"}}
              onClick={e=>e.stopPropagation()}>
              {/* top gradient line */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${card(active).accent},#8B5CF6,${card(active).accent},transparent)`,borderRadius:"28px 28px 0 0"}}/>
              {/* floating glow */}
              <div style={{position:"absolute",top:"-60px",left:"50%",transform:"translateX(-50%)",width:"200px",height:"200px",background:`radial-gradient(circle,${card(active).glow} 0%,transparent 70%)`,borderRadius:"50%",filter:"blur(30px)",pointerEvents:"none"}}/>
              <button onClick={closeVow} style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"50%",width:"32px",height:"32px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.5)",transition:"transform 0.22s,background 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="rotate(90deg)";e.currentTarget.style.background="rgba(255,255,255,0.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
                <X size={14}/>
              </button>
              <div style={{textAlign:"center",marginBottom:"24px"}}>
                <div style={{width:"60px",height:"60px",background:`linear-gradient(135deg,${card(active).accent},#8B5CF6)`,borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",margin:"0 auto 14px",boxShadow:`0 10px 28px ${card(active).glow}`,animation:"avatarDepth 5s ease-in-out infinite alternate"}}>
                  {card(active).avatar}
                </div>
                <h2 style={{fontFamily:"'Manrope',sans-serif",fontSize:"1.5rem",fontWeight:800,color:"#fff",margin:"0 0 4px",letterSpacing:"-0.3px"}}>{card(active).name}</h2>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"0.78rem",color:"rgba(255,255,255,0.3)",margin:0}}>{card(active).from}</p>
              </div>
              <div style={{width:"40px",height:"2px",background:`linear-gradient(90deg,transparent,${card(active).accent},transparent)`,margin:"0 auto 24px"}}/>
              <pre style={{fontFamily:"'Inter',sans-serif",fontSize:"0.92rem",color:"rgba(255,255,255,0.75)",whiteSpace:"pre-wrap",lineHeight:1.9,margin:0}}>
                {getVowText(active)}
              </pre>
              {active===1&&sealed&&(
                <button onClick={()=>{closeVow();setTimeout(unseal,400);}}
                  style={{marginTop:"20px",display:"flex",alignItems:"center",gap:"7px",padding:"11px 22px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.82rem",fontWeight:600,color:"rgba(255,255,255,0.5)"}}>
                  <Pen size={13}/> Edit Vow
                </button>
              )}
              <button onClick={closeVow}
                style={{width:"100%",marginTop:"20px",padding:"14px",background:`linear-gradient(90deg,${card(active).accent},#8B5CF6)`,border:"none",borderRadius:"14px",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.9rem",fontWeight:700,color:"#fff",boxShadow:`0 8px 24px ${card(active).glow}`,transition:"transform 0.22s,box-shadow 0.22s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 16px 40px ${card(active).glow}`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 8px 24px ${card(active).glow}`;}}>
                Close 💕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
