import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addTask, getTasks, deleteTask } from "../api/planner";
import { useAuth } from "../context/AuthContext";

const SUBJECTS = ["OS","AI","OOAD","Economics","DBMS","Embedded","General"];

export default function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const [form, setForm] = useState({ task_name: "", task_type: "Assignment", subject: "General", difficulty: "Medium", deadline: tomorrowStr });

  const fetchTasks = async () => {
    try { const res = await getTasks(user.username); setTasks(res.data.data.tasks || []); } catch {}
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      await addTask({ ...form, user_id: user.username });
      setSuccess("Task added!"); setTimeout(() => setSuccess(""), 2000);
      setForm({ task_name: "", task_type: "Assignment", subject: "General", difficulty: "Medium", deadline: tomorrowStr });
      fetchTasks();
    } catch (err) { setError(err.response?.data?.message || "Failed to add task."); }
    finally { setLoading(false); }
  };

  const diffColor = { Easy: "#7A9E6E", Medium: "#C9A96E", Hard: "#C97B6E" };
  const getHours = (type, diff) => ({ Assignment: { Easy: "1.5", Medium: "2.0", Hard: "3.0" }, Lab: { Easy: "0.75", Medium: "1.5", Hard: "2.0" } }[type]?.[diff] || "?");

  return (
    <div className="main-content">
      <div className="page-header animate-fadeUp">
        <div className="page-header-eyebrow">Step 03 of 04</div>
        <h1>Tasks & <em>Deadlines</em></h1>
        <p>Add your assignments and lab tasks. The scheduler will prioritise them by deadline and difficulty.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div className="card animate-fadeUp delay-1">
          <div className="card-title">Add New Task</div>
          <div className="card-subtitle">Assignment or Lab</div>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input className="form-input" placeholder="e.g. DBMS Assignment 2" value={form.task_name} onChange={e => setForm({ ...form, task_name: e.target.value })} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })} style={{ cursor: "pointer" }}>
                  <option>Assignment</option><option>Lab</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ cursor: "pointer" }}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={{ cursor: "pointer" }}>
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" value={form.deadline} min={tomorrowStr} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
              </div>
            </div>
            <div style={{ background: "var(--cream-dark)", border: "1px solid var(--beige)", borderRadius: "2px", padding: "0.8rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--brown)", display: "flex", justifyContent: "space-between" }}>
              <span>Estimated hours</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{getHours(form.task_type, form.difficulty)} hrs</span>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>{loading ? "Adding..." : "+ Add Task"}</button>
          </form>
        </div>
        <div className="animate-fadeUp delay-2">
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 400, color: "var(--brown-deep)", marginBottom: "1rem" }}>
            Your Tasks <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--beige-mid)", fontWeight: 300 }}>{tasks.length} added</span>
          </div>
          {tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--beige-mid)", fontStyle: "italic", fontFamily: "var(--font-display)" }}>No tasks added yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {tasks.map(task => (
                <div key={task.id} className="card" style={{ padding: "0.9rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 500, color: "var(--brown-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.task_name}</div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem", alignItems: "center" }}>
                      <span className={"badge badge-" + task.task_type.toLowerCase()}>{task.task_type}</span>
                      <span style={{ fontSize: "0.72rem", color: diffColor[task.difficulty] }}>{task.difficulty}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--beige-mid)" }}>Due {task.deadline}</span>
                    </div>
                  </div>
                  <button onClick={() => { deleteTask(task.id).then(fetchTasks); }} style={{ background: "none", border: "none", color: "var(--beige-mid)", cursor: "pointer", fontSize: "1rem", padding: "0.2rem" }} onMouseEnter={e => e.target.style.color = "#C97B6E"} onMouseLeave={e => e.target.style.color = "var(--beige-mid)"}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/availability")}>← Back</button>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("/schedule")}>Continue to Schedule →</button>
      </div>
    </div>
  );
}
