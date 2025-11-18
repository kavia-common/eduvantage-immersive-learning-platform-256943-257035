import React, { useMemo, useState } from 'react';
import './wellbeing.css';

/**
 * PUBLIC_INTERFACE
 * WellbeingDashboard component provides a quick mood tracker UI with:
 * - Emoji-based mood input (1–5)
 * - Optional notes textarea
 * - Save button (non-persistent, stubbed with console log)
 * - Simple weekly mood trend bar chart using divs
 *
 * Accessibility:
 * - Buttons include aria-labels
 * - Textarea labeled with htmlFor/id
 * - High-contrast focus styles and keyboard operable controls
 *
 * Styling:
 * - Uses existing glassmorphism utilities (.glass-card, .glass-panel) where available
 * - Aligns with Ocean Professional theme
 */
export default function WellbeingDashboard() {
  const [mood, setMood] = useState(0);
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  // Placeholder weekly data; in a future iteration, fetch from store/service
  const weeklyData = useMemo(
    () => [
      { day: 'Mon', value: 3 },
      { day: 'Tue', value: 4 },
      { day: 'Wed', value: 2 },
      { day: 'Thu', value: 5 },
      { day: 'Fri', value: 3 },
      { day: 'Sat', value: 4 },
      { day: 'Sun', value: 3 },
    ],
    []
  );

  const emojiMap = {
    1: '😞',
    2: '🙁',
    3: '😐',
    4: '🙂',
    5: '😄',
  };

  const handleSave = () => {
    // Non-persistent stub - replace with redux action or API call later
    const payload = { mood, notes, at: new Date().toISOString() };
    // eslint-disable-next-line no-console
    console.log('[WellbeingDashboard] Save mood entry (stub):', payload);
    setLastSaved(payload.at);
    setNotes('');
    setMood(0);
  };

  return (
    <section className="wellbeing-dashboard glass-card" aria-label="Wellbeing dashboard">
      <header className="wb-header">
        <div>
          <h2 className="wb-title">Wellbeing</h2>
          <p className="wb-subtitle">Track your mood and reflect with quick notes</p>
        </div>
      </header>

      <div className="wb-content">
        {/* Mood input */}
        <div className="wb-section">
          <h3 className="wb-section-title">How are you feeling?</h3>
          <div className="wb-emoji-row" role="group" aria-label="Mood selection from very low to very high">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                className={`wb-emoji-btn ${mood === val ? 'active' : ''}`}
                aria-label={`Select mood ${val} of 5`}
                onClick={() => setMood(val)}
              >
                <span aria-hidden="true">{emojiMap[val]}</span>
                <span className="sr-only">{`Mood ${val}`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="wb-section">
          <label htmlFor="wb-notes" className="wb-section-title">
            Notes (optional)
          </label>
          <textarea
            id="wb-notes"
            className="wb-notes"
            placeholder="Add a quick reflection..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            aria-label="Add optional mood notes"
          />
        </div>

        {/* Save */}
        <div className="wb-actions">
          <button
            type="button"
            className="wb-save-btn"
            onClick={handleSave}
            aria-label="Save mood entry"
            disabled={mood === 0 && notes.trim().length === 0}
          >
            Save Mood Entry
          </button>
          {lastSaved && (
            <span className="wb-saved-hint" aria-live="polite">
              Saved at {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Weekly Trend */}
        <div className="wb-section">
          <h3 className="wb-section-title">Weekly Mood Trend</h3>
          <div className="wb-chart" role="img" aria-label="Weekly mood bar chart, range one to five">
            {weeklyData.map((d) => {
              const pct = (d.value / 5) * 100;
              return (
                <div className="wb-bar-group" key={d.day}>
                  <div className="wb-bar" style={{ height: `${pct}%` }} aria-label={`${d.day} mood ${d.value} out of 5`} />
                  <span className="wb-bar-label">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
