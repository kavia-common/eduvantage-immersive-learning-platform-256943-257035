import React from "react";
import Card from "../components/common/Card";

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
