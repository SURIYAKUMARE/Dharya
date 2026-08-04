import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Map, Image, Lightbulb, Star, Mail, Heart,
  StickyNote, Flower2, Palette, Moon, Calendar,
  Sparkles, BookOpen, PartyPopper, MessageCircle,
  Globe, Brain, Gamepad2, Edit3, Lock, Shield,
  Music2, ChevronRight, MoreHorizontal
} from "lucide-react";
import JourneyTimeline from "./components/JourneyTimeline";
import MemoryGallery from "./components/MemoryGallery";
import ProposalBox from "./components/ProposalBox";
import DreamDashboard from "./components/DreamDashboard";
import LoveLetter from "./components/LoveLetter";
import SadhanaWorld from "./components/SadhanaWorld";
import MagicCorner from "./components/MagicCorner";
import StudyNotes from "./components/StudyNotes";
import TonightPromise from "./components/TonightPromise";
import SurpriseBox from "./components/SurpriseBox";
import MoodBoard from "./components/MoodBoard";
import LoveNotesWall from "./components/LoveNotesWall";
import FuturePlans from "./components/FuturePlans";
import OurVows from "./components/OurVows";
import SuryaEditPanel from "./components/SuryaEditPanel";
import LoveChat from "./components/LoveChat";
import LoginPage from "./components/LoginPage";
import SecretUniverse from "./components/SecretUniverse";
import SuryaMind from "./components/SuryaMind";
import LoveGames from "./components/LoveGames";
import RelationshipQuiz from "./components/RelationshipQuiz";
import "./App.css";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 min idle → auto-lock

const PAGE_SONGS = {
  box:"5KH2WKISoxs", journey:"gB1gPmtDohY", gallery:"wxmOt7Xhb6I",
  dream:"R5Wa9J3Whis", letters:"xP4mMpPAVME", vows:"gB1gPmtDohY",
  chat:"xP4mMpPAVME", mood:"wxmOt7Xhb6I", tonight:"R5Wa9J3Whis",
  world:"5KH2WKISoxs", magic:"xP4mMpPAVME", surprise:"gB1gPmtDohY",
  notes:"xP4mMpPAVME", future:"R5Wa9J3Whis", edit:"xP4mMpPAVME",
  secret:"R5Wa9J3Whis", mind:"gB1gPmtDohY", games:"5KH2WKISoxs",
  quiz:"wxmOt7Xhb6I",
};
const DEFAULT_SONG = "xP4mMpPAVME";

const PLAYLIST = [
  { id:"xP4mMpPAVME", title:"Our Song"      },
  { id:"R5Wa9J3Whis", title:"Nenjame"        },
  { id:"gB1gPmtDohY", title:"Munbe Vaa"      },
  { id:"wxmOt7Xhb6I", title:"Kannazhaga"     },
  { id:"5KH2WKISoxs", title:"Oru Adaar Love" },
];

/* nav groups */
const NAV_GROUPS_BASE = [
  { id:"story",   label:"Our Story", pages:[
    { key:"box",     icon:<Gift size={18}/>,    label:"Proposal"  },
    { key:"journey", icon:<Map size={18}/>,     label:"Journey"   },
    { key:"gallery", icon:<Image size={18}/>,   label:"Gallery"   },
    { key:"quiz",    icon:<Lightbulb size={18}/>, label:"Quiz"    },
  ]},
  { id:"love",    label:"Love Corner", pages:[
    { key:"dream",   icon:<Star size={18}/>,    label:"Dreams"    },
    { key:"letters", icon:<Mail size={18}/>,    label:"Letters"   },
    { key:"vows",    icon:<Heart size={18}/>,   label:"Vows"      },
    { key:"notes",   icon:<StickyNote size={18}/>, label:"Notes"  },
  ]},
  { id:"her",     label:"For Her", pages:[
    { key:"world",   icon:<Flower2 size={18}/>, label:"Sadhana's World" },
    { key:"mood",    icon:<Palette size={18}/>, label:"Mood Board"      },
    { key:"tonight", icon:<Moon size={18}/>,    label:"Tonight"         },
    { key:"future",  icon:<Calendar size={18}/>, label:"Future Plans"  },
  ]},
  { id:"magic",   label:"Magic Corner", pages:[
    { key:"magic",    icon:<Sparkles size={18}/>,     label:"Magic"       },
    { key:"study",    icon:<BookOpen size={18}/>,     label:"Study Notes" },
    { key:"surprise", icon:<PartyPopper size={18}/>,  label:"Surprises"   },
    { key:"chat",     icon:<MessageCircle size={18}/>, label:"Chat"       },
  ]},
  { id:"universe",label:"Universe", pages:[
    { key:"secret",  icon:<Globe size={18}/>,    label:"Secret Universe" },
    { key:"mind",    icon:<Brain size={18}/>,    label:"Surya's Mind"    },
    { key:"games",   icon:<Gamepad2 size={18}/>, label:"Love Games"      },
  ]},
];

