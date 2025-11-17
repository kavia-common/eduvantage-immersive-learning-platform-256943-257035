import React from "react";
import { AnalyticsProvider } from "../state/analyticsSlice";
import AnalyticsDashboard from "../components/analytics/AnalyticsDashboard";

/**
 * PUBLIC_INTERFACE
 * Analytics - authenticated analytics module with mock charts and realtime placeholders.
 * Wraps AnalyticsDashboard with AnalyticsProvider to supply state slice.
 */
export default function Analytics() {
  return (
    <div className="container">
      <AnalyticsProvider>
        <AnalyticsDashboard />
      </AnalyticsProvider>
    </div>
  );
}
