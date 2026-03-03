import React, { createContext, useContext, useState } from "react";
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
  const logout = () => {
    setUser(null);
    setLoginStatus(null);
    localStorage.removeItem("ssp_user");
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loginStatus, setLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
