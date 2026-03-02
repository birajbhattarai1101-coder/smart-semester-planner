import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const steps = [
    { icon:"fa-chart-pie",      title:"Set Coverage",       desc:"Enter your subject coverage percentages to help the AI prioritize your weak areas.", path:"/coverage",     step:"01" },
    { icon:"fa-clock",          title:"Set Availability",   desc:"Tell us how many hours you can study each day of the week.",                         path:"/availability", step:"02" },
    { icon:"fa-list-check",     title:"Add Tasks",          desc:"Add your assignments and lab reports with deadlines and difficulty levels.",          path:"/tasks",        step:"03" },
    { icon:"fa-calendar-days",  title:"Generate Schedule",  desc:"Our AI engine creates your personalized 7-day study schedule instantly.",            path:"/schedule",     step:"04" },
  ];
  return (
    <div className="main-content">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"40px" }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:"28px", color:"var(--espresso)", marginBottom:"6px" }}>
            Welcome back, <em style={{ color:"var(--caramel)" }}>{user?.username}</em>
          </h1>
          <p style={{ color:"var(--coffee)", fontSize:"14px", opacity:0.8 }}>Your AI-powered study planner is ready. Follow the steps below to get started.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/schedule")} style={{ flexShrink:0 }}>
          <i className="fa-solid fa-bolt" /> Generate Schedule
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"20px", marginBottom:"40px" }}>
        {steps.map((s, i) => (
          <div key={s.step} className="card card-hover fade-up" style={{ cursor:"pointer", animationDelay:`${i*0.05}s`, opacity:0 }} onClick={() => navigate(s.path)}>
            <div style={{ display:"flex", gap:"20px", alignItems:"flex-start" }}>
              <div style={{ width:"55px", height:"55px", background:"rgb(250,243,235)", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--caramel)", fontSize:"22px", flexShrink:0 }}>
                <i className={`fa-solid ${s.icon}`} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                  <h3 style={{ fontSize:"16px", fontWeight:700, color:"var(--espresso)" }}>{s.title}</h3>
                  <span style={{ fontSize:"28px", fontWeight:800, color:"rgba(192,133,82,0.2)", fontFamily:"var(--font-display)" }}>{s.step}</span>
                </div>
                <p style={{ fontSize:"13px", color:"var(--coffee)", opacity:0.8, lineHeight:1.6 }}>{s.desc}</p>
              </div>
            </div>
            <div style={{ marginTop:"16px", display:"flex", justifyContent:"flex-end" }}>
              <span style={{ fontSize:"12px", color:"var(--caramel)", fontWeight:700 }}>Go to {s.title} <i className="fa-solid fa-arrow-right" /></span>
            </div>
          </div>
        ))}
      </div>
      <div className="card fade-up delay-5" style={{ background:"var(--espresso)", border:"none", opacity:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
          <div style={{ width:"50px", height:"50px", background:"rgba(192,133,82,0.2)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>🤖</div>
          <div>
            <h3 style={{ color:"white", fontSize:"16px", marginBottom:"4px" }}>Powered by Experta AI Engine</h3>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", lineHeight:1.6 }}>Our rule-based AI analyzes 10 years of historical failure rates and your personal coverage data to create an optimized study schedule.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
