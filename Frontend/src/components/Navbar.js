import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };
  if (!user) return null;
  const initial = user.username?.charAt(0).toUpperCase() || "S";
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><h2>Study<span>Flow</span></h2></div>
      <nav className="nav-menu">
        <NavLink to="/dashboard"    className={({ isActive }) => isActive ? "active" : ""}><i className="fa-solid fa-house" /> Dashboard</NavLink>
        <NavLink to="/coverage"     className={({ isActive }) => isActive ? "active" : ""}><i className="fa-solid fa-chart-pie" /> Coverage</NavLink>
        <NavLink to="/availability" className={({ isActive }) => isActive ? "active" : ""}><i className="fa-solid fa-clock" /> Availability</NavLink>
        <NavLink to="/tasks"        className={({ isActive }) => isActive ? "active" : ""}><i className="fa-solid fa-list-check" /> Tasks</NavLink>
        <NavLink to="/schedule"     className={({ isActive }) => isActive ? "active" : ""}><i className="fa-solid fa-calendar-days" /> Schedule</NavLink>
        <button onClick={handleLogout}><i className="fa-solid fa-right-from-bracket" /> Log Out</button>
      </nav>
      <div className="user-card">
        <div className="avatar">{initial}</div>
        <div className="user-info">
          <p className="user-name">{user.username}</p>
          <p className="user-role">6th Semester</p>
        </div>
      </div>
    </aside>
  );
}
