import React from "react";

/**
 * Simple loader used during lazy route loading.
 */

// PUBLIC_INTERFACE
export default function Loader({ label = "Loading..." }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
        <span aria-busy="true" aria-live="polite">⏳</span>
        <span>{label}</span>
      </div>
    </div>
  );
}
