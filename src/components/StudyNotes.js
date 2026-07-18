import { useState, useEffect, useCallback } from "react";

const SUBJECTS = ["General","Maths","Science","English","History","CS","Tamil","Other"];
const NOTE_COLORS = ["#fff9c4","#fce4ec","#e8f5e9","#e3f2fd","#f3e5f5","#fff3e0","#e0f7fa","#fce4f0"];
const COLOR_NAMES = ["Yellow","Pink","Green","Blue","Purple","Orange","Cyan","Rose"];
const POLL_MS = 5000;

async function apiFetch(path, opts={}) {
  const res = await fetch("/api/notes"+path, { headers:{"Content-Type":"application/json"}, ...opts });
  if (!res.ok) { const e=await res.text(); throw new Error(e); }
  return res.json();
}

function fmtDate(d) {
  const dt = new Date(d);
  const today = new Date(); today.setHours(0,0,0,0);
  const yest  = new Date(today); yest.setDate(today.getDate()-1);
  if (dt >= today) return "Today " + dt.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
  if (dt >= yest)  return "Yesterday";
  return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
}

export default function StudyNotes({ user }) {
  const [notes,      setNotes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [adding,     setAdding]     = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [filter,     setFilter]     = useState("all");  // "all"|"mine"|"theirs"|subject
  const [search,     setSearch]     = useState("");
  const [viewNote,   setViewNote]   = useState(null);
  const [form, setForm] = useState({ title:"", content:"", subject:"General", color:"#fff9c4" });
  const [saving, setSaving] = useState(false);

  const authorLabel = (a) => a==="surya"?"💙 Surya":"💗 Sadhana";
  const other = user==="surya"?"sadhana":"surya";

  /* ── load ── */
  const load = useCallback(async () => {
    try {
      const data = await apiFetch("");
      setNotes(data);
      setError("");
    } catch(e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id=setInterval(load,POLL_MS); return ()=>clearInterval(id); }, [load]);

  /* ── create / update ── */
  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`?id=${editingId}`,{ method:"PATCH", body:JSON.stringify(form) });
        setNotes(prev=>prev.map(n=>String(n._id)===editingId?{...n,...form,updatedAt:new Date()}:n));
      } else {
        const { note } = await apiFetch("",{ method:"POST", body:JSON.stringify({...form,author:user}) });
        setNotes(prev=>[note,...prev]);
      }
      setAdding(false); setEditingId(null);
      setForm({ title:"", content:"", subject:"General", color:"#fff9c4" });
    } catch(e) { setError(e.message); }
    setSaving(false);
  };

  /* ── delete ── */
  const del = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await apiFetch(`?id=${id}`,{ method:"DELETE" });
      setNotes(prev=>prev.filter(n=>String(n._id)!==id));
    } catch(e) { setError(e.message); }
  };

  /* ── pin ── */
  const togglePin = async (note) => {
    const pinned = !note.pinned;
    try {
      await apiFetch(`?id=${String(note._id)}`,{ method:"PATCH", body:JSON.stringify({pinned}) });
      setNotes(prev=>prev.map(n=>String(n._id)===String(note._id)?{...n,pinned}:n));
    } catch {}
  };

  /* ── start edit ── */
  const startEdit = (note) => {
    setForm({ title:note.title, content:note.content, subject:note.subject, color:note.color });
    setEditingId(String(note._id));
    setAdding(true);
  };

  /* ── filtered notes ── */
  const visible = notes.filter(n => {
    const matchFilter = filter==="all" || filter==="mine"?n.author===user : filter==="theirs"?n.author===other : n.subject===filter;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pinned   = visible.filter(n=>n.pinned);
  const unpinned = visible.filter(n=>!n.pinned);

  return (
    <div className="sn-page">
      {/* Header */}
      <div className="sn-header">
        <h1 className="sn-title">📚 Study Notes</h1>
        <p className="sn-sub">Shared notes for Surya & Sadhana 💙💗</p>
      </div>

      {error && <div className="wachat-error">⚠️ {error}</div>}

      {/* Search + filter bar */}
      <div className="sn-toolbar">
        <input className="sn-search" placeholder="🔍 Search notes..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="sn-filters">
          {["all","mine","theirs",...SUBJECTS].map(f=>(
            <button key={f} className={`sn-filter-btn ${filter===f?"sn-filter-active":""}`}
              onClick={()=>setFilter(f)}>
              {f==="all"?"All":f==="mine"?`Mine (${user})`:`f`==="theirs"?`Theirs`:f}
              {f==="mine"?` ${user==="surya"?"💙":"💗"}`:f==="theirs"?` ${user==="surya"?"💗":"💙"}`:""}
            </button>
          ))}
        </div>
      </div>

      {/* Add button */}
      {!adding && (
        <button className="sn-add-btn" onClick={()=>{setAdding(true);setEditingId(null);setForm({title:"",content:"",subject:"General",color:"#fff9c4"});}}>
          ＋ New Note
        </button>
      )}

      {/* Form */}
      {adding && (
        <div className="sn-form" style={{borderColor: form.color, background: form.color}}>
          <input className="sn-form-title" placeholder="Note title..." value={form.title}
            onChange={e=>setForm(f=>({...f,title:e.target.value}))} autoFocus />
          <textarea className="sn-form-content" rows={6} placeholder="Write your notes here..."
            value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} />

          <div className="sn-form-row">
            <select className="sn-select" value={form.subject}
              onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
              {SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>

            <div className="sn-color-row">
              {NOTE_COLORS.map((c,i)=>(
                <button key={c} title={COLOR_NAMES[i]}
                  className={`sn-color-dot ${form.color===c?"sn-color-active":""}`}
                  style={{background:c}} onClick={()=>setForm(f=>({...f,color:c}))} />
              ))}
            </div>
          </div>

          <div className="sn-form-btns">
            <button className="sn-save-btn" onClick={save} disabled={!form.title.trim()||saving}>
              {saving?"Saving...":editingId?"Update ✓":"Save Note 💾"}
            </button>
            <button className="sn-cancel-btn" onClick={()=>{setAdding(false);setEditingId(null);}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="db-loading"><div className="db-loading-icon">📚</div><p>Loading notes...</p></div>
      ) : visible.length === 0 ? (
        <div className="sn-empty">
          <p>📝 No notes yet</p>
          <p>Tap <strong>＋ New Note</strong> to start</p>
        </div>
      ) : (
        <>
          {/* Pinned */}
          {pinned.length > 0 && (
            <>
              <p className="sn-section-label">📌 Pinned</p>
              <div className="sn-grid">
                {pinned.map(n => <NoteCard key={String(n._id)} note={n} user={user} onEdit={startEdit} onDelete={del} onPin={togglePin} onView={setViewNote} authorLabel={authorLabel} />)}
              </div>
            </>
          )}
          {/* All others */}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && <p className="sn-section-label">📄 Notes</p>}
              <div className="sn-grid">
                {unpinned.map(n => <NoteCard key={String(n._id)} note={n} user={user} onEdit={startEdit} onDelete={del} onPin={togglePin} onView={setViewNote} authorLabel={authorLabel} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* Full view overlay */}
      {viewNote && (
        <div className="sn-overlay" onClick={()=>setViewNote(null)}>
          <div className="sn-modal" style={{background:viewNote.color}} onClick={e=>e.stopPropagation()}>
            <div className="sn-modal-head">
              <span className="sn-modal-subject">{viewNote.subject}</span>
              <button className="sn-modal-close" onClick={()=>setViewNote(null)}>✕</button>
            </div>
            <h2 className="sn-modal-title">{viewNote.title}</h2>
            <p className="sn-modal-author">{authorLabel(viewNote.author)} · {fmtDate(viewNote.updatedAt||viewNote.createdAt)}</p>
            <pre className="sn-modal-content">{viewNote.content || "No content."}</pre>
            {viewNote.author===user && (
              <button className="sn-save-btn" style={{marginTop:"16px"}} onClick={()=>{setViewNote(null);startEdit(viewNote);}}>
                ✏️ Edit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, user, onEdit, onDelete, onPin, onView, authorLabel }) {
  const isMine = note.author === user;
  return (
    <div className="sn-card" style={{background:note.color}} onClick={()=>onView(note)}>
      <div className="sn-card-head">
        <span className="sn-card-subject">{note.subject}</span>
        <div className="sn-card-actions" onClick={e=>e.stopPropagation()}>
          <button className={`sn-pin-btn ${note.pinned?"sn-pinned":""}`} title="Pin" onClick={()=>onPin(note)}>📌</button>
          {isMine && <>
            <button className="sn-card-btn" title="Edit"   onClick={()=>onEdit(note)}>✏️</button>
            <button className="sn-card-btn" title="Delete" onClick={()=>onDelete(String(note._id))}>🗑️</button>
          </>}
        </div>
      </div>
      <h3 className="sn-card-title">{note.title}</h3>
      <p  className="sn-card-preview">{note.content ? note.content.slice(0,120)+(note.content.length>120?"...":"") : "No content"}</p>
      <div className="sn-card-footer">
        <span className="sn-card-author">{authorLabel(note.author)}</span>
        <span className="sn-card-date">{fmtDate(note.updatedAt||note.createdAt)}</span>
      </div>
    </div>
  );
}
