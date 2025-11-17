import React, { useMemo, useState } from "react";
import Button from "../common/Button";
import Card from "../common/Card";
import { useWellbeing } from "../../state/wellbeingSlice";

/**
 * PUBLIC_INTERFACE
 * MoodCheck - allows user to submit today's mood (1..5) and optional notes.
 * Includes a privacy notice emphasizing no sensitive data is logged.
 */
export default function MoodCheck() {
  const { submitMood } = useWellbeing();
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const moodLabels = useMemo(
    () => ({
      1: "Very Low",
      2: "Low",
      3: "Neutral",
      4: "Good",
      5: "Excellent",
    }),
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitMood({ mood, notes: notes.trim() });
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <div style={{ display: "grid", gap: ".75rem" }}>
        <div>
          <h3 className="mt-0">Daily Mood Check</h3>
          <p className="mt-1" style={{ color: "var(--color-muted)" }}>
            Track how you feel each day to visualize your wellbeing trends over time.
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: ".75rem" }}>
          <div className="surface" style={{ padding: ".75rem" }}>
            <label htmlFor="mood-range" style={{ display: "block", fontWeight: 600 }}>
              Select your mood today
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: ".75rem", marginTop: ".5rem" }}>
              <input
                id="mood-range"
                type="range"
                min="1"
                max="5"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ minWidth: 100, textAlign: "right", fontWeight: 700, color: "var(--color-primary)" }}>
                {mood} • {moodLabels[mood]}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-muted)", fontSize: ".85rem", marginTop: ".25rem" }}>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div className="surface" style={{ padding: ".75rem" }}>
            <label htmlFor="mood-notes" style={{ display: "block", fontWeight: 600 }}>
              Notes (optional)
            </label>
            <textarea
              id="mood-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a brief reflection (e.g., what influenced your mood)"
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
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem" }}>
            <Button type="button" variant="secondary" onClick={() => { setMood(3); setNotes(""); }} disabled={submitting}>
              Reset
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Mood"}
            </Button>
          </div>
        </form>

        <div
          className="surface"
          style={{
            padding: ".75rem",
            borderStyle: "dashed",
            background: "rgba(37,99,235,0.03)",
          }}
        >
          <div style={{ fontWeight: 700 }}>Privacy notice</div>
          <p className="mt-1" style={{ color: "var(--color-muted)", margin: 0 }}>
            Your wellbeing entries are intended for personal insights. We do not log notes or sensitive information in application logs. Data is handled per your environment’s configuration and privacy settings.
          </p>
        </div>
      </div>
    </Card>
  );
}
