import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import Dashboard from "../Dashboard";

describe("KAVIA AI BOOTCAMP button", () => {
  it("renders the bootcamp button on dashboard and opens modal", () => {
    render(<Dashboard />);
    const btn = screen.getByRole("button", { name: /bootcamp/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    const modalTitle = screen.getByText(/add bootcamp resource/i);
    expect(modalTitle).toBeInTheDocument();
  });
});
