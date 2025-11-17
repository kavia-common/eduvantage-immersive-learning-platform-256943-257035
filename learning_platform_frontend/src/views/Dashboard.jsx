import React from "react";
import Card from "../components/common/Card";
import AssistantPanel from "../components/assistant/AssistantPanel";

/**
 * PUBLIC_INTERFACE
 * Dashboard - authenticated overview module with Assistant panel.
 */
export default function Dashboard() {
  return (
    <div className="container">
      <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
        <Card>
          <h2>Dashboard</h2>
          <p className="mt-2" style={{ color: "var(--color-muted)" }}>
            Overview of your courses, progress, and quick actions.
          </p>
        </Card>

        <AssistantPanel defaultOpen />
      </div>
    </div>
  );
}
