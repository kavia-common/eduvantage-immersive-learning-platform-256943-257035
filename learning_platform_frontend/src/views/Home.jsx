import React from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { logger } from "../services/logger";
import { apiClient } from "../services/apiClient";
import { isFeatureEnabled } from "../services/featureFlags";

export default function Home() {
  const onGetStarted = async () => {
    logger.info("Get Started clicked");
    // Example: best-effort call (will use relative URL if API base not set)
    try {
      await apiClient.get("/api/health"); // may 404 if backend not wired; this is just an example
    } catch {
      // silence in UI; log already handled in apiClient
    }
  };

  const onExplore = () => {
    const enabled = isFeatureEnabled("exploreV2");
    logger.debug("Explore feature flag", { enabled });
  };

  return (
    <div className="container">
      <Card>
        <h1>Welcome to EduVantage</h1>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Immersive, AI-powered learning with a modern, responsive UI.
        </p>
        <div className="mt-3">
          <Button onClick={onGetStarted}>Get Started</Button>
          <Button variant="secondary" className="ml-2" style={{ marginLeft: ".5rem" }} onClick={onExplore}>
            Explore
          </Button>
        </div>
      </Card>
    </div>
  );
}
