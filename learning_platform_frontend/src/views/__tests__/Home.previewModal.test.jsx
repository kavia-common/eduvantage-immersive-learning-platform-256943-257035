import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../Home";

// Silence apiClient/featureFlags side-effects
jest.mock("../../services/featureFlags", () => ({ isFeatureEnabled: jest.fn(() => false) }));
jest.mock("../../services/apiClient", () => ({ apiClient: { get: jest.fn(() => Promise.resolve({ status: 200 })) } }));

describe("Home Preview Modal", () => {
  const setup = () =>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

  test("opens modal when clicking Live Preview on a feature card", () => {
    setup();
    // Find a Live Preview button (e.g., for AI Tutor)
    const previewBtn = screen.getByRole("button", { name: /live preview/i });
    fireEvent.click(previewBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("closes modal on ESC", () => {
    setup();
    const previewBtn = screen.getByRole("button", { name: /live preview/i });
    fireEvent.click(previewBtn);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    // overlay should close
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
