import React, { useContext, useMemo, useState } from "react";
import "../styles/dashboard.css";
import { AuthContext } from "../auth/AuthProvider";
import useProfileRole from "../auth/useProfileRole";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import { useUserEnrollments } from "../hooks/useUserEnrollments";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import BootcampResourceModal from "../components/bootcamp/BootcampResourceModal";
import BootcampResourcesList from "../components/bootcamp/BootcampResourcesList.jsx";

// Modal for quick course actions (used for Bootcamp, not for quizzes)
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
  const { role, loading: roleLoading } = useProfileRole();
  const navigate = useNavigate();
  const userId = auth?.user?.id ?? null;

  // Instructor courses
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useInstructorCourses(role === "instructor" ? userId : null);

  // Student enrollments
  const {
    enrollments = [],
    loading: enrollmentsLoading,
    error: enrollmentsError,
  } = useUserEnrollments(role === "student" ? userId : null);

  // Modal state for instructor multi-course selection (e.g. for alternate quick actions, not used for quiz anymore)
  const [modalOpen, setModalOpen] = useState(false);

  // Ocean Professional theme palette
  const colorPrimary = "#2563EB";
  const colorAccent = "#F59E0B";

  const defaultCourse = useMemo(() =>
    (courses && courses.length > 0 ? courses[0] : null), [courses]
  );

  // Bootcamp modal state
  const [showBootcampModal, setShowBootcampModal] = useState(false);

  // For Bootcamp modal: derive currentUser
  const currentUser = auth?.user || null;

  // Support refreshing Resources list after add
  const [resourcesListRefresh, setResourcesListRefresh] = useState(0);

  // Instructor: quick action - create course (previously 'create quiz')
  const handleCreateCourse = () => {
    navigate("/instructor/courses/new");
  };

  return (
    <div className="dashboard-container">
      <div style={{
        display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 22
      }}>
        <button
          type="button"
          aria-label="Open Bootcamp Resource Modal"
          onClick={() => setShowBootcampModal(true)}
          style={{
            background: "linear-gradient(to right, #2563EB 80%, #F59E0B 100%)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.05em",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            marginRight: 0,
            boxShadow: "0 2px 8px #2563eb20",
            cursor: "pointer",
            transition: "box-shadow 0.15s"
          }}
        >
          <span role="img" aria-label="bootcamp">🎓</span> KAVIA AI BOOTCAMP
        </button>
        {showBootcampModal &&
          <BootcampResourceModal
            open={showBootcampModal}
            onClose={() => setShowBootcampModal(false)}
            currentUser={currentUser}
            userRole={role}
            afterResourceAdded={() => {
              // Triggers downstream resources list to refresh
              setResourcesListRefresh(v => v + 1);
              window.localStorage.setItem("bootcamp_resource_added", "1");
            }}
          />}
      </div>

      <BootcampResourcesList
        key={resourcesListRefresh}
        afterResourceChange={() => setResourcesListRefresh(v => v + 1)}
      />

      <h1>Dashboard</h1>

      {/* Instructor: Offer quick create course if no course */}
      {(role === "instructor" && !roleLoading) && (
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
          aria-label="Instructor quick action: Create course"
        >
          <span
            style={{
              color: colorPrimary,
              fontWeight: 600,
              fontSize: "1.18rem",
            }}
          >
            Create a Course
          </span>
          <span style={{ color: "#374151", fontSize: 15, margin: "8px 0 15px 0" }}>
            Start teaching by creating your first course.
          </span>
          {coursesLoading && (
            <div style={{ margin: "12px 0" }}>
              <Loader size="sm" />
              <span style={{ marginLeft: 9, color: "#666" }}>Loading your courses...</span>
            </div>
          )}
          {coursesError && (
            <div style={{
              background: "#FEF2F2",
              color: "#B91C1C",
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 14,
              marginBottom: 8
            }}>
              Error: {coursesError}
            </div>
          )}
          {!coursesLoading && !coursesError && (
            <>
              {courses.length === 0 && (
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
