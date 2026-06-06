import { useState, useEffect, useRef } from "react";
import JourneyTimeline from "./components/JourneyTimeline";
import MemoryGallery from "./components/MemoryGallery";
import ProposalBox from "./components/ProposalBox";
import RelationshipQuiz from "./components/RelationshipQuiz";
import DreamDashboard from "./components/DreamDashboard";
import LoginPage from "./components/LoginPage";
import "./App.css";

/* ── Background Music Player using YouTube IFrame API ── */
const YT_VIDEO_ID = "xP4mMpPAVME";

function MusicPlayer() {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted,   setMuted]   = useState(false);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API script once
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: YT_VIDEO_ID,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(60);
            e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e) => {
            // keep looping
            if (e.data === window.YT.PlayerState.ENDED) {
              e.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    if (!ready) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setPlaying(p => !p);
  };

  const toggleMute = () => {
    if (!ready) return;
    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(60);
    } else {
      playerRef.current.mute();
    }
    setMuted(m => !m);
  };

  return (
    <>
      {/* Hidden YouTube player iframe */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
        <div ref={containerRef} />
      </div>

      {/* Floating music controls */}
      <div className="music-player">
        <div className="music-icon">🎵</div>
        <div className="music-info">
          <span className="music-title">Our Song</span>
          <span className="music-dots">
            {[0,1,2,3].map(i => (
              <span key={i} className={`music-bar ${playing && !muted ? "playing" : ""}`} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        </div>
        <button className="music-btn" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="music-btn" onClick={togglePlay} title={playing ? "Pause" : "Play"}>
          {playing ? "⏸" : "▶️"}
        </button>
      </div>
    </>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("box");
  const [boxOpened, setBoxOpened] = useState(false);

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (page) {
      case "box":
        return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
      case "journey":
        return <JourneyTimeline setPage={setPage} />;
      case "gallery":
        return <MemoryGallery setPage={setPage} />;
      case "quiz":
        return <RelationshipQuiz setPage={setPage} />;
      case "dream":
        return <DreamDashboard />;
      default:
        return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
    }
  };
  return (
    <div className="app">
      <MusicPlayer />
      <nav className="nav">
        <button onClick={() => setPage("box")}>Proposal Box</button>
        <button onClick={() => setPage("journey")}>Our Journey</button>
        <button onClick={() => setPage("gallery")}>Memory Lane</button>
        <button onClick={() => setPage("quiz")}>Love Quiz</button>
        <button onClick={() => setPage("dream")}>Dreams 💫</button>
      </nav>
      <main>{renderPage()}</main>
      <div className="hearts">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            style={{
              left: `${10 + i * 11}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + i}s`,
            }}
          >
            {" "}
            ❤️{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
