import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addTask, getTasks, deleteTask, saveCoverage, saveAvailability, getAvailability, generateSchedule, saveSchedule } from "../api/planner";

const SUBJECTS = [
  { key: "AI", label: "Artificial Intelligence(AI)" },
  { key: "DBMS", label: "DBMS" },
  { key: "OS", label: "Operating System(OS)" },
  { key: "OOAD", label: "OOAD" },
  { key: "Embedded", label: "Embedded System(ES)" },
  { key: "Economics", label: "Engineering Economics" },
];
const ALL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const today = new Date();
const DAYS = Array.from({length: 7}, (_, i) => ALL_DAYS[(today.getDay() + i) % 7]);
const DIFFS = ["Easy","Medium","Hard"];
const HOURS_MAP = { Assignment:{ Easy:1.5, Medium:2, Hard:3 }, Lab:{ Easy:0.75, Medium:1.5, Hard:2 } };

export default function DashboardPage() {
  const { user, loginStatus, setLoginStatus } = useAuth();
  const [showReturningModal, setShowReturningModal] = useState(false);
  const [returningStep, setReturningStep] = useState(1);

  useEffect(() => {
    if (loginStatus === "new_week") { handleOpenHoursModal(); setLoginStatus(null); } else if (loginStatus === "returning") {
      setShowReturningModal(true);
      setReturningStep(1);
    }
  }, [loginStatus]);

  const handleReturningHoursYes = () => {
    setShowReturningModal(false);
    setLoginStatus(null);
    handleOpenHoursModal();
  };

  const handleReturningHoursNo = () => {
    setReturningStep(2);
  };

  const handleReturningTasksYes = () => {
    setShowReturningModal(false);
    setLoginStatus(null);
  };

  const handleReturningTasksNo = () => {
    setShowReturningModal(false);
    setLoginStatus(null);
    navigate("/view-schedule");
  };
  const navigate = useNavigate();
  const [coverage, setCoverage]               = useState(Object.fromEntries(SUBJECTS.map(s => [s.key, 0])));
  const [lastSchedule, setLastSchedule] = useState(null);
  const [checked, setChecked]                 = useState(Object.fromEntries(SUBJECTS.map(s => [s.key, false])));
  const [hours, setHours]                     = useState(Object.fromEntries(DAYS.map(d => [d, 0])));
  const [tasks, setTasks]                     = useState([]);
  const [showHoursModal, setShowHoursModal]   = useState(false);
  const [showTaskModal, setShowTaskModal]     = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(null);
  const [taskForm, setTaskForm]               = useState({ task_name: "", difficulty: "Medium", deadline: "" });
  const [generating, setGenerating]           = useState(false);
  const [error, setError]                     = useState("");

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try { console.log("Opening hours modal"); console.log("Opening hours modal"); const res = await getTasks(user.username); setTasks(res.data.data.tasks || []); } catch {}
  };

  const handleOpenHoursModal = async () => { console.log("handleOpenHoursModal called"); console.log("handleOpenHoursModal called");
    try { console.log("Opening hours modal"); console.log("Opening hours modal");
      const res = await getAvailability(user.username); console.log("getAvailability response:", res); console.log("getAvailability response:", res);
      const saved = res.data.data.availability || [];
      if (saved.length > 0) {
        const loaded = Object.fromEntries(DAYS.map((d, i) => [d, saved[i]?.available_hours || 0]));
        setHours(loaded);
      }
    } catch {}
    handleOpenHoursModal();
  };
  const handleSaveHours = async () => {
    try { console.log("Opening hours modal"); console.log("Opening hours modal");
      await saveAvailability(user.username, DAYS.map((d, i) => ({ day_label: "Day"+(i+1), available_hours: hours[d] })));
      setShowHoursModal(false); console.log("setShowHoursModal(false) executed"); console.log("Hours modal closed"); console.log("Hours modal closed");
      setShowSuccessModal("hours");
    } catch {}
  };

  const handleAddTask = async () => {
    if (!taskForm.task_name || !taskForm.deadline) return;
    try { console.log("Opening hours modal"); console.log("Opening hours modal");
      await addTask({ user_id: user.username, task_name: taskForm.task_name, task_type: showTaskModal, subject: "General", difficulty: taskForm.difficulty, deadline: taskForm.deadline });
      setTaskForm({ task_name: "", difficulty: "Medium", deadline: "" });
      setShowTaskModal(null);
      await fetchTasks();
    } catch {}
  };

  const handleDelete = async (id) => {
    try { console.log("Opening hours modal"); console.log("Opening hours modal"); await deleteTask(id); await fetchTasks(); } catch {}
  };

  const handleGenerate = async () => {
    const selectedKeys = SUBJECTS.filter(s => checked[s.key]).map(s => s.key);
    if (selectedKeys.length === 0) { alert("Please select at least one subject."); return; }
    setGenerating(true); setError("");
    try { console.log("Opening hours modal"); console.log("Opening hours modal");
      await saveCoverage(user.username, Object.fromEntries(selectedKeys.map(k => [k, coverage[k] || 0])));
      const res = await generateSchedule(user.username, 0, selectedKeys);
      setLastSchedule(res.data.data); await saveSchedule(user.username, res.data.data);
      setShowSuccessModal("schedule");
    } catch { setError("Failed to generate. Please set your availability first."); }
    finally { setGenerating(false); }
  };

  const assignments = tasks.filter(t => t.task_type === "Assignment");
  const labs        = tasks.filter(t => t.task_type === "Lab");
  const totalHours  = Object.values(hours).reduce((s, v) => s + v, 0);

  return (
    <div style={{ marginLeft: "260px", minHeight: "100vh", background: "#FAF8F4", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ padding: "40px 48px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2C1810", margin: "0 0 4px" }}>Weekly Distribution</h1>
            <p style={{ fontSize: "13px", color: "#8C7B70", margin: 0 }}>Your hours are balanced across labs, assignments, and subjects.</p>
          </div>
          <button onClick={() => handleOpenHoursModal()}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#2C1810", color: "white", border: "none", padding: "11px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-sliders" style={{ fontSize: "12px" }} /> Edit Available Hours
          </button>
        </div>

        {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", marginBottom: "16px" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          {[
            { type: "Assignment", icon: "fa-pen-to-square", label: "Assignments", sub: "Click to add task", items: assignments },
            { type: "Lab", icon: "fa-file-lines", label: "Lab Reports", sub: "Click to add report", items: labs },
          ].map(col => (
            <div key={col.type} style={{ background: "white", borderRadius: "16px", border: "1px solid #EEE9E0", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", cursor: "pointer" }} onClick={() => setShowTaskModal(col.type)}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "44px", height: "44px", background: "#FBF5EC", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#B8862E", fontSize: "18px", flexShrink: 0 }}>
                    <i className={"fa-solid " + col.icon} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#2C1810" }}>{col.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#8C7B70" }}>{col.sub}</p>
                  </div>
                </div>
                <div style={{ width: "36px", height: "36px", background: "#2C1810", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px", flexShrink: 0 }}>+</div>
              </div>
              {col.items.map((t, i) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", background: i % 2 === 0 ? "#FAFAF8" : "white", borderTop: "1px solid #F0EBE3" }}>
                  <span style={{ fontSize: "13px", color: "#2C1810", fontWeight: 600 }}>{t.task_name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", color: "#8C7B70" }}>{t.deadline}</span>
                    <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", color: "#C9A080", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}>x</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #EEE9E0", padding: "28px 32px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "4px" }}>6th Semester Subjects</h3>
          <p style={{ fontSize: "13px", color: "#8C7B70", marginBottom: "24px" }}>Select the subjects you want to focus on this week.</p>
          {SUBJECTS.map((s, i) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < SUBJECTS.length - 1 ? "1px solid #F0EBE3" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div onClick={() => setChecked(p => ({...p, [s.key]: !p[s.key]}))}
                  style={{ width: "20px", height: "20px", borderRadius: "5px", border: checked[s.key] ? "none" : "2px solid #C9B99A", background: checked[s.key] ? "#B8862E" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checked[s.key] && <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>&#10003;</span>}
                </div>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#2C1810" }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {checked[s.key] && <span style={{ fontSize: "13px", color: "#8C7B70" }}>syllabus covered</span>}
                {checked[s.key] && <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="%" value={coverage[s.key] === 0 ? "" : coverage[s.key]}
                  id={"cov_" + s.key}
                  onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setCoverage(p => ({ ...p, [s.key]: v === "" ? 0 : Math.min(100, Number(v)) })); }}
                  style={{ width: "62px", textAlign: "center", padding: "7px 8px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", fontWeight: 700, color: "#2C1810", fontFamily: "inherit", outline: "none" }} />
                  <span style={{ fontSize: "13px", color: "#8C7B70", marginLeft: "4px" }}>%</span>
                </div>}
              </div>
            </div>
          ))}
        </div>

        <button id="generateBtn" onClick={handleGenerate} disabled={generating}
          style={{ width: "100%", background: "#2C1810", color: "white", border: "none", padding: "18px", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: generating ? 0.8 : 1 }}>
          {generating ? "Generating..." : "Generate Study Schedule"}
        </button>
      </div>

      {showReturningModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", width: "420px", maxWidth: "90vw", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", textAlign: "center" }}>
            {returningStep === 1 ? (
              <>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>?</div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "8px" }}>Welcome back!</h2>
                <p style={{ fontSize: "14px", color: "#8C7B70", marginBottom: "32px" }}>Any changes to your available hours this week?</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button onClick={handleReturningHoursYes} style={{ background: "#2C1810", color: "white", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Yes, Edit Hours</button>
                  <button onClick={handleReturningHoursNo} style={{ background: "#F5F0EA", color: "#2C1810", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>No Changes</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>??</div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "8px" }}>Any task modifications?</h2>
                <p style={{ fontSize: "14px", color: "#8C7B70", marginBottom: "32px" }}>Do you want to add or edit assignments, labs or subjects?</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button onClick={handleReturningTasksYes} style={{ background: "#2C1810", color: "white", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Yes, Edit Tasks</button>
                  <button onClick={handleReturningTasksNo} style={{ background: "#F5F0EA", color: "#2C1810", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>No, View Schedule</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {true && (  // FORCED OPEN FOR TEST\n console.log("Modal render condition checked");
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowHoursModal(false)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px 40px", width: "400px", maxWidth: "90vw", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: "28px", color: "#B8862E", marginBottom: "12px", display: "block" }} />
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "4px" }}>Weekly Study Plan</h3>
              <p style={{ fontSize: "13px", color: "#8C7B70", margin: 0 }}>Enter hours for the next 7 days</p>
            </div>
            {DAYS.map(day => (
              <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#2C1810" }}>{day}</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" id={"hr_" + day} value={hours[day] === 0 ? "" : hours[day]}
                  onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setHours(p => ({ ...p, [day]: v === "" ? 0 : Math.min(12, Number(v)) })); }}
                  onKeyDown={e => { if (e.key === "Enter") { const idx = DAYS.indexOf(day); if (idx < DAYS.length - 1) { document.getElementById("hr_" + DAYS[idx + 1])?.focus(); } else { document.getElementById("saveHoursBtn")?.click(); } } }}
                  style={{ width: "68px", textAlign: "center", padding: "8px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", fontWeight: 700, color: "#2C1810", fontFamily: "inherit", outline: "none" }} />
              </div>
            ))}
            <p style={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#2C1810", margin: "16px 0" }}>Total Weekly Hours: {totalHours}hr</p>
            <button id="saveHoursBtn" onClick={handleSaveHours}
              style={{ width: "100%", background: "#B8862E", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Save Hours
            </button>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowTaskModal(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px 40px", width: "420px", maxWidth: "90vw", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "24px" }}>
              Add {showTaskModal === "Assignment" ? "Assignment" : "Lab Report"}
            </h3>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Task Name</label>
            <input type="text" placeholder={showTaskModal === "Assignment" ? "e.g. DBMS Assignment 1" : "e.g. OS Lab Report 2"} value={taskForm.task_name}
              onChange={e => setTaskForm(p => ({ ...p, task_name: e.target.value }))}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: "16px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Difficulty</label>
                <select value={taskForm.difficulty} onChange={e => setTaskForm(p => ({ ...p, difficulty: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", background: "white" }}>
                  {DIFFS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Est. Hours</label>
                <input readOnly value={HOURS_MAP[showTaskModal][taskForm.difficulty] + "h"}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#B8862E", fontWeight: 700, fontFamily: "inherit", background: "#FBF5EC", boxSizing: "border-box" }} />
              </div>
            </div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Deadline</label>
            <input type="date" value={taskForm.deadline} onChange={e => setTaskForm(p => ({ ...p, deadline: e.target.value }))}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: "24px" }} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowTaskModal(null)}
                style={{ flex: 1, background: "none", border: "1.5px solid #D9CEC4", color: "#2C1810", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handleAddTask}
                style={{ flex: 1, background: "#2C1810", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowSuccessModal(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "44px 40px", width: "360px", maxWidth: "90vw", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: "60px", height: "60px", background: "#B8862E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px", color: "white" }}>?</div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#2C1810", marginBottom: "10px" }}>
              {showSuccessModal === "hours" ? "Hours Saved!" : "Schedule Ready!"}
            </h3>
            <p style={{ fontSize: "13px", color: "#8C7B70", marginBottom: "28px", lineHeight: 1.7 }}>
              {showSuccessModal === "hours" ? "Your weekly study capacity has been updated for your 6th-semester subjects." : "Your weekly plan has been optimized successfully."}
            </p>
            <button onClick={() => { if (showSuccessModal === "schedule") { setShowSuccessModal(null); navigate("/view-schedule", { state: { scheduleData: lastSchedule } }); } else setShowSuccessModal(null); }}
              style={{ background: "#2C1810", color: "white", border: "none", padding: "13px 40px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {showSuccessModal === "hours" ? "Got it!" : "View Schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



