import { useState, useEffect } from "react";
import { dbGet, dbSet, uploadPhoto, getPhoto, deletePhoto } from "../api";

/* ── Design tokens (Surya = emerald green) ── */
const G = {
  primary:   "#10B981",
  secondary: "#06B6D4",
  grad:      "linear-gradient(135deg,#10B981,#059669)",
  gradFull:  "linear-gradient(135deg,#10B981,#06B6D4)",
  glow:      "rgba(16,185,129,0.28)",
  surface:   "rgba(16,185,129,0.07)",
  border:    "rgba(16,185,129,0.22)",
  borderHi:  "rgba(16,185,129,0.55)",
  bg:        "linear-gradient(160deg,#030d08 0%,#041208 50%,#020a06 100%)",
  text:      "rgba(226,240,234,0.92)",
  muted:     "rgba(226,240,234,0.45)",
};

const inputCss = {
  width:"100%", boxSizing:"border-box",
  padding:"12px 16px",
  background:"rgba(16,185,129,0.06)",
  border:`1.5px solid ${G.border}`,
  borderRadius:"12px", color:G.text,
  fontFamily:"'Inter',sans-serif", fontSize:"0.9rem",
  outline:"none", transition:"all 0.25s",
};
const focusCss = { border:`1.5px solid ${G.primary}`, boxShadow:`0 0 0 3px ${G.glow}`, background:"rgba(16,185,129,0.1)" };

const SECTIONS = [
  { key:"s_proposal",    icon:"🎁", label:"Proposal Letter",       desc:"Edit the main love letter & proposal text" },
  { key:"s_timeline",    icon:"🗺️", label:"Our Journey Timeline",   desc:"Add moments, dates & photos" },
  { key:"s_letters",     icon:"💌", label:"Love Letters",           desc:"4 personal letters to Sadhana" },
  { key:"s_gallery",     icon:"📸", label:"Gallery Captions",       desc:"Photo captions for memory gallery" },
  { key:"s_vow",         icon:"💒", label:"Surya's Vow",            desc:"Your personal vow to her" },
  { key:"s_surprises",   icon:"🎁", label:"Surprise Box",           desc:"5 surprise messages for Sadhana" },
  { key:"s_compliments", icon:"💬", label:"Compliment Machine",     desc:"Compliments that pop up for her" },
  { key:"s_promises",    icon:"💍", label:"Nightly Promises",       desc:"Promises shown on the Tonight page" },
  { key:"s_playlist",    icon:"🎵", label:"Our Playlist",           desc:"Songs with personal notes" },
  { key:"s_dreams",      icon:"💫", label:"Dream Jar",              desc:"Dream page subtitle & footer" },
  { key:"s_profile",     icon:"👤", label:"Site Profile",           desc:"Names, dates & greeting texts" },
];

/* ── Focused input wrapper ── */
function FocusInput({ value, onChange, placeholder, as="input", rows=3, style={} }) {
  const [foc, setFoc] = useState(false);
  const s = { ...inputCss, ...(foc ? focusCss : {}), ...style };
  return as === "textarea"
    ? <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={s} />
    : <input value={value} onChange={onChange} placeholder={placeholder} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={s} />;
}

