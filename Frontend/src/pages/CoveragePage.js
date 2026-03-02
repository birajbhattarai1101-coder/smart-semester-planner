import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveCoverage } from "../api/planner";
import { useAuth } from "../context/AuthContext";

const SUBJECTS = ["OS","AI","OOAD","Economics","DBMS","Embedded"];

export default function CoveragePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coverage, setCoverage] = useState(Object.fromEntries(SUBJECTS.map(s => [s, 50])));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try { await saveCoverage(user.username, coverage); setSaved(true); setTimeout(() => navigate("/availability"), 800); }
    catch { setError("Failed to save coverage."); }
    finally { setSaving(false); }
  };

  const getColor = v => v >= 70 ? "rgb(34,139,34)" : v >= 40 ? "var(--caramel)" : "var(--error-red)";
  const getLabel = v => v >= 70 ? "Strong" : v >= 40 ? "Moderate" : "Weak";

  return (
    <div className="main-content">
      <div className="page-header fade-up" style={{ opacity:0 }}>
        <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", color:"var(--caramel)", marginBottom:"8px" }}>Step 01 of 04</p>
        <h1>Subject <em>Coverage</em></h1>
        <p>Set how much of each subject you have covered. The AI uses this to prioritize weaker areas.</p>
      </div>
      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
      {saved && <div className="alert alert-success"><i className="fa-solid fa-circle-check" /> Saved! Redirecting...</div>}
      <div className="card fade-up delay-2" style={{ opacity:0, marginBottom:"20px" }}>
        <h2 className="section-title">6th Semester Subjects</h2>
        <p className="section-subtitle">Drag the slider to set your coverage percentage for each subject.</p>
        {SUBJECTS.map((subject, i) => (
          <div key={subject} style={{ display:"flex", alignItems:"center", gap:"20px", padding:"18px 0", borderBottom: i < SUBJECTS.length-1 ? "1px solid var(--cream-dark)" : "none" }}>
            <div style={{ width:"140px", flexShrink:0 }}>
              <p style={{ fontSize:"14px", fontWeight:600, color:"var(--espresso)", marginBottom:"2px" }}>{subject}</p>
              <p style={{ fontSize:"11px", color:getColor(coverage[subject]), fontWeight:700 }}>{getLabel(coverage[subject])}</p>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ position:"relative", height:"6px", background:"var(--cream-dark)", borderRadius:"3px", overflow:"hidden", marginBottom:"8px" }}>
                <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${coverage[subject]}%`, background:getColor(coverage[subject]), borderRadius:"3px", transition:"width 100ms" }} />
              </div>
              <input type="number" min="0" max="100" value={coverage[subject]} onChange={e => setCoverage(p => ({ ...p, [subject]: Math.min(100, Math.max(0, Number(e.target.value))) }))} style={{ width:"70px", textAlign:"center", padding:"8px", border:"1px solid var(--border)", borderRadius:"8px", fontSize:"15px", fontWeight:700, color:"var(--espresso)", fontFamily:"var(--font-body)", outline:"none" }} />
            </div>
            <div style={{ width:"52px", textAlign:"center", background:"var(--cream-dark)", borderRadius:"8px", padding:"6px 8px", fontWeight:800, fontSize:"15px", color:"var(--espresso)", flexShrink:0 }}>{coverage[subject]}%</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:"12px" }}>
        <button className="btn btn-outline" onClick={() => navigate("/dashboard")}><i className="fa-solid fa-arrow-left" /> Back</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : <><i className="fa-solid fa-arrow-right" /> Save & Continue</>}</button>
      </div>
    </div>
  );
}

