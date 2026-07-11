import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../api";

/* ══════════════════════════════════════════
   ALL editable sections
══════════════════════════════════════════ */
const SECTIONS = [
  { key:"s_proposal",    icon:"🎁", label:"Proposal Letter"       },
  { key:"s_timeline",    icon:"🗺️", label:"Our Journey Timeline"  },
  { key:"s_letters",     icon:"💌", label:"Love Letters (x4)"     },
  { key:"s_notes",       icon:"📝", label:"Notes Wall"            },
  { key:"s_vow",         icon:"💒", label:"Surya's Vow"           },
  { key:"s_surprises",   icon:"🎁", label:"Surprise Box (x5)"     },
  { key:"s_compliments", icon:"💬", label:"Compliment Machine"    },
  { key:"s_promises",    icon:"💍", label:"Nightly Promises"      },
  { key:"s_playlist",    icon:"🎵", label:"Our Playlist"          },
  { key:"s_mood",        icon:"🌈", label:"Mood Board Quotes"     },
  { key:"s_secret",      icon:"🔐", label:"Secret Messages"       },
  { key:"s_storybook",   icon:"📖", label:"Story Book"            },
  { key:"s_dreams",      icon:"💫", label:"Dream Jar Messages"    },
  { key:"s_future",      icon:"🗺️", label:"Future Plans"          },
  { key:"s_lovenotes",   icon:"🌟", label:"Love Notes (wall pins)" },
  { key:"s_gallery",     icon:"📸", label:"Gallery Captions"      },
  { key:"s_profile",     icon:"👤", label:"Site Profile & Greetings"},
];

