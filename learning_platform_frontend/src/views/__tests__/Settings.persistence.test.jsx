import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Settings from "../Settings";

// Use fake timers for banner timeout and debounce
jest.useFakeTimers();

describe("Settings persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("Save writes current settings and shows success banner", async () => {
    render(<Settings />);

    // Wait a tick for initial hydration effect to complete
    await act(async () => {});

    const toggleThemeBtn = screen.getByRole("button", { name: /toggle theme/i });
    const saveBtn = screen.getByRole("button", { name: /save changes/i });

    // Toggle theme to change state
    fireEvent.click(toggleThemeBtn);

    // Save changes
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Banner appears
    expect(screen.getByTestId("save-success-banner")).toBeInTheDocument();

    // Advance timers to allow banner auto-hide
    act(() => {
      jest.advanceTimersByTime(1600);
    });

    // Validate localStorage key exists
    const raw = window.localStorage.getItem("eduv_settings_v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.theme === "dark" || parsed.theme === "light").toBe(true);
  });

  test("Reset to Defaults restores default settings and writes to storage", async () => {
    render(<Settings />);

    // Wait a tick for initial hydration effect
    await act(async () => {});

    const toggleThemeBtn = screen.getByRole("button", { name: /toggle theme/i });
    const resetBtn = screen.getByRole("button", { name: /reset to defaults/i });

    // Change a few values
    fireEvent.click(toggleThemeBtn); // Flip theme
    const emailCheckbox = screen.getByLabelText(/email/i);
    fireEvent.click(emailCheckbox); // toggle email notifications

    // Reset to defaults
    await act(async () => {
      fireEvent.click(resetBtn);
    });

    // Banner appears
    expect(screen.getByTestId("save-success-banner")).toBeInTheDocument();

    // Check storage has defaults
    const raw = window.localStorage.getItem("eduv_settings_v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    // Defaults from component: theme 'light', notifications.email true
    expect(parsed.theme).toBe("light");
    expect(parsed.notifications.email).toBe(true);
  });
});
