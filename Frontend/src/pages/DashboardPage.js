import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const steps = [
  { number: "01", title: "Subject Coverage", description: "Tell us how much of each subject you have covered so far.", link: "/coverage", icon: "📖" },
  { number: "02", title: "Weekly Availability", description: "Enter how many hours you can study each day this week.", link: "/availability", icon: "🗓" },
  { number: "03", title: "Tasks & Deadlines", description: "Add your assignments and labs with their deadlines.", link: "/tasks", icon: "📝" },
  { number: "04", title: "Your Schedule", description: "Generate your AI-powered personalised study schedule.", link: "/schedule", icon: "✨" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="main-content">
      <div className="page-header animate-fadeUp">
        <div className="page-header-eyebrow">Dashboard</div>
        <h1>Welcome back, <em>{user?.username}</em></h1>
        <p>Follow the four steps below to generate your personalised AI-powered semester study schedule.</p>
      </div>
      <div className="ornament animate-fadeIn delay-1">— ✦ —</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
        {steps.map((step, i) => (
          <Link key={step.number} to={step.link} style={{ textDecoration: "none" }} className={"animate-fadeUp delay-" + (i + 2)}>
            <div className="card" style={{ height: "100%", cursor: "pointer", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-book)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ position: "absolute", top: "-10px", right: "-5px", fontFamily: "var(--font-display)", fontSize: "5rem", fontWeight: 300, color: "var(--beige)", lineHeight: 1, userSelect: "none" }}>{step.number}</div>
              <div style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{step.icon}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" }}>Step {step.number}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 500, color: "var(--brown-deep)", marginBottom: "0.6rem" }}>{step.title}</div>
              <p style={{ fontSize: "0.83rem", color: "var(--beige-dark)", lineHeight: 1.6, fontWeight: 300 }}>{step.description}</p>
              <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown)" }}>Begin →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
