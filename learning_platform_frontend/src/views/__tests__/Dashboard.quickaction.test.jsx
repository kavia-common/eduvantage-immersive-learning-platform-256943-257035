import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import Dashboard from "../Dashboard.jsx";
import { AuthContext } from "../../auth/AuthProvider";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../hooks/useInstructorCourses", () => ({
  useInstructorCourses: jest.fn(),
}));
jest.mock("../../auth/useProfileRole", () => jest.fn());

import { useInstructorCourses } from "../../hooks/useInstructorCourses";
import useProfileRole from "../../auth/useProfileRole";

const renderWithRouter = (ui, { providerProps, ...options } = {}) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={providerProps}>{ui}</AuthContext.Provider>
    </MemoryRouter>,
    options
  );

describe("Dashboard instructor quiz quick action", () => {
  it("shows quick action only for instructors", () => {
    useProfileRole.mockReturnValue("student");
    useInstructorCourses.mockReturnValue({ courses: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U1" } } });
    expect(
      screen.queryByLabelText(/Instructor quick action/i)
    ).not.toBeInTheDocument();

    // switch to instructor
    useProfileRole.mockReturnValue("instructor");
    useInstructorCourses.mockReturnValue({ courses: [], loading: false, error: null });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U1" } } });
    expect(
      screen.queryByLabelText(/Instructor quick action/i)
    ).toBeInTheDocument();
  });

  it("shows create quiz for one course", async () => {
    useProfileRole.mockReturnValue("instructor");
    useInstructorCourses.mockReturnValue({
      courses: [{ id: "C1", title: "Algebra" }],
      loading: false,
      error: null,
    });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U1" } } });
    expect(screen.getByText(/Create Quiz for "Algebra"/)).toBeVisible();
  });

  it("shows modal for multiple courses", async () => {
    useProfileRole.mockReturnValue("instructor");
    useInstructorCourses.mockReturnValue({
      courses: [
        { id: "C1", title: "Algebra" },
        { id: "C2", title: "Geometry" },
      ],
      loading: false,
      error: null,
    });
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
    useProfileRole.mockReturnValue("instructor");
    useInstructorCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
    });
    renderWithRouter(<Dashboard />, { providerProps: { user: { id: "U2" } } });
    expect(screen.getByText(/You have no courses yet/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Course/i })).toBeVisible();
  });
});
