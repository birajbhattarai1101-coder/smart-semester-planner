import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateSchedule, notifyDeadline, notifyDaily, notifyWeekly } from "../api/planner";
import { useAuth } from "../context/AuthContext";

export default function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule]       = useState(null);
  const [priorities, setPriorities]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [offset, setOffset]           = useState(0);
  const [notifStatus, setNotifStatus] = useState("");
  const [notifLoading, setNotifLoading] = useState("");

  const handleGenerate = async () => {
    setLoading(true); setError("");
    try {
      const res  = await generateSchedule(user.username, offset);
      const data = res.data.data;
      setSchedule(data.schedule || []);
      setPriorities(data.subject_priorities || []);
    } catch (err) { setError(err.response?.data?.message || "Failed to generate schedule."); }
    finally { setLoading(false); }
  };

  const sendNotification = async (type) => {
    setNotifLoading(type); setNotifStatus("");
    try {
      const fn = type === "deadline" ? notifyDeadline : type === "daily" ? notifyDaily : notifyWeekly;
      const res = await fn(user.username);
      const d   = res.data.data;
      if (d.sent) setNotifStatus("success:" + type);
      else setNotifStatus("fail:" + (d.reason || d.error || "Unknown error"));
    } catch (err) {
      setNotifStatus("fail:" + (err.response?.data?.message || "Failed to send."));
    } finally { setNotifLoading(""); }
  };

  const grouped = schedule ? schedule.reduce((acc, row) => { if (!acc[row.day]) acc[row.day] = []; acc[row.day].push(row); return acc; }, {}) : {};
  const getBadge   = (t) => "badge badge-" + (t === "Assignment" ? "assignment" : t === "Lab" ? "lab" : "study");
  const getPriClass = (l) => l === "HIGH" || l === "CRITICAL" ? "priority-high" : l === "MEDIUM" ? "priority-medium" : "priority-low";
  const total = schedule ? schedule.reduce((s, r) => s + r.allocated_hours, 0).toFixed(1) : 0;

  return (
    <div className="main-content">
      <div className="page-header animate-fadeUp">
        <div className="page-header-eyebrow">Step 04 of 04</div>
        <h1>Your <em>Schedule</em></h1>
        <p>AI-generated 7-day study plan based on your coverage, availability, and task priorities.</p>
      </div>

      {/* Generate controls */}
      <div className="card animate-fadeUp delay-1" style={{ padding: "1.2rem 1.8rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        <div className="form-group" style={{ margin: 0, flex: 1, minWidth: "200px" }}>
          <label className="form-label">Start offset (days from today)</label>
          <div className="range-group">
            <input type="range" className="range-input" min="0" max="6" step="1" value={offset} onChange={e => setOffset(Number(e.target.value))} />
            <div className="range-value">{offset === 0 ? "Today" : "+" + offset + "d"}</div>
          </div>
        </div>
        <button className="btn btn-gold btn-lg" onClick={handleGenerate} disabled={loading} style={{ flexShrink: 0 }}>
          {loading ? "Generating..." : "✨ Generate Schedule"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <div className="loading-text">Consulting the AI engines...</div>
        </div>
      )}

      {schedule && !loading && (
        <>
          {/* Subject priorities */}
          <div className="animate-fadeUp">
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 400, color: "var(--brown-deep)", marginBottom: "1rem" }}>Subject Priority Analysis</div>
            <div className="priority-grid">
              {priorities.map((p, i) => (
                <div key={p.subject} className={"priority-card animate-fadeUp delay-" + (i + 1)}>
                  <div className="priority-card-subject">{p.subject}</div>
                  <div className="priority-card-score">{p.priority_score.toFixed(1)}</div>
                  <div className={"priority-card-label " + getPriClass(p.priority_label)}>{p.priority_label}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--beige-mid)", marginTop: "0.3rem" }}>{p.coverage_percentage}% covered</div>
                </div>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Hours",  value: total + "h" },
              { label: "Assignments",  value: schedule.filter(r => r.task_type === "Assignment").reduce((s,r) => s + r.allocated_hours, 0).toFixed(1) + "h" },
              { label: "Labs",         value: schedule.filter(r => r.task_type === "Lab").reduce((s,r) => s + r.allocated_hours, 0).toFixed(1) + "h" },
              { label: "Study",        value: schedule.filter(r => r.task_type === "Study").reduce((s,r) => s + r.allocated_hours, 0).toFixed(1) + "h" },
            ].map((stat, i) => (
              <div key={stat.label} className={"card animate-fadeUp delay-" + (i + 1)} style={{ padding: "1rem", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 300, color: "var(--brown-deep)" }}>{stat.value}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--beige-mid)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Email Notifications panel */}
          <div className="card animate-fadeUp" style={{ marginBottom: "2rem", background: "var(--cream-dark)", border: "1px solid var(--beige)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 400, color: "var(--brown-deep)", marginBottom: "0.4rem" }}>
              ✉️ &nbsp;Email Notifications
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--beige-dark)", marginBottom: "1.2rem", lineHeight: 1.7 }}>
              Send your schedule, deadline alerts, or daily plan directly to your registered email.
            </p>

            {notifStatus.startsWith("success") && (
              <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
                ✓ Email sent successfully! Check your inbox.
              </div>
            )}
            {notifStatus.startsWith("fail") && (
              <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                ✕ {notifStatus.replace("fail:", "")}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={() => sendNotification("deadline")}
                disabled={notifLoading === "deadline"}
                style={{ flex: 1, minWidth: "160px" }}
              >
                {notifLoading === "deadline" ? "Sending..." : "⚠️ Deadline Alert"}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => sendNotification("daily")}
                disabled={notifLoading === "daily"}
                style={{ flex: 1, minWidth: "160px" }}
              >
                {notifLoading === "daily" ? "Sending..." : "📅 Today's Plan"}
              </button>
              <button
                className="btn btn-gold"
                onClick={() => sendNotification("weekly")}
                disabled={notifLoading === "weekly"}
                style={{ flex: 1, minWidth: "160px" }}
              >
                {notifLoading === "weekly" ? "Sending..." : "📊 Weekly Summary"}
              </button>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--beige-mid)", marginTop: "1rem" }}>
              ✦ Emails are sent to the address registered with your account
            </p>
          </div>

          {/* Day-by-day schedule */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {Object.entries(grouped).map(([day, rows], di) => {
              const dayTotal = rows.reduce((s, r) => s + r.allocated_hours, 0).toFixed(1);
              return (
                <div key={day} className={"animate-fadeUp delay-" + Math.min(di + 1, 5)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 500, color: "var(--brown-deep)" }}>{day}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--beige-mid)" }}>{dayTotal} hrs total</div>
                  </div>
                  <div style={{ height: "2px", background: "var(--beige)", borderRadius: "1px", marginBottom: "0.8rem", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: Math.min((dayTotal / 8) * 100, 100) + "%", background: "linear-gradient(to right, var(--beige-mid), var(--gold))", borderRadius: "1px" }} />
                  </div>
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <table className="schedule-table">
                      <thead><tr><th>Task</th><th>Type</th><th>Subject</th><th style={{ textAlign: "right" }}>Hours</th><th>Deadline</th><th>Priority</th></tr></thead>
                      <tbody>
                        {rows.map((row, ri) => (
                          <tr key={ri}>
                            <td style={{ color: "var(--ink)", fontWeight: 400 }}>{row.task_name}</td>
                            <td><span className={getBadge(row.task_type)}>{row.task_type}</span></td>
                            <td>{row.subject}</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--brown)" }}>{row.allocated_hours}</td>
                            <td style={{ color: "var(--beige-dark)" }}>{row.deadline}</td>
                            <td><span className={getPriClass(row.urgency_label)}>{row.urgency_label}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ornament" style={{ marginTop: "3rem" }}>— ✦ —</div>
        </>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "space-between" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/tasks")}>← Back to Tasks</button>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>Dashboard</button>
      </div>
    </div>
  );
}
