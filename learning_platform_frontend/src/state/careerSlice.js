"use strict";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiClient } from "../services/apiClient";
import { logger } from "../services/logger";

/**
 * PUBLIC_INTERFACE
 * CareerContext - provides state and actions for Career Path AI module.
 *
 * State:
 * - preferences: object with user-selected career preferences
 * - recommendations: array of recommendation items
 * - loading: boolean
 * - error: string|null
 *
 * Actions:
 * - submitPreferences(prefs)
 * - fetchRecommendations()
 *
 * API Endpoints (placeholders, relative to REACT_APP_API_BASE when set):
 * - POST /api/career/preferences
 * - GET  /api/career/recommendations
 */

export const CareerContext = createContext({
  preferences: null,
  recommendations: [],
  loading: false,
  error: null,
  submitPreferences: async (_prefs) => {},
  fetchRecommendations: async () => {},
});

// PUBLIC_INTERFACE
export function useCareer() {
  /**
   * Hook to access career state and actions.
   */
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("useCareer must be used within CareerProvider");
  return ctx;
}

/** Mock helpers if backend not available */
async function mockSubmitPreferences(prefs) {
  await new Promise((r) => setTimeout(r, 350));
  return { ok: true, saved: { ...prefs } };
}

async function mockFetchRecommendations(prefs) {
  await new Promise((r) => setTimeout(r, 450));
  // create simple mock recs based on interests/time
  const base = (prefs?.interests || []).slice(0, 2);
  const time = Number(prefs?.weeklyHours || 5);
  const difficulty = prefs?.level || "Beginner";
  const tracks = [
    {
      id: "rec-1",
      title: `${base[0] || "Software"} Foundations`,
      summary:
        "A guided track focusing on fundamentals with hands-on projects and mentorship.",
      level: difficulty,
      estHoursPerWeek: Math.max(3, Math.min(10, time)),
      outcomes: ["Portfolio project", "Interviews prep basics", "Foundational skills"],
      tags: [base[0] || "Software", "Foundations", "Career"],
    },
    {
      id: "rec-2",
      title: `${base[1] || "Data"} Career Accelerator`,
      summary:
        "Applied learning path with practical challenges and analytics tooling.",
      level: difficulty === "Advanced" ? "Intermediate" : "Beginner",
      estHoursPerWeek: Math.max(4, Math.min(12, time + 2)),
      outcomes: ["Real-world case studies", "Networking tips", "Resume alignment"],
      tags: [base[1] || "Data", "Analytics", "Projects"],
    },
    {
      id: "rec-3",
      title: "Career Readiness Essentials",
      summary:
        "Short modules for resume, portfolio, and interview readiness tailored to your goals.",
      level: "All",
      estHoursPerWeek: Math.max(2, Math.min(6, Math.round(time / 2))),
      outcomes: ["Resume review", "Mock interviews", "LinkedIn optimization"],
      tags: ["Soft Skills", "Interview", "Portfolio"],
    },
  ];
  return { items: tracks };
}

// PUBLIC_INTERFACE
export function CareerProvider({ children, autoLoad = true }) {
  const [preferences, setPreferences] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const submitPreferences = useCallback(async (prefs) => {
    /**
     * PUBLIC_INTERFACE
     * Submit career preferences to backend, falling back to mock when API not available.
     * Also updates local preferences state on success.
     */
    if (!prefs || typeof prefs !== "object") return;
    setError(null);
    setLoading(true);
    try {
      // Try real API
      let resp = null;
      try {
        resp = await apiClient.post("/api/career/preferences", prefs);
      } catch (e) {
        logger.warn("Career preferences POST fallback to mock", {
          message: String(e?.message || e),
        });
        resp = await mockSubmitPreferences(prefs);
      }
      if (!mountedRef.current) return;
      if (resp && (resp.ok || resp.saved)) {
        setPreferences(resp.saved || prefs);
      }
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * Fetch career recommendations based on current preferences (server-side) or local mock.
     */
    setError(null);
    setLoading(true);
    try {
      let resp = null;
      try {
        // Pass nothing; server should resolve from session/user in real impl
        resp = await apiClient.get("/api/career/recommendations");
      } catch (e) {
        logger.warn("Career recommendations GET fallback to mock", {});
        resp = await mockFetchRecommendations(preferences || {});
      }
      if (!mountedRef.current) return;
      const items = Array.isArray(resp) ? resp : resp?.items;
      setRecommendations(Array.isArray(items) ? items : []);
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [preferences]);

  useEffect(() => {
    mountedRef.current = true;
    if (autoLoad) {
      // Attempt initial load of recs (may be empty until preferences submitted)
      fetchRecommendations().catch(() => {});
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoLoad, fetchRecommendations]);

  const value = useMemo(
    () => ({
      preferences,
      recommendations,
      loading,
      error,
      submitPreferences,
      fetchRecommendations,
    }),
    [preferences, recommendations, loading, error, submitPreferences, fetchRecommendations]
  );

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}
