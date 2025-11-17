"use strict";

/**
 * Simple structured logger with environment-driven log level.
 * Levels: error < warn < info < debug
 * It avoids logging sensitive data and degrades gracefully if console methods are missing.
 */

import { env } from "../config/env";

/** Map textual levels to numeric severity for comparisons */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

/** Normalize log level input with a safe default ('info') */
function normalizeLevel(level) {
  const lvl = String(level || "").toLowerCase();
  return Object.prototype.hasOwnProperty.call(LEVELS, lvl) ? lvl : "info";
}

const CURRENT_LEVEL = normalizeLevel(env.LOG_LEVEL);

/**
 * Internal safe console binding to avoid runtime errors if console or methods are not present.
 */
const c = {
  error: (typeof console !== "undefined" && console.error) ? console.error.bind(console) : () => {},
  warn: (typeof console !== "undefined" && console.warn) ? console.warn.bind(console) : () => {},
  info: (typeof console !== "undefined" && console.info) ? console.info.bind(console) : () => {},
  log:  (typeof console !== "undefined" && console.log)  ? console.log.bind(console)  : () => {},
  debug:(typeof console !== "undefined" && console.debug)? console.debug.bind(console): () => {},
};

/**
 * Base log function applying level filtering and consistent shape.
 */
function baseLog(level, message, meta) {
  const now = new Date().toISOString();
  const record = {
    ts: now,
    level,
    message: String(message ?? ""),
    ...(meta && typeof meta === "object" ? { meta } : {}),
  };

  // Never log raw tokens or secrets; attempt masking if common key names exist.
  if (record.meta) {
    const SENSITIVE_KEYS = ["password", "token", "accessToken", "refreshToken", "apiKey", "authorization"];
    for (const k of Object.keys(record.meta)) {
      if (SENSITIVE_KEYS.includes(k)) {
        record.meta[k] = "[REDACTED]";
      }
    }
  }

  // Route to proper console method
  switch (level) {
    case "error": c.error(record); break;
    case "warn":  c.warn(record);  break;
    case "info":  c.info(record);  break;
    default:      c.debug(record); break;
  }
}

/**
 * PUBLIC_INTERFACE
 */
export const logger = {
  /** Log at error level */
  error(message, meta) {
    baseLog("error", message, meta);
  },
  /** Log at warn level if enabled */
  warn(message, meta) {
    if (LEVELS[CURRENT_LEVEL] >= LEVELS.warn) baseLog("warn", message, meta);
  },
  /** Log at info level if enabled */
  info(message, meta) {
    if (LEVELS[CURRENT_LEVEL] >= LEVELS.info) baseLog("info", message, meta);
  },
  /** Log at debug level if enabled */
  debug(message, meta) {
    if (LEVELS[CURRENT_LEVEL] >= LEVELS.debug) baseLog("debug", message, meta);
  },
  /** Expose current normalized level */
  level: CURRENT_LEVEL,
};

/**
 * Example usage:
 * logger.info("Fetching user", { userId: "123" });
 * logger.error("Network error", { code: 500 });
 */
