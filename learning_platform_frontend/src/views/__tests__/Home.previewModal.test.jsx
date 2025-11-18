import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "../Home";

// Silence apiClient/featureFlags side-effects
jest.mock("../../services/featureFlags", () => ({ isFeatureEnabled: jest.fn(() => false) }));
jest.mock("../../services/apiClient", () => ({ apiClient: { get: jest.fn(() => Promise.resolve({ status: 200 })) } }));

function Page({ label }) {
  return <div data-testid="page">{label}</div>;
}

describe("Home Preview Modal", () => {
  const setup = (initialEntries = ["/"]) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classroom" element={<Page label="Classroom" />} />
          <Route path="/dashboard" element={<Page label="Dashboard" />} />
          <Route path="/analytics" element={<Page label="Analytics" />} />
          <Route path="/feed" element={<Page label="Feed" />} />
        </Routes>
      </MemoryRouter>
    );

  test("opens modal when clicking Live Preview on a feature card", () => {
    setup();
    // Find a Live Preview button (e.g., for AI Tutor)
    const previewBtn = screen.getAllByRole("button", { name: /live preview/i })[0];
    fireEvent.click(previewBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("closes modal on ESC", () => {
    setup();
    const previewBtn = screen.getAllByRole("button", { name: /live preview/i })[0];
    fireEvent.click(previewBtn);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    // overlay should close
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Classroom CTA navigates and closes modal", () => {
    setup();
    // open classroom preview
    const classroomCardBtn = screen.getByRole("button", { name: /live preview immersive classroom/i });
    fireEvent.click(classroomCardBtn);
    const openBtn = screen.getByRole("button", { name: /open full classroom view/i });
    fireEvent.click(openBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("page")).toHaveTextContent("Classroom");
  });

  test("AI Tutor CTA navigates to dashboard anchor and closes", () => {
    setup();
    // open tutor preview
    const tutorBtn = screen.getByRole("button", { name: /live preview ai tutor/i });
    fireEvent.click(tutorBtn);
    const openTutor = screen.getByRole("button", { name: /open ai tutor on dashboard/i });
    fireEvent.click(openTutor);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // We land on Dashboard (anchor not asserted)
    expect(screen.getByTestId("page")).toHaveTextContent("Dashboard");
  });

  test("Analytics CTA navigates and closes modal", () => {
    setup();
    const analyticsBtn = screen.getByRole("button", { name: /live preview analytics/i });
    fireEvent.click(analyticsBtn);
    const viewAnalytics = screen.getByRole("button", { name: /open analytics dashboard/i });
    fireEvent.click(viewAnalytics);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("page")).toHaveTextContent("Analytics");
  });

  test("Community CTA navigates and closes modal", () => {
    setup();
    const communityBtn = screen.getByRole("button", { name: /live preview community/i });
    fireEvent.click(communityBtn);
    const openFeed = screen.getByRole("button", { name: /open community feed/i });
    fireEvent.click(openFeed);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("page")).toHaveTextContent("Feed");
  });
});
