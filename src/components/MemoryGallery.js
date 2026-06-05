import { useEffect, useRef, useState, useCallback } from "react";

export default function MemoryGallery({ setPage }) {
  const media = [
    { type: "image", src: "/images/photo1.jpg.jpg",   msg: "The day we first met 💫" },
    { type: "image", src: "/images/photo2.jpg.jpeg",  msg: "I proposed to you at midnight 💍" },
    { type: "image", src: "/images/photo3.jpg.jpeg",  msg: "She proposed to me 💖" },
    { type: "image", src: "/images/photo4.jpg.jpeg",  msg: "We both said yes 💕" },
    { type: "image", src: "/images/photo5.jpg.jpeg",  msg: "Our journey begins 🌸" },
    { type: "image", src: "/images/photo11.jpg.jpg",  msg: "Every smile is a memory 😊" },
    { type: "image", src: "/images/photo12.jpg.png",  msg: "You make every day beautiful 🌷" },
    { type: "image", src: "/images/photo13.jpg.jpg",  msg: "My favourite person 💓" },
    { type: "image", src: "/images/photo14.jpg.jpg",  msg: "Together is my favourite place 🏡" },
    { type: "image", src: "/images/photo16.jpg.jpg",  msg: "You are my everything ✨" },
    { type: "image", src: "/images/photo17.jpg.jpg",  msg: "Forever and always 💒" },
    { type: "image", src: "/images/1000111741.jpg",   msg: "Sadhana, my love 🌹" },
    { type: "video", src: "/images/photo15.jpg.mp4",  msg: "A moment to remember 🎬" },
    { type: "video", src: "/images/photo81.jpg.mp4",  msg: "Our story in motion 🎥" },
  ];

  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);

  const handleScroll = useCallback(() => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;
    if (atBottom && countdown === null) {
      setCountdown(8);
    }
  }, [countdown]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setPage("quiz");
      return;
    }
    countdownRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(countdownRef.current);
  }, [countdown, setPage]);

  return (
    <div className="gallery-page">
      <h1>Digital Memory Lane</h1>
      <p className="gallery-subtitle">Hover over photos for hidden messages 💌</p>
      <div className="gallery-grid">
        {media.map((item, i) =>
          item.type === "video" ? (
            <div key={i} className="photo-card video-card">
              <video src={item.src} controls playsInline className="gallery-video" />
              <div className="overlay">{item.msg}</div>
            </div>
          ) : (
            <div key={i} className="photo-card">
              <img src={item.src} alt={`memory-${i + 1}`} />
              <div className="overlay">{item.msg}</div>
            </div>
          )
        )}
      </div>

      {countdown !== null && (
        <div className="auto-nav-banner">
          <span>💖 Moving to Love Quiz in </span>
          <strong>{countdown}s</strong>
          <button onClick={() => { clearTimeout(countdownRef.current); setPage("quiz"); }}>
            Go Now
          </button>
          <button onClick={() => { clearTimeout(countdownRef.current); setCountdown(null); }}>
            Stay
          </button>
        </div>
      )}
    </div>
  );
}
