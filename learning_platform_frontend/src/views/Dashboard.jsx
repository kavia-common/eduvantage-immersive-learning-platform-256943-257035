import React, { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import AssistantPanel from "../components/assistant/AssistantPanel";
import LearningAssistant from "../components/assistant/LearningAssistant";
import VirtualClassroom from "../components/VirtualClassroom";
import WellbeingDashboard from "../components/wellbeing/WellbeingDashboard";
import { useUserEnrollments } from "../hooks/useUserEnrollments";

/**
 * PUBLIC_INTERFACE
 * Dashboard - authenticated overview with glass welcome header, stats, quick actions,
 * assistant modules, and a Virtual Classroom preview panel.
 * 
 * Accessibility: Includes aria labels and roles for interactive elements.
 * Responsiveness: Uses CSS grid and responsive cards.
 */
export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Study Time", value: "12h 45m", sub: "Last 7 days", emoji: "⏱️" },
    { label: "Accuracy", value: "92%", sub: "Avg quiz score", emoji: "🎯" },
    { label: "Streak", value: "7 days", sub: "Keep it going!", emoji: "🔥" },
    { label: "Courses", value: "5", sub: "Active enrollments", emoji: "📚" },
  ];

  // --- Begin Take Quiz Quick Action (Dynamic) ---
  const { enrollments, loading: quizLoading, error: quizError } = useUserEnrollments();
  const [navigating, setNavigating] = useState(false);
  const quizButtonRef = useRef(null);

  // Compute the best course for quiz navigation
  const getBestQuizTarget = useCallback(() => {
    if (enrollments && enrollments.length > 0) {
      // Most recent by descending created_at
      const courseId = enrollments[0].course_id;
      return `/courses/${courseId}?tab=quizzes`;
    }
    return `/courses?intent=quiz`;
  }, [enrollments]);

  // Button handler for Take Quiz (overrides legacy quickActions['Take Quiz'])
  const handleQuizClick = useCallback(
    async (e) => {
      e.preventDefault();
      setNavigating(true);
      try {
        const target = getBestQuizTarget();
        navigate(target);
        setNavigating(false);

        if ((!enrollments || enrollments.length === 0) && typeof window !== "undefined") {
          setTimeout(() => {
            if (window?.toast) {
              window.toast(
                "Enroll in a course to take quizzes!",
                { type: "info" }
              );
            } else {
              window.alert("Enroll in a course to access quizzes.");
            }
          }, 500);
        }
      } catch (e) {
        setNavigating(false);
        // Robust error handling - no stack trace
        if (window?.toast) {
          window.toast(
            "Could not determine course for quiz. Try again later.",
            { type: "error" }
          );
        }
      }
    },
    [enrollments, getBestQuizTarget, navigate]
  );
  // --- End Take Quiz Quick Action ---

  // Define other quick actions, removing take-quiz from array (use live button below)
  const quickActions = [
    {
      label: "Continue Learning",
      to: "/classroom",
      emoji: "▶️",
      aria: "Continue learning in your last class",
    },
    {
      label: "Join Live Class",
      to: "/classroom",
      emoji: "📡",
      aria: "Join a live class session",
    },
    // Take Quiz handled separately
    {
      label: "View Progress",
      to: "/analytics",
      emoji: "📈",
      aria: "View your learning progress analytics",
    },
  ];

  return (
    <div className="container" role="main" aria-labelledby="dashboard-heading">
      {/* Glass welcome header */}
      <Card
        variant="glass"
        className="is-interactive"
        style={{
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          background: "transparent",
        }}
        aria-label="Welcome Header"
      >
        <div aria-hidden="true" style={{ fontSize: "1.5rem" }}>👋</div>
        <div style={{ flex: 1 }}>
          <h1 id="dashboard-heading" style={{ margin: 0, fontSize: "1.5rem" }}>
            Welcome back
            <span style={{ color: "var(--color-primary)" }}> Learner</span>
          </h1>
          <p className="mt-1" style={{ margin: 0, color: "var(--color-muted)" }}>
            Here’s a snapshot of your learning and what’s next.
          </p>
        </div>
        <div className="hide-sm">
          <Button
            variant="glass"
            className="is-interactive"
            aria-label="Go to profile"
            onClick={() => navigate("/profile")}
            title="Open your profile"
          >
            Profile
          </Button>
        </div>
      </Card>

      {/* Stats grid */}
      <section aria-label="Your learning statistics" className="mt-3">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {stats.map((s) => (
            <Card
              key={s.label}
              variant="glass"
              className="is-interactive"
              aria-label={`${s.label} card`}
              style={{ padding: "1rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div aria-hidden="true" style={{ fontSize: "1.25rem" }}>
                  {s.emoji}
                </div>
                <div style={{ fontWeight: 600 }}>{s.label}</div>
              </div>
              <div className="glass-divider" style={{ margin: "0.6rem 0" }} />
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>{s.sub}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick actions" className="mt-3">
        <Card variant="glass" style={{ padding: "1rem" }}>
          <div
            className="flex items-center justify-between"
            style={{ gap: "0.75rem", flexWrap: "wrap" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div aria-hidden="true" style={{ fontSize: "1.25rem" }}>⚡</div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Quick Actions</h2>
            </div>
          </div>
          <div
            className="mt-2"
            role="group"
            aria-label="Primary dashboard actions"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.75rem",
              marginTop: "0.75rem",
            }}
          >
            {/* Map other quick actions */}
            {quickActions.map((qa) => (
              <Card
                key={qa.label}
                variant="glass"
                className="is-interactive"
                aria-label={qa.aria}
                style={{
                  padding: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div aria-hidden="true" style={{ fontSize: "1.1rem" }}>
                    {qa.emoji}
                  </div>
                  <div style={{ fontWeight: 600 }}>{qa.label}</div>
                </div>
                <Link to={qa.to} aria-label={qa.aria} title={qa.label}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="is-interactive"
                    aria-label={`Open: ${qa.label}`}
                  >
                    Open
                  </Button>
                </Link>
              </Card>
            ))}
            {/* --- Custom dynamic Take Quiz button --- */}
            <Card
              key="Take Quiz"
              variant="glass"
              className="is-interactive"
              aria-label="Take a quiz for your current course"
              style={{
                padding: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div aria-hidden="true" style={{ fontSize: "1.1rem" }}>🧠</div>
                <div style={{ fontWeight: 600 }}>
                  Take Quiz
                </div>
              </div>
              <Button
                ref={quizButtonRef}
                type="button"
                className="take-quiz-btn is-interactive"
                aria-label={
                  quizLoading || navigating
                    ? "Preparing quiz action"
                    : "Take a quiz for your current course"
                }
                onClick={handleQuizClick}
                disabled={quizLoading || navigating}
                variant="primary"
                size="sm"
                style={{
                  minWidth: 80,
                  position: "relative",
                  opacity: quizLoading || navigating ? 0.6 : 1,
                  cursor: quizLoading || navigating ? "not-allowed" : "pointer",
                }}
              >
                {quizLoading || navigating ? (
                  <span
                    className="loader"
                    aria-busy="true"
                    role="status"
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid #fff",
                      borderTop: "2px solid #60A5FA",
                      borderRadius: "50%",
                      display: "inline-block",
                      verticalAlign: "middle",
                      animation: "spin 1s linear infinite"
                    }}
                  />
                ) : (
                  <span role="text">Open</span>
                )}
              </Button>

              <style>
                {`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                  .take-quiz-btn .loader {
                    border-style: solid;
                    border-width: 2px;
                  }
                `}
              </style>

              {/* Error state (optional) */}
              {quizError && (
                <span
                  role="alert"
                  aria-live="assertive"
                  style={{
                    color: "#EF4444",
                    marginLeft: 8,
                    fontSize: "0.95rem",
                    fontWeight: 500
                  }}
                >
                  {typeof quizError === "string"
                    ? quizError
                    : "Could not load your enrollments."}
                </span>
              )}
            </Card>
          </div>
        </Card>
      </section>

      {/* Virtual Classroom Preview Panel */}
      <section className="mt-3" aria-label="Virtual Classroom preview panel">
        <Card variant="glass" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Virtual Classroom</h2>
            <Link to="/classroom" aria-label="Open full classroom view" title="Open full classroom view">
              <Button variant="primary" size="sm" className="is-interactive">Open</Button>
            </Link>
          </div>
          <VirtualClassroom embedded />
        </Card>
      </section>

      {/* Assistant panel remains available below */}
      <section className="mt-3" aria-label="AI Assistant">
        <AssistantPanel defaultOpen />
      </section>

      {/* New Learning Assistant (static UI) */}
      <section className="mt-3" aria-label="Learning Assistant (static)">
        <LearningAssistant />
      </section>

      {/* Explore modules */}
      <section className="mt-3" aria-label="Explore modules">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          <PreviewCard
            title="Social Feed"
            description="Share progress, ask questions, and celebrate wins with peers."
            to="/feed"
            cta="Open Feed"
            emoji="📰"
          />
          <PreviewCard
            title="Wellbeing"
            description="Log your daily mood and view trends over time."
            to="/wellbeing"
            cta="Open Wellbeing"
            emoji="🧠"
          />
          <PreviewCard
            title="Career Path AI"
            description="Get tailored career recommendations from your goals."
            to="/career"
            cta="Open Career"
            emoji="🧭"
          />
        </div>
      </section>

      {/* Wellbeing quick panel on dashboard */}
      <section className="mt-3" aria-label="Wellbeing dashboard panel">
        <Card variant="glass" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Wellbeing</h2>
            <Link to="/wellbeing" aria-label="Open full wellbeing view" title="Open full wellbeing view">
              <Button variant="primary" size="sm" className="is-interactive">Open</Button>
            </Link>
          </div>
          <WellbeingDashboard />
        </Card>
      </section>

      {/* Inline Social Feed preview panel */}
      <section className="mt-3" aria-label="Social Feed preview">
        <Card variant="glass" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Community Feed</h2>
            <Link to="/feed" aria-label="Open full social feed" title="Open full social feed">
              <Button variant="primary" size="sm" className="is-interactive">Open</Button>
            </Link>
          </div>
          {/* Lightweight sample feed list */}
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <article className="surface glass-sm" style={{ padding: ".75rem" }} aria-label="Post by Ava Singh">
              <header style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <div aria-hidden style={{ fontSize: "1.5rem" }}>🎓</div>
                <div style={{ fontWeight: 700 }}>Ava Singh</div>
                <div style={{ color: "var(--color-muted)", fontSize: ".85rem", marginLeft: "auto" }}>2h ago</div>
              </header>
              <div className="mt-2">Just completed the Algebra mastery quiz with 95%!</div>
              <div className="mt-2" style={{ display: "flex", gap: ".5rem" }}>
                <Button variant="purple" size="sm" className="is-interactive" aria-label="Like post">👍 Like (12)</Button>
                <Button variant="warning" size="sm" className="is-interactive" aria-label="Comment on post">💬 Comment (4)</Button>
              </div>
            </article>
            <article className="surface glass-sm" style={{ padding: ".75rem" }} aria-label="Post by Noah Kim">
              <header style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                <div aria-hidden style={{ fontSize: "1.5rem" }}>📚</div>
                <div style={{ fontWeight: 700 }}>Noah Kim</div>
                <div style={{ color: "var(--color-muted)", fontSize: ".85rem", marginLeft: "auto" }}>4h ago</div>
              </header>
              <div className="mt-2">Study group tonight at 7pm for Biology. Drop your questions!</div>
              <div className="mt-2" style={{ display: "flex", gap: ".5rem" }}>
                <Button variant="purple" size="sm" className="is-interactive" aria-label="Like post">👍 Like (7)</Button>
                <Button variant="warning" size="sm" className="is-interactive" aria-label="Comment on post">💬 Comment (9)</Button>
              </div>
            </article>
          </div>
        </Card>
      </section>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * PreviewCard - small reusable card for module previews with CTA.
 */
function PreviewCard({ title, description, to, cta, emoji }) {
  return (
    <Card
      variant="glass"
      className="is-interactive"
      style={{ padding: "1rem" }}
      aria-label={`${title} preview`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <div aria-hidden="true" style={{ fontSize: "1.25rem" }}>
          {emoji}
        </div>
        <h3 className="mt-0" style={{ margin: 0 }}>{title}</h3>
      </div>
      <p className="mt-2" style={{ color: "var(--color-muted)", marginTop: "0.5rem" }}>
        {description}
      </p>
      <div className="glass-divider" style={{ margin: "0.6rem 0" }} />
      <div style={{ marginLeft: "auto" }}>
        <Link to={to} aria-label={cta} title={cta}>
          <Button variant="primary" size="sm" className="is-interactive">
            {cta}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
