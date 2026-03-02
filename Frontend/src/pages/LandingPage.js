import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAF8F4", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px", background: "white", borderBottom: "1px solid #EEE9E0", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px", lineHeight: 1 }}>📖</span>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "#2C1810", letterSpacing: "-0.3px" }}>Smart Semester Planner</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", fontSize: "15px", fontWeight: 500, color: "#2C1810", cursor: "pointer", fontFamily: "inherit" }}>Login</button>
          <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "11px 26px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Join Now</button>
        </div>
      </nav>
      <section style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 48px 100px", textAlign: "center", background: "linear-gradient(180deg, #FAF8F4 0%, #F0E8D8 100%)" }}>
        <h1 style={{ fontSize: "clamp(52px, 7vw, 82px)", fontWeight: 900, color: "#2C1810", lineHeight: 1.08, marginBottom: "24px", maxWidth: "820px", letterSpacing: "-2px" }}>
          Master Your <span style={{ color: "#B8862E" }}>Semester</span> With AI Precision.
        </h1>
        <p style={{ fontSize: "17px", color: "#6B5A4E", maxWidth: "520px", lineHeight: 1.7, marginBottom: "44px" }}>
          Stop guessing. Our AI analyzes your deadlines and study habits to build the perfect, stress-free academic schedule.
        </p>
        <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "18px 44px", borderRadius: "10px", fontSize: "17px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Start Planning — It's Free
        </button>
      </section>
      <section style={{ padding: "80px 48px", background: "#FAF8F4" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 800, color: "#2C1810", marginBottom: "48px" }}>Why use a Smart Planner?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", maxWidth: "1100px", margin: "0 auto" }}>
          {[
            { icon: "📅", title: "Schedule", desc: "Organize your week for better studying." },
            { icon: "📚", title: "Subjects", desc: "All your subjects, sorted to make studying easier." },
            { icon: "⏰", title: "Reminders", desc: "Never miss assignments, exams, or deadlines." },
            { icon: "✅", title: "Tasks", desc: "Keep your semester on track by organizing tasks easily." },
          ].map(f => (
            <div key={f.title} style={{ background: "white", borderRadius: "16px", padding: "28px 24px", border: "1px solid #EEE9E0" }}>
              <div style={{ fontSize: "28px", marginBottom: "14px" }}>{f.icon}</div>
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
