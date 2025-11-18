"use strict";

/**
 * PUBLIC_INTERFACE
 * Profile service abstraction for getting/updating profile and changing password.
 * - If REACT_APP_BACKEND_URL is set, uses that base for calls.
 * - Otherwise, simulates network operations and returns mock results.
 *
 * SECURITY: No secrets are logged. Do not include passwords in logs.
 */

import { createApiClient } from "./apiClient";
import { logger } from "./logger";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE || "";

function getClient() {
  const base = BACKEND_URL ? BACKEND_URL.replace(/\/+$/, "") : "";
  return createApiClient(base);
}

function simulate(result, delay = 650, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(result instanceof Error ? result : new Error(String(result)));
      else resolve(result);
    }, delay);
  });
}

/**
 * PUBLIC_INTERFACE
 * Fetch the current user's profile.
 * Returns: { id, email, displayName, bio, avatarUrl }
 */
export async function getCurrentUserProfile() {
  try {
    if (BACKEND_URL) {
      const client = getClient();
      // Prefer a standard path; update if backend differs.
      const data = await client.get("/api/profile/me");
      return data;
    }
    // Mocked profile for development without backend
    return await simulate({
      id: "mock-user-1",
      email: "student@example.com",
      displayName: "Ocean Learner",
      bio: "Curious mind exploring immersive learning.",
      avatarUrl: "https://api.dicebear.com/7.x/thumbs/svg?seed=Ocean",
    });
  } catch (e) {
    logger.error("getCurrentUserProfile failed", { error: String(e?.message || e) });
    throw e;
  }
}

/**
 * PUBLIC_INTERFACE
 * Update profile fields (displayName, email?, bio, avatar?)
 * Body: { displayName?: string, email?: string, bio?: string, avatarFile?: File }
 * If avatarFile is provided, will POST multipart/form-data; else JSON.
 */
export async function updateProfile(data = {}) {
  try {
    if (BACKEND_URL) {
      const client = getClient();
      // Switch to multipart if avatar file present
      if (data.avatarFile instanceof File) {
        const form = new FormData();
        if (data.displayName != null) form.append("displayName", data.displayName);
        if (data.email != null) form.append("email", data.email);
        if (data.bio != null) form.append("bio", data.bio);
        form.append("avatar", data.avatarFile);
        const res = await client.request("/api/profile/me", { method: "PUT", body: form });
        return res;
      }
      const res = await client.put("/api/profile/me", {
        displayName: data.displayName,
        email: data.email,
        bio: data.bio,
      });
      return res;
    }
    // Mock: echo back changed fields
    return await simulate({
      success: true,
      profile: {
        id: "mock-user-1",
        email: data.email || "student@example.com",
        displayName: data.displayName || "Ocean Learner",
        bio: data.bio ?? "Curious mind exploring immersive learning.",
        avatarUrl: data.avatarPreview || "https://api.dicebear.com/7.x/thumbs/svg?seed=Ocean",
      },
    });
  } catch (e) {
    logger.error("updateProfile failed", { error: String(e?.message || e) });
    throw e;
  }
}

/**
 * PUBLIC_INTERFACE
 * Change password with validation and backend call if available.
 * Returns { success: boolean }
 */
export async function changePassword(current, next) {
  try {
    if (BACKEND_URL) {
      const client = getClient();
      const res = await client.post("/api/profile/change-password", { current, next });
      return res;
    }
    // Mock: simple rule—reject if current === next
    if (current === next) {
      return await simulate({ success: false, message: "New password must be different." }, 400, true);
    }
    return await simulate({ success: true });
  } catch (e) {
    logger.error("changePassword failed", { error: String(e?.message || e) });
    throw e;
  }
}
