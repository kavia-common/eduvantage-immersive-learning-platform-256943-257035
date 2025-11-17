import React from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

export default function Home() {
  return (
    <div className="container">
      <Card>
        <h1>Welcome to EduVantage</h1>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Immersive, AI-powered learning with a modern, responsive UI.
        </p>
        <div className="mt-3">
          <Button>Get Started</Button>
          <Button variant="secondary" className="ml-2" style={{ marginLeft: ".5rem" }}>
            Explore
          </Button>
        </div>
      </Card>
    </div>
  );
}
