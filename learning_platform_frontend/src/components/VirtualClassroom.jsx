import React, { useMemo, useState } from 'react';
import './virtualClassroom.css';

/**
 * PUBLIC_INTERFACE
 * VirtualClassroom
 * A glass-styled placeholder classroom component with:
 * - Connection toggle (Join/Leave)
 * - Participants list (mock) with count
 * - Basic controls (Camera/Mic toggle - UI only)
 * - Responsive seats grid preview when connected
 *
 * Props:
 * - embedded?: boolean — if true, renders a compact header suited for dashboard panels
 */
function VirtualClassroom({ embedded = false }) {
  const [isConnected, setIsConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // Simple mock participants list (could later be lifted via props or context)
  const participants = useMemo(
    () => (isConnected ? ['You', 'Sam', 'Alex', 'Taylor', 'Jordan'] : []),
    [isConnected]
  );

  const participantCount = participants.length;

  const handleJoin = () => {
    setIsConnected(true);
  };

  const handleLeave = () => {
    setIsConnected(false);
  };

  return (
    <div className={`vc-container glass ${embedded ? 'vc-embedded' : ''}`} role="region" aria-label="Virtual Classroom section">
      <header className="vc-header">
        <div className="vc-title-group">
          <h3 className="vc-title">{embedded ? 'Classroom Preview' : 'Virtual Classroom'}</h3>
          <div className={`vc-status ${isConnected ? 'connected' : 'disconnected'}`} aria-live="polite">
            <span className="vc-status-dot" aria-hidden="true" />
            <span className="vc-status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="vc-actions">
          {!isConnected ? (
            <button
              className="vc-btn vc-primary"
              onClick={handleJoin}
              aria-label="Join Classroom"
            >
              Join Classroom
            </button>
          ) : (
            <button
              className="vc-btn vc-danger"
              onClick={handleLeave}
              aria-label="Leave"
            >
              Leave
            </button>
          )}
        </div>
      </header>

      <div className="vc-body">
        <aside className="vc-side glass-sm" aria-label="Participants">
          <div className="vc-side-header">
            <h4 className="vc-side-title">Participants</h4>
            <span className="vc-badge" aria-label={`Participants count ${participantCount}`}>
              {participantCount}
            </span>
          </div>
          <ul className="vc-participants-list">
            {participants.length === 0 ? (
              <li className="vc-participant muted">No participants yet</li>
            ) : (
              participants.map((p) => (
                <li key={p} className="vc-participant">
                  <span className="vc-avatar" aria-hidden="true">{p.charAt(0).toUpperCase()}</span>
                  <span className="vc-name">{p}</span>
                </li>
              ))
            )}
          </ul>
        </aside>

        <main className="vc-stage glass-sm">
          {!isConnected ? (
            <div className="vc-disconnected" aria-label="classroom disconnected placeholder">
              <p className="vc-helper-text">Connect to preview classroom seating and controls.</p>
            </div>
          ) : (
            <div className="vc-connected" aria-label="classroom connected preview">
              <div className="vc-grid" role="grid" aria-label="Seating grid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div role="gridcell" className="vc-seat" key={i} aria-label={`Seat ${i + 1}`}>
                    <div className="vc-seat-video-sim" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="vc-controls">
        <div className="vc-controls-group" role="group" aria-label="Media controls">
          <button
            className={`vc-icon-btn ${cameraOn ? '' : 'off'}`}
            onClick={() => setCameraOn((v) => !v)}
            aria-label="Toggle camera"
            title="Toggle camera"
          >
            {cameraOn ? '📷' : '🚫📷'}
          </button>
          <button
            className={`vc-icon-btn ${micOn ? '' : 'off'}`}
            onClick={() => setMicOn((v) => !v)}
            aria-label="Toggle microphone"
            title="Toggle microphone"
          >
            {micOn ? '🎙️' : '🔇'}
          </button>
        </div>
        <div className="vc-hint" aria-live="polite">
          {isConnected
            ? 'Preview mode: media is not being captured.'
            : 'Join to preview seating layout.'}
        </div>
      </footer>
    </div>
  );
}

export default VirtualClassroom;
