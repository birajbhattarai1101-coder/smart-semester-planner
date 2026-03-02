import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAF8F4", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", background: "white", borderBottom: "1px solid #EEE9E0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>📖</span>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#2C1810" }}>Smart Semester Planner</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: 500, color: "#2C1810", cursor: "pointer", fontFamily: "inherit" }}>Login</button>
          <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "10px 22px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Join Now</button>
        </div>
      </nav>
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 48px 80px", textAlign: "center", background: "linear-gradient(180deg, #FAF8F4 0%, #F0E9DC 100%)" }}>
        <h1 style={{ fontSize: "clamp(44px, 6vw, 74px)", fontWeight: 900, color: "#2C1810", lineHeight: 1.05, marginBottom: "22px", maxWidth: "780px", letterSpacing: "-1px" }}>
          Master Your <span style={{ color: "#B8862E" }}>Semester</span><br />With AI Precision.
        </h1>
        <p style={{ fontSize: "16px", color: "#6B5A4E", maxWidth: "500px", lineHeight: 1.7, marginBottom: "40px" }}>
          Stop guessing. Our AI analyzes your deadlines and study habits to build the perfect, stress-free academic schedule.
        </p>
        <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "16px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Start Planning — Its Free
        </button>
      </section>
      <section style={{ padding: "80px 48px", background: "#FAF8F4" }}>
        <h2 style={{ textAlign: "center", fontSize: "30px", fontWeight: 800, color: "#2C1810", marginBottom: "48px" }}>Why use a Smart Planner?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", maxWidth: "1100px", margin: "0 auto" }}>
          {[
            { icon: "fa-calendar-days", title: "Schedule", desc: "Organize your week for better studying." },
            { icon: "fa-book-bookmark", title: "Subjects", desc: "All your subjects, sorted to make studying easier." },
            { icon: "fa-clock-rotate-left", title: "Reminders", desc: "Never miss assignments, exams, or deadlines." },
            { icon: "fa-list-check", title: "Tasks", desc: "Keep your semester on track by organizing tasks easily." },
          ].map(f => (
            <div key={f.title} style={{ background: "white", borderRadius: "16px", padding: "28px 24px", border: "1px solid #EEE9E0" }}>
              <i className={"fa-solid " + f.icon} style={{ fontSize: "22px", color: "#B8862E", marginBottom: "14px", display: "block" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2C1810", marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ fontSize: "13px", color: "#6B5A4E", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ background: "#2C1810", padding: "28px 48px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0 }}>2026 Smart Semester Planner | Crafted for Academic Excellence</p>
      </footer>
    </div>
  );
}
