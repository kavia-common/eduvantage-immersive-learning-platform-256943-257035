import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Loader from "../components/common/Loader";

/**
 * Wraps route elements to require authentication.
 * Redirects to /login if unauthenticated.
 */

// PUBLIC_INTERFACE
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
