"use strict";

import { useEffect, useMemo } from "react";
import { wsClient } from "../services/wsClient";
import { logger } from "../services/logger";

/**
 * useMockStreamAssistant
 * Hook exposing a streamer function that simulates assistant token streaming.
 * It subscribes to wsClient message events as a placeholder for future real-time integration.
 *
 * Usage:
 * const { streamReply } = useMockStreamAssistant();
 * await streamReply({ userText, onDelta: (token) => { ... } });
 */

// PUBLIC_INTERFACE
export function useMockStreamAssistant() {
  useEffect(() => {
    // Attach a passive listener to wsClient to demonstrate integration point.
    const off = wsClient.on("message", (evt) => {
      try {
        const data = typeof evt?.data === "string" ? JSON.parse(evt.data) : evt?.data;
        if (data && data.type === "assistant-token") {
          // In the future, you could push tokens into the onDelta handler via a shared channel.
          logger.debug("Received WS token (placeholder)", { len: String(data.token || "").length });
        }
      } catch {
        // ignore parse errors
      }
    });
    return () => {
      try { off && off(); } catch { /* ignore */ }
    };
  }, []);

  const streamReply = useMemo(() => {
    /**
     * PUBLIC_INTERFACE
     * Simulates tokenized assistant response for provided user text.
     * Arguments:
     * - params.userText: string
     * - params.onDelta: function(token:string) -> void
     */
    return async function streamReply(params) {
      const { userText, onDelta } = params || {};
      const canned = chooseMockResponse(userText);
      // Simulate token streaming with variable pacing
      const tokens = tokenize(canned);
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        // eslint-disable-next-line no-await-in-loop
        await sleep(35 + Math.floor(Math.random() * 40));
        try {
          onDelta(t);
        } catch {
          // swallow UI errors to keep loop going
        }
      }
    };
  }, []);

  return { streamReply };
}

function tokenize(text) {
  // Light tokenization by splitting into small chunks preserving spaces
  const arr = [];
  let current = "";
  for (const ch of text) {
    current += ch;
    if (current.length >= 4 || ch === " " || ch === "\n") {
      arr.push(current);
      current = "";
    }
  }
  if (current) arr.push(current);
  return arr;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chooseMockResponse(userText) {
  const lower = String(userText || "").toLowerCase();
  if (lower.includes("analytics")) {
    return "Here’s a quick summary: Your weekly study time increased by 18%, and quiz accuracy improved from 72% to 81%. Keep focusing on spaced repetition for the next 7 days.";
  }
  if (lower.includes("plan") || lower.includes("study")) {
    return "I suggest a 5-day micro-plan: 1) Review core concepts (30m), 2) Practice problems (30m), 3) Spaced repetition flashcards (20m), 4) Reflection (10m). Repeat and adjust based on progress.";
  }
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hi there! I’m here to help you learn efficiently. Ask about courses, analytics, or personalized study plans.";
  }
  return "Great question. Based on your current progress, I recommend focusing on the fundamentals first, then layering in targeted practice. Let me know your time available and goals for a tailored plan.";
}
