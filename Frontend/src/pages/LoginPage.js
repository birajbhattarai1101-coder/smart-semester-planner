import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, loginCheck } from "../api/planner";
import { useAuth } from "../context/AuthContext";

const ILLUSTRATION = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80";

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
      const isRegister = mode === "register";
      if (isRegister) await registerUser(username, password, email || undefined);
      await loginUser(username, password);
      if (isRegister) {
        login(username, "new_week");
        navigate("/onboarding");
      } else {
        const checkRes = await loginCheck(username);
        const status = checkRes.data.data.login_status;
        login(username, status);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.code === "ECONNABORTED" ? "Server is waking up, please try again in 10 seconds..." : err.response?.data?.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    flex: 1, border: "none", outline: "none", fontSize: "15px",
    color: "#2C1810", background: "transparent", fontFamily: "inherit", padding: "8px 0"
  };
  const rowStyle = {
    display: "flex", alignItems: "center", gap: "14px",
    borderBottom: "1.5px solid #C9B99A", paddingBottom: "4px", marginBottom: "28px"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#EDEBE7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px" }}>
      <div style={{ display: "flex", width: "860px", maxWidth: "100%", borderRadius: "20px", overflow: "hidden", boxShadow: "0 24px 64px rgba(44,24,16,0.18)", background: "white" }}>

        <div style={{ width: "48%", background: "#E8DDD0", position: "relative", overflow: "hidden", minHeight: "520px" }}>
          <img
            src={ILLUSTRATION}
            alt="student studying"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => {
              e.target.style.display = "none";
              e.target.parentElement.style.background = "linear-gradient(135deg, #E8DDD0 0%, #D4C4B0 100%)";
              const div = document.createElement("div");
              div.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:80px;";
              div.textContent = "?????";
              e.target.parentElement.appendChild(div);
            }}
          />
        </div>

        <div style={{ width: "52%", padding: "56px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#2C1810", marginBottom: "6px", textAlign: "center" }}>
            {mode === "login" ? "Log In" : "Create Account"}
          </h2>
          <p style={{ fontSize: "14px", color: "#9A8880", marginBottom: "40px", textAlign: "center" }}>
            {mode === "login" ? "Welcome back to your planner" : "Join the Smart Semester community"}
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={rowStyle}>
              <i className="fa-solid fa-user" style={{ color: "#B8862E", fontSize: "16px" }} />
              <input type="text" placeholder="User Name" value={username} onChange={e => setUsername(e.target.value)} required autoFocus autoComplete={mode === "login" ? "username" : "off"} style={inputStyle} />
            </div>

            {mode === "register" && (
              <div style={rowStyle}>
                <i className="fa-solid fa-envelope" style={{ color: "#B8862E", fontSize: "16px" }} />
                <input type="text" placeholder="Email Address" autoComplete="off" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>
            )}

            <div style={rowStyle}>
              <i className="fa-solid fa-lock" style={{ color: "#B8862E", fontSize: "16px" }} />
              <input type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={mode === "login" ? "current-password" : "new-password"} style={inputStyle} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#B8862E", padding: "4px", fontSize: "16px" }}>
                {showPass ? <i className="fa-solid fa-eye-slash" /> : <i className="fa-solid fa-eye" />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", background: "#B8862E", color: "white", border: "none", padding: "15px", borderRadius: "8px", fontSize: "16px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: "22px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#6B5A4E" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#B8862E", fontWeight: 700, cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>
              {mode === "login" ? "Register" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}









