import React from "react";
import Card from "../components/common/Card";
import SocialFeed from "../components/feed/SocialFeed";

/**
 * PUBLIC_INTERFACE
 * FeedDemo - a dedicated page to preview the static SocialFeed component.
 * This is separate from the live Feed (state-backed) view.
 */
export default function FeedDemo() {
  return (
    <div className="container">
      <Card variant="glass" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Social Feed (Static Preview)</h1>
        <p className="mt-1" style={{ margin: 0, color: "var(--color-muted)" }}>
          This demo shows a glass-styled social feed with sample posts and a disabled composer.
        </p>
      </Card>
      <SocialFeed />
    </div>
  );
}
