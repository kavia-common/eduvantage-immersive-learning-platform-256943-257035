import React, { useEffect, useMemo, useState } from "react";
import ImmersiveClassroom from "../components/immersive/ImmersiveClassroom";
import EnvDiagnostics from "../components/common/EnvDiagnostics";
import { useLocation } from "react-router-dom";
import VirtualClassroom from "../components/VirtualClassroom";
import { supabaseEnvStatus } from "../lib/supabase";
import { logger } from "../services/logger";
import RealtimeDiagnostics from "../components/realtime/RealtimeDiagnostics";

/**
 * PUBLIC_INTERFACE
 * Classroom - Renders the classroom page.
 * Integrates Supabase Realtime presence via VirtualClassroom and preserves ImmersiveClassroom.
 * Maps "Room 101" to canonical "101" for presence channel room:101.
 */
export default function Classroom() {
  /** This is a public function. */
  const location = useLocation();
  const [roomId, setRoomId] = useState("101"); // default Room 101

  useEffect(() => {
    // Extract roomId from query or pathname
    const params = new URLSearchParams(location.search);
    const roomFromQuery = params.get("roomId");
    if (roomFromQuery) {
      setRoomId(roomFromQuery);
    } else {
      const parts = location.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p.toLowerCase() === "classroom");
      if (idx !== -1 && parts[idx + 1]) {
        setRoomId(parts[idx + 1]);
      }
    }
  }, [location]);

  const resolvedRoomId = useMemo(() => {
    if (roomId === "101" || String(roomId).toLowerCase() === "room-101") return "101";
    if (String(roomId).toLowerCase() === "classroom-101") return "101";
    return roomId || "101";
  }, [roomId]);

  useEffect(() => {
    logger?.info?.("Navigated to Classroom view", {
      providedRoomId: roomId,
      resolvedRoomId,
      friendlyName: "Room 101",
    });
  }, [roomId, resolvedRoomId]);

  return (
    <div className="page-container" style={{ display: "grid", gap: "1rem" }}>
      <header className="page-header">
        <h2>Classroom</h2>
        <p className="muted">Welcome to your immersive learning space.</p>
      </header>

      <EnvDiagnostics />

      <div className="surface gradient-bg" style={{ padding: "0.5rem" }}>
        <RealtimeDiagnostics roomId={resolvedRoomId} />
      </div>

      {(!supabaseEnvStatus.hasUrl || !supabaseEnvStatus.hasAnonKey) && (
        <div
          style={{
            margin: "12px 0",
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fff7ed",
            color: "#9a3412",
            border: "1px solid #fdba74",
          }}
        >
          Supabase Realtime not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env to enable presence/signaling.
        </div>
      )}

      <section style={{ marginTop: 16 }}>
        <VirtualClassroom roomId={resolvedRoomId}>
          <ImmersiveClassroom roomId={resolvedRoomId} />
        </VirtualClassroom>
      </section>
    </div>
  );
}
