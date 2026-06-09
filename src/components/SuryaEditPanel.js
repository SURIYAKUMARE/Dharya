import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../api";

/* ══════════════════════════════════════════
   Sections Surya can edit
══════════════════════════════════════════ */
const SECTIONS = [
  { key: "edit_letter",    label: "💌 Love Letters",       icon: "💌" },
  { key: "edit_notes",     label: "📝 Notes Wall",         icon: "📝" },
  { key: "edit_vow",       label: "💒 Surya's Vow",        icon: "💒" },
  { key: "edit_promises",  label: "💍 Nightly Promises",   icon: "💍" },
  { key: "edit_compliments",label:"💬 Compliments",        icon: "💬" },
  { key: "edit_quiz",      label: "🎯 Quiz Questions",     icon: "🎯" },
  { key: "edit_timeline",  label: "🗺️ Our Journey",       icon: "🗺️" },
  { key: "edit_surprises", label: "🎁 Surprise Messages",  icon: "🎁" },
];

/* ─── Generic text editor ─── */
function TextEditor({ dbKey, label, placeholder, multiline = true, defaultValue = "" }) {
  const [val,   setVal]   = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(dbKey, defaultValue).then(v => {
      setVal(v || defaultValue);
      setLoading(false);
    });
  }, [dbKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    await dbSet(dbKey, val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="ep-loading">Loading... 💙</div>;

  return (
    <div className="ep-editor">
      <label className="ep-label">{label}</label>
      {multiline ? (
        <textarea className="ep-textarea" value={val} onChange={e => setVal(e.target.value)} rows={6} placeholder={placeholder} />
      ) : (
        <input className="ep-input" value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} />
      )}
      <button className="ep-save-btn" onClick={save}>{saved ? "✅ Saved!" : "Save 💙"}</button>
    </div>
  );
}

