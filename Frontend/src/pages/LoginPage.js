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
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "register") await registerUser(username, password, email || undefined);
      await loginUser(username, password);
      login(username); navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"rgb(245,240,232)", fontFamily:"var(--font-body)", padding:"20px" }}>
      <div style={{ display:"flex", width:"850px", maxWidth:"100%", borderRadius:"20px", overflow:"hidden", boxShadow:"0 0 50px rgba(58,34,22,0.2)" }}>
        <div style={{ width:"50%", background:"var(--espresso)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"50px 40px", position:"relative" }}>
          <div style={{ textAlign:"center", color:"white" }}>
            <div style={{ width:"80px", height:"80px", background:"var(--caramel)", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:"36px" }}>📚</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"28px", fontWeight:700, marginBottom:"12px", lineHeight:1.2 }}>Smart Semester<br /><em style={{ color:"var(--caramel)" }}>Planner</em></h2>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", lineHeight:1.7 }}>AI-powered study scheduling<br />guided by historical insights</p>
          </div>
          <div style={{ position:"absolute", bottom:"30px", display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center" }}>
            {["AI","Experta","Flask","React"].map(tag => (
              <span key={tag} style={{ background:"rgba(192,133,82,0.2)", color:"var(--caramel)", padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:700 }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ width:"50%", background:"white", display:"flex", alignItems:"center", justifyContent:"center", padding:"50px 45px" }}>
          <div style={{ width:"100%", maxWidth:"320px" }}>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"28px", color:"var(--espresso)", marginBottom:"6px" }}>{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
            <p style={{ color:"var(--coffee)", fontSize:"14px", marginBottom:"30px", opacity:0.8 }}>{mode === "login" ? "Sign in to your planner" : "Start your study journey"}</p>
            <div style={{ display:"flex", background:"var(--cream-dark)", borderRadius:"10px", padding:"4px", marginBottom:"24px" }}>
              {["login","register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex:1, padding:"8px", border:"none", cursor:"pointer", borderRadius:"8px", fontSize:"13px", fontWeight:700, fontFamily:"var(--font-body)", background:mode===m?"white":"transparent", color:mode===m?"var(--espresso)":"var(--coffee)", boxShadow:mode===m?"0 2px 8px rgba(58,34,22,0.1)":"none", transition:"all 200ms" }}>
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
            {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-box"><i className="fa-solid fa-user" /><input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required autoFocus /></div>
              <div className="input-box"><i className="fa-solid fa-lock" /><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
              {mode === "register" && (
                <div className="input-box"><i className="fa-solid fa-envelope" /><input type="email" placeholder="Email (for notifications)" value={email} onChange={e => setEmail(e.target.value)} /></div>
              )}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ borderRadius:"10px", marginTop:"8px" }}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
            <p style={{ textAlign:"center", marginTop:"20px", fontSize:"13px", color:"var(--coffee)" }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setMode(mode==="login"?"register":"login"); setError(""); }} style={{ background:"none", border:"none", color:"var(--caramel)", fontWeight:700, cursor:"pointer", fontSize:"13px" }}>
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
