import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../api/planner";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ initialMode = "login" }) {
  const [mode, setMode]         = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(username, password, email || undefined);
        await loginUser(username, password);
      } else {
        await loginUser(username, password);
      }
      login(username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#EDEBE7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px" }}>
      <div style={{ display: "flex", width: "800px", maxWidth: "100%", borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(44,24,16,0.18)", background: "white" }}>
        <div style={{ width: "52%", padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#2C1810", marginBottom: "6px" }}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p style={{ fontSize: "13px", color: "#9A8880", marginBottom: "36px" }}>
            {mode === "login" ? "Sign in to your account" : "Join the Smart Semester community"}
          </p>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", marginBottom: "20px" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #DDD6CE", paddingBottom: "6px", marginBottom: "24px" }}>
              <i className="fa-solid fa-user" style={{ color: "#B8862E", fontSize: "14px", width: "16px", flexShrink: 0 }} />
              <input type="text" placeholder="User Name" value={username} onChange={e => setUsername(e.target.value)} required autoFocus
                style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#2C1810", background: "transparent", fontFamily: "inherit", padding: "6px 0" }} />
            </div>
            {mode === "register" && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #DDD6CE", paddingBottom: "6px", marginBottom: "24px" }}>
                <i className="fa-solid fa-envelope" style={{ color: "#B8862E", fontSize: "14px", width: "16px", flexShrink: 0 }} />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#2C1810", background: "transparent", fontFamily: "inherit", padding: "6px 0" }} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1.5px solid #DDD6CE", paddingBottom: "6px", marginBottom: "36px" }}>
              <i className="fa-solid fa-lock" style={{ color: "#B8862E", fontSize: "14px", width: "16px", flexShrink: 0 }} />
              <input type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#2C1810", background: "transparent", fontFamily: "inherit", padding: "6px 0" }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#B8862E", padding: "4px", fontSize: "14px" }}>
                <i className={"fa-solid " + (showPass ? "fa-eye-slash" : "fa-eye")} />
              </button>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", background: "#B8862E", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "20px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: "13px", color: "#9A8880" }}>
            {mode === "login" ? "Dont have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#B8862E", fontWeight: 700, cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
        <div style={{ width: "48%", background: "linear-gradient(135deg, #EDE0D0 0%, #D9C4A8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative", overflow: "hidden" }}>
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ width: "220px", height: "220px", background: "rgba(255,255,255,0.3)", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", border: "1px solid rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: "72px", lineHeight: 1 }}>🧑‍💻</div>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#B8862E" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(184,134,46,0.4)" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(184,134,46,0.2)" }} />
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
          <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(44,24,16,0.08)" }} />
        </div>
      </div>
    </div>
  );
}
