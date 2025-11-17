import React, { useEffect, useState } from "react";
import "./topnav.css";

/**
 * Top navigation with page title placeholder and theme toggle.
 */

// PUBLIC_INTERFACE
export default function TopNav({ title = "Home", onMenu }) {
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <header className="lp-topnav topnav-blur gradient-bg">
      <button className="menu-btn" onClick={onMenu} aria-label="Toggle navigation">☰</button>
      <div className="title">{title}</div>
      <div className="actions">
        <button className="btn secondary" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </header>
  );
}
