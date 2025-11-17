import React from "react";
import Card from "../components/common/Card";

/**
 * PUBLIC_INTERFACE
 * Dashboard - authenticated overview module placeholder.
 */
export default function Dashboard() {
  return (
    <div className="container">
      <Card>
        <h2>Dashboard</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Overview of your courses, progress, and quick actions.
        </p>
      </Card>
    </div>
  );
}
