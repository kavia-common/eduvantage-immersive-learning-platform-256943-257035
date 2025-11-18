import React, { useEffect, useState } from "react";
import "./topnav.css";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { logger } from "../../services/logger";
import { isFeatureEnabled } from "../../services/featureFlags";

/**
 * Top navigation with page title, theme toggle, and user actions.
 * Adds working Profile and Settings buttons with navigation and minimal telemetry.
 */

// PUBLIC_INTERFACE
export default function TopNav({ title = "Home", onMenu }) {
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    logger.debug("topnav.theme.toggle", { nextTheme: next });
  };

  const onGoProfile = () => {
    if (!user) {
      logger.warn("topnav.profile.click.unauthenticated");
      navigate("/login");
      return;
    }
    if (isFeatureEnabled("profileDisabled")) {
      logger.info("topnav.profile.click.blocked_by_feature_flag", { flag: "profileDisabled" });
      return;
    }
    logger.info("topnav.profile.click", { userId: user?.id });
    navigate("/profile");
  };

  const onGoSettings = () => {
    if (!user) {
      logger.warn("topnav.settings.click.unauthenticated");
      navigate("/login");
      return;
    }
    if (isFeatureEnabled("settingsDisabled")) {
      logger.info("topnav.settings.click.blocked_by_feature_flag", { flag: "settingsDisabled" });
      return;
    }
    logger.info("topnav.settings.click", { userId: user?.id });
    navigate("/settings");
  };

  const onSignOut = async () => {
    try {
      logger.info("topnav.signout.click");
      await signOut();
      navigate("/");
    } catch (e) {
      logger.error("topnav.signout.error", { message: e?.message });
      // keep silent in UI
    }
  };

  return (
    <header className="lp-topnav topnav-blur gradient-bg">
      <button className="menu-btn" onClick={onMenu} aria-label="Toggle navigation">≰</button>
      <div className="title">{title}</div>
      <div className="actions">
        {user && (
          <>
            <button
              className="btn ghost"
              onClick={onGoProfile}
              aria-label="Profile"
              title="Profile"
            >
              👤 Profile
            </button>
            <button
              className="btn ghost"
              onClick={onGoSettings}
              aria-label="Settings"
              title="Settings"
            >
              ⚙️ Settings
            </button>
          </>
        )}
        <button className="btn secondary" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        {user && (
          <button className="btn" onClick={onSignOut} aria-label="Sign out" style={{ marginLeft: ".5rem" }}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
