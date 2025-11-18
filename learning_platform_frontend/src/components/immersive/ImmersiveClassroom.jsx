import React, { useEffect, useMemo, useRef, useState } from "react";
import Controls from "./Controls";
import { createWebRTCClient } from "../../services/WebRTCClient";
import { logger } from "../../services/logger";
import { useAuth } from "../../auth/AuthProvider";
import { env } from "../../config/env";

/**
 * PUBLIC_INTERFACE
 * ImmersiveClassroom - scaffolding for a WebRTC-enabled classroom UI.
 * - Initializes a WebRTC client abstraction with signaling stubs
 * - Shows local preview and remote participant tiles
 * - Exposes basic join/leave and media toggles
 *
 * This is a scaffold: no 3D engine integration yet.
 */
export default function ImmersiveClassroom({ roomId = "demo-room" }) {
  const { user } = useAuth();
  const userId = user?.id || "guest";
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [participants, setParticipants] = useState([]); // {id, stream}
  const [error, setError] = useState("");
  const [wsStatus, setWsStatus] = useState("unknown");

  const title = useMemo(() => `Room: ${roomId}`, [roomId]);

  useEffect(() => {
    logger.info("ImmersiveClassroom mount", {
      roomId,
      userId,
      backend: env.BACKEND_URL || "(same-origin)",
      wsUrl: env.WS_URL || "(derived)",
    });

    clientRef.current = createWebRTCClient({ roomId, userId });

    const off1 = clientRef.current.on("local-stream", ({ stream }) => {
      try {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch {}
    });
    const off2 = clientRef.current.on("track-added", ({ id, stream }) => {
      setParticipants((prev) => {
        const exists = prev.find((p) => p.id === id);
        if (exists) return prev.map((p) => (p.id === id ? { ...p, stream } : p));
        return [...prev, { id, stream }];
      });
    });
    const off3 = clientRef.current.on("participant-left", ({ id }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    });
    const off4 = clientRef.current.on("error", ({ message }) => setError(message));
    const off5 = clientRef.current.on("connection-state", ({ state }) => {
      logger.debug("RTC state", { state });
      setConnected(state === "connected" || state === "connecting");
    });

    // WS socket state probe
    const wsProbe = setInterval(() => {
      try {
        const readyState = clientRef.current?.wsClient?.socket?.readyState;
        setWsStatus(typeof readyState === "number" ? String(readyState) : "n/a");
      } catch {
        setWsStatus("n/a");
      }
    }, 1500);

    // Acquire local media preview on mount
    (async () => {
      try {
        await clientRef.current.startLocalMedia();
      } catch (e) {
        setError(String(e?.message || e));
      }
    })();

    return () => {
      try { off1(); off2(); off3(); off4(); off5(); } catch {}
      clientRef.current?.leave().catch(() => {});
      clearInterval(wsProbe);
    };
  }, [roomId, userId]);

  const onJoin = async () => {
    setError("");
    try {
      await clientRef.current.startLocalMedia();
      await clientRef.current.join();
    } catch (e) {
      setError(String(e?.message || e));
    }
  };

  const onLeave = async () => {
    setError("");
    try {
      await clientRef.current.leave();
      setParticipants([]);
      setConnected(false);
    } catch (e) {
      setError(String(e?.message || e));
    }
  };

  const onToggleCamera = async () => {
    const next = !cameraOn;
    setCameraOn(next);
    try {
      await clientRef.current.toggleCamera(next);
    } catch {}
  };

  const onToggleMic = async () => {
    const next = !micOn;
    setMicOn(next);
    try {
      await clientRef.current.toggleMic(next);
    } catch {}
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="surface" style={{ padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ color: "var(--color-muted)", fontSize: ".85rem" }}>
          WS: {env.WS_URL || "(derived)"} | Backend: {env.BACKEND_URL || "(same-origin)"} | WS state: {wsStatus}
        </div>
        <div style={{ marginLeft: "auto", color: "var(--color-muted)", fontSize: ".9rem" }}>
          {connected ? "Connected" : "Not connected"}
        </div>
      </div>

      {error && (
        <div className="surface" style={{ padding: ".75rem", borderColor: "var(--color-error)", color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1rem" }}>
        {/* Left: local preview + participants list */}
        <div style={{ display: "grid", gap: ".75rem", alignContent: "start" }}>
          <div className="surface" style={{ padding: ".5rem" }}>
            <div style={{ fontWeight: 600, marginBottom: ".5rem" }}>Your Preview</div>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", borderRadius: 12, background: "#000", minHeight: 180 }}
            />
            <div style={{ marginTop: ".5rem", color: "var(--color-muted)", fontSize: ".9rem" }}>
              {cameraOn ? "Camera enabled" : "Camera disabled"} • {micOn ? "Mic enabled" : "Mic disabled"}
            </div>
          </div>

          <div className="surface" style={{ padding: ".5rem" }}>
            <div style={{ fontWeight: 600, marginBottom: ".5rem" }}>Participants ({participants.length})</div>
            <div style={{ display: "grid", gap: ".5rem" }}>
              {participants.length === 0 && (
                <div style={{ color: "var(--color-muted)", fontSize: ".95rem" }}>
                  No remote participants yet. Ensure another user joins the same room and that signaling is connected.
                </div>
              )}
              {participants.map((p) => (
                <ParticipantRow key={p.id} id={p.id} stream={p.stream} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: stage (placeholder for future 3D/scene) */}
        <div className="surface" style={{ padding: ".5rem" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: ".5rem" }}>
            <div style={{ fontWeight: 600 }}>Session Stage</div>
            <div style={{ marginLeft: "auto", color: "var(--color-muted)" }}>3D engine coming soon</div>
          </div>
          <div
            style={{
              height: 420,
              border: "1px dashed var(--color-border)",
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: "rgba(37, 99, 235, 0.03)",
            }}
          >
            <span style={{ color: "var(--color-muted)" }}>Interactive 3D classroom will render here.</span>
          </div>
        </div>
      </div>

      <Controls
        connected={connected}
        cameraOn={cameraOn}
        micOn={micOn}
        onToggleCamera={onToggleCamera}
        onToggleMic={onToggleMic}
        onLeave={onLeave}
        onJoin={onJoin}
      />
    </div>
  );
}

function ParticipantRow({ id, stream }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="surface" style={{ padding: ".5rem", display: "grid", gridTemplateColumns: "120px 1fr", gap: ".5rem" }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{ width: "100%", height: 68, objectFit: "cover", borderRadius: 10, background: "#000" }}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>{id}</div>
      </div>
    </div>
  );
}
