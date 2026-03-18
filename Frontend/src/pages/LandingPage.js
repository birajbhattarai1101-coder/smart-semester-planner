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
        html, body, #root {
          margin: 0; padding: 0;
          width: 100%; height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        *, *::before, *::after { box-sizing: border-box; }

        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 70px;
          background: white;
          border-bottom: 1px solid #EEE9E0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 60px;
          z-index: 100;
        }

        .pages {
          position: fixed;
          top: 70px; left: 0; right: 0; bottom: 0;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
        }
        .pages::-webkit-scrollbar { display: none; }

        .page {
          height: calc(100vh - 70px);
          scroll-snap-align: start;
          scroll-snap-stop: always;
          flex-shrink: 0;
          overflow: hidden;
        }

        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 28px 24px;
          border: 1px solid #EEE9E0;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          border-color: #B8862E;
          box-shadow: 0 12px 28px rgba(184,134,46,0.12);
        }
      `}</style>

      {/* FIXED NAV */}
      <nav className="nav">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="fa-solid fa-book-open-reader" style={{ fontSize: "26px", color: "#B8862E" }} />
          <span style={{ fontSize: "26px", fontWeight: 900, color: "#2C1810", letterSpacing: "-0.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Smart Semester Planner</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", fontSize: "15px", fontWeight: 500, color: "#2C1810", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Login</button>
          <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "11px 26px", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Join Now</button>
        </div>
      </nav>

      {/* PAGES */}
      <div className="pages">

        {/* PAGE 1 — HERO */}
        <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 48px", textAlign: "center", background: "linear-gradient(180deg, #FFFFFF 0%, #EDE0CC 100%)" }}>
          <h1 style={{ fontSize: "clamp(42px, 5vw, 66px)", fontWeight: 900, color: "#2C1810", lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-2px", maxWidth: "700px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Master Your <span style={{ color: "#B8862E" }}>Semester</span><br />With AI Precision.
          </h1>
          <p style={{ fontSize: "17px", color: "#6B5A4E", maxWidth: "560px", lineHeight: 1.7, margin: "0 0 36px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Stop guessing. Our AI analyzes your deadlines and study habits to build the perfect, stress-free academic schedule.
          </p>
          <button onClick={() => navigate("/register")} style={{ background: "#2C1810", color: "white", border: "none", padding: "18px 48px", borderRadius: "10px", fontSize: "17px", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Start Planning — It's Free
          </button>
        </div>

        {/* PAGE 2 — FEATURES + FOOTER */}
        <div className="page" style={{ display: "flex", flexDirection: "column", background: "#FAF8F4", borderTop: "1px solid #DDD5C8" }}>

          {/* FEATURES */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "30px 48px 20px" }}>
            <h2 style={{ textAlign: "center", fontSize: "30px", fontWeight: 800, color: "#2C1810", marginBottom: "24px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Why use a Smart Planner?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", maxWidth: "820px", margin: "0 auto", width: "100%" }}>
              {features.map(f => (
                <div key={f.title} className="feature-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <i className={f.icon} style={{ fontSize: "20px", color: "#B8862E" }} />
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2C1810", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#6B5A4E", lineHeight: 1.6, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <footer style={{ background: "#2C1810", padding: "18px 0", textAlign: "center", flexShrink: 0 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>© 2026 Smart Semester Planner | Crafted for Academic Excellence</p>
          </footer>

        </div>
      </div>
    </>
  );
}