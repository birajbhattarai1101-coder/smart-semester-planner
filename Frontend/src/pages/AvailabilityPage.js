import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAvailability } from "../api/planner";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function AvailabilityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const [hours, setHours] = useState(Array(7).fill(4));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    try {
      const availability = hours.map((h, i) => ({ day_label: "Day" + (i + 1), available_hours: h }));
      await saveAvailability(user.username, availability);
      setSuccess(true);
      setTimeout(() => navigate("/tasks"), 1200);
    } catch { setError("Failed to save."); }
    finally { setLoading(false); }
  };

  const totalHours = hours.reduce((a, b) => a + b, 0);

  return (
    <div className="main-content">
      <div className="page-header animate-fadeUp">
        <div className="page-header-eyebrow">Step 02 of 04</div>
        <h1>Weekly <em>Availability</em></h1>
        <p>How many hours can you study each day? Set 0 for days you are unavailable.</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Availability saved! Redirecting...</div>}
      <div className="card animate-fadeIn delay-1" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--cream-dark)" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--brown)" }}>Total study hours this week</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 300, color: "var(--brown-deep)" }}>{totalHours} <span style={{ fontSize: "0.9rem", color: "var(--beige-dark)" }}>hrs</span></span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {DAYS.map((day, i) => (
          <div key={day} className={"card animate-fadeUp delay-" + Math.min(i + 2, 5)} style={{ padding: "1rem 1.5rem", background: i === todayIdx ? "var(--cream-dark)" : "var(--white-warm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ minWidth: "120px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 500, color: "var(--brown-deep)" }}>
                  {day}
                  {i === todayIdx && <span style={{ marginLeft: "0.5rem", fontSize: "0.65rem", background: "var(--gold)", color: "var(--ink)", padding: "0.1rem 0.4rem", borderRadius: "1px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>Today</span>}
                </div>
              </div>
              <input type="range" className="range-input" min="0" max="12" step="0.5" value={hours[i]} onChange={e => { const n = [...hours]; n[i] = Number(e.target.value); setHours(n); }} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 300, color: hours[i] === 0 ? "var(--beige-mid)" : "var(--brown)", minWidth: "60px", textAlign: "right" }}>
                {hours[i] === 0 ? "Off" : hours[i] + "h"}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/coverage")}>← Back</button>
        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={loading || success}>{loading ? "Saving..." : "Save & Continue →"}</button>
      </div>
    </div>
  );
}
