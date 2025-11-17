"use strict";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../services/apiClient";
import { logger } from "../services/logger";

/**
 * PUBLIC_INTERFACE
 * WellbeingContext - provides mental health UI state and actions.
 *
 * State:
 * - moodHistory: Array<{ date: string (YYYY-MM-DD), mood: number (1-5), notes?: string }>
 * - loading: boolean
 * - error: string|null
 *
 * Actions:
 * - submitMood({ mood, notes })
 * - fetchTrend()
 *
 * Privacy: We do not log notes or sensitive data. All logs are generic.
 */

// PUBLIC_INTERFACE
export const WellbeingContext = createContext({
  moodHistory: [],
  loading: true,
  error: null,
  submitMood: async (_payload) => {},
  fetchTrend: async () => {},
});

// PUBLIC_INTERFACE
export function useWellbeing() {
  /**
   * Hook to access wellbeing state and actions.
   */
  const ctx = useContext(WellbeingContext);
  if (!ctx) throw new Error("useWellbeing must be used within WellbeingProvider");
  return ctx;
}

/** Returns YYYY-MM-DD string for a Date or now */
function toDateKey(d = new Date()) {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${da}`;
}

// Mock helpers if backend not available.
async function fetchMockTrend() {
  await new Promise((r) => setTimeout(r, 300));
  const today = new Date();
  // last 14 days random mood trend 1..5
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    return {
      date: toDateKey(d),
      mood: 1 + Math.floor(Math.random() * 5),
      notes: "",
    };
  });
  return days;
}

async function postMockMood(payload) {
  await new Promise((r) => setTimeout(r, 200));
  const dkey = toDateKey(new Date());
  return { date: dkey, mood: payload.mood, notes: payload.notes || "" };
}

// PUBLIC_INTERFACE
export function WellbeingProvider({ children }) {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchTrend = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      // Try real API; fallback to mock data
      const data =
        (await (async () => {
          try {
            return await apiClient.get("/api/wellbeing/trend");
          } catch (e) {
            logger.warn("Wellbeing trend GET fallback to mock", { message: String(e?.message || e) });
            return await fetchMockTrend();
          }
        })()) || [];

      if (!mountedRef.current) return;
      // Normalize and bound mood range [1..5]
      const normalized = (Array.isArray(data) ? data : []).map((e) => ({
        date: String(e.date || toDateKey()),
        mood: Math.min(5, Math.max(1, Number(e.mood || 3))),
        notes: typeof e.notes === "string" ? e.notes : "",
      }));
      setMoodHistory(normalized);
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const submitMood = useCallback(async ({ mood, notes }) => {
    /**
     * PUBLIC_INTERFACE
     * Submit today's mood. This optimistically updates local state.
     * No sensitive data (like full notes) is logged to console or analytics.
     */
    if (!mood || Number.isNaN(Number(mood))) return;
    const value = Math.min(5, Math.max(1, Number(mood)));
    const todayKey = toDateKey(new Date());

    // Optimistic update (notes stored locally in state; not logged)
    const optimistic = { date: todayKey, mood: value, notes: notes || "" };
    setMoodHistory((prev) => {
      const others = prev.filter((e) => e.date !== todayKey);
      return [...others, optimistic].sort((a, b) => (a.date < b.date ? -1 : 1));
    });

    try {
      // Attempt API; fallback to mock transform
      const created = await (async () => {
        try {
          return await apiClient.post("/api/wellbeing/mood", { mood: value, notes: notes || "" });
        } catch (e) {
          // Do NOT log notes; keep privacy
          logger.warn("Wellbeing mood POST fallback to mock", {});
          return await postMockMood({ mood: value, notes });
        }
      })();

      // Reconcile if API returns canonical record
      if (created && created.date) {
        setMoodHistory((prev) => {
          const others = prev.filter((e) => e.date !== created.date);
          return [...others, { date: created.date, mood: Math.min(5, Math.max(1, Number(created.mood || value))), notes: typeof created.notes === "string" ? created.notes : (notes || "") }].sort((a, b) => (a.date < b.date ? -1 : 1));
        });
      }
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
      // Best-effort: keep optimistic value; do not remove to avoid losing user's entry
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchTrend();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchTrend]);

  const value = useMemo(
    () => ({
      moodHistory,
      loading,
      error,
      submitMood,
      fetchTrend,
    }),
    [moodHistory, loading, error, submitMood, fetchTrend]
  );

  return <WellbeingContext.Provider value={value}>{children}</WellbeingContext.Provider>;
}
