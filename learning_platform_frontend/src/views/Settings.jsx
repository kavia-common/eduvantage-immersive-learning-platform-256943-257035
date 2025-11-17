import React from "react";
import Card from "../components/common/Card";

export default function Settings() {
  return (
    <div className="container">
      <Card>
        <h2>Settings</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Configure application options and notifications.
        </p>
      </Card>
    </div>
  );
}
