import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { logger } from "../services/logger";
import { apiClient } from "../services/apiClient";
import { isFeatureEnabled } from "../services/featureFlags";

/**
 * PUBLIC_INTERFACE
 * Home page - public landing with calls-to-action.
 * Uses common Card and Button components with theme-consistent styles.
 *
 * Get Started -> navigates to /signup if unauthenticated experience is desired,
 * or /dashboard if choosing to show app preview right away. For now, route to /signup.
 * Explore -> navigates to /dashboard.
 */
export default function Home() {
  const navigate = useNavigate();

  const onGetStarted = async (e) => {
    e?.preventDefault?.();
    logger.info("Get Started clicked");

    // Optional: best-effort health call; do not block navigation
    try {
      apiClient.get("/api/health").catch(() => {});
    } catch {
      // ignore
    }

    // Primary CTA should take the user into the intended flow
    navigate("/signup");
  };

  const onExplore = (e) => {
    e?.preventDefault?.();
    logger.debug("Explore clicked");
    // Always navigate to dashboard; feed is no longer available
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <Card>
        <h1>Welcome to EduVantage</h1>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Immersive, AI-powered learning with a modern, responsive UI.
        </p>
        <div className="mt-3">
          <Button onClick={onGetStarted} aria-label="Get Started" title="Create your account to begin">
            Get Started
          </Button>
          <Button
            variant="secondary"
            className="ml-2"
            style={{ marginLeft: ".5rem" }}
            onClick={onExplore}
            aria-label="Explore"
            title="Explore features"
          >
            Explore
          </Button>
        </div>
      </Card>
    </div>
  );
}
