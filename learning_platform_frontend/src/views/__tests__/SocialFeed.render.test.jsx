import React from "react";
import { render, screen } from "@testing-library/react";
import SocialFeed from "../../components/feed/SocialFeed";

describe("SocialFeed (static)", () => {
  it("renders sample posts and actions", () => {
    render(<SocialFeed />);

    // Composer disabled note
    expect(screen.getByText(/posting is disabled/i)).toBeInTheDocument();

    // Sample authors
    expect(screen.getByLabelText(/post by ava singh/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/post by noah kim/i)).toBeInTheDocument();

    // Action buttons exist
    expect(screen.getAllByRole("button", { name: /like/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /comment/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /share/i }).length).toBeGreaterThan(0);
  });
});
