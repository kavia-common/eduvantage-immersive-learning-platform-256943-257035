"use strict";

/**
 * Lightweight API client using fetch with sensible defaults.
 * Base URL is taken from REACT_APP_API_BASE; when absent, falls back to same-origin relative paths.
 * Exports an initialized client and a helper to create custom instances.
 */

import { env } from "../config/env";
import { logger } from "./logger";

/** Resolve the API base URL with safe fallback to empty string (relative) */
function resolveBaseUrl() {
  const base = env.API_BASE || "";
  if (!base) {
    logger.warn("REACT_APP_API_BASE is not set; API client will use relative URLs.");
  }
  return base.replace(/\/+$/, ""); // remove trailing slashes
}

/**
 * Wrapper around fetch with base URL and JSON helpers.
 */
class ApiClient {
  constructor(baseUrl = resolveBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  /**
   * PUBLIC_INTERFACE
   * Perform a fetch to path relative to baseUrl (or absolute if path is absolute).
   * Automatically sets JSON headers and parses JSON responses when possible.
   */
  async request(path, { method = "GET", headers = {}, body, ...rest } = {}) {
    const url = this._buildUrl(path);
    const finalHeaders = {
      "Accept": "application/json",
      ...(body && typeof body === "object" && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...headers,
    };
    const payload = (body && typeof body === "object" && !(body instanceof FormData)) ? JSON.stringify(body) : body;

    try {
      const res = await fetch(url, { method, headers: finalHeaders, body: payload, ...rest });
      const text = await res.text();
      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const msg = (data && data.message) || `Request failed with status ${res.status}`;
        logger.warn("API request failed", { url, status: res.status, message: msg });
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (e) {
      logger.error("API request error", { url, error: String(e?.message || e) });
      throw e;
    }
  }

  /** Convenience JSON methods */
  get(path, options) { return this.request(path, { ...(options || {}), method: "GET" }); }
  post(path, body, options) { return this.request(path, { ...(options || {}), method: "POST", body }); }
  put(path, body, options) { return this.request(path, { ...(options || {}), method: "PUT", body }); }
  patch(path, body, options) { return this.request(path, { ...(options || {}), method: "PATCH", body }); }
  delete(path, options) { return this.request(path, { ...(options || {}), method: "DELETE" }); }

  _buildUrl(path) {
    if (!path) return this.baseUrl || "";
    // if absolute http(s) or protocol-relative
    if (/^https?:\/\//i.test(path) || path.startsWith("//")) return path;
    const base = this.baseUrl || "";
    if (!base) return path; // relative to current origin
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  }
}

// PUBLIC_INTERFACE
export const apiClient = new ApiClient();

/**
 * PUBLIC_INTERFACE
 * Factory to create an API client with a custom base URL.
 */
export function createApiClient(customBaseUrl) {
  return new ApiClient(customBaseUrl || resolveBaseUrl());
}

/**
 * Example usage:
 * const users = await apiClient.get("/users");
 */
