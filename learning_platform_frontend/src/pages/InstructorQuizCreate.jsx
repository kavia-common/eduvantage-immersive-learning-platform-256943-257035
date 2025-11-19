import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useProfileRole from "../auth/useProfileRole";
import QuizForm from "../components/quizzes/QuizForm";
import { apiClient } from "../services/apiClient";
import "../styles/dashboard.css";

const DEFAULT_SUCCESS_TIMEOUT = 1800;

/**
 * Page for creating a new quiz for a course. Only accessible to instructors.
 */
const InstructorQuizCreate = () => {
  const { role } = useProfileRole();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (values) => {
    setCreating(true);
    setApiError("");
    try {
      // POST to course quizzes endpoint
      await apiClient.post(`/courses/${courseId}/quizzes`, values);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate(`/instructor/courses/${courseId}/quizzes`);
      }, DEFAULT_SUCCESS_TIMEOUT);
    } catch (err) {
      setApiError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to create quiz."
      );
    } finally {
      setCreating(false);
    }
  };

  if (!role || role !== "instructor") {
    return (
      <div className="dashboard-card" style={{ maxWidth: 560, margin: "2em auto" }}>
        <h2>Instructor Access Required</h2>
        <div className="text-muted">Only instructors can create quizzes.</div>
      </div>
    );
  }

  return (
    <section className="dashboard-main dashboard-card" style={{ maxWidth: 640, margin: "2em auto" }}>
      <h1 className="dashboard-form-title">Create New Quiz</h1>
      <QuizForm
        initialQuiz={{}}
        onSubmit={handleSubmit}
        loading={creating}
        error={apiError}
      />
      {showModal && (
        <div
          className="modal-overlay"
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 11001,
            width: "100vw",
            height: "100vh",
            background: "rgba(33,42,58,0.38)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: "2em 2.5em",
              minWidth: 260,
              boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            role="document"
            aria-label="Quiz creation success dialog"
          >
            <div style={{ fontSize: "1.1em", marginBottom: 20, color: "#2563EB" }}>
              Quiz created successfully!
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate(`/instructor/courses/${courseId}/quizzes`)}
              style={{ marginTop: 10 }}
            >
              Go to Quizzes
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstructorQuizCreate;
