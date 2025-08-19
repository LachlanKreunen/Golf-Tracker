import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e?.preventDefault();
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");

      // persist session
      localStorage.setItem("gt_token", data.token);
      localStorage.setItem("gt_user", JSON.stringify(data.user));

      //redirect via React Router
      navigate("/login", { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Welcome to LI Golf</h1>
      <p style={{ color: "#448071", fontSize: "1.5rem" }}>Track your scores and stats!</p>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <div style={{ color: "#b00020", marginTop: 8 }}>{err}</div>}

        <div className="button-container">
          <button type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
          <button type="button" onClick={() => navigate("/signup")}>
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
