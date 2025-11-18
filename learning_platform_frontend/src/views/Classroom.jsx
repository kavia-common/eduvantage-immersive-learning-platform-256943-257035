import React from "react";
import VirtualClassroom from "../components/VirtualClassroom";

/**
 * PUBLIC_INTERFACE
 * Classroom - Full-page classroom view rendering the VirtualClassroom component.
 * Provides an expanded area beyond the dashboard preview.
 */
export default function Classroom() {
  return (
    <div className="container" role="main" aria-label="Virtual classroom main view">
      <h1 style={{ marginBottom: "0.5rem" }}>Classroom</h1>
      <p style={{ marginTop: 0, color: "var(--color-muted)" }}>
        Welcome to the immersive classroom experience. Connect to preview a seating grid
        and basic AV controls. This is a placeholder for upcoming real-time features.
      </p>
      <VirtualClassroom />
    </div>
  );
}
