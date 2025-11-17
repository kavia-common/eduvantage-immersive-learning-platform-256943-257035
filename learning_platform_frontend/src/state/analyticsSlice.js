"use strict";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { logger } from "../services/logger";
import { wsClient } from "../services/wsClient";
import { supabase } from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * AnalyticsContext provides a lightweight state slice for analytics dashboards.
 * It contains:
 * - loading: boolean
 * - error: string | null
 * - metrics: array of metric cards
 * - trends: array of { label, value } for line-like mock
 * - distribution: array of { label, value } for bar-like mock
 * - refresh: re-fetch mock analytics
 *
 * Realtime placeholders:
 * - A WebSocket listener for "analytics:update"
 * - A Supabase channel subscription placeholder (commented for future schema)
 */

export const AnalyticsContext = createContext({
  loading: true,
  error: null,
  metrics: [],
  trends: [],
  distribution: [],
  refresh: async () => {},
});

// PUBLIC_INTERFACE
export function useAnalytics() {
  /**
   * Hook to access analytics state slice.
   */
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return ctx;
}

// Simulated network request for mock analytics data
async function fetchMockAnalytics() {
  await new Promise((r) => setTimeout(r, 600));
  const today = new Date();
  // 7-day trends mock
  const trends = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: Math.floor(50 + Math.random() * 50),
    };
  });

  const distribution = [
    { label: "Reading", value: Math.floor(20 + Math.random() * 30) },
    { label: "Practice", value: Math.floor(30 + Math.random() * 40) },
    { label: "Quizzes", value: Math.floor(10 + Math.random() * 20) },
    { label: "Projects", value: Math.floor(5 + Math.random() * 15) },
  ];

  const metrics = [
    { id: "studyTime", label: "Weekly Study Time", value: `${(6 + Math.random() * 3).toFixed(1)} hrs`, delta: "+18%" },
    { id: "accuracy", label: "Quiz Accuracy", value: `${(72 + Math.random() * 10).toFixed(0)}%`, delta: "+9%" },
    { id: "streak", label: "Learning Streak", value: `${Math.floor(3 + Math.random() * 10)} days`, delta: "↗" },
  ];

  return { trends, distribution, metrics };
}

// PUBLIC_INTERFACE
export function AnalyticsProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchMockAnalytics();
      if (!mountedRef.current) return;
      setTrends(data.trends);
      setDistribution(data.distribution);
      setMetrics(data.metrics);
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
      logger.warn("Analytics load failed", { message: msg });
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Realtime placeholders: WS + Supabase
  useEffect(() => {
    mountedRef.current = true;
    load();

    // WebSocket: listen for analytics:update to refresh data
    const offWs = wsClient.on("message", (evt) => {
      try {
        const data = typeof evt?.data === "string" ? JSON.parse(evt.data) : evt?.data;
        if (data?.type === "analytics:update") {
          // Best-effort refresh on updates
          load();
        }
      } catch {
        // ignore parse errors
      }
    });

    // Supabase Realtime placeholder:
    // NOTE: Uncomment and adjust with proper schema/table when available.
    // const channel = supabase
    //   .channel("realtime:analytics")
    //   .on(
    //     "postgres_changes",
    //     { event: "*", schema: "public", table: "analytics_events" },
    //     (_payload) => {
    //       load();
    //     }
    //   )
    //   .subscribe();

    return () => {
      mountedRef.current = false;
      try { offWs && offWs(); } catch {}
      try {
        // channel && supabase.removeChannel(channel);
      } catch {}
    };
  }, [load]);

  const value = useMemo(
    () => ({
      loading,
      error,
      metrics,
      trends,
      distribution,
      refresh: load,
    }),
    [loading, error, metrics, trends, distribution, load]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
