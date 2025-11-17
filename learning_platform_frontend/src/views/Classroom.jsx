import React from "react";
import Card from "../components/common/Card";

export default function Classroom() {
  return (
    <div className="container">
      <Card>
        <h2>Classroom</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Join immersive sessions and collaborate in real-time.
        </p>
      </Card>
    </div>
  );
}