/* ─── List editor (for compliments, promises, quiz) ─── */
function ListEditor({ dbKey, label, defaultItems = [], placeholder = "Add item..." }) {
  const [items,   setItems]   = useState([]);
  const [draft,   setDraft]   = useState("");
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(dbKey, defaultItems).then(v => {
      setItems(Array.isArray(v) && v.length > 0 ? v : defaultItems);
      setLoading(false);
    });
  }, [dbKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = () => {
    if (!draft.trim()) return;
    setItems(prev => [...prev, draft.trim()]);
    setDraft("");
  };

  const remove = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    await dbSet(dbKey, items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="ep-loading">Loading... 💙</div>;

  return (
    <div className="ep-editor">
      <label className="ep-label">{label}</label>
      <div className="ep-list">
        {items.map((item, i) => (
          <div key={i} className="ep-list-item">
            <span>{item}</span>
            <button className="ep-list-del" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <div className="ep-list-add">
        <input className="ep-input" value={draft} onChange={e => setDraft(e.target.value)}
          placeholder={placeholder} onKeyDown={e => e.key === "Enter" && add()} />
        <button className="ep-add-btn" onClick={add}>＋ Add</button>
      </div>
      <button className="ep-save-btn" onClick={save}>{saved ? "✅ Saved!" : "Save All 💙"}</button>
    </div>
  );
}

/* ─── Timeline editor ─── */
function TimelineEditor() {
  const DEFAULT = [
    { year:"19/06/2023", title:"We Met",             desc:"At the tuition a pleasant day..." },
    { year:"17/05/2026", title:"I Proposed to her",  desc:"At midnight" },
    { year:"18/05/2026", title:"She Proposed to me", desc:"At Evening" },
    { year:"19/05/2026", title:"We both Proposed",   desc:"At Evening" },
    { year:"20/05/2026", title:"We start our journey",desc:"From that day, forever together..." },
  ];
  const [moments, setMoments] = useState([]);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet("edit_timeline", DEFAULT).then(v => {
      setMoments(Array.isArray(v) && v.length > 0 ? v : DEFAULT);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (i, field, val) => {
    setMoments(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const add = () => setMoments(prev => [...prev, { year: "", title: "", desc: "" }]);
  const remove = (i) => setMoments(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    await dbSet("edit_timeline", moments);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="ep-loading">Loading... 💙</div>;

  return (
    <div className="ep-editor">
      <label className="ep-label">Journey Timeline Moments</label>
      {moments.map((m, i) => (
        <div key={i} className="ep-timeline-item">
          <div className="ep-timeline-row">
            <input className="ep-input ep-short" value={m.year}  onChange={e => update(i,"year",e.target.value)}  placeholder="Date e.g. 19/06/2023" />
            <input className="ep-input ep-short" value={m.title} onChange={e => update(i,"title",e.target.value)} placeholder="Title" />
            <button className="ep-list-del" onClick={() => remove(i)}>✕</button>
          </div>
          <textarea className="ep-textarea ep-short-ta" value={m.desc} onChange={e => update(i,"desc",e.target.value)} placeholder="Description" rows={2} />
        </div>
      ))}
      <button className="ep-add-btn" style={{ marginBottom:"12px" }} onClick={add}>＋ Add Moment</button>
      <button className="ep-save-btn" onClick={save}>{saved ? "✅ Saved!" : "Save Timeline 💙"}</button>
    </div>
  );
}

/* ─── Main Edit Panel ─── */
export default function SuryaEditPanel({ setPage }) {
  const [active, setActive] = useState(null);

  const renderEditor = () => {
    switch (active) {
      case "edit_letter":
        return (
          <>
            <TextEditor dbKey="custom_letter_1_title"   label="Letter 1 — Title"   placeholder="e.g. The First Time I Saw You" multiline={false} defaultValue="The First Time I Saw You" />
            <TextEditor dbKey="custom_letter_1_content" label="Letter 1 — Content" placeholder="Write the letter..." defaultValue="" />
            <TextEditor dbKey="custom_letter_2_title"   label="Letter 2 — Title"   placeholder="Letter title..." multiline={false} defaultValue="The Night I Proposed" />
            <TextEditor dbKey="custom_letter_2_content" label="Letter 2 — Content" placeholder="Write the letter..." defaultValue="" />
            <TextEditor dbKey="custom_letter_3_title"   label="Letter 3 — Title"   placeholder="Letter title..." multiline={false} defaultValue="Why I Choose You Every Day" />
            <TextEditor dbKey="custom_letter_3_content" label="Letter 3 — Content" placeholder="Write the letter..." defaultValue="" />
            <TextEditor dbKey="custom_letter_4_title"   label="Letter 4 — Title"   placeholder="Letter title..." multiline={false} defaultValue="A Promise For Our Future" />
            <TextEditor dbKey="custom_letter_4_content" label="Letter 4 — Content" placeholder="Write the letter..." defaultValue="" />
          </>
        );
      case "edit_notes":
        return <ListEditor dbKey="edit_notes_list" label="Love Notes (shown on the Notes Wall)" placeholder="Write a love note..." defaultItems={[
          "You are the first thing I think about every morning 🌙",
          "I would choose you in every universe 💍",
          "Your dreams are safe with me 🌟",
          "I love the way your mind works 💚",
          "Watching you grow is the greatest privilege of my life 🌺",
          "Being loved by you is the best thing that has ever happened to me 💙",
        ]} />;
      case "edit_vow":
        return <TextEditor dbKey="surya_vow_text" label="Surya's Vow to Sadhana (shown in Vows page)" placeholder="Write your vow..." defaultValue="" />;
      case "edit_promises":
        return <ListEditor dbKey="edit_promises_list" label="Nightly Promises (rotate daily on Tonight page)" placeholder="Add a promise..." defaultItems={[
          "I promise to always be your safe place 💙",
          "I promise to make you smile every single day 🌸",
          "I promise to never let you feel alone 🫂",
          "I promise to love you on your hardest days 💍",
          "I promise to always choose you 🌟",
        ]} />;
      case "edit_compliments":
        return <ListEditor dbKey="edit_compliments_list" label="Compliments (shown in Compliment Machine)" placeholder="Add a compliment..." defaultItems={[
          "You have the most beautiful soul I have ever encountered 🌸",
          "Your smile is literally the highlight of my entire day 🌟",
          "You are so much stronger than you know 💪",
        ]} />;
      case "edit_quiz":
        return (
          <>
            <p className="ep-section-note">Edit quiz questions and answers (correct answer index is 0-based)</p>
            {[1,2,3,4].map(n => (
              <div key={n} className="ep-quiz-block">
                <TextEditor dbKey={`edit_quiz_q${n}`} label={`Question ${n}`} placeholder="Write the question..." multiline={false} defaultValue="" />
                <ListEditor dbKey={`edit_quiz_opts${n}`} label={`Options for Q${n} (add in order)`} placeholder="Add option..." defaultItems={[]} />
                <TextEditor dbKey={`edit_quiz_correct${n}`} label={`Correct answer index for Q${n} (0,1,2,3)`} multiline={false} placeholder="e.g. 2" defaultValue="" />
              </div>
            ))}
          </>
        );
      case "edit_timeline":
        return <TimelineEditor />;
      case "edit_surprises":
        return (
          <>
            {[1,2,3,4,5].map(n => (
              <div key={n} className="ep-surprise-block">
                <TextEditor dbKey={`edit_surprise_${n}_title`}   label={`Surprise #${n} — Title`}   multiline={false} placeholder="e.g. A Virtual Hug From Surya 🫂" defaultValue="" />
                <TextEditor dbKey={`edit_surprise_${n}_hint`}    label={`Surprise #${n} — Hint`}    multiline={false} placeholder="e.g. Open when you feel like you need a hug" defaultValue="" />
                <TextEditor dbKey={`edit_surprise_${n}_content`} label={`Surprise #${n} — Message`} placeholder="Write the surprise message..." defaultValue="" />
              </div>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ep-page">
      <div className="ep-hero">
        <h1 className="ep-title">✏️ Surya's Edit Panel</h1>
        <p className="ep-sub">Edit content across the whole website — only you can see this 💙</p>
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
          <button className="ep-back-btn" onClick={() => setActive(null)}>← Back</button>
          <h2 className="ep-section-title">{SECTIONS.find(s => s.key === active)?.label}</h2>
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
