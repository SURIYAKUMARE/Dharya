import { useEffect, useRef, useState, useCallback } from "react";

export default function JourneyTimeline({ setPage }) {
  const moments = [
    {
      year: "19/06/2023",
      title: "We Met",
      desc: "At the tution a pleasant day...",
      img: "/images/photo1.jpg.jpg",
    },
    {
      year: "17/05/2026",
      title: "I Proposed to her",
      desc: "At midnight",
      img: "/images/photo2.jpg.jpeg",
    },
    {
      year: "18/05/2026",
      title: "She Proposed to me",
      desc: "At Evening",
      img: "/images/photo3.jpg.jpeg",
    },
    {
      year: "19/05/2026",
      title: "We both Proposed",
      desc: "At Evening",
      img: "/images/photo4.jpg.jpeg",
    },
    {
      year: "20/05/2026",
      title: "We start our journey",
      desc: "From that day, forever together...",
      img: "/images/photo5.jpg.jpeg",
    },
  ];

  const itemRefs = useRef([]);
  const [countdown, setCountdown] = useState(null); // null = not started
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Scroll-to-bottom detection
  const handleScroll = useCallback(() => {
    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 60;

    if (scrolledToBottom && countdown === null) {
      setCountdown(8);
    }
  }, [countdown]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setPage("gallery");
      return;
    }
    countdownRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(countdownRef.current);
  }, [countdown, setPage]);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.3 }
    );
    itemRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="timeline-page">
      <h1>Our Journey</h1>
      <div className="timeline">
        {moments.map((m, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`}
          >
            <div className="dot"></div>
            <div className="content">
              <span className="year">{m.year}</span>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              {m.img && (
                <>
                  <img src={m.img} alt={m.title} />
                  <p className="photo-name">Sadhana 💕</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-navigate countdown banner */}
      {countdown !== null && (
        <div className="auto-nav-banner">
          <span>✨ Moving to Memory Lane in </span>
          <strong>{countdown}s</strong>
          <button onClick={() => { clearTimeout(countdownRef.current); setPage("gallery"); }}>
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
