import { useState, useEffect } from "react";

export default function WelcomeSplash({ user, onDone }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // slight delay so transition plays nicely
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleTap = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => onDone(), 700);
  };

  const isSurya = user === "surya";
  const name    = isSurya ? "Surya" : "Sadhana";
  const emoji   = isSurya ? "🌿" : "🌸";
  const accent  = isSurya ? "#00d97e" : "#ff1a6e";
  const glow    = isSurya ? "rgba(0,217,126,0.35)" : "rgba(255,26,110,0.35)";

  return (
    <div
      onClick={handleTap}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        cursor: "pointer",
        userSelect: "none",
        background: "#000",
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: leaving
          ? "opacity 0.7s ease"
          : "opacity 0.8s ease",
      }}
    >
      {/* Full-bleed photo */}
      <img
        src="/images/photo1.jpg.jpg"
        alt="Welcome"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          transform: leaving ? "scale(1.06)" : visible ? "scale(1)" : "scale(1.08)",
          transition: leaving
            ? "transform 0.7s ease"
            : "transform 1s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      />

      {/* Dark gradient overlay — stronger at top & bottom */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          linear-gradient(to bottom,
            rgba(0,0,0,0.55) 0%,
            rgba(0,0,0,0.0)  35%,
            rgba(0,0,0,0.0)  55%,
            rgba(0,0,0,0.75) 100%
          )
        `,
      }} />

      {/* Coloured glow overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 80%, ${glow} 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />

      {/* Top greeting */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "48px 32px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? "translateY(0)" : "translateY(-20px)",
        transition: "opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s",
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "3px",
          margin: 0,
        }}>
          ✦ Welcome back ✦
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(2rem, 8vw, 3.2rem)",
          fontWeight: 600,
          fontStyle: "italic",
          color: "#fff",
          margin: 0,
          textShadow: `0 0 60px ${glow}, 0 2px 20px rgba(0,0,0,0.6)`,
          lineHeight: 1.1,
          textAlign: "center",
        }}>
          Hello, {name} {emoji}
        </h1>
      </div>

      {/* Bottom tap hint */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "0 32px 52px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.9s ease 0.6s, transform 0.9s ease 0.6s",
      }}>
        {/* Decorative accent line */}
        <div style={{
          width: 48,
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          marginBottom: 2,
        }} />

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.35rem",
          fontStyle: "italic",
          color: "rgba(255,255,255,0.85)",
          margin: 0,
          textAlign: "center",
          textShadow: "0 2px 12px rgba(0,0,0,0.7)",
        }}>
          Your special world awaits
        </p>

        {/* Tap to continue pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 24px",
          background: "rgba(255,255,255,0.12)",
          border: `1.5px solid ${accent}55`,
          borderRadius: 50,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: `0 4px 24px ${glow}`,
          animation: "splashPulse 2s ease-in-out infinite",
        }}>
          <span style={{ fontSize: "1rem" }}>{emoji}</span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "0.5px",
          }}>
            Tap anywhere to continue
          </span>
          <span style={{ fontSize: "1rem" }}>{emoji}</span>
        </div>

        {/* Animated dots */}
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: accent,
              opacity: 0.5,
              animation: `dotPulse 1.4s ease-in-out ${i * 0.18}s infinite alternate`,
            }} />
          ))}
        </div>
      </div>

      {/* Floating hearts/leaves */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[...Array(6)].map((_, i) => (
          <span key={i} style={{
            position: "absolute",
            bottom: "-40px",
            left: `${10 + i * 16}%`,
            fontSize: `${14 + (i % 3) * 6}px`,
            opacity: 0.5,
            animation: `floatUp ${9 + i * 1.5}s linear ${i * 1.2}s infinite`,
            filter: `drop-shadow(0 0 6px ${accent})`,
          }}>
            {isSurya ? "🍃" : "✨"}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 24px ${glow}; }
          50%       { transform: scale(1.04); box-shadow: 0 6px 36px ${glow}; }
        }
      `}</style>
    </div>
  );
}
