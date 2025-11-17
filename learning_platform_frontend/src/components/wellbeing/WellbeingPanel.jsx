import React, { useMemo } from "react";
import Card from "../common/Card";
import { useWellbeing } from "../../state/wellbeingSlice";

/**
 * PUBLIC_INTERFACE
 * WellbeingPanel - shows mood trend over time using a lightweight SVG line.
 * Uses moodHistory from WellbeingProvider and displays average + last entry.
 */
export default function WellbeingPanel() {
  const { moodHistory, loading, error, fetchTrend } = useWellbeing();

  const stats = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) return { avg: 0, last: null };
    const sum = moodHistory.reduce((acc, e) => acc + (Number(e.mood) || 0), 0);
    const avg = sum / moodHistory.length;
    const last = moodHistory[moodHistory.length - 1] || null;
    return { avg, last };
  }, [moodHistory]);

  return (
    <Card>
      <div style={{ display: "grid", gap: ".5rem" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <h3 className="mt-0">Wellbeing Trend</h3>
            <div style={{ color: "var(--color-muted)" }}>
              Track your mood over the past two weeks.
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn secondary" onClick={fetchTrend} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="surface" style={{ padding: ".5rem", color: "var(--color-error)" }}>
            Failed to load trend: {error}
          </div>
        )}

        {loading && (
          <div className="surface" style={{ padding: ".5rem" }}>
            Loading trend…
          </div>
        )}

        {!loading && (!moodHistory || moodHistory.length === 0) && (
          <div
            className="surface"
            style={{
              padding: ".75rem",
              borderStyle: "dashed",
              color: "var(--color-muted)",
            }}
          >
            No entries yet. Submit today’s mood to get started.
          </div>
        )}

        {moodHistory && moodHistory.length > 0 && (
          <>
            <Sparkline data={moodHistory} height={140} />
            <div style={{ display: "flex", gap: "1rem", color: "var(--color-muted)" }}>
              <div>Entries: <strong>{moodHistory.length}</strong></div>
              <div>Average: <strong>{stats.avg.toFixed(2)}</strong>/5</div>
              {stats.last && (
                <div>Last: <strong>{stats.last.mood}</strong>/5 ({stats.last.date})</div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function Sparkline({ data = [], height = 140 }) {
  const padding = 10;
  const width = Math.max(220, data.length * 36);
  const max = 5;
  const min = 1;
  const range = max - min;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((Number(d.mood) - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const path = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={width} height={height} role="img" aria-label="Mood trend sparkline">
        <defs>
          <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.35)" />
            <stop offset="90%" stopColor="rgba(245, 158, 11, 0.02)" />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = padding + (1 - t) * (height - padding * 2);
          return <line key={t} x1={padding} x2={width - padding} y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="3,4" />;
        })}

        {/* Area under line */}
        {points.length > 1 && (
          <path
            d={`${path} L ${points[points.length - 1][0]},${height - padding} L ${points[0][0]},${height - padding} Z`}
            fill="url(#moodGradient)"
            stroke="none"
          />
        )}
        {/* Main line */}
        <path d={path} fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" />
        {/* Points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--color-secondary)" />
        ))}
      </svg>
    </div>
  );
}
