import React from "react";

/**
 * PUBLIC_INTERFACE
 * Charts - lightweight mock charts without heavy dependencies.
 * Provides:
 * - LineChart: simple sparkline-like chart using SVG path
 * - BarChart: simple vertical bars using divs
 *
 * Props use simple arrays:
 * - LineChart: data=[{label, value}]
 * - BarChart: data=[{label, value}]
 */

export function EmptyChartState({ message = "No data available" }) {
  return (
    <div
      style={{
        height: 180,
        border: "1px dashed var(--color-border)",
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        color: "var(--color-muted)",
      }}
    >
      {message}
    </div>
  );
}

// PUBLIC_INTERFACE
export function LineChart({ data = [], height = 180 }) {
  if (!data || data.length === 0) return <EmptyChartState />;

  const padding = 10;
  const width = Math.max(240, data.length * 40);
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = Math.max(max - min, 1);

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={width} height={height} role="img" aria-label="Trend line chart">
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(37,99,235,0.35)" />
            <stop offset="90%" stopColor="rgba(37,99,235,0.02)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <g>
          {[0.25, 0.5, 0.75].map((t) => {
            const y = padding + (1 - t) * (height - padding * 2);
            return <line key={t} x1={padding} x2={width - padding} y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="3,4" />;
          })}
        </g>

        {/* Area under line */}
        <path
          d={`${path} L ${points[points.length - 1][0]},${height - padding} L ${points[0][0]},${height - padding} Z`}
          fill="url(#lineGradient)"
          stroke="none"
        />
        {/* Main line */}
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
        {/* Points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--color-primary)" />
        ))}
      </svg>
    </div>
  );
}

// PUBLIC_INTERFACE
export function BarChart({ data = [], height = 180 }) {
  if (!data || data.length === 0) return <EmptyChartState />;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: "0.75rem", alignItems: "end", height }}>
      {data.map((d) => {
        const h = Math.max(6, Math.round((d.value / max) * (height - 40)));
        return (
          <div key={d.label} style={{ display: "grid", gridTemplateRows: "1fr auto", alignItems: "end" }}>
            <div
              title={`${d.label}: ${d.value}`}
              style={{
                height: h,
                background: "linear-gradient(180deg, var(--color-primary-500), var(--color-primary))",
                borderRadius: "10px",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid rgba(37,99,235,0.35)",
              }}
            />
            <div style={{ marginTop: 6, fontSize: ".85rem", color: "var(--color-muted)", textAlign: "center" }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default { LineChart, BarChart, EmptyChartState };
