 /**
  * App routes using React Router v6.
  * Defines core pages and lazy loading boundaries.
  * Ensures protected pages are gated and common components are used.
  */
import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

const Home = lazy(() => import("../views/Home"));
const Dashboard = lazy(() => import("../views/Dashboard"));
const Classroom = lazy(() => import("../views/Classroom"));
const Analytics = lazy(() => import("../views/Analytics"));
const Profile = lazy(() => import("../views/Profile"));
const Settings = lazy(() => import("../views/Settings"));
const NotFound = lazy(() => import("../views/NotFound"));
const Login = lazy(() => import("../views/Login"));
const Signup = lazy(() => import("../views/Signup"));
const OAuthCallback = lazy(() => import("../views/OAuthCallback"));

/**
 * PUBLIC_INTERFACE
 * Exported list of route definitions consumed by <App />.
 * - label is used for sidebar and TopNav title
 * - icon is displayed in the Sidebar
 */
export const routes = [
  // Core public page
  { path: "/", element: <Home />, label: "Home", icon: "🏠" },

  // Core protected modules
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    label: "Dashboard",
    icon: "📊",
  },
  {
    path: "/classroom",
    element: (
      <ProtectedRoute>
        <Classroom />
      </ProtectedRoute>
    ),
    label: "Classroom",
    icon: "🎓",
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
    label: "Analytics",
    icon: "📈",
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    label: "Profile",
    icon: "👤",
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
    label: "Settings",
    icon: "⚙️",
  },

  // Auth routes (not in sidebar)
  { path: "/login", element: <Login />, label: "Login" },
  { path: "/signup", element: <Signup />, label: "Signup" },
  { path: "/auth/callback", element: <OAuthCallback />, label: "OAuth Callback" },

  // Aliases and 404
  { path: "/home", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFound />, label: "Not Found" },
];

/**
 * PUBLIC_INTERFACE
 * Filtered routes used in the sidebar navigation (excludes auth/utility routes).
 */
export const navRoutes = routes.filter(
  (r) => r.label && r.path && !["/home", "*", "/login", "/signup", "/auth/callback"].includes(r.path)
);
