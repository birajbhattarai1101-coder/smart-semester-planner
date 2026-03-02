import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateSchedule, notifyDeadline, notifyDaily, notifyWeekly } from "../api/planner";
import { useAuth } from "../context/AuthContext";

export default function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule]         = useState(null);
  const [priorities, setPriorities]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [notifStatus, setNotifStatus]   = useState("");
  const [notifLoading, setNotifLoading] = useState("");

  const handleGenerate = async () => {
    setLoading(true); setError("");
    try { const res = await generateSchedule(user.username,0); const data=res.data.data; setSchedule(data.schedule||[]); setPriorities(data.subject_priorities||[]); }
    catch (err) { setError(err.response?.data?.message||"Failed to generate schedule."); }
    finally { setLoading(false); }
  };

  const sendNotif = async (type) => {
    setNotifLoading(type); setNotifStatus("");
    try {
      const fn = type==="deadline"?notifyDeadline:type==="daily"?notifyDaily:notifyWeekly;
      const res = await fn(user.username); const d=res.data.data;
      setNotifStatus(d.sent?"success":"fail:"+(d.reason||d.error||"Failed"));
    } catch (err) { setNotifStatus("fail:"+(err.response?.data?.message||"Failed")); }
    finally { setNotifLoading(""); }
  };

  const grouped = schedule ? schedule.reduce((acc,row) => { (acc[row.day]=acc[row.day]||[]).push(row); return acc; }, {}) : {};
  const total = schedule ? schedule.reduce((s,r)=>s+r.allocated_hours,0).toFixed(1) : 0;
  const getPriColor = l => l==="HIGH"||l==="CRITICAL"?"var(--error-red)":l==="MEDIUM"?"rgb(180,120,20)":"rgb(34,139,34)";
  const getBadgeStyle = type => type==="Assignment"?{background:"rgb(235,245,235)",color:"rgb(50,100,50)",border:"1px solid rgb(180,220,180)"}:type==="Lab"?{background:"rgb(235,235,250)",color:"rgb(50,50,130)",border:"1px solid rgb(180,180,220)"}:{background:"rgb(250,243,235)",color:"var(--coffee)",border:"1px solid rgba(192,133,82,0.3)"};

  return (
    <div className="main-content">
      <div className="page-header fade-up" style={{ opacity:0 }}>
        <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", color:"var(--caramel)", marginBottom:"8px" }}>Step 04 of 04</p>
        <h1>Study <em>Schedule</em></h1>
        <p>Generate your AI-powered 7-day study plan based on your coverage, availability, and tasks.</p>
      </div>
      {!schedule && !loading && (
        <div className="card fade-up delay-1" style={{ opacity:0, textAlign:"center", padding:"60px 40px" }}>
          <div style={{ width:"70px", height:"70px", background:"rgb(250,243,235)", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", margin:"0 auto 20px" }}>🤖</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"24px", color:"var(--espresso)", marginBottom:"10px" }}>Ready to Generate</h2>
          <p style={{ color:"var(--coffee)", fontSize:"14px", marginBottom:"28px", opacity:0.8 }}>Our AI will analyze your data and create an optimized schedule.</p>
          <button className="btn btn-primary" onClick={handleGenerate} style={{ fontSize:"15px", padding:"14px 32px" }}>
            <i className="fa-solid fa-bolt" /> Generate Study Schedule
          </button>
        </div>
      )}
      {loading && (
        <div className="processing-overlay">
          <div className="processing-box"><div className="spinner" /><h3>Generating Schedule</h3><p>Consulting the AI engine...</p></div>
        </div>
      )}
      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
      {schedule && !loading && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" }}>
            {[
              {label:"Total Hours",  value:total+"h",  icon:"fa-clock"},
              {label:"Assignments",  value:schedule.filter(r=>r.task_type==="Assignment").reduce((s,r)=>s+r.allocated_hours,0).toFixed(1)+"h", icon:"fa-pen-to-square"},
              {label:"Labs",         value:schedule.filter(r=>r.task_type==="Lab").reduce((s,r)=>s+r.allocated_hours,0).toFixed(1)+"h", icon:"fa-file-lines"},
              {label:"Study",        value:schedule.filter(r=>r.task_type==="Study").reduce((s,r)=>s+r.allocated_hours,0).toFixed(1)+"h", icon:"fa-book-open"},
            ].map((stat,i) => (
              <div key={stat.label} className="card fade-up" style={{ opacity:0, animationDelay:`${i*0.05}s`, textAlign:"center", padding:"20px" }}>
                <i className={`fa-solid ${stat.icon}`} style={{ color:"var(--caramel)", fontSize:"18px", marginBottom:"8px" }} />
                <p style={{ fontFamily:"var(--font-display)", fontSize:"28px", fontWeight:700, color:"var(--espresso)", margin:"4px 0" }}>{stat.value}</p>
                <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:"var(--coffee)", opacity:0.7 }}>{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="card fade-up delay-2" style={{ opacity:0, marginBottom:"24px" }}>
            <h2 className="section-title" style={{ marginBottom:"4px" }}>Subject Priority Analysis</h2>
            <p className="section-subtitle">AI-generated priority based on historical failure rates and your coverage</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
              {priorities.map(p => (
                <div key={p.subject} style={{ background:"var(--cream)", borderRadius:"12px", padding:"16px", border:"1px solid var(--border)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                    <h4 style={{ fontSize:"14px", fontWeight:700, color:"var(--espresso)" }}>{p.subject}</h4>
                    <span style={{ fontSize:"11px", fontWeight:800, color:getPriColor(p.priority_label) }}>{p.priority_label}</span>
                  </div>
                  <div style={{ height:"4px", background:"var(--border)", borderRadius:"2px", overflow:"hidden", marginBottom:"6px" }}>
                    <div style={{ height:"100%", width:`${Math.min(p.priority_score,100)}%`, background:getPriColor(p.priority_label), borderRadius:"2px" }} />
                  </div>
                  <p style={{ fontSize:"11px", color:"var(--coffee)", opacity:0.8 }}>{p.coverage_percentage}% covered · Score: {p.priority_score.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card fade-up delay-3" style={{ opacity:0, marginBottom:"24px", background:"var(--espresso)", border:"none" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
              <div>
                <h3 style={{ color:"white", fontSize:"16px", marginBottom:"4px" }}><i className="fa-solid fa-envelope" style={{ color:"var(--caramel)", marginRight:"8px" }} />Email Notifications</h3>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px" }}>Send your schedule to your registered email</p>
              </div>
              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                {[{type:"deadline",label:"Deadline Alert",icon:"fa-triangle-exclamation"},{type:"daily",label:"Today Plan",icon:"fa-calendar-day"},{type:"weekly",label:"Weekly Summary",icon:"fa-calendar-week"}].map(btn => (
                  <button key={btn.type} onClick={() => sendNotif(btn.type)} disabled={notifLoading===btn.type}
                    style={{ background:"rgba(192,133,82,0.2)", color:"var(--caramel)", border:"1px solid rgba(192,133,82,0.4)", padding:"8px 16px", borderRadius:"8px", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>
                    <i className={`fa-solid ${btn.icon}`} style={{ marginRight:"6px" }} />{notifLoading===btn.type?"Sending...":btn.label}
                  </button>
                ))}
              </div>
            </div>
            {notifStatus==="success" && <div style={{ marginTop:"12px", color:"rgb(150,220,150)", fontSize:"13px", fontWeight:600 }}><i className="fa-solid fa-circle-check" style={{ marginRight:"6px" }} />Email sent!</div>}
            {notifStatus.startsWith("fail") && <div style={{ marginTop:"12px", color:"rgb(239,150,150)", fontSize:"13px", fontWeight:600 }}><i className="fa-solid fa-circle-xmark" style={{ marginRight:"6px" }} />{notifStatus.replace("fail:","")}</div>}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            {Object.entries(grouped).map(([day,rows]) => {
              const dayTotal = rows.reduce((s,r)=>s+r.allocated_hours,0).toFixed(1);
              return (
                <div key={day} className="card fade-up" style={{ opacity:0, padding:0, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", background:"var(--espresso)" }}>
                    <h3 style={{ color:"white", fontSize:"15px", fontWeight:700 }}>{day}</h3>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <div style={{ height:"4px", width:"100px", background:"rgba(255,255,255,0.2)", borderRadius:"2px", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min((dayTotal/8)*100,100)}%`, background:"var(--caramel)", borderRadius:"2px" }} />
                      </div>
                      <span style={{ color:"var(--caramel)", fontSize:"13px", fontWeight:700 }}>{dayTotal}h</span>
                    </div>
                  </div>
                  <table className="data-table">
                    <thead><tr><th>Task</th><th>Type</th><th>Subject</th><th style={{ textAlign:"right" }}>Hours</th><th>Deadline</th><th>Priority</th></tr></thead>
                    <tbody>
                      {rows.map((row,ri) => (
                        <tr key={ri}>
                          <td style={{ fontWeight:600, color:"var(--espresso)" }}>{row.task_name}</td>
                          <td><span style={{ ...getBadgeStyle(row.task_type), display:"inline-block", padding:"2px 8px", borderRadius:"4px", fontSize:"11px", fontWeight:700 }}>{row.task_type}</span></td>
                          <td>{row.subject}</td>
                          <td style={{ textAlign:"right", fontWeight:700, color:"var(--caramel)" }}>{row.allocated_hours}h</td>
                          <td>{row.deadline||"—"}</td>
                          <td style={{ color:getPriColor(row.urgency_label), fontWeight:700, fontSize:"12px" }}>{row.urgency_label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"24px" }}>
            <button className="btn btn-outline" onClick={() => navigate("/tasks")}><i className="fa-solid fa-arrow-left" /> Back to Tasks</button>
            <button className="btn btn-caramel" onClick={handleGenerate}><i className="fa-solid fa-rotate" /> Regenerate</button>
          </div>
        </>
      )}
    </div>
  );
}
