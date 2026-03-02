import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addTask, getTasks, deleteTask } from "../api/planner";
import { useAuth } from "../context/AuthContext";

const SUBJECTS  = ["OS","AI","OOAD","Economics","DBMS","Embedded"];
const TYPES     = ["Assignment","Lab"];
const DIFFS     = ["Easy","Medium","Hard"];
const HOURS_MAP = { Assignment:{Easy:1.5,Medium:2,Hard:3}, Lab:{Easy:0.75,Medium:1.5,Hard:2} };

export default function TasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ task_name:"", task_type:"Assignment", subject:"OS", difficulty:"Medium", deadline:"" });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try { const res = await getTasks(user.username); setTasks(res.data.data.tasks || []); } catch {}
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.task_name || !form.deadline) { setError("Please fill task name and deadline."); return; }
    setLoading(true); setError("");
    try { await addTask({ ...form, user_id:user.username }); setForm({ task_name:"", task_type:"Assignment", subject:"OS", difficulty:"Medium", deadline:"" }); await fetchTasks(); }
    catch (err) { setError(err.response?.data?.message || "Failed to add task."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteTask(id); await fetchTasks(); } catch {}
  };

  const assignments = tasks.filter(t => t.task_type === "Assignment");
  const labs        = tasks.filter(t => t.task_type === "Lab");

  const TaskGroup = ({ title, icon, items }) => (
    <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"20px", overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"16px", padding:"22px 24px", borderBottom:items.length>0?"1px solid var(--cream-dark)":"none" }}>
        <div style={{ width:"48px", height:"48px", background:"rgb(250,243,235)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--caramel)", fontSize:"20px" }}>
          <i className={`fa-solid ${icon}`} />
        </div>
        <div>
          <h3 style={{ fontSize:"16px", fontWeight:700, color:"var(--espresso)" }}>{title}</h3>
          <p style={{ fontSize:"12px", color:"var(--coffee)", opacity:0.7 }}>{items.length} task{items.length!==1?"s":""} added</p>
        </div>
      </div>
      {items.map((t, i) => (
        <div key={t.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 24px", borderBottom:i<items.length-1?"1px solid var(--cream-dark)":"none", background:i%2===0?"white":"rgba(253,251,247,0.5)" }}>
          <span style={{ color:"var(--caramel)", fontWeight:800, fontSize:"12px", width:"20px" }}>{i+1}</span>
          <span style={{ flex:1, fontSize:"13px", fontWeight:600, color:"var(--espresso)" }}>{t.task_name}</span>
          <span style={{ fontSize:"12px", color:"var(--coffee)", width:"80px" }}>{t.subject}</span>
          <span style={{ fontSize:"10px", fontWeight:700, padding:"3px 8px", borderRadius:"4px", background:"var(--cream-dark)", color:"var(--coffee)" }}>{t.difficulty}</span>
          <span style={{ fontSize:"12px", color:"var(--coffee)", width:"90px" }}>{t.deadline}</span>
          <span style={{ fontSize:"12px", color:"var(--caramel)", fontWeight:700, width:"40px" }}>{t.hours_required}h</span>
          <button onClick={() => handleDelete(t.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(100,80,70,0.5)", fontSize:"14px", padding:"4px", borderRadius:"4px" }}
            onMouseEnter={e => e.target.style.color="var(--error-red)"} onMouseLeave={e => e.target.style.color="rgba(100,80,70,0.5)"}>
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      ))}
      {items.length === 0 && <div style={{ padding:"20px 24px", color:"var(--coffee)", fontSize:"13px", opacity:0.6, textAlign:"center" }}>No tasks added yet. Use the form to add one.</div>}
    </div>
  );

  return (
    <div className="main-content">
      <div className="page-header fade-up" style={{ opacity:0 }}>
        <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"2px", color:"var(--caramel)", marginBottom:"8px" }}>Step 03 of 04</p>
        <h1>Add <em>Tasks</em></h1>
        <p>Add your assignments and lab reports. The AI will prioritize them by deadline and difficulty.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:"24px", alignItems:"start" }}>
        <div className="card fade-up delay-1" style={{ opacity:0 }}>
          <h2 className="section-title" style={{ marginBottom:"4px" }}>Add New Task</h2>
          <p className="section-subtitle">Fill in the details below</p>
          {error && <div className="alert alert-error" style={{ marginBottom:"12px" }}><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input className="form-input" placeholder="e.g. DBMS Assignment 1" value={form.task_name} onChange={e => setForm(p => ({ ...p, task_name:e.target.value }))} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.task_type} onChange={e => setForm(p => ({ ...p, task_type:e.target.value }))}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject:e.target.value }))}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-input" value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty:e.target.value }))}>
                  {DIFFS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hours</label>
                <input className="form-input" readOnly value={`${HOURS_MAP[form.task_type][form.difficulty]}h`} style={{ background:"var(--cream-dark)", color:"var(--caramel)", fontWeight:700 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline:e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ borderRadius:"12px" }}>
              {loading ? "Adding..." : <><i className="fa-solid fa-plus" /> Add Task</>}
            </button>
          </form>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <TaskGroup title="Assignments" icon="fa-pen-to-square" items={assignments} />
          <TaskGroup title="Lab Reports" icon="fa-file-lines" items={labs} />
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:"12px", marginTop:"24px" }}>
        <button className="btn btn-outline" onClick={() => navigate("/availability")}><i className="fa-solid fa-arrow-left" /> Back</button>
        <button className="btn btn-primary" onClick={() => navigate("/schedule")}><i className="fa-solid fa-arrow-right" /> Go to Schedule</button>
      </div>
    </div>
  );
}
