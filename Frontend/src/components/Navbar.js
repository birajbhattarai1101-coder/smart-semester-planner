import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        Smart <span>Semester</span> Planner
      </Link>
      {user && (
        <ul className="navbar-links">
          <li><Link to="/coverage" style={{ color: isActive("/coverage") ? "var(--brown)" : undefined }}>Coverage</Link></li>
          <li><Link to="/availability" style={{ color: isActive("/availability") ? "var(--brown)" : undefined }}>Availability</Link></li>
          <li><Link to="/tasks" style={{ color: isActive("/tasks") ? "var(--brown)" : undefined }}>Tasks</Link></li>
          <li><Link to="/schedule" style={{ color: isActive("/schedule") ? "var(--brown)" : undefined }}>Schedule</Link></li>
        </ul>
      )}
      <div className="navbar-user">
        <span className="navbar-username">✦ {user?.username}</span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  );
}
