import React, { useContext, useMemo, useState } from "react";
import "../styles/dashboard.css";
import { AuthContext } from "../auth/AuthProvider";
import useProfileRole from "../auth/useProfileRole";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

/**
 * Modal to select from multiple courses for the quick action.
 * Keyboard and a11y supported.
 */
function QuickActionCourseModal({ courses, isOpen, onClose, onSelect }) {
  const [focusedIdx, setFocusedIdx] = useState(0);
  React.useEffect(() => {
    if (!isOpen) return;
    function down(e) {
      if (e.key === "ArrowDown") {
        setFocusedIdx(i => (i + 1) % courses.length);
      } else if (e.key === "ArrowUp") {
        setFocusedIdx(i => (i - 1 + courses.length) % courses.length);
      } else if (e.key === "Enter" && courses[focusedIdx]) {
        onSelect(courses[focusedIdx]);
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [isOpen, focusedIdx, courses, onClose, onSelect]);
  if (!isOpen) return null;
  return (
    <div
      className="quickaction-modal"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1001,
        width: "100vw",
        height: "100vh",
        background: "rgba(37, 99, 235, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        className="quickaction-modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "1rem",
          boxShadow: "0px 8px 24px rgba(0,0,0,0.14)",
          minWidth: 320,
          padding: "2rem",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h2 style={{ color: "#2563EB", marginBottom: 16, fontWeight: 600 }}>
          Select Course
        </h2>
        <div role="listbox" aria-activedescendant={`modal-item-${focusedIdx}`}>
          {courses.map((c, idx) => (
            <button
              key={c.id}
              id={`modal-item-${idx}`}
              role="option"
              tabIndex={idx === focusedIdx ? 0 : -1}
              aria-selected={idx === focusedIdx}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                borderRadius: 8,
                background: idx === focusedIdx ? "#F0F8FF" : "#F9FAFB",
                border: idx === focusedIdx ? "1px solid #2563EB" : "1px solid transparent",
                marginBottom: 6,
                outline: idx === focusedIdx ? "2px solid #2563EB" : "none",
                color: "#111827",
                fontWeight: 500,
                cursor: "pointer"
              }}
              onClick={() => onSelect(c)}
              onMouseEnter={() => setFocusedIdx(idx)}
            >
              {c.title || c.name || "(Untitled Course)"}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 18,
            background: "#F3F4F6",
            color: "#2563EB",
            borderRadius: 8,
            padding: "0.5rem 1.5rem",
            border: "none",
            fontWeight: 500,
            cursor: "pointer"
          }}
          tabIndex={courses.length}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const auth = useContext(AuthContext);
  const role = useProfileRole();
  const navigate = useNavigate();
  const userId = auth?.user?.id ?? null;

  const { courses, loading, error } = useInstructorCourses(role === "instructor" ? userId : null);

  // Modal state for multi-course selection
  const [modalOpen, setModalOpen] = useState(false);

  // Most recently updated course (default)
  const defaultCourse = useMemo(
    () => (courses && courses.length > 0 ? courses[0] : null),
    [courses]
  );

  // Quick Action Handlers
  const handleQuickAction = () => {
    if (!courses || courses.length === 0) return;
    if (courses.length === 1) {
      navigate(`/instructor/courses/${courses[0].id}/quizzes/new`);
    } else {
      setModalOpen(true);
    }
  };

  const handleSelectCourse = (course) => {
    setModalOpen(false);
    if (course && course.id) {
      navigate(`/instructor/courses/${course.id}/quizzes/new`);
    }
  };

  const handleCreateCourse = () => {
    navigate("/instructor/courses/new");
  };

  // Ocean Professional theme palette
  const colorPrimary = "#2563EB";
  const colorAccent = "#F59E0B";

  // Only visible for instructors
  const showInstructorQuickAction = role === "instructor";

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {showInstructorQuickAction && (
        <div
          className="dashboard-quickaction"
          style={{
            marginTop: 24,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            background: "linear-gradient(90deg,#2563EB0F,#F9FAFB 80%)",
            padding: "1.5rem 2rem",
            borderRadius: 16,
            boxShadow: "0 2px 10px rgba(37,99,235,0.06)",
            position: "relative",
            maxWidth: 520,
          }}
          aria-label="Instructor quick action: Create quiz"
        >
          <span
            style={{
              color: colorPrimary,
              fontWeight: 600,
              fontSize: "1.18rem"
            }}
          >
            Create a Quiz for Your Course
          </span>
          <span style={{ color: "#374151", fontSize: 15, margin: "8px 0 15px 0" }}>
            Build engaging quizzes to boost student learning.
          </span>
          {loading && (
            <div style={{ margin: "12px 0" }}>
              <Loader size="sm" />
              <span style={{ marginLeft: 9, color: "#666" }}>Loading your courses...</span>
            </div>
          )}
          {error && (
            <div style={{
              background: "#FEF2F2",
              color: "#B91C1C",
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 14,
              marginBottom: 8
            }}>
              Error: {error}
            </div>
          )}
          {!loading && !error && (
            <>
              {courses.length > 0 ? (
                <>
                  <Button
                    aria-label="Quick create quiz"
                    style={{
                      background: colorPrimary,
                      color: "#fff",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 16,
                      padding: "0.85rem 2.2rem",
                      marginRight: 14,
                      transition: "all 0.18s",
                      outline: "none",
                      boxShadow: "0px 1.5px 0.5px rgba(37,99,235,0.08)"
                    }}
                    onClick={handleQuickAction}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleQuickAction();
                      }
                    }}
                  >
                    {courses.length === 1
                      ? `Create Quiz for "${courses[0].title || courses[0].name || 'Untitled'}"`
                      : `Create Quiz for Course`}
                  </Button>
                  {courses.length > 1 && (
                    <span style={{ marginTop: 9, fontSize: 13, color: "#5B6471" }}>
                      Most recent course: <span style={{ color: colorAccent }}>{defaultCourse.title || defaultCourse.name}</span>
                      {" "}(<button
                        onClick={() => setModalOpen(true)}
                        style={{ marginLeft: 8, background: "none", border: "none", color: colorPrimary, textDecoration: "underline", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                        aria-label="Select a different course"
                      >choose another</button>)
                    </span>
                  )}
                  <QuickActionCourseModal
                    courses={courses}
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSelect={handleSelectCourse}
                  />
                </>
              ) : (
                <div style={{ margin: "12px 0" }}>
                  <span style={{ color: "#EF4444", fontWeight: 500, marginRight: 10 }}>
                    You have no courses yet.
                  </span>
                  <Button
                    style={{
                      background: colorAccent,
                      color: "#fff",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 16,
                      padding: "0.85rem 2.2rem",
                    }}
                    aria-label="Create a new course"
                    onClick={handleCreateCourse}
                  >
                    Create Course
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {/* Dashboard main content goes here */}
    </div>
  );
}

export default Dashboard;
