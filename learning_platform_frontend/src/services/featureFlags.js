"use strict";

/**
 * Feature flag utilities.
 * Parses REACT_APP_FEATURE_FLAGS as CSV (e.g., "betaUI,analyticsV2").
 * Provides helpers with graceful fallbacks when env is missing.
 */

import { env, getFeatureFlag as getFlagFromEnv } from "../config/env";
import { logger } from "./logger";

/** Parse CSV flags into a Set, trimming blanks */
function parseFlags(csv) {
  if (!csv || typeof csv !== "string") return new Set();
  return new Set(csv.split(",").map((s) => s.trim()).filter(Boolean));
}

const flagsSet = parseFlags(env.FEATURE_FLAGS);

/**
 * PUBLIC_INTERFACE
 * Return true if a feature flag is enabled.
 */
export function isFeatureEnabled(flagName) {
  if (!flagName) return false;
  // Prefer env helper for consistency
  const enabled = getFlagFromEnv(flagName);
  return enabled;
}

/**
 * PUBLIC_INTERFACE
 * Get all enabled flags as an array.
 */
export function getAllFlags() {
  return Array.from(flagsSet);
}

/**
 * PUBLIC_INTERFACE
 * Safely check experiment enablement via REACT_APP_EXPERIMENTS_ENABLED
 */
export function experimentsEnabled() {
  const v = String(env.EXPERIMENTS_ENABLED || "").toLowerCase();
  const enabled = v === "1" || v === "true" || v === "yes";
  if (!enabled && (env.NODE_ENV === "development")) {
    logger.debug("Experiments disabled; override with REACT_APP_EXPERIMENTS_ENABLED=true");
  }
  return enabled;
}

/**
 * Example usage:
 * if (isFeatureEnabled("analyticsV2")) { renderNewCharts(); }
 */
