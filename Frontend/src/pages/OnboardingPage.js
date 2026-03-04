import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <style>{`html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }`}</style>
      <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* LEFT */}
        <div style={{ flex: 1, background: "#FAF8F4", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px" }}>
          <div style={{ marginBottom: "36px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#2C1810" }}>
              <span style={{ width: "8px", height: "8px", background: "#B8862E", borderRadius: "50%", display: "inline-block" }} />
              SMART SEMESTER
            </span>
          </div>
          <div style={{ marginBottom: "12px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#B8862E" }}>
            REGISTRATION COMPLETE
          </div>
          <h1 style={{ fontSize: "clamp(48px, 5vw, 68px)", fontWeight: 900, color: "#2C1810", lineHeight: 1.05, marginBottom: "20px", letterSpacing: "-2px" }}>
            Own every<br />study <span style={{ color: "#B8862E" }}>second.</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#6B5A4E", lineHeight: 1.7, marginBottom: "40px", maxWidth: "380px" }}>
            Welcome to a smarter way of learning. We've created a space where your goals meet your actual availability.
          </p>
          <button onClick={() => navigate("/dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "#2C1810", color: "white", border: "none", padding: "16px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "fit-content" }}>
            Get Started <span style={{ fontSize: "18px" }}>→</span>
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ width: "45%", background: "#2C1810", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 60px" }}>
          {[
            { phase: "PHASE 01", title: "Define Capacity", desc: "Tell us how many hours you can truly give to your studies each week.", active: true },
            { phase: "PHASE 02", title: "Sync Syllabus", desc: "Upload your assignments and labs to populate your task engine.", active: false },
            { phase: "PHASE 03", title: "Generate Schedule", desc: "Balance your day, boost your results.", active: false },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", marginBottom: i < 2 ? "32px" : "0" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: item.active ? "#B8862E" : "transparent", border: item.active ? "none" : "2px solid rgba(255,255,255,0.3)", flexShrink: 0, marginTop: "3px" }} />
                {i < 2 && <div style={{ width: "1px", flex: 1, background: "rgba(255,255,255,0.15)", margin: "8px 0" }} />}
              </div>
              <div style={{ paddingBottom: i < 2 ? "28px" : "0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#B8862E", marginBottom: "6px" }}>{item.phase}</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "white", marginBottom: "6px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
