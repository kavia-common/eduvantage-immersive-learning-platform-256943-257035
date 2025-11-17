import React from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * NotFound - 404 fallback page.
 */
export default function NotFound() {
  return (
    <div className="container">
      <Card>
        <h2>Page not found</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          The page you’re looking for doesn’t exist.
        </p>
        <Link to="/">
          <Button className="mt-3">Back to Home</Button>
        </Link>
      </Card>
    </div>
  );
}
