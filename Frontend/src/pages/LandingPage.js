import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: "fa-solid fa-calendar-days", title: "Schedule", desc: "Organize your week for better studying." },
    { icon: "fa-solid fa-bookmark", title: "Subjects", desc: "All your subjects, sorted to make studying easier." },
    { icon: "fa-solid fa-clock-rotate-left", title: "Reminders", desc: "Never miss assignments, exams, or deadlines." },
    { icon: "fa-solid fa-list-check", title: "Tasks", desc: "Keep your semester on track by organizing tasks easily." },
  ];

  return (
    <>
      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; overflow-x: hidden; box-sizing: border-box; }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>

        {/* NAV */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", background: "white", borderBottom: "1px solid #EEE9E0", position: "sticky", top: 0, zIndex: 100, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fa-solid fa-book-open-reader" style={{ fontSize: "22px", color: "#B8862E" }} />
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#2C1810", letterSpacing: "-0.5px" }}>Smart Semester Planner</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", fontSize: "15px", fontWeight: 500, color: "#2C1810", cursor: "pointer", fontFamily: "inherit" }}>Login</button>
            <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Join Now</button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight: "calc(100vh - 61px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 48px", textAlign: "center", background: "linear-gradient(180deg, #FFFFFF 0%, #EDE0CC 100%)", width: "100%" }}>
          <h1 style={{ fontSize: "clamp(42px, 5vw, 66px)", fontWeight: 900, color: "#2C1810", lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-2px", maxWidth: "700px" }}>
            Master Your <span style={{ color: "#B8862E" }}>Semester</span><br />With AI Precision.
          </h1>
          <p style={{ fontSize: "17px", color: "#6B5A4E", maxWidth: "560px", lineHeight: 1.7, margin: "0 0 36px" }}>
            Stop guessing. Our AI analyzes your deadlines and study habits to build the perfect, stress-free academic schedule.
          </p>
          <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "18px 48px", borderRadius: "10px", fontSize: "17px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Start Planning — It's Free
          </button>
        </section>

        {/* FEATURES */}
        <section style={{ padding: "80px 48px", background: "#FAF8F4", width: "100%", borderTop: "1px solid #DDD5C8" }}>
          <h2 style={{ textAlign: "center", fontSize: "30px", fontWeight: 800, color: "#2C1810", marginBottom: "40px" }}>Why use a Smart Planner?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", maxWidth: "820px", margin: "0 auto" }}>
            {features.map(f => (
              <div key={f.title} style={{ background: "white", borderRadius: "16px", padding: "28px 24px", border: "1px solid #EEE9E0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <i className={f.icon} style={{ fontSize: "20px", color: "#B8862E" }} />
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2C1810", margin: 0 }}>{f.title}</h3>
                </div>
                <p style={{ fontSize: "13px", color: "#6B5A4E", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#2C1810", padding: "52px 0", textAlign: "center", width: "100%", display: "block" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0 }}>2026 Smart Semester Planner | Crafted for Academic Excellence</p>
        </footer>

      </div>
    </>
  );
}
