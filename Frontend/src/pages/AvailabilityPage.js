import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAvailability } from "../api/planner";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function AvailabilityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hours, setHours]   = useState(Object.fromEntries(DAYS.map((d,i) => [d, i<5?4:2])));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");
  const total = Object.values(hours).reduce((s,v) => s+v, 0);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await saveAvailability(user.username, DAYS.map((d,i) => ({ day_label:`Day${i+1}`, available_hours:hours[d] })));
      setSaved(true); setTimeout(() => navigate("/tasks"), 800);
    } catch { setError("Failed to save availability."); }
    finally { setSaving(false); }
  };

  return (
    <div className="main-content">
      <div className="page-header fade-up" style={{ opacity:0 }}>
        <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", color:"var(--caramel)", marginBottom:"8px" }}>Step 02 of 04</p>
        <h1>Study <em>Availability</em></h1>
        <p>Set how many hours you can dedicate to studying each day this week.</p>
      </div>
      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
      {saved && <div className="alert alert-success"><i className="fa-solid fa-circle-check" /> Saved! Redirecting...</div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:"20px", alignItems:"start" }}>
        <div className="card fade-up delay-1" style={{ opacity:0 }}>
          <h2 className="section-title" style={{ marginBottom:"4px" }}>Weekly Hours</h2>
          <p className="section-subtitle">Enter available study hours per day (0-12)</p>
          {DAYS.map((day, i) => (
            <div key={day} style={{ display:"flex", alignItems:"center", gap:"16px", padding:"14px 0", borderBottom:i<DAYS.length-1?"1px solid var(--cream-dark)":"none" }}>
              <div style={{ width:"100px", flexShrink:0 }}>
                <p style={{ fontSize:"13px", fontWeight:700, color:"var(--espresso)" }}>{day}</p>
              </div>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ flex:1, height:"5px", background:"var(--cream-dark)", borderRadius:"3px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(hours[day]/12)*100}%`, background:"var(--caramel)", borderRadius:"3px", transition:"width 100ms" }} />
                </div>
                <input type="number" min="0" max="12" value={hours[day]}
                  onChange={e => setHours(p => ({ ...p, [day]:Math.min(12,Math.max(0,Number(e.target.value))) }))}
                  style={{ width:"55px", textAlign:"center", padding:"7px", border:"1px solid var(--border)", borderRadius:"8px", fontSize:"14px", fontWeight:700, color:"var(--espresso)", fontFamily:"var(--font-body)", outline:"none" }} />
                <span style={{ fontSize:"12px", color:"var(--coffee)", width:"20px" }}>hr</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div className="card fade-up delay-2" style={{ opacity:0, textAlign:"center" }}>
            <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:"var(--coffee)", marginBottom:"8px" }}>Total Weekly Hours</p>
            <p style={{ fontFamily:"var(--font-display)", fontSize:"48px", fontWeight:700, color:"var(--espresso)", lineHeight:1 }}>{total}</p>
            <p style={{ fontSize:"13px", color:"var(--coffee)", marginTop:"4px" }}>hours planned</p>
          </div>
          <div className="card fade-up delay-3" style={{ opacity:0 }}>
            <p style={{ fontSize:"12px", color:"var(--coffee)", lineHeight:1.7 }}><strong style={{ color:"var(--espresso)" }}>Tip:</strong> Aim for 4-6 hours on weekdays and 2-3 on weekends for balanced study sessions.</p>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:"12px", marginTop:"20px" }}>
        <button className="btn btn-outline" onClick={() => navigate("/coverage")}><i className="fa-solid fa-arrow-left" /> Back</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : <><i className="fa-solid fa-arrow-right" /> Save & Continue</>}</button>
      </div>
    </div>
  );
}
