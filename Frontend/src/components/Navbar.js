import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);
  if (!user) return null;
  const initial = user.username?.charAt(0).toUpperCase() || "S";

  const linkStyle = (isActive, key) => ({
    display: "block", padding: "14px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textDecoration: "none",
    color: isActive || hoveredLink === key ? "#B8862E" : "rgba(255,255,255,0.45)",
    borderBottom: "1px solid rgba(255,255,255,0.07)", transition: "color 150ms", fontFamily: "'Plus Jakarta Sans', sans-serif",
  });

  return (
    <aside style={{ width: "260px", background: "#2C1810", color: "white", display: "flex", flexDirection: "column", padding: "36px 28px", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, boxSizing: "border-box" }}>
      <div style={{ marginBottom: "52px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "white", letterSpacing: "-0.3px", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>StudyFlow</h2>
      </div>
      <nav style={{ flex: 1 }}>
        <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive, "dashboard")} onMouseEnter={() => setHoveredLink("dashboard")} onMouseLeave={() => setHoveredLink(null)}>DASHBOARD</NavLink>
        <NavLink to="/view-schedule" style={({ isActive }) => linkStyle(isActive, "schedule")} onMouseEnter={() => setHoveredLink("schedule")} onMouseLeave={() => setHoveredLink(null)}>SCHEDULE</NavLink>
        <button onClick={() => { logout(); navigate("/login"); }} onMouseEnter={() => setHoveredLink("logout")} onMouseLeave={() => setHoveredLink(null)}
          style={{ ...linkStyle(false, "logout"), background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: "14px 0" }}>
          LOG OUT
        </button>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ width: "42px", height: "42px", background: "#B8862E", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "17px", color: "white", flexShrink: 0 }}>
          {initial}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "white" }}>{user.username}</p>
          <p style={{ margin: "3px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>6th Semester</p>
        </div>
      </div>
    </aside>
  );
}