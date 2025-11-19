import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useProfileRole from "../auth/useProfileRole";
import { useInstructorCourses } from "../hooks/useInstructorCourses";
import { apiClient } from "../services/apiClient";
import "../styles/dashboard.css";

/**
 * Shows quizzes for a specific instructor course, with options to create or edit.
 */
const InstructorCourseQuizzes = () => {
  const { courseId } = useParams();
  const { role } = useProfileRole();
  const { courses, loading: coursesLoading } = useInstructorCourses();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const thisCourse =
    courses && Array.isArray(courses)
      ? courses.find((c) => String(c.id) === String(courseId))
      : null;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFetchError("");
    apiClient
      .get(`/courses/${courseId}/quizzes`)
      .then((response) => {
        if (active) {
          setQuizzes(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setFetchError("Failed to load quizzes for course.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  if (!role || role !== "instructor") {
    return (
      <div className="dashboard-card" style={{ maxWidth: 560, margin: "2em auto" }}>
        <h2 className="dashboard-form-title">Instructor Access Required</h2>
        <div className="text-muted">Only instructors can manage course quizzes.</div>
      </div>
    );
  }

  return (
    <section className="dashboard-main dashboard-card" style={{ margin: "2em auto", maxWidth: 800 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="dashboard-form-title" style={{ margin: 0 }}>
          Quizzes for {thisCourse ? thisCourse.title : "Course"}
        </h1>
        <Link
          to={`/instructor/courses/${courseId}/quizzes/create`}
          className="btn-primary"
          style={{ marginLeft: 24 }}
        >
          + New Quiz
        </Link>
      </header>
      {loading || coursesLoading ? (
        <div style={{ padding: "1.5em 0" }} aria-busy="true">
          Loading quizzes...
        </div>
      ) : fetchError ? (
        <div className="form-error" role="alert">{fetchError}</div>
      ) : quizzes.length === 0 ? (
        <div style={{ padding: "1.5em 0" }} className="text-muted">
          No quizzes for this course yet.
        </div>
      ) : (
        <table className="dashboard-table" style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.title}</td>
                <td>{quiz.description}</td>
                <td>{Array.isArray(quiz.questions) ? quiz.questions.length : "N/A"}</td>
                <td>
                  <Link
                    to={`/instructor/courses/${courseId}/quizzes/${quiz.id}/edit`}
                    className="btn-small btn-primary"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default InstructorCourseQuizzes;
