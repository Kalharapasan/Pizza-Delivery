import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children, staffOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="empty-state">Loading&hellip;</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (staffOnly && !user.is_staff) {
    return <Navigate to="/menu" replace />;
  }

  return children;
}
