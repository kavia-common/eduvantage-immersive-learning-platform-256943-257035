/**
 * VirtualClassroom
 * - Uses Supabase Realtime presence/broadcast via useRealTime hook
 * - Renders connection state, participants list, and a child/placeholder area for immersive container
 */

import React from 'react';
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
  const { participants, isConnected, sendSignal, envOk } = useRealTime({ roomId, onSignal });

  const handleRetry = () => {
    // A simple retry UX; reloading will re-init the hook/channel
    window.location.reload();
  };

  const handleTestSignal = async () => {
    await sendSignal({ type: 'ping', at: new Date().toISOString() });
  };

  const missingEnvMsg = !envOk ? (
    <div className="vc-banner vc-banner-warning" role="note" aria-live="polite">
      Supabase Realtime not configured. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env and restart the app.
    </div>
  ) : null;

  return (
    <section className="vc-container" aria-label="Virtual Classroom">
      <header className="vc-header">
        <h3 className="vc-title">Virtual Classroom</h3>
        {!isConnected ? (
          <div className="vc-connection vc-connection-bad">
            <span className="vc-dot vc-dot-red" aria-hidden="true" />
            <span>Connecting to Realtime...</span>
            <button className="vc-btn" onClick={handleRetry} type="button">
              Retry
            </button>
          </div>
        ) : (
          <div className="vc-connection vc-connection-good">
            <span className="vc-dot vc-dot-green" aria-hidden="true" />
            <span>Connected</span>
            <button className="vc-btn-secondary" onClick={handleTestSignal} type="button">
              Send Test Signal
            </button>
          </div>
        )}
      </header>

      {missingEnvMsg}

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
