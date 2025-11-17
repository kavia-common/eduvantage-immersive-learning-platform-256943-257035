import React from "react";

/**
 * Error boundary for catching render errors in child tree.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: String(error) };
  }

  componentDidCatch(error, errorInfo) {
    // Avoid logging sensitive info; keep minimal
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Render error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem" }}>
          <h2>Something went wrong.</h2>
          <p className="mt-2" style={{ color: "var(--color-muted)" }}>
            Please reload the page. If the issue persists, contact support.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// PUBLIC_INTERFACE
export default ErrorBoundary;
