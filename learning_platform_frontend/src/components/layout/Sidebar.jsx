import React from "react";
import { NavLink } from "react-router-dom";
import { navRoutes } from "../../routes";
import "./sidebar.css";

/**
 * Sidebar navigation with minimal, modern aesthetic.
 * Highlights active route and supports collapse on small screens via parent state.
 */

// PUBLIC_INTERFACE
export default function Sidebar({ collapsed = false, onToggle }) {
  return (
    <aside className={`lp-sidebar surface ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="logo">🌊</div>
        {!collapsed && <div className="name">EduVantage</div>}
        <button className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <nav className="nav">
        {navRoutes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            end={r.path === "/"}
            aria-current={({ isActive }) => (isActive ? "page" : undefined)}
          >
            <span className="icon" aria-hidden="true">{r.icon}</span>
            {!collapsed && <span>{r.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
