import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { logger } from "../services/logger";
import { apiClient } from "../services/apiClient";
import { isFeatureEnabled } from "../services/featureFlags";
import "../styles/theme.css";
import "../styles/utilities.css";

/**
 * PUBLIC_INTERFACE
 * Home page - immersive landing with animated gradient hero, glass preview cards, and CTAs.
 * Accessibility: proper landmarks, aria-labels for CTAs, sufficient color contrast via theme tokens.
 */
export default function Home() {
  const navigate = useNavigate();

  const onGetStarted = async (e) => {
    e?.preventDefault?.();
    logger.info("Get Started clicked");

    // Non-blocking health ping
    try {
      apiClient.get("/api/health").catch(() => {});
    } catch {
      /* ignore */
    }

    navigate("/signup");
  };

  const onExplore = (e) => {
    e?.preventDefault?.();
    // Respect feature flag behavior; otherwise default to courses (fallback handled below)
    const exploreV2 = isFeatureEnabled("exploreV2");
    logger.debug("Explore feature flag", { exploreV2 });
    // If explore feature flag exists, route to v2 dashboard; else fall back to courses (or feed if courses not present)
    const destination = exploreV2 ? "/dashboard" : "/courses";
    navigate(destination);
  };

  // Fallback handler if /courses route is not defined; router will handle 404 or alias elsewhere if absent.
  const handleExploreKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      onExplore(e);
    }
  };

  // Decorative animated blobs for hero background
  const blobCommon = {
    position: "absolute",
    filter: "blur(60px)",
    opacity: 0.6,
    borderRadius: "50%",
    pointerEvents: "none",
    animationTimingFunction: "ease-in-out",
    willChange: "transform, opacity",
  };

  return (
    <main role="main" aria-labelledby="home-heading" style={{ isolation: "isolate" }}>
      {/* Immersive hero */}
      <section
        aria-label="Hero"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "6rem 1rem",
          background: "var(--gradient-soft)",
        }}
      >
        {/* Animated gradient/blur layers */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <div
            style={{
              ...blobCommon,
              width: 420,
              height: 420,
              left: "-6rem",
              top: "-4rem",
              background:
                "radial-gradient(closest-side, rgba(37,99,235,0.35), rgba(37,99,235,0.12), transparent)",
              animation: "floatA 12s infinite alternate",
            }}
          />
          <div
            style={{
              ...blobCommon,
              width: 560,
              height: 560,
              right: "-8rem",
              top: "-6rem",
              background:
                "radial-gradient(closest-side, rgba(245,158,11,0.30), rgba(245,158,11,0.12), transparent)",
              animation: "floatB 14s infinite alternate",
            }}
          />
          <div
            style={{
              ...blobCommon,
              width: 460,
              height: 460,
              left: "20%",
              bottom: "-8rem",
              background:
                "radial-gradient(closest-side, rgba(59,130,246,0.28), rgba(59,130,246,0.10), transparent)",
              animation: "floatC 16s infinite alternate",
            }}
          />
        </div>

        {/* Centered heading and subtitle */}
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            className="flex flex-col items-center"
            style={{ textAlign: "center", gap: "1rem", maxWidth: 900, margin: "0 auto" }}
          >
            <h1 id="home-heading" style={{ fontSize: "clamp(2rem, 6vw, 3.25rem)", margin: 0 }}>
              Learn without limits with
              <span style={{ color: "var(--color-primary)" }}> EduVantage</span>
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--color-muted)",
                fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                lineHeight: 1.6,
              }}
            >
              Immersive, AI-powered classrooms, real-time tutoring, advanced analytics,
              and social learning—all in a modern, responsive experience.
            </p>

            {/* CTAs */}
            <div className="flex items-center" style={{ gap: "0.75rem", marginTop: "0.75rem" }}>
              <Button
                onClick={onGetStarted}
                aria-label="Get Started"
                title="Create your account to begin"
              >
                Get Started
              </Button>

              {/* Use glass variant for secondary CTA to align with Ocean Professional theme */}
              <Button
                variant="glass"
                className="is-interactive"
                onClick={onExplore}
                onKeyDown={handleExploreKey}
                aria-label="Explore Courses"
                title="Browse available courses"
                role="button"
              >
                Explore Courses
              </Button>
            </div>
          </div>
        </div>

        {/* Keyframes (scoped via style tag for simplicity) */}
        <style>{`
          @keyframes floatA { from { transform: translateY(0px) translateX(0px); } to { transform: translateY(18px) translateX(10px); } }
          @keyframes floatB { from { transform: translateY(0px) translateX(0px); } to { transform: translateY(-14px) translateX(-10px); } }
          @keyframes floatC { from { transform: translateY(0px) translateX(0px); } to { transform: translateY(22px) translateX(-6px); } }
        `}</style>
      </section>

      {/* Feature previews grid with glass cards */}
      <section aria-label="Features" className="container" style={{ padding: "2.5rem 0 4rem" }}>
        <div
          className="flex"
          style={{
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <FeatureCard
            title="Immersive Classroom"
            description="Real-time collaboration, spatial audio, and interactive boards."
            emoji="🎓"
          />
          <FeatureCard
            title="AI Tutor"
            description="Adaptive assistance tailored to your pace and goals."
            emoji="🤖"
          />
          <FeatureCard
            title="Analytics"
            description="Progress tracking with insights that keep you on course."
            emoji="📊"
          />
          <FeatureCard
            title="Community"
            description="Learn together through posts, comments, and peer feedback."
            emoji="🧑‍🤝‍🧑"
          />
        </div>
      </section>
    </main>
  );
}

/**
 * FeatureCard - small glass preview card with simple hover motion.
 */
function FeatureCard({ title, description, emoji }) {
  return (
    <Card
      variant="glass"
      className="is-interactive"
      style={{
        width: "min(100%, 280px)",
        minHeight: 160,
        padding: "1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
      aria-label={`${title} feature`}
    >
      <div style={{ fontSize: "1.5rem" }} aria-hidden="true">
        {emoji}
      </div>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ color: "var(--color-muted)" }}>{description}</div>
      <div className="glass-divider" style={{ marginTop: "0.5rem" }} />
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          Preview
        </span>
      </div>
    </Card>
  );
}
