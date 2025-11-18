"use strict";

/**
 * PUBLIC_INTERFACE
 * enrollmentService
 * Local persistence for enrolled course IDs using localStorage with JSON guards.
 *
 * Shape:
 *  - key: 'eduv_enrollments_v1'
 *  - value: JSON string: { enrolled: string[] }
 *
 * All public functions are side-effect free except those that write to storage.
 */

import { logger } from "./logger";

const STORAGE_KEY = "eduv_enrollments_v1";

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

function readState() {
  if (typeof window === "undefined" || !window.localStorage) return { enrolled: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enrolled: [] };
    const parsed = safeParse(raw, { enrolled: [] });
    if (!parsed || !Array.isArray(parsed.enrolled)) return { enrolled: [] };
    // Ensure unique strings
    const unique = Array.from(new Set(parsed.enrolled.filter((x) => typeof x === "string")));
    return { enrolled: unique };
  } catch (e) {
    logger.warn("enrollmentService.readState failed", { error: String(e?.message || e) });
    return { enrolled: [] };
  }
}

function writeState(state) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const normalized = { enrolled: Array.from(new Set((state?.enrolled || []).filter((x) => typeof x === "string"))) };
  const str = safeStringify(normalized);
  if (str == null) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, str);
    return true;
  } catch (e) {
    logger.warn("enrollmentService.writeState failed", { error: String(e?.message || e) });
    return false;
  }
}

// PUBLIC_INTERFACE
export const enrollmentService = {
  /**
   * Get list of enrolled course IDs.
   * @returns {string[]} enrolled course IDs
   */
  getAll() {
    return readState().enrolled;
  },

  /**
   * Check if a courseId is enrolled.
   * @param {string} courseId
   * @returns {boolean}
   */
  isEnrolled(courseId) {
    if (!courseId) return false;
    return readState().enrolled.includes(courseId);
  },

  /**
   * Enroll into a course by ID. Idempotent.
   * @param {string} courseId
   * @returns {{ success: boolean, enrolled: string[] }}
   */
  enroll(courseId) {
    if (!courseId) return { success: false, enrolled: readState().enrolled };
    const state = readState();
    if (!state.enrolled.includes(courseId)) {
      state.enrolled.push(courseId);
      writeState(state);
    }
    return { success: true, enrolled: state.enrolled };
  },

  /**
   * Unenroll from a course by ID. No-op if not enrolled.
   * @param {string} courseId
   * @returns {{ success: boolean, enrolled: string[] }}
   */
  unenroll(courseId) {
    if (!courseId) return { success: false, enrolled: readState().enrolled };
    const state = readState();
    const next = state.enrolled.filter((id) => id !== courseId);
    writeState({ enrolled: next });
    return { success: true, enrolled: next };
  },

  /** Clear all enrollments (mostly for tests). */
  clear() {
    if (typeof window === "undefined" || !window.localStorage) return false;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  },

  /** Expose storage key for tests */
  key: STORAGE_KEY,
};
