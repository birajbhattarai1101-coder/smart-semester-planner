import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addTask, getTasks, deleteTask, updateTask, saveCoverage, saveAvailability, getAvailability, getCoverage, generateSchedule, saveSchedule } from "../api/planner";

const SUBJECTS = [
  { key: "AI", label: "Artificial Intelligence(AI)" },
  { key: "DBMS", label: "DBMS" },
  { key: "OS", label: "Operating System(OS)" },
  { key: "OOAD", label: "OOAD" },
  { key: "Embedded", label: "Embedded System(ES)" },
  { key: "Economics", label: "Engineering Economics" },
];
const LAB_SUBJECTS = [
  { key: "AI", label: "AI Lab" },
  { key: "DBMS", label: "DBMS Lab" },
  { key: "OS", label: "OS Lab" },
  { key: "Embedded", label: "Embedded System Lab" },
  { key: "OOAD", label: "OOAD Lab" },
];
const ALL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const today = new Date();
const DAYS = Array.from({length: 7}, (_, i) => ALL_DAYS[(today.getDay() + i) % 7]);
const DIFFS = ["Easy","Medium","Hard"];
const HOURS_MAP = { Assignment:{ Easy:1.5, Medium:2, Hard:3 }, Lab:{ Easy:0.75, Medium:1.5, Hard:2 } };

