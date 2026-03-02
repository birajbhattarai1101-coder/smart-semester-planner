import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ flex: 1, background: "#FAF8F4", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 80px" }}>
        <div style={{ marginBottom: "48px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#2C1810" }}>
            <span style={{ width: "8px", height: "8px", background: "#B8862E", borderRadius: "50%", display: "inline-block" }} />
            SMART SEMESTER
          </span>
        </div>
        <div style={{ marginBottom: "16px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#B8862E" }}>
          REGISTRATION COMPLETE
        </div>
        <h1 style={{ fontSize: "clamp(52px, 5vw, 72px)", fontWeight: 900, color: "#2C1810", lineHeight: 1.05, marginBottom: "24px", letterSpacing: "-2px" }}>
          Own every<br />study <span style={{ color: "#B8862E" }}>second.</span>
        </h1>
        <p style={{ fontSize: "16px", color: "#6B5A4E", lineHeight: 1.7, marginBottom: "48px", maxWidth: "420px" }}>
          Welcome to a smarter way of learning. We've created a space where your goals meet your actual availability.
        </p>
        <button onClick={() => navigate("/dashboard")}
          style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "#2C1810", color: "white", border: "none", padding: "16px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "fit-content" }}>
          Get Started <span style={{ fontSize: "18px" }}>→</span>
        </button>
      </div>

      <div style={{ width: "45%", background: "#2C1810", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 60px" }}>
        {[
          { phase: "PHASE 01", title: "Define Capacity", desc: "Tell us how many hours you can truly give to your studies each week.", active: true },
          { phase: "PHASE 02", title: "Sync Syllabus", desc: "Upload your assignments and labs to populate your task engine.", active: false },
          { phase: "PHASE 03", title: "Generate Schedule", desc: "Balance your day, boost your results.", active: false },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "20px", marginBottom: i < 2 ? "40px" : "0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: item.active ? "#B8862E" : "transparent", border: item.active ? "none" : "2px solid rgba(255,255,255,0.3)", flexShrink: 0, marginTop: "3px" }} />
              {i < 2 && <div style={{ width: "1px", flex: 1, background: "rgba(255,255,255,0.15)", margin: "8px 0" }} />}
            </div>
            <div style={{ paddingBottom: i < 2 ? "32px" : "0" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#B8862E", marginBottom: "6px" }}>{item.phase}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "white", marginBottom: "8px" }}>{item.title}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
