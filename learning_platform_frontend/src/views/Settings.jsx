import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/common/Card";
import { settingsService } from "../services/settingsService";
import { logger } from "../services/logger";

/**
 * PUBLIC_INTERFACE
 * Settings - authenticated settings module with persistence.
 *
 * Features:
 * - Hydrates from localStorage on mount (key: 'eduv_settings_v1')
 * - Save Changes persists current settings and shows success banner
 * - Reset to Defaults restores defaults and writes to localStorage
 * - Debounced auto-save when settings are frequently changed
 */
export default function Settings() {
  // Define initial defaults - expand as needed
  const DEFAULTS = useMemo(
    () => ({
      theme: "light", // 'light' | 'dark'
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      privacy: {
        profileVisibility: "friends", // 'public' | 'friends' | 'private'
      },
    }),
    []
  );

  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Simple debounce helper
  const debounce = (fn, delay = 400) => {
    return (...args) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => fn(...args), delay);
    };
  };

  // Debounced write via service to avoid frequent storage churn
  const debouncedPersist = useMemo(
    () =>
      debounce(async (next) => {
        const success = await settingsService.saveSettings(next);
        if (!success) {
          logger.warn("Debounced settings save failed");
        }
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Hydrate on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await settingsService.getSettings(DEFAULTS);
      if (!mounted) return;
      setSettings(loaded);
      setLoading(false);
    })();
    return () => {
      mounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [DEFAULTS]);

  // Optionally auto-persist on changes (debounced) to support background saves.
  useEffect(() => {
    if (loading) return;
    debouncedPersist(settings);
  }, [settings, loading, debouncedPersist]);

  const showSavedBanner = () => {
    setSaved(true);
    // Hide banner after a short period
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSave = async () => {
    const success = await settingsService.saveSettings(settings);
    if (success) showSavedBanner();
  };

  const handleReset = async () => {
    const next = await settingsService.resetSettings(DEFAULTS);
    setSettings(next);
    showSavedBanner();
  };

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

  const handleToggle = (path) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const [section, key] = path.split(".");
      next[section][key] = !prev[section][key];
      return next;
    });
  };

  const handleSelect = (path, val) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const [section, key] = path.split(".");
      next[section][key] = val;
      return next;
    });
  };

  return (
    <div className="container">
      <Card>
        <h2>Settings</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Configure application options and notifications.
        </p>

        {saved && (
          <div
            role="status"
            aria-live="polite"
            className="mt-3"
            style={{
              background: "var(--color-success, #F59E0B)",
              color: "white",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
            }}
            data-testid="save-success-banner"
          >
            Saved!
          </div>
        )}

        <div className="mt-4" />

        {/* Theme */}
        <section aria-labelledby="theme-heading">
          <h3 id="theme-heading">Theme</h3>
          <p className="mt-1" style={{ color: "var(--color-muted)" }}>
            Current: {settings.theme}
          </p>
          <button onClick={handleToggleTheme} className="btn mt-2" type="button">
            Toggle Theme
          </button>
        </section>

        <div className="mt-4" />

        {/* Notifications */}
        <section aria-labelledby="notif-heading">
          <h3 id="notif-heading">Notifications</h3>
          <div className="mt-2">
            <label>
              <input
                type="checkbox"
                checked={!!settings.notifications.email}
                onChange={() => handleToggle("notifications.email")}
              />{" "}
              Email
            </label>
          </div>
          <div className="mt-1">
            <label>
              <input
                type="checkbox"
                checked={!!settings.notifications.sms}
                onChange={() => handleToggle("notifications.sms")}
              />{" "}
              SMS
            </label>
          </div>
          <div className="mt-1">
            <label>
              <input
                type="checkbox"
                checked={!!settings.notifications.push}
                onChange={() => handleToggle("notifications.push")}
              />{" "}
              Push
            </label>
          </div>
        </section>

        <div className="mt-4" />

        {/* Privacy */}
        <section aria-labelledby="privacy-heading">
          <h3 id="privacy-heading">Privacy</h3>
          <label className="mt-2">
            Profile visibility:{" "}
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSelect("privacy.profileVisibility", e.target.value)}
            >
              <option value="public">Public</option>
              <option value="friends">Friends</option>
              <option value="private">Private</option>
            </select>
          </label>
        </section>

        <div className="mt-4" />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn" type="button" onClick={handleSave}>
            Save Changes
          </button>
          <button className="btn" type="button" onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>
      </Card>
    </div>
  );
}