/* ── Reusable editors ─────────────────────── */
function Field({ dbKey, label, placeholder, rows = 1, defaultValue = "" }) {
  const [val, setVal]     = useState("");
  const [ok,  setOk]      = useState(false);
  const [loading, setLd]  = useState(true);

  useEffect(() => {
    dbGet(dbKey, defaultValue).then(v => { setVal(v ?? defaultValue); setLd(false); });
  }, [dbKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => { await dbSet(dbKey, val); setOk(true); setTimeout(() => setOk(false), 2000); };

  if (loading) return <p className="ep-loading">...</p>;
  return (
    <div className="ep-field">
      <label className="ep-label">{label}</label>
      {rows > 1
        ? <textarea className="ep-textarea" rows={rows} value={val} placeholder={placeholder} onChange={e => setVal(e.target.value)} />
        : <input    className="ep-input"              value={val} placeholder={placeholder} onChange={e => setVal(e.target.value)} />
      }
      <button className="ep-save-btn" onClick={save}>{ok ? "✅ Saved!" : "Save 💙"}</button>
    </div>
  );
}

function ListField({ dbKey, label, defaults = [], placeholder = "Add..." }) {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [ok,    setOk]    = useState(false);
  const [loading, setLd]  = useState(true);

  useEffect(() => {
    dbGet(dbKey, defaults).then(v => { setItems(Array.isArray(v) && v.length ? v : defaults); setLd(false); });
  }, [dbKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const add    = () => { if (!draft.trim()) return; setItems(p => [...p, draft.trim()]); setDraft(""); };
  const remove = (i) => setItems(p => p.filter((_,j) => j !== i));
  const move   = (i, dir) => {
    const arr = [...items];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setItems(arr);
  };
  const save = async () => { await dbSet(dbKey, items); setOk(true); setTimeout(() => setOk(false), 2000); };

  if (loading) return <p className="ep-loading">...</p>;
  return (
    <div className="ep-field">
      <label className="ep-label">{label}</label>
      <div className="ep-list">
        {items.map((item, i) => (
          <div key={i} className="ep-list-item">
            <div className="ep-list-order">
              <button onClick={() => move(i,-1)} disabled={i===0}>↑</button>
              <button onClick={() => move(i,1)} disabled={i===items.length-1}>↓</button>
            </div>
            <span className="ep-list-text">{item}</span>
            <button className="ep-list-del" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <div className="ep-list-add">
        <input className="ep-input" value={draft} placeholder={placeholder}
          onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <button className="ep-add-btn" onClick={add}>＋</button>
      </div>
      <button className="ep-save-btn" onClick={save}>{ok ? "✅ Saved!" : "Save All 💙"}</button>
    </div>
  );
}

/* ── Section editors ──────────────────────── */
function ProposalEditor() {
  return (
    <>
      <Field dbKey="prop_title"    label="Letter Title"            rows={1} placeholder="My Dearest Moon," defaultValue="My Dearest Moon," />
      <Field dbKey="prop_body"     label="Letter Body"             rows={6} placeholder="Write the proposal letter..." defaultValue="Every moment with you has been magical ✨\nYou are the reason I smile every day 🌸\nMy heart beats only for you 💓" />
      <Field dbKey="prop_question" label="Proposal Question"       rows={1} placeholder="Will You Marry Me? 💍" defaultValue="Will You Marry Me? 💍" />
      <Field dbKey="prop_yes_btn"  label="Yes Button Text"         rows={1} placeholder="💍 Yes, I Will!" defaultValue="💍 Yes, I Will!" />
    </>
  );
}

function LettersEditor() {
  return (
    <>
      {[1,2,3,4].map(n => (
        <div key={n} className="ep-block">
          <p className="ep-block-title">📜 Letter {n}</p>
          <Field dbKey={`custom_letter_${n}_title`}   label="Title" rows={1} placeholder="Letter title..." defaultValue="" />
          <Field dbKey={`custom_letter_${n}_content`} label="Content" rows={8} placeholder="Write the letter..." defaultValue="" />
        </div>
      ))}
    </>
  );
}

function TimelineEditor() {
  const DEFAULT = [
    { year:"19/06/2023", title:"We Met",              desc:"At the tuition a pleasant day..." },
    { year:"17/05/2026", title:"I Proposed to her",   desc:"At midnight" },
    { year:"18/05/2026", title:"She Proposed to me",  desc:"At Evening" },
    { year:"19/05/2026", title:"We both Proposed",    desc:"At Evening" },
    { year:"20/05/2026", title:"We start our journey",desc:"From that day, forever together..." },
  ];
  const [moments, setMoments] = useState([]);
  const [ok, setOk] = useState(false);
  const [loading, setLd] = useState(true);

  useEffect(() => {
    dbGet("edit_timeline", DEFAULT).then(v => { setMoments(Array.isArray(v) && v.length ? v : DEFAULT); setLd(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upd    = (i, f, v) => setMoments(p => p.map((m,j) => j===i ? {...m,[f]:v} : m));
  const add    = ()  => setMoments(p => [...p, {year:"",title:"",desc:""}]);
  const remove = (i) => setMoments(p => p.filter((_,j) => j!==i));
  const save   = async () => { await dbSet("edit_timeline", moments); setOk(true); setTimeout(() => setOk(false), 2000); };

  if (loading) return <p className="ep-loading">Loading...</p>;
  return (
    <>
      {moments.map((m,i) => (
        <div key={i} className="ep-block">
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"6px"}}>
            <input className="ep-input" style={{flex:1}} value={m.year}  placeholder="Date" onChange={e => upd(i,"year",e.target.value)} />
            <input className="ep-input" style={{flex:2}} value={m.title} placeholder="Title" onChange={e => upd(i,"title",e.target.value)} />
            <button className="ep-list-del" onClick={() => remove(i)}>✕</button>
          </div>
          <textarea className="ep-textarea" rows={2} value={m.desc} placeholder="Description" onChange={e => upd(i,"desc",e.target.value)} />
        </div>
      ))}
      <button className="ep-add-btn" style={{marginBottom:"12px"}} onClick={add}>＋ Add Moment</button><br/>
      <button className="ep-save-btn" onClick={save}>{ok ? "✅ Saved!" : "Save Timeline 💙"}</button>
    </>
  );
}

function GalleryEditor() {
  const defaults = [
    "The day it all began 💫","The night I said I love you 💍","She said yes back 💗",
    "Together forever 🥂","Our journey starts 🌸","Every smile counts 😊",
    "My favourite person 💓","You are my everything ✨",
    "The day we first met 💫","I proposed to you at midnight 💍",
    "She proposed to me 💖","We both said yes 💕",
    "Our journey begins 🌸","Every smile is a memory 😊",
  ];
  return <ListField dbKey="gallery_captions" label="Gallery Photo Captions (in order)" defaults={defaults} placeholder="Caption for next photo..." />;
}

function SecretEditor() {
  const defaults = [
    { hint:"Our first meeting date (DD/MM/YYYY)", key:"19/06/2023", msg:"That day, my heart said: 'She's the one.' I've never doubted it since. 💙" },
    { hint:"The month we started (e.g. may)",     key:"may",        msg:"May 2026 — the month the rest of my life began. 🌸" },
    { hint:"My nickname for you (one word 🥰)",   key:"fruad",      msg:"My fruad — you light up my darkest nights without even knowing it. 🌙💕" },
    { hint:"How many dreams you wrote (number)",  key:"5",          msg:"5 dreams — and I promise to make every single one come true. 💍" },
  ];
  const [items, setItems] = useState([]);
  const [ok, setOk] = useState(false);
  const [loading, setLd] = useState(true);

  useEffect(() => {
    dbGet("secret_msgs", defaults).then(v => { setItems(Array.isArray(v) && v.length ? v : defaults); setLd(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upd  = (i,f,v) => setItems(p => p.map((m,j) => j===i ? {...m,[f]:v} : m)); // eslint-disable-line no-unused-vars
  const save = async () => { await dbSet("secret_msgs", items); setOk(true); setTimeout(() => setOk(false),2000); };

  if (loading) return <p className="ep-loading">Loading...</p>;
  return (
    <>
      {items.map((s,i) => (
        <div key={i} className="ep-block">
          <p className="ep-block-title">🔐 Secret #{i+1}</p>
          <Field dbKey={`_sec_h_${i}`} label="Hint shown to Sadhana" rows={1} placeholder="Hint..." defaultValue={s.hint} />
          <Field dbKey={`_sec_k_${i}`} label="Answer (case-insensitive)" rows={1} placeholder="Answer..." defaultValue={s.key} />
          <Field dbKey={`_sec_m_${i}`} label="Message revealed on unlock" rows={3} placeholder="Secret message..." defaultValue={s.msg} />
        </div>
      ))}
      <p className="ep-section-note">Note: hint/key/msg are saved per-secret above — changes apply immediately on save.</p>
      <button className="ep-save-btn" onClick={save}>{ok ? "✅ Saved!" : "Save Secrets 💙"}</button>
    </>
  );
}

function StoryEditor() {
  const defaults = [
    { art:"🌅", title:"Chapter 1 — The Beginning",   text:"It was 19 June 2023. Just an ordinary Tuesday at tuition. And then — there she was." },
    { art:"💭", title:"Chapter 2 — The Waiting",      text:"For months, he watched from a distance. Too nervous to speak." },
    { art:"🌙", title:"Chapter 3 — The Midnight",     text:"17 May 2026. Midnight. The whole world was asleep. But Surya was wide awake." },
    { art:"💗", title:"Chapter 4 — She Wrote Back",   text:"18 May 2026. Evening. Her message came. And in it — love." },
    { art:"🥂", title:"Chapter 5 — Together",         text:"19 May 2026. They both said yes — to each other, to the future, to forever." },
    { art:"🌸", title:"Chapter 6 — The Journey Begins",text:"From 20 May 2026 onwards, every ordinary day became extraordinary." },
    { art:"💍", title:"Chapter 7 — What Comes Next",  text:"The story isn't finished. Not even close. The best chapters are still being written." },
  ];
  const [chapters, setChapters] = useState([]);
  const [ok, setOk] = useState(false);
  const [loading, setLd] = useState(true);

  useEffect(() => {
    dbGet("story_chapters", defaults).then(v => { setChapters(Array.isArray(v) && v.length ? v : defaults); setLd(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upd  = (i,f,v) => setChapters(p => p.map((c,j) => j===i?{...c,[f]:v}:c));
  const add  = () => setChapters(p => [...p, {art:"✨",title:"New Chapter",text:""}]);
  const remove = (i) => setChapters(p => p.filter((_,j) => j!==i));
  const save = async () => { await dbSet("story_chapters", chapters); setOk(true); setTimeout(() => setOk(false),2000); };

  if (loading) return <p className="ep-loading">Loading...</p>;
  return (
    <>
      {chapters.map((c,i) => (
        <div key={i} className="ep-block">
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"6px"}}>
            <input className="ep-input" style={{width:"60px"}} value={c.art}   placeholder="🌟" onChange={e=>upd(i,"art",e.target.value)} />
            <input className="ep-input" style={{flex:1}}       value={c.title} placeholder="Chapter title" onChange={e=>upd(i,"title",e.target.value)} />
            <button className="ep-list-del" onClick={()=>remove(i)}>✕</button>
          </div>
          <textarea className="ep-textarea" rows={4} value={c.text} placeholder="Chapter text..." onChange={e=>upd(i,"text",e.target.value)} />
        </div>
      ))}
      <button className="ep-add-btn" style={{marginBottom:"12px"}} onClick={add}>＋ Add Chapter</button><br/>
      <button className="ep-save-btn" onClick={save}>{ok ? "✅ Saved!" : "Save Story 💙"}</button>
    </>
  );
}

function ProfileEditor() {
  return (
    <>
      <Field dbKey="site_sadhana_name"   label="Sadhana's display name" rows={1} placeholder="Sadhana" defaultValue="Sadhana" />
      <Field dbKey="site_surya_name"     label="Surya's display name" rows={1} placeholder="Surya" defaultValue="Surya" />
      <Field dbKey="site_together_date"  label="Together since (YYYY-MM-DD)" rows={1} placeholder="2026-05-20" defaultValue="2026-05-20" />
      <Field dbKey="site_special_day"    label="Special Day date (YYYY-MM-DD)" rows={1} placeholder="2027-05-20" defaultValue="2027-05-20" />
      <Field dbKey="site_hero_subtitle"  label="Main subtitle text" rows={1} placeholder="Every dream starts and ends with you 🌸" defaultValue="Every dream starts and ends with you 🌸" />
      <Field dbKey="site_footer_quote"   label="Footer quote" rows={2} placeholder="With you, every dream feels possible ❤️" defaultValue="With you, every dream feels possible ❤️" />
      <Field dbKey="site_login_hint"     label="Login page hint text" rows={1} placeholder="Only someone special knows the way in 💍" defaultValue="Only someone special knows the way in 💍" />
    </>
  );
}

/* ── Main Export ──────────────────────────── */
export default function SuryaEditPanel() {
  const [active, setActive] = useState(null);

  const renderEditor = () => {
    switch (active) {
      case "s_proposal":    return <ProposalEditor />;
      case "s_letters":     return <LettersEditor />;
      case "s_timeline":    return <TimelineEditor />;
      case "s_gallery":     return <GalleryEditor />;
      case "s_notes":       return <ListField dbKey="edit_notes_list" label="Love Notes on the Wall" defaults={["You are the first thing I think about every morning 🌙","I would choose you in every universe 💍","Your dreams are safe with me 🌟","I love the way your mind works 💚","Watching you grow is the greatest privilege of my life 🌺","Being loved by you is the best thing that has ever happened to me 💙"]} placeholder="Write a love note..." />;
      case "s_vow":         return <Field dbKey="surya_vow_text" label="Surya's Vow" rows={12} placeholder="Write your vow..." defaultValue="" />;
      case "s_surprises":   return <>{[1,2,3,4,5].map(n=><div key={n} className="ep-block"><p className="ep-block-title">🎁 Surprise #{n}</p><Field dbKey={`edit_surprise_${n}_title`} label="Title" rows={1} placeholder="Surprise title..." defaultValue="" /><Field dbKey={`edit_surprise_${n}_hint`} label="Hint" rows={1} placeholder="Open when..." defaultValue="" /><Field dbKey={`edit_surprise_${n}_content`} label="Message" rows={6} placeholder="Write the message..." defaultValue="" /></div>)}</>;
      case "s_compliments": return <ListField dbKey="edit_compliments_list" label="Compliments (Compliment Machine)" defaults={["You have the most beautiful soul I have ever encountered 🌸","Your smile is literally the highlight of my entire day 🌟","You are so much stronger than you know 💪","The way your mind works is one of my favourite things about you 💭","You make every room feel warmer just by walking into it 🌻"]} placeholder="Add a compliment..." />;
      case "s_promises":    return <ListField dbKey="edit_promises_list" label="Nightly Promises (Tonight page)" defaults={["I promise to always be your safe place 💙","I promise to make you smile every single day 🌸","I promise to never let you feel alone 🫂","I promise to love you on your hardest days 💍","I promise to always choose you 🌟"]} placeholder="Add a promise..." />;
      case "s_playlist":    return <>{[1,2,3,4,5].map(n=><div key={n} className="ep-block"><p className="ep-block-title">🎵 Song {n}</p><Field dbKey={`playlist_title_${n}`} label="Song Title" rows={1} placeholder="Song name..." defaultValue="" /><Field dbKey={`playlist_artist_${n}`} label="Artist" rows={1} placeholder="Artist name..." defaultValue="" /><Field dbKey={`playlist_note_${n}`} label="Personal Note" rows={3} placeholder="Why this song means something..." defaultValue="" /></div>)}</>;
      case "s_mood":        return <>{["happy","loved","calm","dreamy","missing","tired","excited"].map(m=><div key={m} className="ep-block"><p className="ep-block-title">🌈 {m.charAt(0).toUpperCase()+m.slice(1)} mood</p><Field dbKey={`mood_quote_${m}`} label="Surya's quote for this mood" rows={2} placeholder={`Quote for ${m} mood...`} defaultValue="" /><Field dbKey={`mood_activity_${m}`} label="Activity suggestion" rows={2} placeholder="What Surya suggests doing..." defaultValue="" /></div>)}</>;
      case "s_secret":      return <SecretEditor />;
      case "s_storybook":   return <StoryEditor />;
      case "s_dreams":      return <><Field dbKey="dream_hero_subtitle" label="Dreams page subtitle" rows={1} placeholder="Every dream you write here will come true 💫" defaultValue="Every dream you write here will come true 💫" /><Field dbKey="dream_footer_quote" label="Dreams page footer quote" rows={2} placeholder="With you, every dream feels possible ❤️" defaultValue="With you, every dream feels possible ❤️" /></>;
      case "s_future":      return <>{["Places to Visit Together","Things to Do Together","Our Life Goals","Our Milestones"].map((cat,ci)=><div key={ci} className="ep-block"><p className="ep-block-title">🗺️ {cat}</p><ListField dbKey={`future_cat_${ci}`} label={`Plans for: ${cat}`} defaults={[]} placeholder="Add a plan..." /></div>)}</>;
      case "s_lovenotes":   return <ListField dbKey="wall_surya_notes" label="Surya's sticky notes on the wall" defaults={["You are the first thing I think about every morning 🌙","I would choose you in every universe 💍","Your dreams are safe with me 🌟","I love the way your mind works 💚","Watching you grow is the greatest privilege of my life 🌺","Being loved by you is the best thing that has ever happened to me 💙"]} placeholder="Write a sticky note..." />;
      case "s_profile":     return <ProfileEditor />;
      default: return null;
    }
  };

  return (
    <div className="ep-page">
      <div className="ep-hero">
        <h1 className="ep-title">✏️ Surya's Edit Panel</h1>
        <p className="ep-sub">Customise every single thing on this website 💙</p>
        <p className="ep-sub" style={{fontSize:"0.8rem",color:"#aaa"}}>Only visible when logged in as Surya</p>
      </div>

      {!active ? (
        <div className="ep-grid">
          {SECTIONS.map(s => (
            <div key={s.key} className="ep-card" onClick={() => setActive(s.key)}>
              <div className="ep-card-icon">{s.icon}</div>
              <div className="ep-card-label">{s.label}</div>
              <div className="ep-card-arrow">→</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ep-section-wrap">
          <button className="ep-back-btn" onClick={() => setActive(null)}>← Back to all sections</button>
          <h2 className="ep-section-title">{SECTIONS.find(s=>s.key===active)?.label}</h2>
          {renderEditor()}
        </div>
      )}

      <div className="dream-footer" style={{ marginTop:"50px" }}>
        <p>"Everything you write here is a gift to her 💙"</p>
        <p className="dream-names">Surya — The author of this world 💍</p>
      </div>
    </div>
  );
}
