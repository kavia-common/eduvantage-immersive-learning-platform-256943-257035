"use strict";

/**
 * WebSocket client with environment-aware URL resolution and simple reconnect.
 * REACT_APP_WS_URL preferred; when missing, it attempts to derive from current location.
 */

import { env } from "../config/env";
import { logger } from "./logger";

/** Try deriving ws(s) URL from current location as fallback */
function deriveWsUrl() {
  if (typeof window === "undefined" || typeof window.location === "undefined") return "";
  const { protocol, host } = window.location;
  const wsProto = protocol === "https:" ? "wss:" : "ws:";
  return `${wsProto}//${host}/ws`;
}

/** Resolve base WS URL with safe fallback */
function resolveWsUrl() {
  const provided = env.WS_URL || "";
  if (provided) return provided;
  const derived = deriveWsUrl();
  if (!provided) {
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

    if (this.url) {
      this.connect();
    } else {
      logger.warn("WebSocket URL is empty; wsClient will remain disconnected.");
    }
  }

  /** PUBLIC_INTERFACE */
  connect() {
    if (!this.url || typeof WebSocket === "undefined") {
      logger.warn("WebSocket not available in this environment or URL missing.");
      return;
    }
    try {
      this.socket = new WebSocket(this.url);

      this.socket.addEventListener("open", (evt) => {
        this._reconnectAttempts = 0;
        logger.info("WebSocket connected", { url: this.url });
        this._emit("open", evt);
      });

      this.socket.addEventListener("message", (evt) => {
        this._emit("message", evt);
      });

      this.socket.addEventListener("close", (evt) => {
        logger.warn("WebSocket closed", { code: evt.code, reason: evt.reason });
        this._emit("close", evt);
        this._scheduleReconnect();
      });

      this.socket.addEventListener("error", (evt) => {
        logger.warn("WebSocket error", {});
        this._emit("error", evt);
      });
    } catch (e) {
      logger.error("WebSocket connect error", { error: String(e?.message || e) });
      this._scheduleReconnect();
    }
  }

  /** PUBLIC_INTERFACE */
  send(data) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(typeof data === "string" ? data : JSON.stringify(data));
    } else {
      logger.warn("WebSocket not open; dropping message.");
    }
  }

  /** PUBLIC_INTERFACE */
  close(code, reason) {
    if (this.socket) {
      this.socket.close(code, reason);
    }
  }

  /** PUBLIC_INTERFACE */
  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
    return () => this.off(event, handler);
  }

  /** PUBLIC_INTERFACE */
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
      logger.warn("WebSocket max reconnect attempts reached; giving up.");
      return;
    }
    const delay = 1000 * (this._reconnectAttempts + 1); // linear backoff
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

/**
 * Example usage:
 * wsClient.on("message", (evt) => console.log("WS:", evt.data));
 * wsClient.send({ type: "ping" });
 */
