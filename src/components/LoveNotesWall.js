import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dbGet, dbSet } from "../api";

const DEFAULT_SURYA_NOTES = [
  "You are the first thing I think about every morning and the last thing every night 🌙",
  "I would choose you in every universe, in every lifetime, without a second thought 💍",
  "Your dreams are safe with me — I'll protect every single one of them 🌟",
  "I love the way your mind works — you see the world differently and it's beautiful 💚",
  "Watching you grow into yourself is one of the greatest privileges of my life 🌺",
  "Being loved by you is the best thing that has ever happened to me 💙",
];
const NOTE_COLORS = ["#ffd700","#ff85b3","#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6","#86efac"];
const NOTE_ROTS   = [-3,2,-4,3,-2,4,-5,2];
const NOTE_EMOJIS = ["💙","🌸","💫","✨","🌻","🌊","💗","🌟"];

function StickyNote({ note, isPopped, onTap, onDelete }) {
  const isSadhana = note.from === "Sadhana";
  return (
    <motion.div
      layout
      initial={{ scale:0, rotate: note.rot || 0, opacity:0 }}
      animate={{ scale:1, rotate: isPopped ? 0 : (note.rot||0), opacity:1, y: isPopped ? -8 : 0, zIndex: isPopped ? 20 : 1 }}
      exit={{ scale:0, opacity:0 }}
      transition={{ type:"spring", stiffness:280, damping:22 }}
      whileHover={{ scale:1.06, rotate:0, y:-6, zIndex:15 }}
      onClick={onTap}
      style={{
        position:    "relative",
        background:  note.color+"ee",
        borderRadius:"4px",
        padding:     "28px 14px 20px",
        minHeight:   "140px",
        cursor:      "pointer",
        boxShadow:   isPopped
          ? "0 20px 50px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.3)"
          : "4px 4px 14px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      {/* Pin */}
      <div style={{ position:"absolute", top:"-10px", left:"50%", transform:"translateX(-50%)", width:"16px", height:"16px", background:"radial-gradient(circle at 40% 35%,#ff6b6b,#c71585)", borderRadius:"50%", boxShadow:"0 2px 6px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.2)", zIndex:3 }}/>

      {/* From badge */}
      <div style={{ fontSize:"0.65rem", fontWeight:800, color:"rgba(0,0,0,0.5)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"8px", display:"flex", alignItems:"center", gap:"4px" }}>
        {isSadhana ? "💗 Sadhana" : "💙 Surya"}
      </div>

      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", lineHeight:1.65, color:"rgba(0,0,0,0.72)", margin:"0 0 10px", wordBreak:"break-word" }}>
        {note.text}
      </p>

      <div style={{ textAlign:"right", fontSize:"1.4rem" }}>{note.emoji}</div>

      {/* Delete only for Sadhana's own notes when popped */}
      {isSadhana && isPopped && (
        <button
          onClick={e=>{e.stopPropagation();onDelete(note.id);}}
          style={{ position:"absolute", top:"6px", right:"6px", background:"rgba(200,0,0,0.12)", border:"none", color:"rgba(180,0,0,0.65)", fontSize:"0.72rem", cursor:"pointer", borderRadius:"50%", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
          ✕
        </button>
      )}
    </motion.div>
  );
}

export default function LoveNotesWall() {
  const [notes,   setNotes]   = useState([]);
  const [reply,   setReply]   = useState("");
  const [color,   setColor]   = useState(NOTE_COLORS[0]);
  const [popped,  setPopped]  = useState(null);
  const [adding,  setAdding]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dbGet("wall_surya_notes", DEFAULT_SURYA_NOTES),
      dbGet("wall_notes", []),
    ]).then(([suryaRaw, sadhanaRaw]) => {
      const arr = Array.isArray(suryaRaw) && suryaRaw.length ? suryaRaw : DEFAULT_SURYA_NOTES;
      const suryaNotes = arr.map((item,i) => ({
        id:`surya_${i}`, color:NOTE_COLORS[i%NOTE_COLORS.length], rot:NOTE_ROTS[i%NOTE_ROTS.length],
        from:"Surya", text:typeof item==="string"?item:item.text||"", emoji:NOTE_EMOJIS[i%NOTE_EMOJIS.length],
      }));
      setNotes([...suryaNotes, ...(Array.isArray(sadhanaRaw)?sadhanaRaw:[])]);
      setLoading(false);
    });
  }, []); // eslint-disable-line

  const sadhanaOnly = all => all.filter(n => n.from==="Sadhana");

  const addNote = async () => {
    if (!reply.trim()) return;
    const n = { id:Date.now(), color, rot:Math.floor(Math.random()*10)-5, from:"Sadhana", text:reply.trim(), emoji:"💗" };
    const updated = [...notes, n];
    setNotes(updated); setReply(""); setAdding(false);
    await dbSet("wall_notes", sadhanaOnly(updated));
  };

  const removeNote = async id => {
    const updated = notes.filter(n=>n.id!==id);
    setNotes(updated); if(popped===id) setPopped(null);
    await dbSet("wall_notes", sadhanaOnly(updated));
  };

  const suryaCount   = notes.filter(n=>n.from==="Surya").length;
  const sadhanaCount = notes.filter(n=>n.from==="Sadhana").length;

  return (
    <div style={{ maxWidth:"680px", margin:"0 auto", padding:"8px 4px 60px" }}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
        style={{ textAlign:"center", marginBottom:"28px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"5px 16px", background:"rgba(236,72,153,0.08)", border:"1px solid rgba(236,72,153,0.2)", borderRadius:"50px", marginBottom:"12px", fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#EC4899", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          📝 Love Notes
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.6rem", fontWeight:600, fontStyle:"italic", color:"#fff", margin:"0 0 8px", textShadow:"0 0 40px rgba(236,72,153,0.25)" }}>
          Love Notes Wall 📌
        </h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.4)", margin:0 }}>
          Surya left notes for you — pin one back 💌
        </p>
        {/* Stats */}
        <div style={{ display:"inline-flex", gap:"16px", marginTop:"14px", padding:"10px 20px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"50px" }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", fontWeight:700, color:"rgba(59,130,246,0.8)" }}>💙 {suryaCount} from Surya</span>
          <span style={{ width:"1px", background:"rgba(255,255,255,0.1)" }}/>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", fontWeight:700, color:"rgba(236,72,153,0.8)" }}>💗 {sadhanaCount} from Sadhana</span>
        </div>
      </motion.div>

      {/* Cork wall */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>📝</div>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem" }}>Loading notes…</p>
        </div>
      ) : (
        <div style={{ background:"rgba(139,90,43,0.08)", border:"1px solid rgba(139,90,43,0.2)", borderRadius:"20px", padding:"24px 18px", minHeight:"200px", marginBottom:"24px" }}>
          {/* Cork texture hint */}
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.62rem", fontWeight:700, color:"rgba(255,255,255,0.2)", textTransform:"uppercase", letterSpacing:"2px", textAlign:"center", marginBottom:"18px" }}>
            🪵 Cork Board — Tap a note to pop it
          </p>
          <motion.div layout style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"20px" }}>
            <AnimatePresence>
              {notes.map(n => (
                <StickyNote
                  key={String(n.id)}
                  note={n}
                  isPopped={popped===n.id}
                  onTap={()=>setPopped(popped===n.id?null:n.id)}
                  onDelete={removeNote}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          {notes.length===0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(255,255,255,0.3)", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontStyle:"italic" }}>
              No notes yet — be the first! 💕
            </div>
          )}
        </div>
      )}

      {/* Add note CTA */}
      {!adding ? (
        <div style={{ textAlign:"center", marginBottom:"20px" }}>
          <motion.button whileHover={{scale:1.04,y:-3}} whileTap={{scale:0.97}}
            onClick={()=>setAdding(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"14px 36px", background:"linear-gradient(135deg,#e8305a,#8b0040)", border:"none", borderRadius:"50px", color:"#fff", fontFamily:"'Manrope',sans-serif", fontSize:"0.95rem", fontWeight:800, cursor:"pointer", boxShadow:"0 10px 28px rgba(232,48,90,0.45)" }}>
            📌 Pin Your Reply 💗
          </motion.button>
        </div>
      ) : (
        <motion.div initial={{opacity:0,y:-16,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0}}
          style={{ background:"rgba(9,4,21,0.9)", border:"1px solid rgba(236,72,153,0.18)", borderRadius:"24px", padding:"28px 24px", backdropFilter:"blur(20px)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)", marginBottom:"20px" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", fontStyle:"italic", color:"#ff9ab8", margin:"0 0 16px" }}>Write your note 💌</h3>

          <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={3} placeholder="Write something for Surya to see..."
            style={{ width:"100%", minHeight:"90px", padding:"12px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"14px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", resize:"vertical", outline:"none", lineHeight:1.6, marginBottom:"14px", boxSizing:"border-box" }}/>

          {/* Color picker */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px", flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.5px" }}>Color:</span>
            {NOTE_COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)}
                style={{ width:"24px", height:"24px", borderRadius:"50%", background:c, border:color===c?"2.5px solid #fff":"2px solid transparent", cursor:"pointer", transition:"transform 0.2s", transform:color===c?"scale(1.25)":"scale(1)" }}/>
            ))}
          </div>

          {/* Preview */}
          {reply.trim()&&(
            <div style={{ background:color+"ee", borderRadius:"4px", padding:"18px 14px 14px", marginBottom:"14px", position:"relative" }}>
              <div style={{ position:"absolute", top:"-8px", left:"50%", transform:"translateX(-50%)", width:"12px", height:"12px", background:"radial-gradient(circle at 40% 35%,#ff6b6b,#c71585)", borderRadius:"50%", boxShadow:"0 2px 4px rgba(0,0,0,0.4)" }}/>
              <div style={{ fontSize:"0.65rem", fontWeight:800, color:"rgba(0,0,0,0.5)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"6px" }}>💗 Sadhana</div>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", color:"rgba(0,0,0,0.7)", margin:0, lineHeight:1.6 }}>{reply}</p>
            </div>
          )}

          <div style={{ display:"flex", gap:"10px" }}>
            <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}}
              onClick={addNote} disabled={!reply.trim()}
              style={{ flex:1, padding:"13px", background:"linear-gradient(135deg,#e8305a,#8b0040)", border:"none", borderRadius:"14px", color:"#fff", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, cursor:"pointer", opacity:reply.trim()?1:0.4, boxShadow:"0 8px 24px rgba(232,48,90,0.4)" }}>
              Pin It 📌
            </motion.button>
            <button onClick={()=>{setAdding(false);setReply("");}}
              style={{ padding:"13px 20px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"14px", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem" }}>
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div style={{ textAlign:"center", padding:"22px", background:"linear-gradient(135deg,rgba(236,72,153,0.07),rgba(139,92,246,0.05))", border:"1px solid rgba(236,72,153,0.12)", borderRadius:"20px" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", fontStyle:"italic", color:"rgba(255,255,255,0.5)", margin:"0 0 6px" }}>"Every note you leave becomes a piece of my heart 💙"</p>
        <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"0.88rem", fontWeight:800, color:"rgba(255,255,255,0.7)", margin:0 }}>Surya &amp; Sadhana — Forever 💍</p>
      </div>
    </div>
  );
}
