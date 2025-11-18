"use strict";

/**
 * PUBLIC_INTERFACE
 * settingsStorage
 * A small persistence utility for Settings using localStorage with JSON guards.
 *
 * Key shape:
 *  - key: 'eduv_settings_v1'
 *  - value: JSON string of a plain object
 */

const STORAGE_KEY = "eduv_settings_v1";

/** Safely parse JSON, returning fallback on error. */
function safeParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/** Safely stringify value, returning null on error. */
function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 */
export const settingsStorage = {
  /**
   * Get settings object from localStorage.
   * - Returns null if not found or parse fails.
   */
  get() {
    if (typeof window === "undefined" || !window.localStorage) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return safeParse(raw, null);
    } catch {
      return null;
    }
  },

  /**
   * Save settings object to localStorage.
   * - No-ops if stringify fails.
   * - Returns true on success, false otherwise.
   */
  set(settingsObj) {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const str = safeStringify(settingsObj);
    if (str == null) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, str);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Clear stored settings.
   * - Returns true on success, false otherwise.
   */
  clear() {
    if (typeof window === "undefined" || !window.localStorage) return false;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  },

  /** Expose the storage key for advanced use cases/tests. */
  key: STORAGE_KEY,
};
