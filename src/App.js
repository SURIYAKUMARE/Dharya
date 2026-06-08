import { useState, useEffect, useRef } from "react";
import JourneyTimeline from "./components/JourneyTimeline";
import MemoryGallery from "./components/MemoryGallery";
import ProposalBox from "./components/ProposalBox";
import RelationshipQuiz from "./components/RelationshipQuiz";
import DreamDashboard from "./components/DreamDashboard";
import LoveLetter from "./components/LoveLetter";
import SecretUniverse from "./components/SecretUniverse";
import SadhanaWorld from "./components/SadhanaWorld";
import LoveGames from "./components/LoveGames";
import MagicCorner from "./components/MagicCorner";
import TonightPromise from "./components/TonightPromise";
import SurpriseBox from "./components/SurpriseBox";
import MoodBoard from "./components/MoodBoard";
import LoveNotesWall from "./components/LoveNotesWall";
import SuryaMind from "./components/SuryaMind";
import FuturePlans from "./components/FuturePlans";
import OurVows from "./components/OurVows";
import LoginPage from "./components/LoginPage";
import "./App.css";

/* ── Background Music Player ── */
const YT_VIDEO_ID = "xP4mMpPAVME";

function MusicPlayer() {
  const playerRef    = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted,   setMuted]   = useState(false);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    const initPlayer = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: YT_VIDEO_ID,
        playerVars: { autoplay:1, loop:1, playlist:YT_VIDEO_ID, controls:0, disablekb:1, fs:0, modestbranding:1, rel:0 },
        events: {
          onReady: (e) => { e.target.setVolume(60); e.target.playVideo(); setReady(true); },
          onStateChange: (e) => { if (e.data === window.YT.PlayerState.ENDED) e.target.playVideo(); },
        },
      });
    };
    if (window.YT && window.YT.Player) { initPlayer(); }
    else { window.onYouTubeIframeAPIReady = initPlayer; }
    return () => { if (playerRef.current) { try { playerRef.current.destroy(); } catch (_) {} } };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    if (!ready) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    setPlaying(p => !p);
  };
  const toggleMute = () => {
    if (!ready) return;
    if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(60); }
    else        { playerRef.current.mute(); }
    setMuted(m => !m);
  };

  return (
    <>
      <div style={{ position:"fixed", top:"-9999px", left:"-9999px", width:"1px", height:"1px", overflow:"hidden" }}>
        <div ref={containerRef} />
      </div>
      <div className="music-player">
        <div className="music-icon">🎵</div>
        <div className="music-info">
          <span className="music-title">Our Song</span>
          <span className="music-dots">
            {[0,1,2,3].map(i => (
              <span key={i} className={`music-bar ${playing && !muted ? "playing" : ""}`} style={{ animationDelay:`${i*0.15}s` }} />
            ))}
          </span>
        </div>
        <button className="music-btn" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>{muted ? "🔇" : "🔊"}</button>
        <button className="music-btn" onClick={togglePlay} title={playing ? "Pause" : "Play"}>{playing ? "⏸" : "▶️"}</button>
      </div>
    </>
  );
}

/* ── Anniversary Badge ── */
const TOGETHER_SINCE = new Date("2026-05-20T00:00:00");

function AnniversaryBadge() {
  const [days,      setDays]      = useState(0);
  const [nextAnniv, setNextAnniv] = useState(0);

  useEffect(() => {
    const calc = () => {
      const now  = new Date();
      const diff = now - TOGETHER_SINCE;
      setDays(Math.max(0, Math.floor(diff / 86400000)));
      let next = new Date(now.getFullYear(), 4, 20);
      if (now >= next) next = new Date(now.getFullYear() + 1, 4, 20);
      setNextAnniv(Math.ceil((next - now) / 86400000));
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="anniv-badge">
      <span className="anniv-icon">💑</span>
      <div className="anniv-info">
        <span className="anniv-days">{days} days together</span>
        <span className="anniv-next">🎂 Anniversary in {nextAnniv}d</span>
      </div>
    </div>
  );
}

/* ── App ── */
const NAV = [
  { key: "box",      label: "Proposal Box"  },
  { key: "journey",  label: "Our Journey"   },
  { key: "gallery",  label: "Memory Lane"   },
  { key: "quiz",     label: "Love Quiz"     },
  { key: "dream",    label: "Dreams 💫"    },
  { key: "letters",  label: "Letters 💌"   },
  { key: "universe", label: "Universe 🌌"  },
  { key: "world",    label: "My World 🌸"  },
  { key: "games",   label: "Games 🎮"     },
  { key: "magic",   label: "Magic ✨"      },
  { key: "tonight", label: "Tonight 🌙"    },
  { key: "surprise",label: "Surprises 🎁"  },
  { key: "mood",    label: "Mood 🌈"       },
  { key: "notes",   label: "Notes 📝"      },
  { key: "mind",    label: "His Mind 💭"   },
  { key: "future",  label: "Future 🗺️"   },
  { key: "vows",    label: "Vows 💒"       },
];

export default function App() {
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [page,      setPage]      = useState("box");
  const [boxOpened, setBoxOpened] = useState(false);

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  const renderPage = () => {
    switch (page) {
      case "box":     return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
      case "journey": return <JourneyTimeline setPage={setPage} />;
      case "gallery": return <MemoryGallery setPage={setPage} />;
      case "quiz":    return <RelationshipQuiz setPage={setPage} />;
      case "dream":   return <DreamDashboard />;
      case "letters":  return <LoveLetter setPage={setPage} />;
      case "universe": return <SecretUniverse setPage={setPage} />;
      case "world":    return <SadhanaWorld setPage={setPage} />;
      case "games":    return <LoveGames setPage={setPage} />;
      case "magic":    return <MagicCorner setPage={setPage} />;
      case "tonight":  return <TonightPromise />;
      case "surprise": return <SurpriseBox />;
      case "mood":     return <MoodBoard />;
      case "notes":    return <LoveNotesWall />;
      case "mind":     return <SuryaMind />;
      case "future":   return <FuturePlans />;
      case "vows":     return <OurVows />;
      default:        return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
    }
  };

  return (
    <div className="app">
      <MusicPlayer />
      <AnniversaryBadge />
      <nav className="nav">
        {NAV.map(({ key, label }) => (
          <button key={key} onClick={() => setPage(key)} className={page === key ? "nav-active" : ""}>
            {label}
          </button>
        ))}
      </nav>
      <main>{renderPage()}</main>
      <div className="hearts">
        {[...Array(8)].map((_, i) => (
          <span key={i} style={{ left:`${10+i*11}%`, animationDelay:`${i*1.2}s`, animationDuration:`${6+i}s` }}>
            {" "}❤️{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