/* bottom-tab configs per user */
const BOTTOM_TABS_SADHANA = [
  { key:"box",     icon:<Gift size={20}/>,           label:"Proposal" },
  { key:"gallery", icon:<Image size={20}/>,          label:"Gallery"  },
  { key:"dream",   icon:<Star size={20}/>,           label:"Dreams"   },
  { key:"letters", icon:<Mail size={20}/>,           label:"Letters"  },
  { key:"chat",    icon:<MessageCircle size={20}/>,  label:"Chat"     },
];
const BOTTOM_TABS_SURYA = [
  { key:"box",     icon:<Gift size={20}/>,           label:"Proposal" },
  { key:"gallery", icon:<Image size={20}/>,          label:"Gallery"  },
  { key:"notes",   icon:<StickyNote size={20}/>,     label:"Notes"    },
  { key:"chat",    icon:<MessageCircle size={20}/>,  label:"Chat"     },
  { key:"edit",    icon:<Edit3 size={20}/>,          label:"Edit"     },
];

/* ─────────────────────────────────────────────
   LOCK SCREEN
───────────────────────────────────────────── */
function LockScreen({ user, onUnlock }) {
  const [pin,   setPin]   = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const correctPass = user === "surya" ? "09/10/2007" : "29/02/2008";
  const isSurya     = user === "surya";

  const tryUnlock = (e) => {
    e && e.preventDefault();
    if (pin === correctPass) {
      onUnlock();
    } else {
      setError("Wrong password 🔐");
      setShake(true);
      setTimeout(() => { setShake(false); setError(""); setPin(""); }, 700);
    }
  };

  return (
    <div className={`lock-screen ${isSurya ? "lock-screen-surya" : ""}`}>
      <div className="lock-bg-blur" />
      <div className={`lock-card ${shake ? "login-shake" : ""}`}>
        <div className="lock-icon">{isSurya ? "🌿" : "🌸"}</div>
        <h2 className="lock-title">App Locked</h2>
        <p className="lock-sub">Enter your password to continue</p>
        <form onSubmit={tryUnlock} autoComplete="off">
          <input
            className="login-input"
            type="password"
            placeholder="Password..."
            value={pin}
            onChange={e => { setPin(e.target.value); setError(""); }}
            autoFocus
            style={{ marginBottom: "14px", textAlign: "center", letterSpacing: "5px" }}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn">
            {isSurya ? "Unlock 🌿" : "Unlock 🌸"}
          </button>
        </form>
        <p className="lock-hint">
          {isSurya ? "Surya's private space 💙" : "Sadhana's private space 💗"}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRIVACY SHIELD
───────────────────────────────────────────── */
function PrivacyShield({ user, onDismiss }) {
  return (
    <div className="privacy-shield" onClick={onDismiss}>
      <div className="privacy-shield-inner">
        <div className="privacy-shield-icon">{user === "surya" ? "🌿" : "🌸"}</div>
        <p className="privacy-shield-text">Tap anywhere to continue</p>
        <p className="privacy-shield-sub">Content hidden 🛡️</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MUSIC PLAYER
───────────────────────────────────────────── */
function MusicPlayer({ page }) {
  const playerRef    = useRef(null);
  const containerRef = useRef(null);
  const [playing,  setPlaying]  = useState(true);
  const [muted,    setMuted]    = useState(false);
  const [ready,    setReady]    = useState(false);
  const [trackId,  setTrackId]  = useState(PAGE_SONGS[page] || DEFAULT_SONG);
  const [expanded, setExpanded] = useState(false);

  const currentTrack = PLAYLIST.find(t => t.id === trackId) || PLAYLIST[0];

  const initPlayer = (videoId) => {
    if (playerRef.current) { try { playerRef.current.destroy(); } catch (_) {} }
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: { autoplay:1, controls:0, disablekb:1, fs:0, modestbranding:1, rel:0 },
      events: {
        onReady: (e) => { e.target.setVolume(60); e.target.playVideo(); setReady(true); setPlaying(true); },
        onStateChange: (e) => { if (e.data === window.YT.PlayerState.ENDED) e.target.playVideo(); },
      },
    });
  };

  useEffect(() => {
    const start = () => initPlayer(PAGE_SONGS[page] || DEFAULT_SONG);
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
    const newId = PAGE_SONGS[page] || DEFAULT_SONG;
    if (newId === trackId) return;
    setTrackId(newId);
    if (!ready || !playerRef.current) return;
    try { playerRef.current.loadVideoById(newId); setPlaying(true); } catch (_) {}
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => { if (!ready) return; playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo(); setPlaying(p=>!p); };
  const toggleMute = () => { if (!ready) return; if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(60); } else { playerRef.current.mute(); } setMuted(m=>!m); };

  return (
    <>
      <div style={{ position:"fixed",top:"-9999px",left:"-9999px",width:"1px",height:"1px",overflow:"hidden" }}>
        <div ref={containerRef} />
      </div>
      <div className={`music-player-v2 ${expanded ? "expanded" : ""}`}>
        <div className="mp-pill" onClick={() => setExpanded(e => !e)}>
          <span className={`mp-note ${playing && !muted ? "mp-bounce" : ""}`}>🎵</span>
          <div className="mp-bars">
            {[0,1,2,3].map(i => (
              <span key={i} className={`music-bar ${playing && !muted ? "playing" : ""}`} style={{ animationDelay:`${i*0.15}s` }} />
            ))}
          </div>
        </div>
        {expanded && (
          <div className="mp-panel">
            <p className="mp-track-name">{currentTrack.title}</p>
            <p className="mp-track-num">🎵 This page's song</p>
            <div className="mp-controls">
              <button className="mp-ctrl mp-ctrl-main" onClick={togglePlay}>{playing ? "⏸" : "▶"}</button>
              <button className="mp-ctrl" onClick={toggleMute}>{muted ? "🔇" : "🔊"}</button>
            </div>
            <div className="mp-playlist">
              {PLAYLIST.map(t => (
                <div key={t.id} className={`mp-plist-item ${t.id===trackId?"mp-plist-active":""}`}>
                  {t.id===trackId ? "▶ " : ""}{t.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   ANNIVERSARY BADGE
───────────────────────────────────────────── */
const TOGETHER_SINCE = new Date("2026-05-20T00:00:00");
function AnniversaryBadge() {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const calc = () => setDays(Math.max(0, Math.floor((new Date()-TOGETHER_SINCE)/86400000)));
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="anniv-badge-v2">
      <span className="anniv-heart">💑</span>
      <span className="anniv-text">{days}d</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  const [user,        setUser]        = useState(null);
  const [loggedIn,    setLoggedIn]    = useState(false);
  const [page,        setPage]        = useState("box");
  const [boxOpened,   setBoxOpened]   = useState(false);
  const [navOpen,     setNavOpen]     = useState(false);
  const [locked,      setLocked]      = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [tabHidden,   setTabHidden]   = useState(false);
  const [idleWarning, setIdleWarning] = useState(false);

  const idleRef    = useRef(null);
  const warnRef    = useRef(null);

  /* ── Idle timer ── */
  const resetIdle = useCallback(() => {
    if (locked) return;
    setIdleWarning(false);
    clearTimeout(idleRef.current);
    clearTimeout(warnRef.current);
    warnRef.current = setTimeout(() => setIdleWarning(true), IDLE_TIMEOUT_MS - 30000);
    idleRef.current = setTimeout(() => setLocked(true),      IDLE_TIMEOUT_MS);
  }, [locked]);

  useEffect(() => {
    if (!loggedIn) return;
    const events = ["mousemove","mousedown","keydown","touchstart","scroll","click"];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive:true }));
    resetIdle();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      clearTimeout(idleRef.current);
      clearTimeout(warnRef.current);
    };
  }, [loggedIn, resetIdle]);

  /* ── Tab visibility blur ── */
  useEffect(() => {
    if (!loggedIn) return;
    const onVis = () => {
      if (document.hidden) setTabHidden(true);
      else setTimeout(() => setTabHidden(false), 500);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loggedIn]);

  /* ── Back button → lock ── */
  useEffect(() => {
    if (!loggedIn) return;
    window.history.pushState(null, "", window.location.href);
    const onPop = () => { window.history.pushState(null,"",window.location.href); setLocked(true); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [loggedIn]);

  /* ── Screens ── */
  if (!loggedIn) return <LoginPage onLogin={(u) => { setUser(u); setLoggedIn(true); }} />;
  if (locked)    return <LockScreen user={user} onUnlock={() => { setLocked(false); resetIdle(); }} />;

  /* apply theme */
  document.body.className = user === "surya" ? "theme-surya" : "";

  const isSurya = user === "surya";

  const renderPage = () => {
    switch (page) {
      case "box":      return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
      case "journey":  return <JourneyTimeline setPage={setPage} user={user} />;
      case "gallery":  return <MemoryGallery setPage={setPage} user={user} />;
      case "dream":    return <DreamDashboard user={user} />;
      case "letters":  return <LoveLetter setPage={setPage} user={user} />;
      case "world":    return <SadhanaWorld setPage={setPage} user={user} />;
      case "magic":    return <MagicCorner setPage={setPage} user={user} />;
      case "study":    return <StudyNotes user={user} />;
      case "tonight":  return <TonightPromise user={user} />;
      case "chat":     return <LoveChat user={user} />;
      case "surprise": return <SurpriseBox user={user} />;
      case "mood":     return <MoodBoard user={user} />;
      case "notes":    return <LoveNotesWall user={user} />;
      case "future":   return <FuturePlans user={user} />;
      case "vows":     return <OurVows user={user} />;
      case "secret":   return <SecretUniverse setPage={setPage} />;
      case "mind":     return <SuryaMind user={user} />;
      case "games":    return <LoveGames setPage={setPage} />;
      case "quiz":     return <RelationshipQuiz setPage={setPage} />;
      case "edit":     return isSurya ? <SuryaEditPanel /> : <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
      default:         return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
    }
  };

  const allPages     = NAV_GROUPS_BASE.flatMap(g => g.pages);
  const currentLabel = allPages.find(p => p.key === page);
  const navigate     = (key) => { setPage(key); setNavOpen(false); };
  const bottomTabs   = isSurya ? BOTTOM_TABS_SURYA : BOTTOM_TABS_SADHANA;

  return (
    <div className={`app-v2 ${isSurya ? "theme-surya" : ""} ${tabHidden ? "app-tab-blurred" : ""}`}>
      <MusicPlayer page={page} />

      {/* Tab-switch blur */}
      {tabHidden && (
        <div className="tab-blur-overlay" onClick={() => setTabHidden(false)}>
          <div className="tab-blur-inner">
            <div className="tab-blur-icon">{isSurya ? "🌿" : "🌸"}</div>
            <p>Tap to continue</p>
          </div>
        </div>
      )}

      {/* Privacy shield */}
      {privacyMode && <PrivacyShield user={user} onDismiss={() => setPrivacyMode(false)} />}

      {/* Idle warning */}
      {idleWarning && !locked && (
        <div className="idle-warning-banner">
          <span>🔒 Locking in 30s</span>
          <button onClick={resetIdle}>Stay</button>
          <button onClick={() => setLocked(true)}>Lock</button>
        </div>
      )}

      {/* ── Top bar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-brand">
            <div className="topbar-logo">{isSurya ? "🌿" : "💗"}</div>
            <span className="topbar-title">Dharya</span>
          </div>
        </div>

        <div className="topbar-center">
          {currentLabel && (
            <span className="topbar-current">
              {currentLabel.label}
            </span>
          )}
        </div>

        <div className="topbar-right">
          <AnniversaryBadge />
          <button className="topbar-icon-btn" onClick={() => setPrivacyMode(v => !v)} title="Privacy" aria-label="Privacy shield">
            <Shield size={16} />
          </button>
          <button className="topbar-icon-btn" onClick={() => setLocked(true)} title="Lock" aria-label="Lock app">
            <Lock size={16} />
          </button>
          <button className="topbar-menu-btn" onClick={() => setNavOpen(n => !n)} aria-label="Menu">
            <span className={`hamburger ${navOpen ? "open" : ""}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </header>

      {/* ── Nav drawer backdrop ── */}
      {navOpen && <div className="nav-backdrop" onClick={() => setNavOpen(false)} />}

      {/* ── Nav drawer ── */}
      <nav className={`nav-drawer ${navOpen ? "nav-drawer-open" : ""}`}>
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <div className="nav-drawer-brand-logo">{isSurya ? "🌿" : "💗"}</div>
            <span className="nav-drawer-brand-name">Dharya</span>
          </div>
          <div className="nav-drawer-user">
            <span className="nav-drawer-username">{isSurya ? "Surya" : "Sadhana"}</span>
          </div>
          <button className="nav-drawer-close" onClick={() => setNavOpen(false)}>✕</button>
        </div>

        <div className="nav-drawer-body">
          {NAV_GROUPS_BASE.map(g => (
            <div key={g.id} className="nav-group">
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
                    {page === p.key && <ChevronRight size={14} style={{opacity:0.6}} />}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Privacy section */}
          <div className="nav-group">
            <p className="nav-group-label">Privacy</p>
            <div className="nav-group-items">
              <button className="nav-item" onClick={() => { setNavOpen(false); setLocked(true); }}>
                <span className="nav-item-icon"><Lock size={18}/></span>
                <span className="nav-item-label">Lock App</span>
              </button>
              <button className="nav-item" onClick={() => { setNavOpen(false); setPrivacyMode(true); }}>
                <span className="nav-item-icon"><Shield size={18}/></span>
                <span className="nav-item-label">Privacy Shield</span>
              </button>
            </div>
          </div>

          {/* Surya-only: Edit panel */}
          {isSurya && (
            <div className="nav-group">
              <p className="nav-group-label">Admin</p>
              <div className="nav-group-items">
                <button className={`nav-item ${page==="edit"?"nav-item-active":""}`} onClick={() => navigate("edit")}>
                  <span className="nav-item-icon"><Edit3 size={18}/></span>
                  <span className="nav-item-label">Edit Panel</span>
                  {page==="edit" && <ChevronRight size={14} style={{opacity:0.6}} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Bottom tab bar ── */}
      <nav className="bottom-tabs">
        {bottomTabs.map(t => (
          <button
            key={t.key}
            className={`btab ${page===t.key ? "btab-active" : ""}`}
            onClick={() => navigate(t.key)}
          >
            <span className="btab-icon">{t.icon}</span>
            <span className="btab-label">{t.label}</span>
          </button>
        ))}
        <button className="btab" onClick={() => setNavOpen(true)}>
          <span className="btab-icon"><MoreHorizontal size={20}/></span>
          <span className="btab-label">More</span>
        </button>
      </nav>

      {/* ── Page content with Framer Motion transitions ── */}
      <AnimatePresence mode="wait">
        <motion.main
          className="main-content"
          key={page}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>

      {/* Floating ambient particles */}
      <div className="hearts" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{
            left: `${10 + i * 18}%`,
            animationDelay: `${i * 1.8}s`,
            animationDuration: `${10 + i * 1.5}s`,
            fontSize: `${16 + (i % 2) * 8}px`,
          }}>
            {isSurya ? "🍃" : "✨"}
          </span>
        ))}
      </div>
    </div>
  );
}
