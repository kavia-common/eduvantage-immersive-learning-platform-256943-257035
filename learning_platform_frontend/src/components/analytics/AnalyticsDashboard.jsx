import React from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { useAnalytics } from "../../state/analyticsSlice";
import { LineChart, BarChart, EmptyChartState } from "./Charts";

/**
 * PUBLIC_INTERFACE
 * AnalyticsDashboard - renders analytics overview with mock charts.
 * Sections:
 * - KPI metric cards
 * - Trends (LineChart)
 * - Activity distribution (BarChart)
 * Includes:
 * - loading/empty/error states
 * - manual refresh action
 */
export default function AnalyticsDashboard() {
  const { loading, error, metrics, trends, distribution, refresh } = useAnalytics();

  if (loading) {
    return (
      <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <span aria-busy="true">⏳</span>
            <div>Loading analytics...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
        <Card>
          <div style={{ color: "var(--color-error)", marginBottom: ".5rem" }}>Failed to load analytics: {error}</div>
          <Button onClick={refresh}>Retry</Button>
        </Card>
      </div>
    );
  }

  const isEmpty = (!metrics || metrics.length === 0) && (!trends || trends.length === 0) && (!distribution || distribution.length === 0);

  if (isEmpty) {
    return (
      <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
        <Card>
          <h2>Analytics</h2>
          <EmptyChartState message="No analytics yet. Start learning to see insights!" />
          <div className="mt-3">
            <Button onClick={refresh}>Refresh</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <h2>Analytics</h2>
            <p className="mt-2" style={{ color: "var(--color-muted)" }}>
              Track performance with insights and trends.
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button variant="secondary" onClick={refresh}>Refresh</Button>
          </div>
        </div>
      </Card>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {metrics.map((m) => (
          <Card key={m.id}>
            <div style={{ fontSize: ".9rem", color: "var(--color-muted)" }}>{m.label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: ".25rem" }}>{m.value}</div>
            <div style={{ marginTop: ".25rem", color: "var(--color-primary)" }}>{m.delta}</div>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", marginBottom: ".5rem" }}>
            <div style={{ fontWeight: 700 }}>Weekly Trend</div>
            <div style={{ marginLeft: "auto", color: "var(--color-muted)" }}>Last 7 days</div>
          </div>
          <LineChart data={trends} height={220} />
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", marginBottom: ".5rem" }}>
            <div style={{ fontWeight: 700 }}>Activity Distribution</div>
            <div style={{ marginLeft: "auto", color: "var(--color-muted)" }}>By learning type</div>
          </div>
          <BarChart data={distribution} height={220} />
        </Card>
      </div>
    </div>
  );
}
