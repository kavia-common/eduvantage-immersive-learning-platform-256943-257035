"use strict";

/**
 * WebSocket client with environment-aware URL resolution and simple reconnect.
 * REACT_APP_WS_URL preferred; when missing, it attempts to derive from current location.
 * Note: Logs and warnings about REACT_APP_WS_URL are suppressed unless feature flag 'useCustomWS' is enabled.
 */

import { env, getFeatureFlag } from "../config/env";
import { logger } from "./logger";

/** Normalize provided or derived URL and ensure it is ws:// or wss:// */
function normalizeWsUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
    if (!/^wss?:$/i.test(u.protocol)) {
      if (u.protocol === "https:") return url.replace(/^https:/i, "wss:");
      if (u.protocol === "http:") return url.replace(/^http:/i, "ws:");
      return "";
    }
    return u.toString();
  } catch {
    if (typeof window !== "undefined") {
      const base = window.location.protocol === "https:" ? "wss:" : "ws:";
      if (url.startsWith("//")) return `${base}${url}`;
    }
    return "";
  }
}

/** Try deriving ws(s) URL from current location as fallback */
function deriveWsUrl() {
  if (typeof window === "undefined" || typeof window.location === "undefined") return "";
  const { protocol, host } = window.location;
  const wsProto = protocol === "https:" ? "wss:" : "ws:";
  return `${wsProto}//${host}/ws`;
}

/** Resolve base WS URL with safe fallback and diagnostics (feature-flagged) */
function resolveWsUrl() {
  const customWS = getFeatureFlag("useCustomWS") === true;
  const providedRaw = env.WS_URL || "";
  const provided = normalizeWsUrl(providedRaw);

  if (!customWS) {
    // In default path, do not encourage custom WS usage; return empty so WSClient remains inactive.
    return "";
  }

  if (provided) {
    logger.info("Using REACT_APP_WS_URL for WebSocket (feature-flagged)", { url: provided });
    return provided;
  }
  if (providedRaw && !provided) {
    logger.warn("REACT_APP_WS_URL provided but invalid; attempting fallback", { providedRaw });
  }
  const derived = normalizeWsUrl(deriveWsUrl());
  if (!derived) {
    logger.error("Unable to resolve WebSocket URL.");
  } else {
    logger.warn("REACT_APP_WS_URL is not set; using derived WebSocket URL.", { derived });
  }
  return derived;
}

/**
 * Very small WS wrapper with auto-reconnect (linear backoff) and event handlers.
 */
class WSClient {
  constructor(url = resolveWsUrl()) {
    this.url = url;
    this.socket = null;
    this._reconnectAttempts = 0;
    this._maxAttempts = 5;
    this._listeners = { open: [], message: [], close: [], error: [] };
    this._firstConnectAt = null;

    if (this.url) {
      this.connect();
    } else {
      // Silent by default unless feature flag enables WS
      logger.debug?.("WSClient idle: custom WS not enabled or URL not resolved.");
    }
  }

  // PUBLIC_INTERFACE
  connect() {
    if (!this.url || typeof WebSocket === "undefined") {
      logger.warn("WebSocket not available in this environment or URL missing.", {
        hasWebSocket: typeof WebSocket !== "undefined",
        url: this.url,
      });
      return;
    }
    try {
      const start = Date.now();
      this.socket = new WebSocket(this.url);

      this.socket.addEventListener("open", (evt) => {
        this._reconnectAttempts = 0;
        if (!this._firstConnectAt) this._firstConnectAt = start;
        logger.info("WebSocket connected", { url: this.url, ttfb_ms: Date.now() - start });
        this._emit("open", evt);
      });

      this.socket.addEventListener("message", (evt) => {
        logger.debug("WebSocket message", { size: typeof evt?.data === "string" ? evt.data.length : undefined });
        this._emit("message", evt);
      });

      this.socket.addEventListener("close", (evt) => {
        logger.warn("WebSocket closed", { code: evt.code, reason: evt.reason, attempts: this._reconnectAttempts });
        this._emit("close", evt);
        this._scheduleReconnect();
      });

      this.socket.addEventListener("error", (evt) => {
        logger.warn("WebSocket error", { message: evt?.message });
        this._emit("error", evt);
      });
    } catch (e) {
      logger.error("WebSocket connect error", { error: String(e?.message || e) });
      this._scheduleReconnect();
    }
  }

  // PUBLIC_INTERFACE
  send(data) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(typeof data === "string" ? data : JSON.stringify(data));
    } else {
      logger.warn("WebSocket not open; dropping message.", {
        readyState: this.socket?.readyState,
      });
    }
  }

  // PUBLIC_INTERFACE
  close(code, reason) {
    if (this.socket) {
      this.socket.close(code, reason);
    }
  }

  // PUBLIC_INTERFACE
  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
    return () => this.off(event, handler);
  }

  // PUBLIC_INTERFACE
  off(event, handler) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((h) => h !== handler);
  }

  _emit(event, payload) {
    (this._listeners[event] || []).forEach((h) => {
      try { h(payload); } catch { /* noop */ }
    });
  }

  _scheduleReconnect() {
    if (this._reconnectAttempts >= this._maxAttempts) {
      logger.warn("WebSocket max reconnect attempts reached; giving up.", {
        attempts: this._reconnectAttempts,
      });
      return;
    }
    const delay = 1000 * (this._reconnectAttempts + 1);
    logger.info("Scheduling WebSocket reconnect", { in_ms: delay, attempt: this._reconnectAttempts + 1 });
    this._reconnectAttempts += 1;
    setTimeout(() => this.connect(), delay);
  }
}

// PUBLIC_INTERFACE
export const wsClient = new WSClient(resolveWsUrl());

/**
 * PUBLIC_INTERFACE
 * Factory to create a custom instance for specific endpoints.
 */
export function createWsClient(customUrl) {
  return new WSClient(customUrl || resolveWsUrl());
}
