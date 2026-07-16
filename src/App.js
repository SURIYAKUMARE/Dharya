import { useState, useEffect, useRef } from "react";
import JourneyTimeline from "./components/JourneyTimeline";
import MemoryGallery from "./components/MemoryGallery";
import ProposalBox from "./components/ProposalBox";
import DreamDashboard from "./components/DreamDashboard";
import LoveLetter from "./components/LoveLetter";
import SadhanaWorld from "./components/SadhanaWorld";
import MagicCorner from "./components/MagicCorner";
import TonightPromise from "./components/TonightPromise";
import SurpriseBox from "./components/SurpriseBox";
import MoodBoard from "./components/MoodBoard";
import LoveNotesWall from "./components/LoveNotesWall";
import FuturePlans from "./components/FuturePlans";
import OurVows from "./components/OurVows";
import SuryaEditPanel from "./components/SuryaEditPanel";
import LoveChat from "./components/LoveChat";
import LoginPage from "./components/LoginPage";
import "./App.css";

/* ── Playlist ── */
const PLAYLIST = [
  { id: "xP4mMpPAVME", title: "Our Song"         },
  { id: "R5Wa9J3Whis",  title: "Nenjame"           },
  { id: "gB1gPmtDohY",  title: "Munbe Vaa"         },
  { id: "wxmOt7Xhb6I",  title: "Kannazhaga"        },
  { id: "5KH2WKISoxs",  title: "Oru Adaar Love"    },
];

