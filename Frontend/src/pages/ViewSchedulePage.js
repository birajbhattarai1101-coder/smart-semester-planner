import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateSchedule, notifyDeadline, notifyDaily, notifyWeekly, getPreviousSchedule, saveSchedule } from "../api/planner";

export default function ViewSchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [schedule, setSchedule]         = useState([]);
  const [priorities, setPriorities]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [notifStatus, setNotifStatus]   = useState("");
  const [notifLoading, setNotifLoading] = useState("");
  const [prevSchedule, setPrevSchedule] = useState(null);
  const [prevLoading, setPrevLoading]   = useState(false);
  const [showPrev, setShowPrev]         = useState(false);
  const [isFirstWeek, setIsFirstWeek]   = useState(false);

  useEffect(() => { loadSchedule(); }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const stateData = location.state?.scheduleData;
      const selectedSubjects = location.state?.selectedSubjects
        || JSON.parse(localStorage.getItem("sf_selected_" + user.username) || "null");

      if (stateData) {
        setSchedule(stateData.schedule || []);
        setPriorities(stateData.subject_priorities || []);
      } else {
        const res = await generateSchedule(user.username, 0, selectedSubjects);
        const data = res.data.data;
        setSchedule(data.schedule || []);
        setPriorities(data.subject_priorities || []);
        await saveSchedule(user.username, data);
      }
    } catch {}

    try {
      const prev = await getPreviousSchedule(user.username);
      const prevData = prev?.data?.data?.schedule;
      if (prevData && Array.isArray(prevData) && prevData.length > 0) {
        setPrevSchedule(prevData);
        setIsFirstWeek(false);
      } else {
        setPrevSchedule(null);
        setIsFirstWeek(true);
      }
    } catch {
      setPrevSchedule(null);
      setIsFirstWeek(true);
    }

    setLoading(false);
  };

  const handleTogglePrev = async () => {
    if (!showPrev && prevSchedule === null && !isFirstWeek) {
      setPrevLoading(true);
      try {
        const prev = await getPreviousSchedule(user.username);
        const prevData = prev?.data?.data?.schedule;
        if (prevData && Array.isArray(prevData) && prevData.length > 0) {
          setPrevSchedule(prevData);
          setIsFirstWeek(false);
        } else {
          setIsFirstWeek(true);
        }
      } catch { setIsFirstWeek(true); }
      setPrevLoading(false);
    }
    setShowPrev(v => !v);
  };

  const sendNotif = async (type) => {
    setNotifLoading(type); setNotifStatus("");
    try {
      const fn = type === "deadline" ? notifyDeadline : type === "daily" ? notifyDaily : notifyWeekly;
      const res = await fn(user.username);
      const d = res.data.data;
      setNotifStatus(d.sent ? "success" : "fail:" + (d.reason || d.error || "Failed"));
    } catch (err) {
      setNotifStatus("fail:" + (err.response?.data?.message || "Failed to send"));
    }
    finally { setNotifLoading(""); }
  };

  const fmtH = h => {
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    if (hrs === 0) return mins + " mins";
    if (mins === 0) return hrs + "h";
    return hrs + "h " + mins + " mins";
  };

  const prColor = l =>
    l === "HIGH" || l === "CRITICAL" ? "#DC2626" : l === "MEDIUM" ? "#B45309" : "#15803D";

  const grouped = schedule.reduce((acc, row) => {
    (acc[row.day] = acc[row.day] || []).push(row); return acc;
  }, {});

  const totalH  = schedule.reduce((s, r) => s + r.allocated_hours, 0).toFixed(1);
  const assignH = schedule.filter(r => r.task_type === "Assignment").reduce((s, r) => s + r.allocated_hours, 0).toFixed(1);
  const labH    = schedule.filter(r => r.task_type === "Lab").reduce((s, r) => s + r.allocated_hours, 0).toFixed(1);
  const studyH  = schedule.filter(r => r.task_type === "Study").reduce((s, r) => s + r.allocated_hours, 0).toFixed(1);

  const renderScheduleTable = (rows, headerBg = "#2C1810") => {
    const dayGrouped = rows.reduce((acc, row) => {
      (acc[row.day] = acc[row.day] || []).push(row); return acc;
    }, {});

    return Object.entries(dayGrouped).map(([day, dayRows]) => {
      const dayTotal = dayRows.reduce((s, r) => s + r.allocated_hours, 0);
      return (
        <div key={day} style={{ background: "white", borderRadius: "16px", border: "1px solid #EEE9E0", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", background: headerBg }}>
            <h4 style={{ color: "white", fontSize: "14px", fontWeight: 700, margin: 0 }}>{day}</h4>
            <span style={{ color: "#B8862E", fontSize: "13px", fontWeight: 700 }}>{fmtH(dayTotal)} total</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F5F0" }}>
                {["Task", "Type", "Subject", "Hours", "Deadline", "Priority"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#6B5A4E", borderBottom: "1px solid #EEE9E0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dayRows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #F5F0EA" }}>
                  <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 600, color: "#2C1810" }}>{row.task_name}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700,
                      background: row.task_type === "Assignment" ? "#ECFDF5" : row.task_type === "Lab" ? "#EEF2FF" : "#FBF5EC",
                      color: row.task_type === "Assignment" ? "#059669" : row.task_type === "Lab" ? "#4F46E5" : "#B8862E"
                    }}>
                      {row.task_type}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "13px", color: "#6B5A4E" }}>{row.subject}</td>
                  <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 700, color: "#B8862E" }}>{fmtH(row.allocated_hours)}</td>
                  <td style={{ padding: "11px 16px", fontSize: "13px", color: "#6B5A4E" }}>{row.deadline || "-"}</td>
                  <td style={{ padding: "11px 16px", fontSize: "12px", fontWeight: 700, color: prColor(row.urgency_label) }}>{row.urgency_label || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    });
  };

  return (
    <div style={{ marginLeft: "260px", minHeight: "100vh", background: "#FAF8F4", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ padding: "40px 48px" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2C1810", margin: "0 0 4px" }}>
              {showPrev ? "Previous Week's Schedule" : "Your Study Schedule"}
            </h1>
            <p style={{ fontSize: "13px", color: "#8C7B70", margin: 0 }}>
              {showPrev ? "Showing your last week's AI-generated plan." : "AI-generated 7-day plan based on your data."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleTogglePrev}
              disabled={prevLoading}
              style={{
                background: showPrev ? "#B8862E" : "#F5F0EA",
                color: showPrev ? "white" : "#2C1810",
                border: "none", padding: "11px 20px", borderRadius: "50px",
                fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                opacity: prevLoading ? 0.7 : 1
              }}>
              {prevLoading ? "Loading..." : showPrev ? "← Current Week" : "Previous Week"}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ background: "#2C1810", color: "white", border: "none", padding: "11px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Back to Dashboard
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: "40px", height: "40px", border: "4px solid #EEE9E0", borderTop: "4px solid #B8862E", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#8C7B70", fontSize: "14px" }}>Loading your schedule...</p>
          </div>
        )}

        {!loading && !showPrev && (
          <>
            {schedule.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "20px" }}>
                  {[
                    { label: "Total Hours", value: fmtH(parseFloat(totalH)) },
                    { label: "Assignments", value: fmtH(parseFloat(assignH)) },
                    { label: "Labs", value: fmtH(parseFloat(labH)) },
                    { label: "Study", value: fmtH(parseFloat(studyH)) }
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #EEE9E0", textAlign: "center" }}>
                      <p style={{ fontSize: "30px", fontWeight: 800, color: "#2C1810", margin: "0 0 4px" }}>{stat.value}</p>
                      <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#8C7B70", margin: 0 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {priorities.length > 0 && (
                  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #EEE9E0", padding: "24px 28px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2C1810", marginBottom: "16px" }}>Subject Priority Analysis</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                      {priorities.map(p => (
                        <div key={p.subject} style={{ background: "#FAF8F4", borderRadius: "10px", padding: "14px 16px", border: "1px solid #EEE9E0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#2C1810" }}>{p.subject}</span>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: prColor(p.priority_label) }}>{p.priority_label}</span>
                          </div>
                          <div style={{ height: "3px", background: "#EEE9E0", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: Math.min(p.priority_score || 0, 100) + "%", background: prColor(p.priority_label), borderRadius: "2px" }} />
                          </div>
                          <p style={{ fontSize: "11px", color: "#8C7B70", margin: "6px 0 0" }}>{p.coverage_percentage}% covered</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: "#2C1810", borderRadius: "16px", padding: "20px 28px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ color: "white", fontSize: "15px", fontWeight: 700, margin: "0 0 4px" }}>Email Notifications</h3>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0 }}>Send your schedule to your registered email</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {[{ type: "deadline", label: "Deadline Alert" }, { type: "daily", label: "Today's Plan" }, { type: "weekly", label: "Weekly Summary" }].map(btn => (
                        <button key={btn.type} onClick={() => sendNotif(btn.type)} disabled={!!notifLoading}
                          style={{ background: "rgba(184,134,46,0.2)", color: "#D4A853", border: "1px solid rgba(184,134,46,0.4)", padding: "9px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: notifLoading ? 0.7 : 1 }}>
                          {notifLoading === btn.type ? "Sending..." : btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {notifStatus === "success" && <p style={{ color: "#86EFAC", fontSize: "12px", margin: "10px 0 0", fontWeight: 600 }}>✓ Email sent successfully!</p>}
                  {notifStatus.startsWith("fail") && <p style={{ color: "#FCA5A5", fontSize: "12px", margin: "10px 0 0", fontWeight: 600 }}>{notifStatus.replace("fail:", "")}</p>}
                </div>

                {renderScheduleTable(schedule, "#2C1810")}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ fontSize: "16px", color: "#8C7B70", marginBottom: "20px" }}>No schedule found. Go back and generate one!</p>
                <button onClick={() => navigate("/dashboard")}
                  style={{ background: "#2C1810", color: "white", border: "none", padding: "13px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Go to Dashboard
                </button>
              </div>
            )}
          </>
        )}

        {!loading && showPrev && (
          <>
            {isFirstWeek || !prevSchedule ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: "52px", marginBottom: "20px" }}>📅</div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "10px" }}>You're Just Getting Started!</h3>
                <p style={{ fontSize: "14px", color: "#8C7B70", maxWidth: "400px", margin: "0 auto", lineHeight: 1.7 }}>
                  This is your first week using the planner — no previous week exists yet. Complete this week's schedule and it will appear here next week.
                </p>
                <button onClick={() => setShowPrev(false)}
                  style={{ marginTop: "28px", background: "#2C1810", color: "white", border: "none", padding: "13px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Back to Current Week
                </button>
              </div>
            ) : (
              <>
                <div style={{ background: "#4A3728", borderRadius: "12px", padding: "14px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>📋</span>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0 }}>
                    Showing your <strong style={{ color: "white" }}>previous week's</strong> schedule for reference. Click "← Current Week" to return.
                  </p>
                </div>
                {renderScheduleTable(prevSchedule, "#4A3728")}
              </>
            )}
          </>
        )}

      </div>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
