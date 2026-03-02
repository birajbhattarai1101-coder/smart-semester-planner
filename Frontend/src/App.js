import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CoveragePage from "./pages/CoveragePage";
import AvailabilityPage from "./pages/AvailabilityPage";
import TasksPage from "./pages/TasksPage";
import SchedulePage from "./pages/SchedulePage";
import "./styles/global.css";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();
  return (
    <div className="page-wrapper">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/coverage" element={<ProtectedRoute><CoveragePage /></ProtectedRoute>} />
        <Route path="/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const isLogin = location.pathname === "/";
  return (
    <div className="app-container">
      {user && !isLogin && <Navbar />}
      <AnimatedRoutes />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