/* ── Reusable single-field editor ── */
function Field({ dbKey, label, placeholder, rows=1, defaultValue="" }) {
  const [val,setVal] = useState("");
  const [ok,setOk]   = useState(false);
  const [ld,setLd]   = useState(true);
  useEffect(()=>{ dbGet(dbKey,defaultValue).then(v=>{setVal(v??defaultValue);setLd(false);}); },[dbKey]);// eslint-disable-line
  const save=async()=>{ await dbSet(dbKey,val); setOk(true); setTimeout(()=>setOk(false),2200); };
  if(ld) return <p style={{color:G.muted,fontSize:"0.8rem",fontStyle:"italic",padding:"8px 0"}}>Loading...</p>;
  return (
    <div style={{marginBottom:18}}>
      <label style={{display:"block",fontSize:"0.68rem",fontWeight:700,color:G.primary,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>{label}</label>
      <FocusInput as={rows>1?"textarea":"input"} rows={rows} value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder} />
      <button onClick={save} style={{
        marginTop:8,padding:"9px 22px",background:ok?"rgba(16,185,129,0.15)":G.grad,
        border:ok?`1px solid ${G.primary}`:"none",borderRadius:10,color:"#fff",fontSize:"0.82rem",
        fontWeight:700,cursor:"pointer",transition:"all 0.2s",
        boxShadow:ok?"none":`0 4px 16px ${G.glow}`,
      }}>{ok?"✅ Saved!":"Save 💚"}</button>
    </div>
  );
}

/* ── List field editor ── */
function ListField({ dbKey, label, defaults=[], placeholder="Add..." }) {
  const [items,setItems] = useState([]);
  const [draft,setDraft] = useState("");
  const [ok,setOk]       = useState(false);
  const [ld,setLd]       = useState(true);
  const [foc,setFoc]     = useState(false);
  useEffect(()=>{ dbGet(dbKey,defaults).then(v=>{setItems(Array.isArray(v)&&v.length?v:defaults);setLd(false);}); },[dbKey]);// eslint-disable-line
  const add    = ()=>{ if(!draft.trim())return; setItems(p=>[...p,draft.trim()]); setDraft(""); };
  const remove = i => setItems(p=>p.filter((_,j)=>j!==i));
  const move   = (i,dir)=>{ const a=[...items],j=i+dir; if(j<0||j>=a.length)return; [a[i],a[j]]=[a[j],a[i]]; setItems(a); };
  const save   = async()=>{ await dbSet(dbKey,items); setOk(true); setTimeout(()=>setOk(false),2200); };
  if(ld) return <p style={{color:G.muted,fontSize:"0.8rem",padding:"8px 0"}}>Loading...</p>;
  return (
    <div style={{marginBottom:18}}>
      <label style={{display:"block",fontSize:"0.68rem",fontWeight:700,color:G.primary,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>{label}</label>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
        {items.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"8px 12px"}}>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              <button onClick={()=>move(i,-1)} disabled={i===0} style={{...btnSm,opacity:i===0?0.3:1}}>↑</button>
              <button onClick={()=>move(i,1)} disabled={i===items.length-1} style={{...btnSm,opacity:i===items.length-1?0.3:1}}>↓</button>
            </div>
            <span style={{flex:1,fontSize:"0.85rem",color:G.text,lineHeight:1.5}}>{item}</span>
            <button onClick={()=>remove(i)} style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,color:"#fca5a5",padding:"4px 8px",cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input value={draft} placeholder={placeholder} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
          onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          style={{...inputCss,flex:1,...(foc?focusCss:{})}} />
        <button onClick={add} style={{padding:"10px 18px",background:G.grad,border:"none",borderRadius:10,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"0.9rem",boxShadow:`0 4px 14px ${G.glow}`}}>＋</button>
      </div>
      <button onClick={save} style={{padding:"9px 22px",background:ok?"rgba(16,185,129,0.15)":G.grad,border:ok?`1px solid ${G.primary}`:"none",borderRadius:10,color:"#fff",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",boxShadow:ok?"none":`0 4px 16px ${G.glow}`}}>{ok?"✅ Saved!":"Save All 💚"}</button>
    </div>
  );
}

const btnSm = { background:"transparent",border:"none",color:G.muted,cursor:"pointer",padding:"2px 4px",fontSize:"0.75rem",borderRadius:4 };

/* ── Block wrapper ── */
function Block({ title, children }) {
  return (
    <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:16,padding:"18px 20px",marginBottom:14}}>
      {title && <p style={{margin:"0 0 14px",fontSize:"0.78rem",fontWeight:700,color:G.primary,textTransform:"uppercase",letterSpacing:"1.2px"}}>{title}</p>}
      {children}
    </div>
  );
}

/* ── Section editors ── */
function ProposalEditor() {
  return (<>
    <Field dbKey="prop_title"    label="Letter Title"      rows={1} placeholder="My Dearest Moon," defaultValue="My Dearest Moon," />
    <Field dbKey="prop_body"     label="Letter Body"       rows={7} placeholder="Write the proposal letter..." defaultValue="Every moment with you has been magical ✨" />
    <Field dbKey="prop_question" label="Proposal Question" rows={1} placeholder="Will You Marry Me? 💍" defaultValue="Will You Marry Me? 💍" />
    <Field dbKey="prop_yes_btn"  label="Yes Button Text"   rows={1} placeholder="💍 Yes, I Will!" defaultValue="💍 Yes, I Will!" />
  </>);
}

function LettersEditor() {
  return (<>{[1,2,3,4].map(n=>(
    <Block key={n} title={`💌 Letter ${n}`}>
      <Field dbKey={`custom_letter_${n}_title`}   label="Title"   rows={1} placeholder="Letter title..." defaultValue="" />
      <Field dbKey={`custom_letter_${n}_content`} label="Content" rows={8} placeholder="Write the letter..." defaultValue="" />
    </Block>
  ))}</>);
}

function TimelineEditor() {
  const DEFAULT = [
    {year:"19/06/2023",title:"We Met",             desc:"At the tuition a pleasant day..."},
    {year:"17/05/2026",title:"I Proposed to her",  desc:"At midnight"},
    {year:"18/05/2026",title:"She Proposed to me", desc:"At Evening"},
    {year:"19/05/2026",title:"We both Proposed",   desc:"At Evening"},
    {year:"20/05/2026",title:"We start our journey",desc:"From that day, forever together..."},
  ];
  const [moments,setMoments]     = useState([]);
  const [photos,setPhotos]       = useState({});
  const [uploading,setUploading] = useState({});
  const [ok,setOk]               = useState(false);
  const [ld,setLd]               = useState(true);

  useEffect(()=>{
    dbGet("edit_timeline",DEFAULT).then(async v=>{
      const data=Array.isArray(v)&&v.length?v:DEFAULT;
      setMoments(data);
      const map={};
      for(let i=0;i<data.length;i++){const p=await getPhoto(`timeline_img_${i}`);if(p)map[i]=p;}
      setPhotos(map);setLd(false);
    });
  },[]);// eslint-disable-line
  const upd=(i,f,v)=>setMoments(p=>p.map((m,j)=>j===i?{...m,[f]:v}:m));
  const add=()=>setMoments(p=>[...p,{year:"",title:"",desc:""}]);
  const remove=async(i)=>{setMoments(p=>p.filter((_,j)=>j!==i));await deletePhoto(`timeline_img_${i}`);setPhotos(p=>{const n={...p};delete n[i];return n;});};
  const handlePhoto=async(i,file)=>{
    if(!file)return;if(file.size>2.5*1024*1024){alert("Max 2MB");return;}
    setUploading(p=>({...p,[i]:true}));
    const b64=await uploadPhoto(`timeline_img_${i}`,file);
    setPhotos(p=>({...p,[i]:b64}));setUploading(p=>({...p,[i]:false}));
  };
  const save=async()=>{await dbSet("edit_timeline",moments);setOk(true);setTimeout(()=>setOk(false),2200);};
  if(ld)return<p style={{color:G.muted,padding:"8px 0"}}>Loading timeline...</p>;
  return (<>
    {moments.map((m,i)=>(
      <Block key={i} title={`Moment ${i+1}`}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <FocusInput value={m.year}  onChange={e=>upd(i,"year",e.target.value)}  placeholder="Date e.g. 19/06/2023" style={{flex:"0 0 145px"}} />
          <FocusInput value={m.title} onChange={e=>upd(i,"title",e.target.value)} placeholder="Title" style={{flex:1}} />
          <button onClick={()=>remove(i)} style={{padding:"8px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,color:"#fca5a5",cursor:"pointer",fontWeight:700}}>✕</button>
        </div>
        <FocusInput as="textarea" rows={2} value={m.desc} onChange={e=>upd(i,"desc",e.target.value)} placeholder="Description" style={{marginBottom:10}} />
        <div>
          {photos[i]?(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <img src={photos[i]} alt="" style={{width:70,height:55,objectFit:"cover",borderRadius:8,border:`1px solid ${G.border}`}} />
              <button onClick={()=>remove(i)} style={{padding:"6px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,color:"#fca5a5",cursor:"pointer",fontSize:"0.78rem"}}>✕ Remove</button>
            </div>
          ):(
            <label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"9px 16px",background:G.surface,border:`1.5px dashed ${G.border}`,borderRadius:10,cursor:"pointer",fontSize:"0.82rem",color:G.primary,fontWeight:600}}>
              {uploading[i]?"⏳ Uploading...":"📷 Upload Photo"}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handlePhoto(i,e.target.files[0])} />
            </label>
          )}
        </div>
      </Block>
    ))}
    <button onClick={add} style={{marginBottom:12,padding:"10px 20px",background:G.surface,border:`1.5px dashed ${G.border}`,borderRadius:12,color:G.primary,cursor:"pointer",fontWeight:700,width:"100%",fontSize:"0.88rem"}}>＋ Add Moment</button>
    <button onClick={save} style={{padding:"11px 28px",background:ok?"rgba(16,185,129,0.15)":G.grad,border:ok?`1px solid ${G.primary}`:"none",borderRadius:12,color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:ok?"none":`0 4px 18px ${G.glow}`}}>{ok?"✅ Saved!":"Save Timeline 💚"}</button>
  </>);
}

function GalleryEditor() {
  const defaults=["The day it all began 💫","The night I said I love you 💍","She said yes back 💗","Together forever 🥂","Our journey starts 🌸","Every smile counts 😊","My favourite person 💓","You are my everything ✨","The day we first met 💫","I proposed to you at midnight 💍","She proposed to me 💖","We both said yes 💕","Our journey begins 🌸","Every smile is a memory 😊"];
  return <ListField dbKey="gallery_captions" label="Gallery Photo Captions (in order)" defaults={defaults} placeholder="Caption for next photo..." />;
}

function ProfileEditor() {
  return (<>
    <Field dbKey="site_sadhana_name"  label="Sadhana's display name"       rows={1} placeholder="Sadhana"        defaultValue="Sadhana" />
    <Field dbKey="site_surya_name"    label="Surya's display name"         rows={1} placeholder="Surya"          defaultValue="Surya" />
    <Field dbKey="site_together_date" label="Together since (YYYY-MM-DD)"  rows={1} placeholder="2026-05-20"     defaultValue="2026-05-20" />
    <Field dbKey="site_special_day"   label="Special Day date (YYYY-MM-DD)"rows={1} placeholder="2027-05-20"     defaultValue="2027-05-20" />
    <Field dbKey="site_hero_subtitle" label="Main subtitle text"           rows={1} placeholder="Every dream starts and ends with you 🌸" defaultValue="Every dream starts and ends with you 🌸" />
    <Field dbKey="site_footer_quote"  label="Footer quote"                 rows={2} placeholder="With you, every dream feels possible ❤️" defaultValue="With you, every dream feels possible ❤️" />
    <Field dbKey="site_login_hint"    label="Login page hint text"         rows={1} placeholder="Only someone special knows the way in 💍" defaultValue="Only someone special knows the way in 💍" />
  </>);
}

/* ── Main Export ── */
export default function SuryaEditPanel() {
  const [active,setActive]   = useState(null);
  const [mounted,setMounted] = useState(false);
  useEffect(()=>{ setTimeout(()=>setMounted(true),80); },[]);

  const renderEditor = () => {
    switch(active){
      case "s_proposal":    return <ProposalEditor />;
      case "s_letters":     return <LettersEditor />;
      case "s_timeline":    return <TimelineEditor />;
      case "s_gallery":     return <GalleryEditor />;
      case "s_vow":         return <Field dbKey="surya_vow_text" label="Surya's Vow" rows={12} placeholder="Write your vow..." defaultValue="" />;
      case "s_surprises":   return <>{[1,2,3,4,5].map(n=><Block key={n} title={`🎁 Surprise #${n}`}><Field dbKey={`edit_surprise_${n}_title`} label="Title" rows={1} placeholder="Surprise title..." defaultValue="" /><Field dbKey={`edit_surprise_${n}_hint`} label="Hint (shown on sealed box)" rows={1} placeholder="Open when..." defaultValue="" /><Field dbKey={`edit_surprise_${n}_content`} label="Message" rows={6} placeholder="Write the message..." defaultValue="" /></Block>)}</>;
      case "s_compliments": return <ListField dbKey="edit_compliments_list" label="Compliments (Compliment Machine)" defaults={["You have the most beautiful soul I have ever encountered 🌸","Your smile is literally the highlight of my entire day 🌟","You are so much stronger than you know 💪","The way your mind works is one of my favourite things about you 💭","You make every room feel warmer just by walking into it 🌻"]} placeholder="Add a compliment..." />;
      case "s_promises":    return <ListField dbKey="edit_promises_list" label="Nightly Promises" defaults={["I promise to always be your safe place 💙","I promise to make you smile every single day 🌸","I promise to never let you feel alone 🫂","I promise to love you on your hardest days 💍","I promise to always choose you 🌟"]} placeholder="Add a promise..." />;
      case "s_playlist":    return <>{[1,2,3,4,5].map(n=><Block key={n} title={`🎵 Song ${n}`}><Field dbKey={`playlist_title_${n}`} label="Song Title" rows={1} placeholder="Song name..." defaultValue="" /><Field dbKey={`playlist_artist_${n}`} label="Artist" rows={1} placeholder="Artist name..." defaultValue="" /><Field dbKey={`playlist_note_${n}`} label="Personal Note" rows={3} placeholder="Why this song means something..." defaultValue="" /></Block>)}</>;
      case "s_dreams":      return <><Field dbKey="dream_hero_subtitle" label="Dreams page subtitle" rows={1} placeholder="Every dream you write here will come true 💫" defaultValue="Every dream you write here will come true 💫" /><Field dbKey="dream_footer_quote" label="Dreams page footer quote" rows={2} placeholder="With you, every dream feels possible ❤️" defaultValue="With you, every dream feels possible ❤️" /></>;
      case "s_profile":     return <ProfileEditor />;
      default: return null;
    }
  };

  const activeSec = SECTIONS.find(s=>s.key===active);

  return (
    <div style={{
      minHeight:"100vh", padding:"0 0 80px",
      opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(24px)",
      transition:"all 0.6s ease",
    }}>
      {/* Hero */}
      <div style={{
        textAlign:"center", padding:"36px 20px 28px",
        background:`linear-gradient(180deg,rgba(16,185,129,0.08) 0%,transparent 100%)`,
        borderBottom:`1px solid ${G.border}`, marginBottom:24, position:"relative",
      }}>
        {/* Floating particles */}
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          {["🌿","✦","💚","🍃","✧","⭐","🌱","◦"].map((s,i)=>(
            <span key={i} style={{
              position:"absolute",bottom:"-20px",left:`${i*12+5}%`,
              fontSize:`${10+(i%3)*5}px`,color:G.primary,opacity:0.3,
              animation:`floatUp ${7+i*0.8}s linear ${i*0.6}s infinite`,
              filter:`drop-shadow(0 0 4px ${G.primary})`,
            }}>{s}</span>
          ))}
        </div>
        <div style={{
          width:72,height:72,margin:"0 auto 16px",
          background:G.gradFull,borderRadius:20,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",
          boxShadow:`0 12px 36px ${G.glow},0 0 0 1px rgba(255,255,255,0.08)`,
          animation:"floatEmoji 3s ease-in-out infinite alternate",
          position:"relative",zIndex:1,
        }}>🌿</div>
        <h2 style={{
          fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",
          fontWeight:600,fontStyle:"italic",color:"#fff",margin:"0 0 8px",
          textShadow:`0 0 40px ${G.glow}`,position:"relative",zIndex:1,
        }}>Surya's Edit Panel</h2>
        <p style={{color:G.muted,fontSize:"0.88rem",margin:"0 0 4px",position:"relative",zIndex:1}}>Customise every single thing on this website 💚</p>
        <p style={{color:`${G.muted}`,fontSize:"0.75rem",margin:0,fontStyle:"italic",opacity:0.6,position:"relative",zIndex:1}}>Only visible when logged in as Surya 🔒</p>
        {/* Gradient top line */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:"2.5px",background:`linear-gradient(90deg,transparent,${G.primary},${G.secondary},${G.primary},transparent)`,backgroundSize:"200%",animation:"shimmerRibbon 2.5s linear infinite"}} />
      </div>

      {!active ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,padding:"0 16px"}}>
          {SECTIONS.map((s,i)=>(
            <button key={s.key} onClick={()=>setActive(s.key)} style={{
              background:G.surface,
              border:`1.5px solid ${G.border}`,
              borderRadius:18,padding:"18px 20px",
              textAlign:"left",cursor:"pointer",
              transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              opacity:mounted?1:0,
              animation:`fadeInUp 0.5s ease ${0.05*i}s both`,
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px) scale(1.02)";e.currentTarget.style.borderColor=G.borderHi;e.currentTarget.style.boxShadow=`0 12px 36px ${G.glow}`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
              <div style={{fontSize:"1.6rem",marginBottom:10}}>{s.icon}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:"0.92rem",fontWeight:700,color:G.text,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:"0.75rem",color:G.muted,lineHeight:1.5}}>{s.desc}</div>
              <div style={{marginTop:12,fontSize:"0.72rem",color:G.primary,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>Edit →</div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{padding:"0 16px",maxWidth:640,margin:"0 auto"}}>
          <button onClick={()=>setActive(null)} style={{
            display:"flex",alignItems:"center",gap:8,marginBottom:20,
            background:G.surface,border:`1px solid ${G.border}`,
            borderRadius:12,padding:"10px 18px",cursor:"pointer",
            color:G.primary,fontWeight:700,fontSize:"0.88rem",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background=`rgba(16,185,129,0.12)`;}}
          onMouseLeave={e=>{e.currentTarget.style.background=G.surface;}}>
            ← Back to all sections
          </button>
          <div style={{
            background:G.surface,border:`1.5px solid ${G.borderHi}`,
            borderRadius:20,padding:"20px 22px",marginBottom:20,
            display:"flex",alignItems:"center",gap:14,
          }}>
            <div style={{fontSize:"1.8rem"}}>{activeSec?.icon}</div>
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",fontStyle:"italic",color:"#fff",fontWeight:600}}>{activeSec?.label}</div>
              <div style={{fontSize:"0.78rem",color:G.muted}}>{activeSec?.desc}</div>
            </div>
          </div>
          {renderEditor()}
        </div>
      )}

      <div style={{textAlign:"center",padding:"32px 20px 0",borderTop:`1px solid ${G.border}`,marginTop:32}}>
        <p style={{color:G.muted,fontSize:"0.85rem",fontStyle:"italic",margin:"0 0 6px"}}>"Everything you write here is a gift to her 💚"</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",fontStyle:"italic",color:G.primary,margin:0}}>Surya — The author of this world 💍</p>
      </div>
    </div>
  );
}
