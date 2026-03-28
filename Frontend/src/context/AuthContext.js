import React, { createContext, useContext, useState, useEffect, useRef } from "react";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ssp_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loginStatus, setLoginStatus] = useState(null);

  const login = (username, status = null) => {
    const userData = { username };
    setUser(userData);
    setLoginStatus(status);
    localStorage.setItem("ssp_user", JSON.stringify(userData));
  };
  const [weekEndMessage, setWeekEndMessage] = useState(false);
  const timerRef = useRef(null);
  const API_BASE = "https://smart-planner-backend.onrender.com/api";

  const logout = () => {
    setUser(null);
    setLoginStatus(null);
    localStorage.removeItem("ssp_user");
  };

  const clearUserData = async (username) => {
    try { await fetch(`${API_BASE}/tasks/clear/${username}`, { method: "DELETE" }); } catch {}
    try { await fetch(`${API_BASE}/coverage/${username}`, { method: "DELETE" }); } catch {}
    try { await fetch(`${API_BASE}/availability/${username}`, { method: "DELETE" }); } catch {}
    localStorage.removeItem("sf_checked_" + username);
    localStorage.removeItem("sf_coverage_" + username);
    localStorage.removeItem("sf_selected_" + username);
  };

  const getMsUntilTuesdayMidnight = () => {
    const now = new Date();
    const target = new Date();
    const daysUntilTuesday = (2 - now.getDay() + 7) % 7 || 7;
    target.setDate(now.getDate() + daysUntilTuesday);
    target.setHours(23, 59, 0, 0);
    return target.getTime() - now.getTime();
  };

  useEffect(() => {
    if (!user) return;
    const ms = getMsUntilTuesdayMidnight();
    timerRef.current = setTimeout(async () => {
      try {
        const schedRes = await fetch(`${API_BASE}/schedule/previous/${user.username}`);
        const schedJson = await schedRes.json();
        const currentSchedule = schedJson?.data?.schedule;
        if (currentSchedule && currentSchedule.length > 0) {
          await fetch(`${API_BASE}/schedule/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.username, schedule_data: { schedule: currentSchedule } })
          });
        }
      } catch {}
      await clearUserData(user.username);
      setWeekEndMessage(true);
      setTimeout(() => { setWeekEndMessage(false); logout(); }, 3000);
    }, ms);
    return () => clearTimeout(timerRef.current);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loginStatus, setLoginStatus }}>
      {children}
      {weekEndMessage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,24,16,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ textAlign: "center", color: "white", padding: "40px" }}>
            <div style={{ fontSize: "52px", marginBottom: "20px" }}>&#127769;</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Week Complete!</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>Your schedule has been archived.<br />See you on Wednesday for a fresh week!</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
