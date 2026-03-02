import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../api/planner";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [mode, setMode]         = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(username, password, email || undefined);
      }
      await loginUser(username, password);
      login(username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%)",
      padding: "2rem"
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1rem" }}>Academic Intelligence</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 300, color: "var(--brown-deep)", lineHeight: 1.1 }}>
            Smart Semester<br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Planner</em>
          </h1>
          <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--beige-dark)", fontWeight: 300, lineHeight: 1.7 }}>
            AI-powered study scheduling guided by<br />historical insights and your availability.
          </p>
        </div>
        <div className="card animate-fadeUp delay-2">
          <div style={{ display: "flex", background: "var(--cream)", borderRadius: "2px", padding: "3px", marginBottom: "2rem", border: "1px solid var(--beige)" }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "0.55rem", background: mode === m ? "var(--white-warm)" : "transparent", border: mode === m ? "1px solid var(--beige)" : "1px solid transparent", borderRadius: "1px", fontFamily: "var(--font-body)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: mode === m ? "var(--brown-deep)" : "var(--beige-mid)", cursor: "pointer" }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">
                  Email Address
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.68rem", color: "var(--beige-mid)", textTransform: "none", letterSpacing: 0, fontWeight: 300 }}>
                    (for deadline alerts and schedule emails)
                  </span>
                </label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div style={{ marginTop: "0.4rem", fontSize: "0.72rem", color: "var(--beige-mid)", lineHeight: 1.6 }}>
                  Optional — you can add it later in settings
                </div>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.75rem", color: "var(--beige-mid)" }}>
          Powered by Experta AI Rule Engine
        </p>
      </div>
    </div>
  );
}
