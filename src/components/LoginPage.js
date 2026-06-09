import { useState } from "react";

const CORRECT_USER = "DHARYA";
const USERS = {
  "29/02/2008": "sadhana",
  "09/10/2007": "surya",
};

export default function LoginPage({ onLogin }) {  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [shake,    setShake]    = useState(false);
  const [hearts,   setHearts]   = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().toUpperCase() === CORRECT_USER && USERS[password]) {
      spawnHearts();
      setTimeout(() => onLogin(USERS[password]), 900);
    } else {
      setError(
        username.trim().toUpperCase() !== CORRECT_USER
          ? "Hmm, that name doesn't match 💭"
          : "Wrong password, try again 🔐"
      );
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const spawnHearts = () => {
    const arr = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${5 + i * 8}%`,
      delay: `${i * 0.08}s`,
      dur: `${1.2 + Math.random() * 0.8}s`,
    }));
    setHearts(arr);
  };

  return (
    <div className="login-bg">
      {/* Floating background hearts */}
      <div className="login-hearts-bg">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="login-bg-heart"
            style={{
              left: `${i * 10 + 2}%`,
              animationDelay: `${i * 1.1}s`,
              animationDuration: `${7 + i}s`,
              fontSize: `${18 + (i % 3) * 10}px`,
            }}
          >
            {["💖","💗","💓","💕","🌸"][i % 5]}
          </span>
        ))}
      </div>

      {/* Success burst hearts */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="login-burst-heart"
          style={{ left: h.left, animationDelay: h.delay, animationDuration: h.dur }}
        >
          💖
        </span>
      ))}

      <form
        className={`login-card ${shake ? "login-shake" : ""}`}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {/* Top decoration */}
        <div className="login-top-ribbon" />

        <div className="login-avatar">💗</div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">This is a special place, just for you 🌸</p>

        {/* Username */}
        <div className="login-field">
          <label className="login-label">👤 Username</label>
          <input
            className="login-input"
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            autoComplete="off"
          />
        </div>

        {/* Password */}
        <div className="login-field">
          <label className="login-label">🔐 Password</label>
          <div className="login-pass-wrap">
            <input
              className="login-input"
              type={showPass ? "text" : "password"}
              placeholder="Enter your password..."
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              autoComplete="off"
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setShowPass(v => !v)}
              aria-label="Toggle password visibility"
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="login-error">{error}</p>}

        {/* Submit */}
        <button type="submit" className="login-btn">
          Enter with Love 💖
        </button>

        <p className="login-hint">Only someone special knows the way in 💍</p>
      </form>
    </div>
  );
}
