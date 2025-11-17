import React from "react";

/**
 * PUBLIC_INTERFACE
 * Controls - basic media/session controls for the Immersive Classroom.
 * Props:
 * - connected: boolean
 * - cameraOn: boolean
 * - micOn: boolean
 * - onToggleCamera: () => void
 * - onToggleMic: () => void
 * - onLeave: () => void
 * - onJoin: () => void
 */
export default function Controls({
  connected = false,
  cameraOn = true,
  micOn = true,
  onToggleCamera,
  onToggleMic,
  onLeave,
  onJoin,
}) {
  return (
    <div className="surface" style={{ padding: ".5rem", display: "flex", gap: ".5rem", alignItems: "center" }}>
      <button
        className="btn secondary"
        onClick={onToggleCamera}
        aria-pressed={cameraOn}
        title={cameraOn ? "Turn camera off" : "Turn camera on"}
      >
        {cameraOn ? "📷 On" : "📷 Off"}
      </button>
      <button
        className="btn secondary"
        onClick={onToggleMic}
        aria-pressed={micOn}
        title={micOn ? "Mute microphone" : "Unmute microphone"}
      >
        {micOn ? "🎙️ On" : "🎙️ Off"}
      </button>

      <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
        {connected ? (
          <button className="btn" onClick={onLeave} title="Leave session">Leave</button>
        ) : (
          <button className="btn" onClick={onJoin} title="Join session">Join</button>
        )}
      </div>
    </div>
  );
}
