import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../styles/dashboard.css";

/**
 * QuizForm renders a form for creating or editing a quiz.
 *
 * Props:
 *   - initialQuiz: Object with initial values for the quiz (for editing).
 *   - onSubmit: Function to call when form is submitted.
 *   - loading: Boolean if submission is in progress.
 *   - error: Error message to display on submission error.
 */
const QuizForm = ({
  initialQuiz = {},
  onSubmit,
  loading = false,
  error = "",
}) => {
  const [title, setTitle] = useState(initialQuiz.title || "");
  const [description, setDescription] = useState(initialQuiz.description || "");
  const [questions, setQuestions] = useState(initialQuiz.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setTitle(initialQuiz.title || "");
    setDescription(initialQuiz.description || "");
    setQuestions(initialQuiz.questions || []);
  }, [initialQuiz]);

  const handleAddQuestion = () => {
    if (!currentQuestion.trim()) {
      setFormError("Question cannot be empty.");
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion("");
    setFormError("");
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Quiz title is required.");
      return;
    }
    if (questions.length === 0) {
      setFormError("At least one question is required.");
      return;
    }
    setFormError("");
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      questions,
    });
  };

  return (
    <form
      className="dashboard-card dashboard-form quiz-form"
      aria-label="Quiz Form"
      onSubmit={handleSubmit}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <h2 className="dashboard-form-title">
        {initialQuiz.id ? "Edit Quiz" : "Create Quiz"}
      </h2>
      {error && (
        <div className="form-error" role="alert" tabIndex={-1}>
          {error}
        </div>
      )}
      {formError && (
        <div className="form-error" role="alert" tabIndex={-1}>
          {formError}
        </div>
      )}
      <div className="form-group mb-3">
        <label htmlFor="quiz-title" className="form-label">
          Quiz Title<span style={{ color: "#EF4444" }} aria-hidden="true">*</span>
        </label>
        <input
          id="quiz-title"
          name="title"
          className="form-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          autoFocus
          aria-required="true"
        />
      </div>
      <div className="form-group mb-3">
        <label htmlFor="quiz-description" className="form-label">
          Description
        </label>
        <textarea
          id="quiz-description"
          name="description"
          className="form-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
        />
      </div>
      <fieldset className="form-group quiz-questions mb-4">
        <legend className="form-label">Questions</legend>
        <div className="quiz-questions-list mb-2">
          {questions.length === 0 ? (
            <span className="text-muted">No questions added yet.</span>
          ) : (
            <ol className="questions-ol">
              {questions.map((q, idx) => (
                <li
                  key={idx}
                  className="question-li"
                  style={{ display: "flex", alignItems: "center", marginBottom: 3 }}
                >
                  <span style={{ flex: 1 }}>{q}</span>
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    aria-label={`Remove question ${idx + 1}`}
                    onClick={() => handleRemoveQuestion(idx)}
                    tabIndex={0}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="add-question-group" style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            value={currentQuestion}
            placeholder="Enter new question"
            onChange={(e) => setCurrentQuestion(e.target.value)}
            aria-label="New question text"
          />
          <button
            type="button"
            className="btn-primary"
            style={{ minWidth: 88 }}
            onClick={handleAddQuestion}
            disabled={!currentQuestion.trim()}
            aria-label="Add question"
          >
            Add
          </button>
        </div>
      </fieldset>
      <div className="form-actions" style={{ textAlign: "right" }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Saving..." : initialQuiz.id ? "Update Quiz" : "Create Quiz"}
        </button>
      </div>
    </form>
  );
};

QuizForm.propTypes = {
  initialQuiz: PropTypes.shape({
    id: PropTypes.any,
    title: PropTypes.string,
    description: PropTypes.string,
    questions: PropTypes.arrayOf(PropTypes.string),
  }),
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default QuizForm;
