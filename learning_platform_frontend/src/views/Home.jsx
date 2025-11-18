import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { logger } from "../services/logger";
import { apiClient } from "../services/apiClient";
import { isFeatureEnabled } from "../services/featureFlags";
import ThreeDBackground from "../components/home/ThreeDBackground";
import FeatureCard3D from "../components/home/FeatureCard3D";
import PreviewModal from "../components/home/PreviewModal";
import "../styles/theme.css";
import "../styles/utilities.css";

/**
 * PUBLIC_INTERFACE
 * Home page - immersive landing with animated 3D background, 3D tilt cards, and CTAs.
 * Accessibility: proper landmarks, aria-labels for CTAs, sufficient color contrast via theme tokens.
 */
export default function Home() {
  const navigate = useNavigate();
  const [modal, setModal] = useState({ open: false, title: "", key: "" });

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
    const exploreV2 = isFeatureEnabled("exploreV2");
    logger.debug("Explore feature flag", { exploreV2 });
    const destination = exploreV2 ? "/dashboard" : "/courses";
    navigate(destination);
  };

  const handleExploreKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      onExplore(e);
    }
  };

  const blobCommon = useMemo(
    () => ({
      position: "absolute",
      filter: "blur(60px)",
      opacity: 0.6,
      borderRadius: "50%",
      pointerEvents: "none",
      animationTimingFunction: "ease-in-out",
      willChange: "transform, opacity",
    }),
    []
  );

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
        {/* 3D animated particles layer */}
        <ThreeDBackground />

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
          <FeatureCard3D
            title="Immersive Classroom"
            description="Real-time collaboration, spatial audio, and interactive boards."
            emoji="🎓"
            onPreview={() => setModal({ open: true, title: "Immersive Classroom Preview", key: "classroom" })}
          />
          <FeatureCard3D
            title="AI Tutor"
            description="Adaptive assistance tailored to your pace and goals."
            emoji="🤖"
            onPreview={() => setModal({ open: true, title: "AI Tutor Preview", key: "tutor" })}
          />
          <FeatureCard3D
            title="Analytics"
            description="Progress tracking with insights that keep you on course."
            emoji="📊"
            onPreview={() => setModal({ open: true, title: "Analytics Preview", key: "analytics" })}
          />
          <FeatureCard3D
            title="Community"
            description="Learn together through posts, comments, and peer feedback."
            emoji="🧑‍🤝‍🧑"
            onPreview={() => setModal({ open: true, title: "Community Preview", key: "community" })}
          />
        </div>
      </section>

      <PreviewModal
        open={modal.open}
        onClose={() => setModal({ open: false, title: "", key: "" })}
        title={modal.title}
      >
        {modal.key === "classroom" && (
          <div>
            <p>
              Experience a live, collaborative classroom with shared whiteboards, spatial audio,
              and low-latency presence. Join a session to see peers interacting in real-time.
            </p>
            <div
              className="glass"
              style={{
                padding: "0.75rem",
                display: "grid",
                gap: "0.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              }}
            >
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Whiteboard module">
                🧠 Whiteboard
              </div>
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Chat module">
                💬 Live Chat
              </div>
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Presence module">
                👥 Presence
              </div>
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Media module">
                🎥 Media
              </div>
            </div>
          </div>
        )}
        {modal.key === "tutor" && (
          <div>
            <p>
              Your personal AI tutor adapts to your goals and pace. Ask questions, get hints,
              and receive step-by-step walkthroughs to master concepts.
            </p>
            <div className="glass" style={{ padding: ".75rem" }}>
              <div style={{ display: "grid", gap: ".5rem" }}>
                <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Example prompt">
                  Q: How do I solve quadratic equations quickly?
                </div>
                <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Example AI response">
                  A: Use the quadratic formula x = [-b ± √(b² - 4ac)] / (2a). Identify a, b, c from ax² + bx + c = 0.
                </div>
              </div>
            </div>
          </div>
        )}
        {modal.key === "analytics" && (
          <div>
            <p>
              Track your progress with visual insights across topics, time, and mastery. Identify
              strengths and areas to improve with actionable suggestions.
            </p>
            <div
              className="glass"
              style={{
                padding: ".75rem",
                display: "grid",
                gap: ".5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Streak card">
                🔥 Streak: 7 days
              </div>
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Accuracy card">
                🎯 Accuracy: 92%
              </div>
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Time card">
                ⏱️ Study Time: 12h 45m
              </div>
            </div>
          </div>
        )}
        {modal.key === "community" && (
          <div>
            <p>
              Learn together through posts, comments, and peer feedback. Share milestones and
              join study groups aligned with your goals.
            </p>
            <div className="glass" style={{ padding: ".75rem", display: "grid", gap: ".5rem" }}>
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Sample post 1">
                🎓 Ava: Just aced Algebra mastery quiz with 95%!
              </div>
              <div className="surface glass-sm" style={{ padding: ".5rem" }} aria-label="Sample post 2">
                📚 Noah: Study group tonight at 7pm — join in!
              </div>
            </div>
          </div>
        )}
      </PreviewModal>
    </main>
  );
}
