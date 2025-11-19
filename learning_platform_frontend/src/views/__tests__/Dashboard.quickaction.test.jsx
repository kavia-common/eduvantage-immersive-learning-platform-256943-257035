import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import Dashboard from "../Dashboard.jsx";
import { AuthContext } from "../../auth/AuthProvider";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../hooks/useInstructorCourses", () => ({
  useInstructorCourses: jest.fn(),
}));
jest.mock("../../auth/useProfileRole", () => jest.fn());
jest.mock("../../hooks/useUserEnrollments", () => ({
  useUserEnrollments: jest.fn(),
}));

import { useInstructorCourses } from "../../hooks/useInstructorCourses";
import useProfileRole from "../../auth/useProfileRole";
import { useUserEnrollments } from "../../hooks/useUserEnrollments";

const renderWithRouter = (ui, { providerProps, ...options } = {}) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={providerProps}>{ui}</AuthContext.Provider>
    </MemoryRouter>,
    options
  );

describe("Dashboard instructor and student quiz quick actions", () => {
  beforeEach(() => {
    useInstructorCourses.mockReset();
    useProfileRole.mockReset();
    useUserEnrollments.mockReset();
  });

  it("shows quick action only for instructors", () => {
    useProfileRole.mockReturnValue({ role: "student", loading: false });
    useInstructorCourses.mockReturnValue({ courses: [], loading: false, error: null });
    useUserEnrollments.mockReturnValue({ enrollments: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U1" } } });
    expect(
      screen.queryByLabelText(/Instructor quick action/i)
    ).not.toBeInTheDocument();

    // switch to instructor
    useProfileRole.mockReturnValue({ role: "instructor", loading: false });
    useInstructorCourses.mockReturnValue({ courses: [], loading: false, error: null });
    useUserEnrollments.mockReturnValue({ enrollments: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U1" } } });
    expect(
      screen.queryByLabelText(/Instructor quick action/i)
    ).toBeInTheDocument();
  });

  it("shows create quiz for one course", () => {
    useProfileRole.mockReturnValue({ role: "instructor", loading: false });
    useInstructorCourses.mockReturnValue({
      courses: [{ id: "C1", title: "Algebra" }],
      loading: false,
      error: null,
    });
    useUserEnrollments.mockReturnValue({ enrollments: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U1" } } });
    expect(screen.getByText(/Create Quiz for "Algebra"/)).toBeVisible();
  });

  it("shows modal for multiple courses", async () => {
    useProfileRole.mockReturnValue({ role: "instructor", loading: false });
    useInstructorCourses.mockReturnValue({
      courses: [
        { id: "C1", title: "Algebra" },
        { id: "C2", title: "Geometry" },
      ],
      loading: false,
      error: null,
    });
    useUserEnrollments.mockReturnValue({ enrollments: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U1" } } });
    expect(screen.getByText(/Create Quiz for Course/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Create Quiz for Course/i }));
    expect(
      await screen.findByRole("dialog", { name: /Select Course/i })
    ).toBeInTheDocument();
    // Modal shows both courses
    expect(screen.getByText("Algebra")).toBeInTheDocument();
    expect(screen.getByText("Geometry")).toBeInTheDocument();
  });

  it("shows 'create course' CTA if no courses", () => {
    useProfileRole.mockReturnValue({ role: "instructor", loading: false });
    useInstructorCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
    });
    useUserEnrollments.mockReturnValue({ enrollments: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U2" } } });
    expect(screen.getByText(/You have no courses yet/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Course/i })).toBeVisible();
  });

  it("shows student take-quiz quick action for enrolled", () => {
    useProfileRole.mockReturnValue({ role: "student", loading: false });
    useUserEnrollments.mockReturnValue({
      enrollments: [{ course_id: "C3", course_title: "Biology" }],
      loading: false,
      error: null,
    });
    useInstructorCourses.mockReturnValue({ courses: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U3" } } });
    expect(screen.getByLabelText(/Student quick action/i)).toBeInTheDocument();
    expect(screen.getByText(/Take Quiz for "Biology"/)).toBeVisible();
  });

  it("shows student fallback CTA if not enrolled", () => {
    useProfileRole.mockReturnValue({ role: "student", loading: false });
    useUserEnrollments.mockReturnValue({ enrollments: [], loading: false, error: null });
    useInstructorCourses.mockReturnValue({ courses: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U4" } } });
    expect(screen.getByLabelText(/Student quick action/i)).toBeInTheDocument();
    expect(screen.getByText(/not enrolled in any courses yet/i)).toBeVisible();
  });
});
