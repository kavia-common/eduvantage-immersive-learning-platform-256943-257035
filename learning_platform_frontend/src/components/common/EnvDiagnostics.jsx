import React from "react";
import { env } from "../../config/env";
import { logger } from "../../services/logger";

/**
 * PUBLIC_INTERFACE
 * EnvDiagnostics - display key runtime environment values and basic checks.
 * Useful to validate REACT_APP_WS_URL, BACKEND_URL, and log level at runtime.
 */
export default function EnvDiagnostics() {
  const [origin, setOrigin] = React.useState("(n/a)");
  React.useEffect(() => {
    try {
      setOrigin(window.location.origin);
    } catch {}
    logger.info("EnvDiagnostics", { env });
  }, []);

  return (
    <div className="surface" style={{ padding: ".75rem" }}>
      <div style={{ fontWeight: 700, marginBottom: ".35rem" }}>Environment Diagnostics</div>
      <div style={{ fontFamily: "monospace", fontSize: ".9rem", lineHeight: "1.5" }}>
        <div>Origin: {origin}</div>
        <div>REACT_APP_BACKEND_URL: {env.BACKEND_URL || "(empty)"}</div>
        <div>REACT_APP_WS_URL: {env.WS_URL || "(empty -> derived)"}</div>
        <div>REACT_APP_LOG_LEVEL: {env.LOG_LEVEL}</div>
        <div>NODE_ENV: {env.NODE_ENV}</div>
      </div>
    </div>
  );
}