export default function DashboardPage() {
  const { user, loginStatus, setLoginStatus } = useAuth();
  const navigate = useNavigate();
  const [showReturningModal, setShowReturningModal] = useState(false);
  const [returningStep, setReturningStep] = useState(1);
  const [coverage, setCoverage] = useState(Object.fromEntries(SUBJECTS.map(s => [s.key, 0])));
  const [lastSchedule, setLastSchedule] = useState(null);
  const [checked, setChecked] = useState(Object.fromEntries(SUBJECTS.map(s => [s.key, false])));
  const [hours, setHours] = useState(Object.fromEntries(DAYS.map(d => [d, 0])));
  const [hoursWarning, setHoursWarning] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(null);
  const [taskForm, setTaskForm] = useState({ task_name: "", subject: "", difficulty: "Medium", deadline: "" });
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({ task_name: "", difficulty: "Medium", deadline: "" });
  const [generating, setGenerating] = useState(false);
  const [generateStep, setGenerateStep] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [taskError, setTaskError] = useState("");

  const VALID_ASSIGNMENT_SUBJECTS = ["AI", "DBMS", "OS", "OOAD", "Embedded", "Economics",
    "artificial intelligence", "operating system", "embedded system", "engineering economics",
    "ooad", "dbms", "ai", "os"];
  const VALID_LAB_SUBJECTS = ["AI", "DBMS", "OS", "Embedded", "OOAD",
    "ai lab", "dbms lab", "os lab", "embedded", "ooad lab"];

  const isValidSubject = (name, type) => {
    const lower = name.toLowerCase();
    const validList = type === "Assignment" ? VALID_ASSIGNMENT_SUBJECTS : VALID_LAB_SUBJECTS;
    return validList.some(s => lower.includes(s.toLowerCase()));
  };
  const loginHandled = useRef(false);
  const [error, setError] = useState("");

  // Cycle loading messages while generating
  React.useEffect(() => {
    if (!generating) return;
    let i = 0;
    const interval = setInterval(() => { i = (i + 1) % 4; setGenerateStep(i); }, 2000);
    return () => clearInterval(interval);
  }, [generating]);

  // Load everything once user is known
  useEffect(() => {
    if (!user?.username) return;
    fetchTasks();
    loadCheckedAndCoverage();
  }, [user]);

  // Handle login status AFTER user and data are loaded - fires once per session
  useEffect(() => {
    if (!user?.username) return;
    if (loginHandled.current) return;
    if (loginStatus === "new_week") {
      loginHandled.current = true;
      setLoginStatus(null);
      openHoursModal();
    } else if (loginStatus === "returning") {
      loginHandled.current = true;
      setLoginStatus(null);
      setShowReturningModal(true);
      setReturningStep(1);
    }
  }, [loginStatus, user]);

  const loadCheckedAndCoverage = async () => {
    const uname = user.username;
    // First load from localStorage immediately so UI shows fast
    try {
      const savedChecked = localStorage.getItem("sf_checked_" + uname);
      const savedCoverage = localStorage.getItem("sf_coverage_" + uname);
      if (savedChecked) setChecked(JSON.parse(savedChecked));
      if (savedCoverage) setCoverage(JSON.parse(savedCoverage));
    } catch {}
    // Sync from backend only if no localStorage exists (localStorage is source of truth)
    const storedChecked = localStorage.getItem("sf_checked_" + uname);
    const storedCoverage = localStorage.getItem("sf_coverage_" + uname);
    if (!storedChecked || !storedCoverage) {
      try {
        const res = await getCoverage(uname);
        const rows = res.data.data.coverage || [];
        if (rows.length > 0) {
          if (!storedCoverage) {
            const loadedCoverage = Object.fromEntries(rows.map(r => [r.subject, r.coverage_percentage || 0]));
            setCoverage(loadedCoverage);
            localStorage.setItem("sf_coverage_" + uname, JSON.stringify(loadedCoverage));
          }
          if (!storedChecked) {
            const inferredChecked = Object.fromEntries(SUBJECTS.map(s => [s.key, rows.some(r => r.subject === s.key)]));
            setChecked(inferredChecked);
            localStorage.setItem("sf_checked_" + uname, JSON.stringify(inferredChecked));
          }
        }
      } catch {}
    }
  };

  const fetchTasks = async () => {
    try { const res = await getTasks(user.username); setTasks(res.data.data.tasks || []); } catch {}
  };

  const updateChecked = (key, value) => {
    setChecked(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("sf_checked_" + user.username, JSON.stringify(next));
      return next;
    });
  };

  const updateCoverage = (key, value) => {
    setCoverage(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("sf_coverage_" + user.username, JSON.stringify(next));
      return next;
    });
  };

  const openHoursModal = async () => {
    try {
      const res = await getAvailability(user.username);
      const saved = res.data.data.availability || [];
      if (saved.length > 0) {
        const loaded = Object.fromEntries(DAYS.map((d) => [d, saved.find(s => s.day_label === d)?.available_hours || 0]));
        setHours(loaded);
      }
    } catch {}
    setShowHoursModal(true);
  };

  const handleSaveHours = () => {
    const previousHours = hours;
    setShowHoursModal(false);
    setShowSuccessModal("hours");
    saveAvailability(user.username, DAYS.map((d) => ({ day_label: d, available_hours: hours[d] })))
      .catch(() => {
        setHours(previousHours);
        setShowSuccessModal(null);
        setError("Failed to save hours. Please try again.");
      });
  };

  const handleReturningHoursYes = () => { setShowReturningModal(false); setLoginStatus(null); openHoursModal(); };
  const handleReturningHoursNo = () => { setReturningStep(2); };
  const handleReturningTasksYes = () => { setShowReturningModal(false); setLoginStatus(null); };
  const handleReturningTasksNo = () => { setShowReturningModal(false); setLoginStatus(null); navigate("/view-schedule"); };

  const handleAddTask = async () => {
    if (!taskForm.task_name || !taskForm.deadline) return;
    if (!isValidSubject(taskForm.task_name, showTaskModal)) {
      const validNames = showTaskModal === "Assignment"
        ? "AI, DBMS, OS, OOAD, Embedded System, Economics"
        : "AI, DBMS, OS, Embedded System, OOAD";
      setTaskError(`Invalid subject. Only 6th sem subjects allowed: ${validNames}`);
      return;
    }
    setTaskError("");
    try {
      await addTask({ user_id: user.username, task_name: taskForm.task_name, task_type: showTaskModal, subject: taskForm.task_name, difficulty: taskForm.difficulty, deadline: taskForm.deadline });
      setTaskForm({ task_name: "", subject: "", difficulty: "Medium", deadline: "" });
      setShowTaskModal(null);
      await fetchTasks();
      showToast("Task added successfully!");
    } catch { showToast("Failed to add task.", "error"); }
  };

  const handleDelete = async (id) => {
    try { await deleteTask(id); await fetchTasks(); showToast("Task deleted."); }
    catch { showToast("Failed to delete task.", "error"); }
  };

  const handleEditSave = async () => {
    if (!editForm.task_name || !editForm.deadline) return;
    try {
      await updateTask(editTask.id, {
        task_name: editForm.task_name,
        difficulty: editForm.difficulty,
        deadline: editForm.deadline,
        task_type: editTask.task_type,
      });
      await fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
    setEditTask(null);
  };

  const handleGenerate = async () => {
    const selectedKeys = SUBJECTS.filter(s => checked[s.key]).map(s => s.key); localStorage.setItem("sf_selected_" + user.username, JSON.stringify(selectedKeys)); const uncheckedKeys = SUBJECTS.filter(s => !checked[s.key]).map(s => s.key); if (uncheckedKeys.length > 0) { try { await saveCoverage(user.username, Object.fromEntries(selectedKeys.map(k => [k, coverage[k] || 0]))); } catch {} }
    if (selectedKeys.length === 0) { alert("Please select at least one subject."); return; }
    setGenerating(true); setGenerateStep(0); setError("");
    try {
      await saveCoverage(user.username, Object.fromEntries(selectedKeys.map(k => [k, coverage[k] || 0])));
      const res = await generateSchedule(user.username, 0, selectedKeys);
      setLastSchedule(res.data.data); await saveSchedule(user.username, res.data.data); setShowSuccessModal("schedule");
    } catch { setError("Failed to generate. Please set your availability first."); }
    finally { setGenerating(false); }
  };

  const assignments = tasks.filter(t => t.task_type === "Assignment");
  const labs = tasks.filter(t => t.task_type === "Lab");
  const totalHours = Object.values(hours).reduce((s, v) => s + v, 0);

  return (
    <div style={{ marginLeft: "260px", minHeight: "100vh", background: "#FAF8F4", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ padding: "40px 48px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2C1810", margin: "0 0 4px" }}>Weekly Distribution</h1>
            <p style={{ fontSize: "13px", color: "#8C7B70", margin: 0 }}>Your hours are balanced across labs, assignments, and subjects.</p>
          </div>
          <button onClick={() => openHoursModal()}
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
                <div style={{ width: "36px", height: "36px", background: "#2C1810", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px", flexShrink: 0, lineHeight: "1", paddingBottom: "2px" }}>+</div>
              </div>
              {col.items.map((t, i) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", background: i % 2 === 0 ? "#FAFAF8" : "white", borderTop: "1px solid #F0EBE3" }}>
                  <span style={{ fontSize: "13px", color: "#2C1810", fontWeight: 600 }}>{t.task_name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", color: "#8C7B70" }}>{t.deadline}</span>
                    <button onClick={() => { setEditTask(t); setEditForm({ task_name: t.task_name, difficulty: t.difficulty || "Medium", deadline: t.deadline || "" }); }} style={{ background: "none", border: "none", color: "#B8862E", cursor: "pointer", fontSize: "13px", lineHeight: 1, marginRight: "4px" }}>&#9998;</button>
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
                <div onClick={() => updateChecked(s.key, !checked[s.key])}
                  style={{ width: "20px", height: "20px", borderRadius: "5px", border: checked[s.key] ? "none" : "2px solid #C9B99A", background: checked[s.key] ? "#B8862E" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {checked[s.key] && <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>&#10003;</span>}
                </div>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#2C1810" }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {checked[s.key] && <span style={{ fontSize: "13px", color: "#8C7B70" }}>syllabus covered</span>}
                {checked[s.key] && <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="%" value={coverage[s.key] === 0 ? "" : coverage[s.key]}
                  id={"cov_" + s.key} autoComplete="off"
                  onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); updateCoverage(s.key, v === "" ? 0 : Math.min(100, Number(v))); }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "40px", width: "420px", maxWidth: "90vw", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", textAlign: "center" }}>
            {returningStep === 1 ? (
              <>
                <i className="fa-solid fa-hand-wave" style={{ fontSize: "36px", color: "#B8862E", marginBottom: "16px", display: "block" }}></i>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "8px" }}>Welcome back!</h2>
                <p style={{ fontSize: "14px", color: "#8C7B70", marginBottom: "32px" }}>Any changes to your available hours this week?</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button onClick={handleReturningHoursYes} style={{ background: "#2C1810", color: "white", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Yes, Edit Hours</button>
                  <button onClick={handleReturningHoursNo} style={{ background: "#F5F0EA", color: "#2C1810", border: "none", padding: "12px 32px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>No Changes</button>
                </div>
              </>
            ) : (
              <>
                <i className="fa-solid fa-list-check" style={{ fontSize: "36px", color: "#B8862E", marginBottom: "16px", display: "block" }}></i>
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

      {showHoursModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(44,24,16,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", isolation: "isolate", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px 40px", width: "400px", maxWidth: "90vw", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: "28px", color: "#B8862E", marginBottom: "12px", display: "block" }} />
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "4px" }}>Weekly Study Plan</h3>
              <p style={{ fontSize: "13px", color: "#8C7B70", margin: 0 }}>Enter hours for the next 7 days</p>
            </div>
            {DAYS.map(day => (
              <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#2C1810" }}>{day}</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" id={"hr_" + day} autoComplete="off"
                  value={hours[day] === 0 ? "" : hours[day]}
                  onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); const n = v === "" ? 0 : Number(v); if (n > 8) { setHoursWarning(day); } else { setHoursWarning(""); } setHours(p => ({ ...p, [day]: Math.min(8, n) })); }}
                  onKeyDown={e => { if (e.key === "Enter") { const idx = DAYS.indexOf(day); if (idx < DAYS.length - 1) { document.getElementById("hr_" + DAYS[idx + 1])?.focus(); } else { document.getElementById("saveHoursBtn")?.click(); } } }}
                  style={{ width: "68px", textAlign: "center", padding: "8px", border: hoursWarning === day ? "1.5px solid #DC2626" : "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", fontWeight: 700, color: hoursWarning === day ? "#DC2626" : "#2C1810", fontFamily: "inherit", outline: "none" }} />
              </div>
            ))}
            {hoursWarning && <p style={{ textAlign: "center", fontSize: "12px", color: "#DC2626", margin: "8px 0 0", fontWeight: 600 }}><i className="fa-solid fa-triangle-exclamation"></i> Maximum 8 hours per day allowed!</p>}
            <p style={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#2C1810", margin: "8px 0 16px" }}>Total Weekly Hours: {totalHours}hr</p>
            <button id="saveHoursBtn" onClick={handleSaveHours}
              style={{ width: "100%", background: "#B8862E", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Save Hours
            </button>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setShowTaskModal(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px 40px", width: "420px", maxWidth: "90vw", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", marginBottom: "24px" }}>
              Add {showTaskModal === "Assignment" ? "Assignment" : "Lab Report"}
            </h3>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Subject</label>
            <select value={taskForm.subject} onChange={e => { const opt = e.target.options[e.target.selectedIndex]; setTaskForm(p => ({ ...p, subject: e.target.value, task_name: e.target.value ? opt.text + (showTaskModal === "Assignment" ? " Assignment" : " Lab Report") : "" })); }}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: taskForm.subject ? "#2C1810" : "#8C7B70", fontFamily: "inherit", outline: "none", background: "white", boxSizing: "border-box", marginBottom: "16px" }}>
              <option value="">-- Select Subject --</option>
              {(showTaskModal === "Assignment" ? SUBJECTS : LAB_SUBJECTS).map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Task Name</label>
            <input type="text" placeholder={showTaskModal === "Assignment" ? "e.g. DBMS Assignment 1" : "e.g. OS Lab Report 2"} value={taskForm.task_name}
              autoComplete="off"
              onChange={e => { setTaskForm(p => ({ ...p, task_name: e.target.value })); if (taskError) setTaskError(""); }}
              style={{ width: "100%", padding: "11px 14px", border: taskError ? "1.5px solid #DC2626" : "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: taskError ? "6px" : "16px", background: taskError ? "#FFF5F5" : "white" }} />
            {taskError && <p style={{ fontSize: "12px", color: "#DC2626", fontWeight: 600, marginBottom: "10px" }}>⚠️ {taskError}</p>}
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
            <input type="date" value={taskForm.deadline} min={new Date().toISOString().split("T")[0]} onChange={e => setTaskForm(p => ({ ...p, deadline: e.target.value }))}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: "24px" }} />
            {taskError && <p style={{ fontSize: "12px", color: "#DC2626", fontWeight: 600, marginBottom: "12px", background: "#FEF2F2", padding: "8px 12px", borderRadius: "6px", border: "1px solid #FECACA" }}>⚠️ {taskError}</p>}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => { setShowTaskModal(null); setTaskError(""); }}
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

     {editTask && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setEditTask(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px 40px", width: "420px", maxWidth: "90vw", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <i className="fa-solid fa-pen-to-square" style={{ fontSize: "28px", color: "#B8862E", marginBottom: "10px", display: "block" }} />
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#2C1810", margin: 0 }}>Edit any tasks?</h3>
            </div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Task Name</label>
            <input type="text" value={editForm.task_name} autoComplete="off"
              onChange={e => setEditForm(p => ({ ...p, task_name: e.target.value }))}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: "16px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Difficulty</label>
                <select value={editForm.difficulty} onChange={e => setEditForm(p => ({ ...p, difficulty: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", background: "white" }}>
                  {DIFFS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Est. Hours</label>
                <input readOnly value={(HOURS_MAP[editTask.task_type] || HOURS_MAP["Assignment"])[editForm.difficulty] + "h"}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#B8862E", fontWeight: 700, fontFamily: "inherit", background: "#FBF5EC", boxSizing: "border-box" }} />
              </div>
            </div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#8C7B70", display: "block", marginBottom: "6px" }}>Deadline</label>
            <input type="date" value={editForm.deadline} min={new Date().toISOString().split("T")[0]} onChange={e => setEditForm(p => ({ ...p, deadline: e.target.value }))}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D9CEC4", borderRadius: "8px", fontSize: "14px", color: "#2C1810", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: "24px" }} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEditTask(null)}
                style={{ flex: 1, background: "none", border: "1.5px solid #D9CEC4", color: "#2C1810", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handleEditSave}
                style={{ flex: 1, background: "#2C1810", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {generating && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 99998, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ textAlign: "center", color: "white" }}>
            <div style={{ width: "72px", height: "72px", border: "5px solid rgba(184,134,46,0.3)", borderTop: "5px solid #B8862E", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 28px" }} />
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>Building Your Schedule</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", marginBottom: "32px" }}>
              {["Fetching your tasks and availability...", "Analyzing deadlines and priorities...", "Optimizing your weekly plan...", "Almost ready — finalizing schedule..."][generateStep]}
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === generateStep ? "#B8862E" : "rgba(255,255,255,0.25)", transition: "background 0.3s" }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "28px", right: "28px", background: toast.type === "error" ? "#DC2626" : "#2C1810", color: "white", padding: "14px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", zIndex: 99999, display: "flex", alignItems: "center", gap: "10px", fontFamily: "'Plus Jakarta Sans', sans-serif", animation: "slideUp 0.3s ease" }}>
          <span style={{ fontSize: "16px" }}>{toast.type === "error" ? "⚠️" : "✅"}</span>
          {toast.message}
        </div>
      )}

     {showSuccessModal === "hours" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setShowSuccessModal(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "44px 40px", width: "360px", maxWidth: "90vw", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: "60px", height: "60px", background: "#B8862E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px", color: "white" }}>
             <i className="fa-solid fa-check" />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#2C1810", marginBottom: "10px" }}>Hours Saved!</h3>
            <p style={{ fontSize: "13px", color: "#8C7B70", marginBottom: "28px", lineHeight: 1.7 }}>Your weekly study capacity has been updated.</p>
            <button onClick={() => setShowSuccessModal(null)}
              style={{ background: "#2C1810", color: "white", border: "none", padding: "13px 40px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {showSuccessModal === "schedule" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setShowSuccessModal(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "44px 40px", width: "360px", maxWidth: "90vw", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: "60px", height: "60px", background: "#B8862E", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px", color: "white" }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#2C1810", marginBottom: "10px" }}>Schedule Ready!</h3>
            <p style={{ fontSize: "13px", color: "#8C7B70", marginBottom: "28px", lineHeight: 1.7 }}>Your weekly plan has been optimized successfully.</p>
            <button onClick={() => { setShowSuccessModal(null); navigate("/view-schedule", { state: { scheduleData: lastSchedule, selectedSubjects: SUBJECTS.filter(s => checked[s.key]).map(s => s.key) } }); }}
              style={{ background: "#2C1810", color: "white", border: "none", padding: "13px 40px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              View Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}










