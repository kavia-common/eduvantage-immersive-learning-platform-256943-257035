import React, { useMemo, useState } from "react";
import useRealTime from "../../hooks/useRealTime";
import { env } from "../../config/env";

/**
 * PUBLIC_INTERFACE
 * RealtimeDiagnostics
 * A collapsible diagnostics panel that subscribes to the classroom's realtime channel
 * and displays connection status, room info, redacted Supabase URL, participants and a
 * scrollable log of recent presence/broadcast events. Provides test actions.
 *
 * @param {Object} props
 * @param {string|number} props.roomId - The room/channel id to connect to
 */
export default function RealtimeDiagnostics({ roomId }) {
  /** This is a public function. */
  const [open, setOpen] = useState(true);

  const {
    participants,
    isConnected,
    isConnecting,
    lastError,
    sendBroadcast,
    recentEvents,
    reconnect,
    resendPresenceTrack,
    envOk,
  } = useRealTime({ roomId });

  const supabaseHost = useMemo(() => {
    try {
      const url = env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "";
      if (!url) return "(unset)";
      const u = new URL(url);
      return u.host;
    } catch {
      return "(invalid)";
    }
  }, []);

  const status = isConnecting ? "connecting" : isConnected ? "connected" : lastError ? "error" : "idle";
  const statusColor = status === "connected" ? "#10b981" : status === "connecting" ? "#f59e0b" : status === "error" ? "#ef4444" : "#6b7280";

  const onRetry = () => {
    reconnect?.();
  };

  const onSendTestBroadcast = async () => {
    await sendBroadcast?.({ sample: true, msg: "Hello from diagnostics", at: new Date().toISOString() });
  };

  const onResendPresence = async () => {
    await resendPresenceTrack?.();
  };

  return (
    <div className="surface" style={{ padding: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn secondary"
          style={{ padding: "0.4rem 0.7rem" }}
          aria-expanded={open}
          aria-controls="realtime-diagnostics-panel"
        >
          {open ? "Hide" : "Show"} Realtime Diagnostics
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            aria-hidden="true"
            style={{ width: 10, height: 10, borderRadius: 999, background: statusColor, display: "inline-block" }}
          />
          <span style={{ color: "var(--color-muted)", fontSize: ".9rem" }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div style={{ marginLeft: "auto", color: "var(--color-muted)", fontSize: ".9rem" }}>
          Room: <strong>{String(roomId)}</strong> • Supabase: {supabaseHost}
        </div>
      </div>

      {open && (
        <div id="realtime-diagnostics-panel" style={{ marginTop: "0.75rem", display: "grid", gap: "0.75rem" }}>
          {!envOk && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "#fff7ed",
                color: "#9a3412",
                border: "1px solid #fdba74",
              }}
            >
              Supabase Realtime not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env.
            </div>
          )}

          {lastError && envOk && (
            <div
              role="alert"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.08)",
                color: "#b91c1c",
                border: "1px solid rgba(239,68,68,0.35)",
              }}
            >
              {lastError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "0.75rem" }}>
            <div className="surface" style={{ padding: ".6rem" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: ".4rem" }}>
                <strong>Participants</strong>
                <span
                  style={{
                    marginLeft: "auto",
                    background: "var(--color-primary)",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: ".75rem",
                  }}
                >
                  {participants.length}
                </span>
              </div>
              <div style={{ display: "grid", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {participants.length === 0 ? (
                  <div style={{ color: "var(--color-muted)" }}>None</div>
                ) : (
                  participants.map((p, i) => (
                    <div
                      key={`${p.user_id}-${i}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "36px 1fr",
                        gap: 8,
                        alignItems: "center",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        padding: 8,
                        background: "#fff",
                      }}
                    >
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(249,250,251,1))",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-primary)",
                          fontWeight: 700,
                        }}
                      >
                        {String(p.user_id).slice(0, 2).toUpperCase()}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                        <div style={{ fontWeight: 600 }}>{p.user_id}</div>
                        <div style={{ color: "var(--color-muted)", fontSize: ".8rem" }}>
                          Joined: {new Date(p.joined_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="surface" style={{ padding: ".6rem", display: "grid", gap: ".5rem" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <strong>Recent Events</strong>
                <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
                  <button type="button" className="btn secondary" onClick={onResendPresence}>
                    Resend Presence
                  </button>
                  <button type="button" className="btn" onClick={onSendTestBroadcast}>
                    Send Broadcast
                  </button>
                  <button type="button" className="btn" onClick={onRetry}>
                    Retry
                  </button>
                </div>
              </div>
              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  background: "rgba(59,130,246,0.06)",
                  maxHeight: 220,
                  overflowY: "auto",
                  padding: 8,
                }}
                aria-label="Realtime event log"
              >
                {recentEvents.length === 0 ? (
                  <div style={{ color: "var(--color-muted)" }}>No events yet.</div>
                ) : (
                  recentEvents.map((e, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "140px 1fr",
                        gap: 8,
                        padding: "6px 8px",
                        borderBottom: "1px dashed var(--color-border)",
                      }}
                    >
                      <span style={{ fontFamily: "monospace", fontSize: ".8rem", color: "var(--color-muted)" }}>
                        {new Date(e.at).toLocaleTimeString()}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: ".85rem" }}>
                        {e.type}:{e.event} {e.info ? "• " + JSON.stringify(e.info) : ""}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
