"use strict";

import { settingsStorage } from "./settingsStorage";
import { logger } from "./logger";

/**
 * PUBLIC_INTERFACE
 * settingsService
 * A thin service API for settings. Currently backed by localStorage but can be
 * swapped for real API calls in the future without changing consumers.
 */
export const settingsService = {
  /**
   * PUBLIC_INTERFACE
   * getSettings
   * Fetch settings, falling back to provided defaults when none are stored.
   * @param {object} defaults - Default settings object
   * @returns {Promise<object>} resolved settings
   */
  async getSettings(defaults = {}) {
    try {
      const stored = settingsStorage.get();
      return stored && typeof stored === "object" ? stored : { ...defaults };
    } catch (e) {
      logger.warn("settingsService.getSettings failed; using defaults", { error: String(e) });
      return { ...defaults };
    }
  },

  /**
   * PUBLIC_INTERFACE
   * saveSettings
   * Persist settings object.
   * @param {object} settings - Settings to save
   * @returns {Promise<boolean>} success
   */
  async saveSettings(settings) {
    try {
      const ok = settingsStorage.set(settings);
      if (!ok) throw new Error("localStorage set failed");
      return true;
    } catch (e) {
      logger.error("settingsService.saveSettings failed", { error: String(e) });
      return false;
    }
  },

  /**
   * PUBLIC_INTERFACE
   * resetSettings
   * Clear stored settings and return defaults.
   * @param {object} defaults - Default settings object
   * @returns {Promise<object>} defaults returned for convenience
   */
  async resetSettings(defaults = {}) {
    try {
      settingsStorage.clear();
    } catch (e) {
      logger.warn("settingsService.resetSettings encountered an error", { error: String(e) });
    }
    // Ensure defaults are written so next mount hydrates consistently
    try {
      settingsStorage.set(defaults);
    } catch {
      // Ignore if write fails; UI can still use in-memory defaults.
    }
    return { ...defaults };
  },
};
