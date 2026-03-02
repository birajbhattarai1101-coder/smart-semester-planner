import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CoveragePage from "./pages/CoveragePage";
import AvailabilityPage from "./pages/AvailabilityPage";
import TasksPage from "./pages/TasksPage";
import SchedulePage from "./pages/SchedulePage";
import "./styles/global.css";

function AppLayout({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  return <div className="app-layout"><Navbar />{children}</div>;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/coverage"     element={<ProtectedRoute><CoveragePage /></ProtectedRoute>} />
            <Route path="/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
            <Route path="/tasks"        element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/schedule"     element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
