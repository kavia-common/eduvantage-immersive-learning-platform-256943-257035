/**
 * App routes using React Router v6.
 * Defines core pages and lazy loading boundaries.
 */
import React, { lazy } from "react";
import { Navigate } from "react-router-dom";

const Home = lazy(() => import("../views/Home"));
const Dashboard = lazy(() => import("../views/Dashboard"));
const Classroom = lazy(() => import("../views/Classroom"));
const Analytics = lazy(() => import("../views/Analytics"));
const Profile = lazy(() => import("../views/Profile"));
const Settings = lazy(() => import("../views/Settings"));
const NotFound = lazy(() => import("../views/NotFound"));

// PUBLIC_INTERFACE
export const routes = [
  { path: "/", element: <Home />, label: "Home", icon: "🏠" },
  { path: "/dashboard", element: <Dashboard />, label: "Dashboard", icon: "📊" },
  { path: "/classroom", element: <Classroom />, label: "Classroom", icon: "🎓" },
  { path: "/analytics", element: <Analytics />, label: "Analytics", icon: "📈" },
  { path: "/profile", element: <Profile />, label: "Profile", icon: "👤" },
  { path: "/settings", element: <Settings />, label: "Settings", icon: "⚙️" },
  { path: "/home", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFound />, label: "Not Found" },
];

// PUBLIC_INTERFACE
export const navRoutes = routes.filter(r => r.label && r.path && !["/home", "*"].includes(r.path));
