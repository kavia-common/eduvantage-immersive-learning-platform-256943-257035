import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useProfileRole from "../auth/useProfileRole";
import QuizForm from "../components/quizzes/QuizForm";
import { apiClient } from "../services/apiClient";
import "../styles/dashboard.css";

const DEFAULT_SUCCESS_TIMEOUT = 1800;

/**
 * Page to edit an existing quiz for a course.
 */
const InstructorQuizEdit = () => {
  const { role } = useProfileRole();
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [initialQuiz, setInitialQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setApiError("");
    apiClient
      .get(`/courses/${courseId}/quizzes/${quizId}`)
      .then((response) => {
        setInitialQuiz(response.data || {});
      })
      .catch(() => {
        setApiError("Quiz not found.");
      })
      .finally(() => setLoading(false));
  }, [courseId, quizId]);

  const handleSubmit = async (values) => {
    setApiError("");
    setLoading(true);
    try {
      await apiClient.put(`/courses/${courseId}/quizzes/${quizId}`, values);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate(`/instructor/courses/${courseId}/quizzes`);
      }, DEFAULT_SUCCESS_TIMEOUT);
    } catch (err) {
      setApiError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to update quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!role || role !== "instructor") {
    return (
      <div className="dashboard-card" style={{ maxWidth: 560, margin: "2em auto" }}>
        <h2>Instructor Access Required</h2>
        <div className="text-muted">Only instructors can edit quizzes.</div>
      </div>
    );
  }

  return (
    <section className="dashboard-main dashboard-card" style={{ maxWidth: 640, margin: "2em auto" }}>
      <h1 className="dashboard-form-title">Edit Quiz</h1>
      {loading ? (
        <div style={{ padding: 32 }}>Loading quiz...</div>
      ) : initialQuiz ? (
        <QuizForm
          initialQuiz={initialQuiz}
          onSubmit={handleSubmit}
          loading={loading}
          error={apiError}
        />
      ) : (
        <div className="form-error" role="alert">
          {apiError || "Quiz could not be loaded."}
        </div>
      )}
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
            aria-label="Quiz updated success dialog"
          >
            <div style={{ fontSize: "1.1em", marginBottom: 20, color: "#2563EB" }}>
              Quiz updated successfully!
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

export default InstructorQuizEdit;