function MusicPlayer() {
  const playerRef    = useRef(null);
  const containerRef = useRef(null);
  const [playing,  setPlaying]  = useState(true);
  const [muted,    setMuted]    = useState(false);
  const [ready,    setReady]    = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const currentTrack = PLAYLIST[trackIdx];

  const initPlayer = (videoId) => {
    if (playerRef.current) { try { playerRef.current.destroy(); } catch (_) {} }
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: { autoplay:1, controls:0, disablekb:1, fs:0, modestbranding:1, rel:0 },
      events: {
        onReady: (e) => { e.target.setVolume(60); e.target.playVideo(); setReady(true); setPlaying(true); },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.ENDED)
            setTrackIdx(i => (i + 1) % PLAYLIST.length);
        },
      },
    });
  };

  useEffect(() => {
    const start = () => initPlayer(PLAYLIST[0].id);
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = start;
    } else if (window.YT.Player) { start(); }
    else { window.onYouTubeIframeAPIReady = start; }
    return () => { if (playerRef.current) { try { playerRef.current.destroy(); } catch (_) {} } };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try { playerRef.current.loadVideoById(PLAYLIST[trackIdx].id); setPlaying(true); } catch (_) {}
  }, [trackIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => { if (!ready) return; playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo(); setPlaying(p=>!p); };
  const toggleMute = () => { if (!ready) return; if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(60); } else { playerRef.current.mute(); } setMuted(m=>!m); };
  const prev = () => setTrackIdx(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
  const next = () => setTrackIdx(i => (i + 1) % PLAYLIST.length);

  return (
    <>
      <div style={{ position:"fixed", top:"-9999px", left:"-9999px", width:"1px", height:"1px", overflow:"hidden" }}>
        <div ref={containerRef} />
      </div>
      <div className={`music-player-v2 ${expanded ? "expanded" : ""}`}>
        {/* Collapsed pill */}
        <div className="mp-pill" onClick={() => setExpanded(e => !e)}>
          <span className={`mp-note ${playing && !muted ? "mp-bounce" : ""}`}>🎵</span>
          <div className="mp-bars">
            {[0,1,2,3].map(i => (
              <span key={i} className={`music-bar ${playing && !muted ? "playing" : ""}`} style={{ animationDelay:`${i*0.15}s` }} />
            ))}
          </div>
        </div>
        {/* Expanded panel */}
        {expanded && (
          <div className="mp-panel">
            <p className="mp-track-name">{currentTrack.title}</p>
            <p className="mp-track-num">{trackIdx+1} / {PLAYLIST.length}</p>
            <div className="mp-controls">
              <button className="mp-ctrl" onClick={prev}>⏮</button>
              <button className="mp-ctrl mp-ctrl-main" onClick={togglePlay}>{playing ? "⏸" : "▶"}</button>
              <button className="mp-ctrl" onClick={next}>⏭</button>
              <button className="mp-ctrl" onClick={toggleMute}>{muted ? "🔇" : "🔊"}</button>
            </div>
            <div className="mp-playlist">
              {PLAYLIST.map((t, i) => (
                <button key={i} className={`mp-plist-item ${i===trackIdx?"mp-plist-active":""}`} onClick={() => setTrackIdx(i)}>
                  {i===trackIdx ? "▶ " : ""}{t.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Anniversary Badge ── */
const TOGETHER_SINCE = new Date("2026-05-20T00:00:00");
function AnniversaryBadge() {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const calc = () => { const d = Math.max(0, Math.floor((new Date()-TOGETHER_SINCE)/86400000)); setDays(d); };
    calc(); const id = setInterval(calc,60000); return ()=>clearInterval(id);
  }, []);
  return (
    <div className="anniv-badge-v2">
      <span>💑</span>
      <span>{days}d together</span>
    </div>
  );
}

/* ── Nav groups ── */
const NAV_GROUPS = [
  { label:"💛 Our Story",  pages:[
    { key:"box",      icon:"🎁", label:"Proposal"    },
    { key:"journey",  icon:"🗺️", label:"Journey"     },
    { key:"gallery",  icon:"📸", label:"Gallery"     },
  ]},
  { label:"💌 Love Corner", pages:[
    { key:"dream",    icon:"💫", label:"Dreams"      },
    { key:"letters",  icon:"💌", label:"Letters"     },
    { key:"vows",     icon:"💒", label:"Vows"        },
    { key:"notes",    icon:"📝", label:"Notes"       },
  ]},
  { label:"🌸 Sadhana's",  pages:[
    { key:"world",    icon:"🌸", label:"My World"    },
    { key:"mood",     icon:"🌈", label:"Mood"        },
    { key:"tonight",  icon:"🌙", label:"Tonight"     },
    { key:"future",   icon:"🗓️", label:"Future"     },
  ]},
  { label:"✨ Magic",       pages:[
    { key:"magic",    icon:"✨", label:"Magic"       },
    { key:"surprise", icon:"🎁", label:"Surprises"   },
    { key:"chat",     icon:"💬", label:"Chat"        },
  ]},
];

export default function App() {
  const [user,      setUser]      = useState(null);
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [page,      setPage]      = useState("box");
  const [boxOpened, setBoxOpened] = useState(false);
  const [navOpen,   setNavOpen]   = useState(false);

  if (!loggedIn) return <LoginPage onLogin={(u) => { setUser(u); setLoggedIn(true); }} />;

  const renderPage = () => {
    switch (page) {
      case "box":      return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
      case "journey":  return <JourneyTimeline setPage={setPage} user={user} />;
      case "gallery":  return <MemoryGallery setPage={setPage} user={user} />;
      case "dream":    return <DreamDashboard user={user} />;
      case "letters":  return <LoveLetter setPage={setPage} user={user} />;
      case "world":    return <SadhanaWorld setPage={setPage} user={user} />;
      case "magic":    return <MagicCorner setPage={setPage} user={user} />;
      case "tonight":  return <TonightPromise user={user} />;
      case "chat":     return <LoveChat user={user} />;
      case "surprise": return <SurpriseBox user={user} />;
      case "mood":     return <MoodBoard user={user} />;
      case "notes":    return <LoveNotesWall user={user} />;
      case "future":   return <FuturePlans user={user} />;
      case "vows":     return <OurVows user={user} />;
      case "edit":     return user === "surya" ? <SuryaEditPanel /> : <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
      default:         return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
    }
  };

  // Find current page label
  const allPages = NAV_GROUPS.flatMap(g => g.pages);
  const currentLabel = allPages.find(p => p.key === page);

  const navigate = (key) => { setPage(key); setNavOpen(false); };

  return (
    <div className="app-v2">
      <MusicPlayer />

      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-logo">💗</span>
          <span className="topbar-title">Dharya</span>
        </div>
        <div className="topbar-center">
          {currentLabel && (
            <span className="topbar-current">{currentLabel.icon} {currentLabel.label}</span>
          )}
        </div>
        <div className="topbar-right">
          <AnniversaryBadge />
          <div className="topbar-user">{user === "surya" ? "💙" : "💗"}</div>
          <button className="topbar-menu-btn" onClick={() => setNavOpen(n => !n)}>
            {navOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Slide-out nav drawer */}
      {navOpen && <div className="nav-backdrop" onClick={() => setNavOpen(false)} />}
      <nav className={`nav-drawer ${navOpen ? "nav-drawer-open" : ""}`}>
        <div className="nav-drawer-header">
          <span>💗 Dharya</span>
          <button onClick={() => setNavOpen(false)}>✕</button>
        </div>
        {NAV_GROUPS.map(g => (
          <div key={g.label} className="nav-group">
            <p className="nav-group-label">{g.label}</p>
            <div className="nav-group-items">
              {g.pages.map(p => (
                <button
                  key={p.key}
                  className={`nav-item ${page === p.key ? "nav-item-active" : ""}`}
                  onClick={() => navigate(p.key)}
                >
                  <span className="nav-item-icon">{p.icon}</span>
                  <span className="nav-item-label">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {user === "surya" && (
          <div className="nav-group">
            <p className="nav-group-label">🛠️ Surya Only</p>
            <div className="nav-group-items">
              <button className={`nav-item ${page==="edit"?"nav-item-active":""}`} onClick={() => navigate("edit")}>
                <span className="nav-item-icon">✏️</span>
                <span className="nav-item-label">Edit Panel</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom tab bar for quick access (most used pages) */}
      <nav className="bottom-tabs">
        {[
          { key:"box",     icon:"🎁" },
          { key:"chat",    icon:"💬" },
          { key:"dream",   icon:"💫" },
          { key:"letters", icon:"💌" },
          { key:"gallery", icon:"📸" },
        ].map(t => (
          <button key={t.key} className={`btab ${page===t.key?"btab-active":""}`} onClick={() => navigate(t.key)}>
            <span className="btab-icon">{t.icon}</span>
          </button>
        ))}
        <button className="btab" onClick={() => setNavOpen(true)}>
          <span className="btab-icon">☰</span>
        </button>
      </nav>

      <main className="main-content">{renderPage()}</main>

      {/* Floating hearts */}
      <div className="hearts">
        {[...Array(6)].map((_, i) => (
          <span key={i} style={{ left:`${8+i*16}%`, animationDelay:`${i*1.4}s`, animationDuration:`${7+i}s` }}>❤️</span>
        ))}
      </div>
    </div>
  );
}
