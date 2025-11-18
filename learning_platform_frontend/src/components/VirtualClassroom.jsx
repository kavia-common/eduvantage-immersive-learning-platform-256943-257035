/**
 * VirtualClassroom
 * - Uses Supabase Realtime presence/broadcast via useRealTime hook
 * - Renders connection state, participants list, and a child/placeholder area for immersive container
 */

import React, { useMemo } from 'react';
import useRealTime from '../hooks/useRealTime';
import './virtualClassroom.css';
import { supabaseEnvStatus } from '../lib/supabase';

/**
 * PUBLIC_INTERFACE
 * VirtualClassroom
 * Realtime presence container for a classroom. Shows participants and connection diagnostics.
 *
 * @param {Object} props
 * @param {string|number} props.roomId - Room identifier
 * @param {(signal:any)=>void} [props.onSignal] - Optional incoming signal handler
 * @param {React.ReactNode} [props.children] - Optional immersive/3D UI mount area
 */
export default function VirtualClassroom({ roomId, onSignal, children }) {
  /** This is a public function. */
  const { participants, isConnected, isConnecting, lastError, sendSignal, envOk } = useRealTime({ roomId, onSignal });

  const handleRetry = () => {
    window.location.reload();
  };

  const handleTestSignal = async () => {
    await sendSignal({ type: 'ping', at: new Date().toISOString() });
  };

  const missingEnvMsg = !envOk ? (
    <div className="vc-banner vc-banner-warning" role="note" aria-live="polite">
      Supabase Realtime not configured. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to your .env and restart the app.
    </div>
  ) : null;

  const supabaseHost = useMemo(() => {
    try {
      const url = process.env.REACT_APP_SUPABASE_URL || '';
      if (!url) return '(unset)';
      const u = new URL(url);
      return u.host;
    } catch {
      return '(invalid)';
    }
  }, []);

  return (
    <section className="vc-container" aria-label="Virtual Classroom">
      <header className="vc-header">
        <h3 className="vc-title">Virtual Classroom</h3>
        {!isConnected ? (
          <div className={`vc-connection ${isConnecting ? 'vc-connection-pending' : 'vc-connection-bad'}`}>
            <span className={`vc-dot ${isConnecting ? 'vc-dot-amber' : 'vc-dot-red'}`} aria-hidden="true" />
            <span>{isConnecting ? 'Connecting to Supabase Realtime…' : 'Connection error'}</span>
            <button className="vc-btn" onClick={handleRetry} type="button">
              Retry
            </button>
          </div>
        ) : (
          <div className="vc-connection vc-connection-good">
            <span className="vc-dot vc-dot-green" aria-hidden="true" />
            <span>Connected • {participants.length} participant{participants.length === 1 ? '' : 's'}</span>
            <button className="vc-btn-secondary" onClick={handleTestSignal} type="button">
              Send Test Signal
            </button>
          </div>
        )}
      </header>

      {missingEnvMsg}

      {lastError && envOk && !isConnecting && !isConnected && (
        <div className="vc-banner vc-banner-error" role="alert" aria-live="assertive">
          Realtime error: {lastError}
        </div>
      )}

      <div className="vc-diagnostics muted">
        Supabase: {supabaseHost} • Channel: room:{String(roomId)}
      </div>

      <div className="vc-content">
        <aside className="vc-participants" aria-label="Participants">
          <div className="vc-participants-header">
            <strong>Participants</strong>
            <span className="vc-count">{participants.length}</span>
          </div>
          <ul className="vc-participants-list">
            {participants.length === 0 ? (
              <li className="vc-participant muted">No one is here yet</li>
            ) : (
              participants.map((p, idx) => (
                <li className="vc-participant" key={`${p.user_id}-${idx}`}>
                  <span className="vc-avatar" aria-hidden="true">
                    {String(p.user_id).slice(0, 2).toUpperCase()}
                  </span>
                  <div className="vc-participant-meta">
                    <div className="vc-participant-id">{p.user_id}</div>
                    <div className="vc-participant-time">Joined: {new Date(p.joined_at).toLocaleTimeString()}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </aside>

        <main className="vc-stage" aria-label="Immersive Stage">
          {children ? (
            children
          ) : (
            <div className="vc-stage-placeholder">
              <p>Immersive/3D content mounts here.</p>
              <p className="muted">This area is reserved for the ImmersiveClassroom component or other content.</p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
