"use strict";

/**
 * PUBLIC_INTERFACE
 * progressService
 * Local persistence of lesson completion per course using localStorage with JSON guards.
 *
 * Shape:
 *  - key: 'eduv_progress_v1'
 *  - value: JSON string: { [courseId: string]: { completed: string[] } }
 */

import { logger } from "./logger";

const STORAGE_KEY = "eduv_progress_v1";

function safeParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function readState() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = safeParse(raw, {});
    if (!parsed || typeof parsed !== "object") return {};
    // Normalize: ensure arrays of strings and uniqueness
    const out = {};
    for (const [cid, obj] of Object.entries(parsed)) {
      const arr = Array.isArray(obj?.completed) ? obj.completed : [];
      out[cid] = { completed: Array.from(new Set(arr.filter((x) => typeof x === "string"))) };
    }
    return out;
  } catch (e) {
    logger.warn("progressService.readState failed", { error: String(e?.message || e) });
    return {};
  }
}

function writeState(state) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const normalized = {};
  for (const [cid, obj] of Object.entries(state || {})) {
    const arr = Array.isArray(obj?.completed) ? obj.completed : [];
    normalized[cid] = { completed: Array.from(new Set(arr.filter((x) => typeof x === "string"))) };
  }
  const str = safeStringify(normalized);
  if (str == null) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, str);
    return true;
  } catch (e) {
    logger.warn("progressService.writeState failed", { error: String(e?.message || e) });
    return false;
  }
}

// PUBLIC_INTERFACE
export const progressService = {
  /**
   * Get completed lesson IDs for a course.
   * @param {string} courseId
   * @returns {string[]} lesson IDs
   */
  getCompleted(courseId) {
    if (!courseId) return [];
    const state = readState();
    return state[courseId]?.completed || [];
  },

  /**
   * Mark a lesson complete for a course. Idempotent.
   * @param {string} courseId
   * @param {string} lessonId
   * @returns {{ success: boolean, completed: string[] }}
   */
  completeLesson(courseId, lessonId) {
    if (!courseId || !lessonId) return { success: false, completed: this.getCompleted(courseId) };
    const state = readState();
    if (!state[courseId]) state[courseId] = { completed: [] };
    if (!state[courseId].completed.includes(lessonId)) {
      state[courseId].completed.push(lessonId);
      writeState(state);
    }
    return { success: true, completed: state[courseId].completed };
  },

  /**
   * Clear a completion record (e.g., for retake).
   */
  clearLesson(courseId, lessonId) {
    if (!courseId || !lessonId) return { success: false, completed: this.getCompleted(courseId) };
    const state = readState();
    if (!state[courseId]) return { success: true, completed: [] };
    state[courseId].completed = (state[courseId].completed || []).filter((id) => id !== lessonId);
    writeState(state);
    return { success: true, completed: state[courseId].completed };
  },

  /** Clear all progress (for tests). */
  clearAll() {
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
