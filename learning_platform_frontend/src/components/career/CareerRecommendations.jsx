import React from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { useCareer } from "../../state/careerSlice";

/**
 * PUBLIC_INTERFACE
 * CareerRecommendations - shows recommended career tracks/paths returned by API.
 * Includes refresh control and robust empty/error/loading handling.
 */
export default function CareerRecommendations() {
  const { recommendations, loading, error, fetchRecommendations } = useCareer();

  if (loading && (!recommendations || recommendations.length === 0)) {
    return (
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          <span aria-busy="true">⏳</span>
          <div>Generating recommendations...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ color: "var(--color-error)", marginBottom: ".5rem" }}>
          Failed to load recommendations: {error}
        </div>
        <Button variant="secondary" onClick={fetchRecommendations} disabled={loading}>
          {loading ? "Refreshing..." : "Retry"}
        </Button>
      </Card>
    );
  }

  const isEmpty = !recommendations || recommendations.length === 0;

  if (isEmpty) {
    return (
      <Card>
        <h3 className="mt-0">Career Recommendations</h3>
        <div
          className="mt-2"
          style={{
            border: "1px dashed var(--color-border)",
            borderRadius: 12,
            padding: "1rem",
            color: "var(--color-muted)",
          }}
        >
          No recommendations yet. Save your preferences to generate a personalized path.
        </div>
        <div className="mt-2">
          <Button variant="secondary" onClick={fetchRecommendations} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <h3 className="mt-0">Career Recommendations</h3>
            <p className="mt-1" style={{ color: "var(--color-muted)" }}>
              Curated learning tracks tailored to your goals and availability.
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button variant="secondary" onClick={fetchRecommendations} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }) {
  return (
    <div
      className="surface"
      style={{ padding: ".75rem", display: "grid", gap: ".5rem" }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{rec.title}</div>
          <div style={{ color: "var(--color-muted)", fontSize: ".95rem" }}>
            Level: <strong>{rec.level || "All"}</strong> • Est. {rec.estHoursPerWeek} hrs/week
          </div>
        </div>
        <div
          aria-hidden
          style={{
            marginLeft: "auto",
            width: 38,
            height: 38,
            borderRadius: 999,
            background:
              "linear-gradient(135deg, var(--color-primary-500), var(--color-primary))",
            boxShadow: "var(--shadow-sm)",
          }}
          title="Track icon"
        />
      </div>
      {rec.summary && (
        <div style={{ color: "var(--color-text)" }}>{rec.summary}</div>
      )}
      {Array.isArray(rec.outcomes) && rec.outcomes.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
          {rec.outcomes.map((o, i) => (
            <li key={i} style={{ marginTop: ".25rem" }}>
              {o}
            </li>
          ))}
        </ul>
      )}
      {Array.isArray(rec.tags) && rec.tags.length > 0 && (
        <div className="mt-1" style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
          {rec.tags.map((t, i) => (
            <span
              key={i}
              className="surface"
              style={{
                borderRadius: 999,
                border: "1px solid var(--color-border)",
                padding: ".25rem .5rem",
                fontSize: ".85rem",
                color: "var(--color-muted)",
                background: "transparent",
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-1" style={{ display: "flex", gap: ".5rem" }}>
        <button className="btn">View Plan</button>
        <button className="btn secondary">Save</button>
      </div>
    </div>
  );
}
