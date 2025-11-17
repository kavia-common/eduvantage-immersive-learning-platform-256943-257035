import React, { useMemo, useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { useCareer } from "../../state/careerSlice";

/**
 * PUBLIC_INTERFACE
 * CareerPreferences - form to capture user career preferences:
 * - desired role (string)
 * - experience level (Beginner|Intermediate|Advanced)
 * - interests (multi-select chips)
 * - availability (weekly hours)
 *
 * Submits via submitPreferences action from CareerContext.
 */
export default function CareerPreferences() {
  const { submitPreferences, loading, error, fetchRecommendations } = useCareer();
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [notes, setNotes] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  const interestOptions = useMemo(
    () => [
      "Software Engineering",
      "Data Science",
      "Machine Learning",
      "Product Management",
      "Cybersecurity",
      "Cloud/DevOps",
      "UI/UX",
      "Business Analytics",
    ],
    []
  );

  const toggleInterest = (label) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      role: role.trim(),
      level,
      weeklyHours: Math.max(1, Math.min(80, Number(weeklyHours) || 5)),
      interests: selectedInterests,
      notes: notes.trim(), // not logged; only sent to API if configured
    };
    await submitPreferences(payload);
    await fetchRecommendations();
  };

  return (
    <Card>
      <div style={{ display: "grid", gap: ".75rem" }}>
        <div>
          <h3 className="mt-0">Career Preferences</h3>
          <p className="mt-1" style={{ color: "var(--color-muted)" }}>
            Tell us about your goals to tailor a personalized career path.
          </p>
        </div>

        {error && (
          <div
            className="surface"
            style={{ padding: ".5rem", color: "var(--color-error)" }}
          >
            Failed to save preferences: {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: ".75rem" }}>
          <div className="surface" style={{ padding: ".75rem" }}>
            <label htmlFor="desired-role" style={{ fontWeight: 600, display: "block" }}>
              Desired Role
            </label>
            <input
              id="desired-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Frontend Developer"
              style={{
                width: "100%",
                marginTop: ".5rem",
                padding: "0.6rem 0.7rem",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div
            className="surface"
            style={{ padding: ".75rem", display: "grid", gap: ".75rem" }}
          >
            <div style={{ display: "grid", gap: ".5rem" }}>
              <label htmlFor="level" style={{ fontWeight: 600 }}>
                Experience Level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.7rem",
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "transparent",
                  color: "var(--color-text)",
                }}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: ".5rem" }}>
              <label htmlFor="hours" style={{ fontWeight: 600 }}>
                Weekly Availability (hours)
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: ".75rem",
                }}
              >
                <input
                  id="hours"
                  type="range"
                  min="1"
                  max="40"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                />
                <div
                  style={{
                    minWidth: 120,
                    textAlign: "right",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                  }}
                >
                  {weeklyHours} hrs/week
                </div>
              </div>
            </div>
          </div>

          <div className="surface" style={{ padding: ".75rem" }}>
            <div style={{ fontWeight: 600, marginBottom: ".5rem" }}>
              Interests
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
              {interestOptions.map((opt) => {
                const active = selectedInterests.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    className={`btn ${active ? "" : "secondary"}`}
                    onClick={() => toggleInterest(opt)}
                    aria-pressed={active}
                    style={{ padding: ".4rem .7rem" }}
                  >
                    {active ? "✅ " : "➕ "} {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface" style={{ padding: ".75rem" }}>
            <label htmlFor="notes" style={{ fontWeight: 600, display: "block" }}>
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else you'd like us to consider?"
              style={{
                width: "100%",
                marginTop: ".5rem",
                padding: "0.6rem 0.7rem",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text)",
                resize: "vertical",
              }}
            />
            <div className="mt-1" style={{ color: "var(--color-muted)", fontSize: ".9rem" }}>
              We avoid logging sensitive details; your inputs are sent securely based on your environment configuration.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setRole("");
                setLevel("Beginner");
                setWeeklyHours(5);
                setNotes("");
                setSelectedInterests([]);
              }}
              disabled={loading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save & Generate"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
