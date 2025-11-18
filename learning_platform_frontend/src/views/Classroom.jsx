import React from "react";
import ImmersiveClassroom from "../components/immersive/ImmersiveClassroom";
import { logger } from "../services/logger";

/**
 * PUBLIC_INTERFACE
 * Classroom - renders the immersive classroom scaffolding with WebRTC client abstraction.
 * - Maps friendly "Room 101" to canonical signaling room id "classroom-101"
 * - Provides basic page chrome and logs mount for diagnostics
 */
export default function Classroom() {
  const roomId = "classroom-101"; // maps to user-facing "Room 101"

  // Log once for diagnosability
  React.useEffect(() => {
    logger.info("Navigated to Classroom view", { roomId, friendlyName: "Room 101" });
  }, [roomId]);

  return (
    <div className="container" style={{ display: "grid", gap: "1rem" }}>
      <header className="surface" style={{ padding: "0.75rem 1rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Room 101</div>
        <div style={{ color: "var(--color-muted)", fontSize: ".9rem" }}>
          Interactive Immersive Classroom
        </div>
      </header>
      <ImmersiveClassroom roomId={roomId} />
    </div>
  );
}
