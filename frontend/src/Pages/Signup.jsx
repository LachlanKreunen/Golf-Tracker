import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Signup = () => {
  const navigate = useNavigate();

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e?.preventDefault();
    setErr(null);

    if (!username || !password) {
      setErr("Username and password are required.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first, last, username, password }),
      });

      const raw = await res.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { /* non-JSON error */ }

      if (!res.ok) {
        const msg =
          data?.error ||
          raw?.slice(0, 200) ||
          `Register failed (${res.status} ${res.statusText})`;
        throw new Error(msg);
      }

      // Expecting { token, user }
      const token = data?.token;
      const user  = data?.user;

      if (!token || !user) {
        throw new Error("Register succeeded but no token/user returned.");
      }

      // Persist auth
      localStorage.setItem("gt_token", token);
      localStorage.setItem("gt_user", JSON.stringify(user));

      // Navigate to /login
      navigate("/login", { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Create Account</h1>

      <form onSubmit={handleSignup} style={{ display: "contents" }}>
        <input
          type="text"
          className="login-input"
          placeholder="First"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
        />
        <input
          type="text"
          className="login-input"
          placeholder="Last"
          value={last}
          onChange={(e) => setLast(e.target.value)}
        />
        <input
          type="text"
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {err && <div style={{ color: "#b00020", marginTop: 8 }}>{err}</div>}

        <div className="button-container">
          <button type="button" onClick={() => navigate("/", { replace: true })}>
            Home
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
