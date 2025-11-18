import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "../Home";

// Mock feature flag helper to control Explore destination
jest.mock("../../services/featureFlags", () => ({
  isFeatureEnabled: jest.fn(() => false),
}));

// Mock apiClient health call to avoid network noise
jest.mock("../../services/apiClient", () => ({
  apiClient: {
    get: jest.fn(() => Promise.resolve({ status: 200 })),
  },
}));

// Minimal route components for assertion
function Page({ label }) {
  return <div data-testid="page">{label}</div>;
}

describe("Home CTAs", () => {
  const renderWithRoutes = (initialEntries = ["/"]) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Page label="Signup" />} />
          <Route path="/dashboard" element={<Page label="Dashboard" />} />
          <Route path="/feed" element={<Page label="Feed" />} />
        </Routes>
      </MemoryRouter>
    );

  test("Get Started navigates to /signup", () => {
    renderWithRoutes();
    const btn = screen.getByRole("button", { name: /get started/i });
    fireEvent.click(btn);
    expect(screen.getByTestId("page")).toHaveTextContent("Signup");
  });

  test("Explore navigates to /feed when exploreV2 disabled", () => {
    const { isFeatureEnabled } = require("../../services/featureFlags");
    isFeatureEnabled.mockReturnValue(false);
    renderWithRoutes();
    const btn = screen.getByRole("button", { name: /explore/i });
    fireEvent.click(btn);
    expect(screen.getByTestId("page")).toHaveTextContent("Feed");
  });

  test("Explore navigates to /dashboard when exploreV2 enabled", () => {
    const { isFeatureEnabled } = require("../../services/featureFlags");
    isFeatureEnabled.mockReturnValue(true);
    renderWithRoutes();
    const btn = screen.getByRole("button", { name: /explore/i });
    fireEvent.click(btn);
    expect(screen.getByTestId("page")).toHaveTextContent("Dashboard");
  });
}
