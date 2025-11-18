import React from "react";
import { env } from "../../config/env";
import { logger } from "../../services/logger";

/**
 * PUBLIC_INTERFACE
 * EnvDiagnostics - display key runtime environment values and basic checks.
 * Shows Supabase URL (domain only), backend URL, and log level.
 */
export default function EnvDiagnostics() {
  const [origin, setOrigin] = React.useState("(n/a)");
  const [supabaseHost, setSupabaseHost] = React.useState("(unset)");
  React.useEffect(() => {
    try {
      setOrigin(window.location.origin);
    } catch {}
    try {
      const url = env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "";
      if (url) {
        const u = new URL(url);
        setSupabaseHost(u.host);
      }
    } catch {
      setSupabaseHost("(invalid)");
    }
    logger.info("EnvDiagnostics", { env: { ...env, SUPABASE_URL: supabaseHost } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="surface" style={{ padding: ".75rem" }}>
      <div style={{ fontWeight: 700, marginBottom: ".35rem" }}>Environment Diagnostics</div>
      <div style={{ fontFamily: "monospace", fontSize: ".9rem", lineHeight: "1.5" }}>
        <div>Origin: {origin}</div>
        <div>REACT_APP_BACKEND_URL: {env.BACKEND_URL || "(empty)"}</div>
        <div>Supabase: {supabaseHost}</div>
        <div>REACT_APP_LOG_LEVEL: {env.LOG_LEVEL}</div>
        <div>NODE_ENV: {env.NODE_ENV}</div>
      </div>
    </div>
  );
}
