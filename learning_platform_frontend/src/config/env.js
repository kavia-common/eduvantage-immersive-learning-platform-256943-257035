"use strict";

/**
 * Environment configuration helper for CRA.
 * Reads values from process.env (must be prefixed with REACT_APP_).
 * No secrets are hardcoded here. Ensure .env is supplied by orchestrator.
 *
 * Exposed variables (with graceful fallbacks):
 * - REACT_APP_API_BASE           -> env.API_BASE ("" for same-origin relative)
 * - REACT_APP_BACKEND_URL        -> env.BACKEND_URL (leave "" to use same-origin)
 * - REACT_APP_WS_URL             -> env.WS_URL (auto-derived from location when missing)
 * - REACT_APP_FEATURE_FLAGS      -> env.FEATURE_FLAGS ("" -> no flags)
 * - REACT_APP_LOG_LEVEL          -> env.LOG_LEVEL ("info" default)
 *
 * Other supported vars are documented below.
 */

// PUBLIC_INTERFACE
export const env = {
  /** Current node environment (development|production|test) */
  NODE_ENV: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development",

  /** Base URLs */
  API_BASE: process.env.REACT_APP_API_BASE || "",
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || "",
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || "",
  WS_URL: process.env.REACT_APP_WS_URL || "",

  /** Supabase configuration (do not hardcode) */
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || "",
  SUPABASE_KEY: process.env.REACT_APP_SUPABASE_KEY || "",

  /** App config */
  PORT: process.env.REACT_APP_PORT || "3000",
  TRUST_PROXY: process.env.REACT_APP_TRUST_PROXY || "false",
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || "info",
  HEALTHCHECK_PATH: process.env.REACT_APP_HEALTHCHECK_PATH || "/health",
  FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || "",
  EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED || "false",
  NEXT_TELEMETRY_DISABLED: process.env.REACT_APP_NEXT_TELEMETRY_DISABLED || "1",
  ENABLE_SOURCE_MAPS: process.env.REACT_APP_ENABLE_SOURCE_MAPS || "true",
};

// PUBLIC_INTERFACE
export function getFeatureFlag(flagName) {
  /** Return boolean if a given CSV feature flags contains the flag */
  const list = (env.FEATURE_FLAGS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(flagName);
}
