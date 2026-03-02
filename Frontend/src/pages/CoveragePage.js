import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveCoverage } from "../api/planner";
import { useAuth } from "../context/AuthContext";

const SUBJECTS = ["OS", "AI", "OOAD", "Economics", "DBMS", "Embedded"];
const LABELS = { OS: "Operating Systems", AI: "Artificial Intelligence", OOAD: "OO Analysis & Design", Economics: "Economics", DBMS: "Database Management", Embedded: "Embedded Systems" };

export default function CoveragePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coverage, setCoverage] = useState(Object.fromEntries(SUBJECTS.map(s => [s, 50])));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const getColor = (val) => val >= 70 ? "#7A9E6E" : val >= 40 ? "var(--gold)" : "#C97B6E";

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveCoverage(user.username, coverage);
      setSuccess(true);
      setTimeout(() => navigate("/availability"), 1200);
    } catch { setError("Failed to save."); }
    finally { setLoading(false); }
  };

  return (
    <div className="main-content">
      <div className="page-header animate-fadeUp">
        <div className="page-header-eyebrow">Step 01 of 04</div>
        <h1>Subject <em>Coverage</em></h1>
        <p>Drag the sliders to reflect how much of each subject you have studied so far.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Coverage saved! Redirecting...</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {SUBJECTS.map((subject, i) => (
          <div key={subject} className={"card animate-fadeUp delay-" + (i + 1)} style={{ padding: "1.4rem 1.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 500, color: "var(--brown-deep)" }}>{LABELS[subject]}</div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--beige-mid)", marginTop: "0.15rem" }}>{subject}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 300, color: getColor(coverage[subject]), transition: "color 0.3s ease" }}>{coverage[subject]}%</div>
            </div>
            <div style={{ height: "3px", background: "var(--beige)", borderRadius: "2px", marginBottom: "0.8rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: coverage[subject] + "%", background: getColor(coverage[subject]), borderRadius: "2px", transition: "width 0.2s ease" }} />
            </div>
            <div className="range-group">
              <span style={{ fontSize: "0.72rem", color: "var(--beige-mid)" }}>0%</span>
              <input type="range" className="range-input" min="0" max="100" step="1" value={coverage[subject]} onChange={e => setCoverage(prev => ({ ...prev, [subject]: Number(e.target.value) }))} />
              <span style={{ fontSize: "0.72rem", color: "var(--beige-mid)" }}>100%</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>← Back</button>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading || success}>{loading ? "Saving..." : "Save & Continue →"}</button>
      </div>
    </div>
  );
}
