"use strict";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { logger } from "../services/logger";

/**
 * Assistant state management using a simple React Context.
 * Keeps messages and streaming state, and exposes helpers for sending user prompts
 * and handling assistant responses. This is a lightweight "slice" without external libs.
 *
 * SECURITY: No secrets or PII are stored here. Avoid logging sensitive content.
 */

// PUBLIC_INTERFACE
export const AssistantContext = createContext({
  messages: [],
  isStreaming: false,
  error: null,
  // Actions
  sendMessage: async (_text) => {},
  reset: () => {},
});

// PUBLIC_INTERFACE
export function useAssistant() {
  /**
   * Hook to access assistant chat state and actions.
   */
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}

/**
 * Shape of a chat message:
 * { id: string, role: "user"|"assistant"|"system", content: string, ts: string }
 */

// PUBLIC_INTERFACE
export function AssistantProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      id: "m-welcome",
      role: "assistant",
      content: "Hello! I’m your learning assistant. Ask me anything about your courses, goals, or analytics.",
      ts: new Date().toISOString(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const nextIdRef = useRef(1);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastAssistantMessage = useCallback((delta) => {
    setMessages((prev) => {
      // find last assistant message to append to
      const lastIndex = [...prev].reverse().findIndex((m) => m.role === "assistant");
      if (lastIndex === -1) {
        // If not found, create a new assistant message
        return [
          ...prev,
          {
            id: `m-${nextIdRef.current++}`,
            role: "assistant",
            content: delta,
            ts: new Date().toISOString(),
          },
        ];
      }
      const actualIndex = prev.length - 1 - lastIndex;
      const updated = [...prev];
      updated[actualIndex] = {
        ...updated[actualIndex],
        content: (updated[actualIndex].content || "") + delta,
      };
      return updated;
    });
  }, []);

  // PUBLIC_INTERFACE
  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  // PUBLIC_INTERFACE
  const sendMessage = useCallback(async (text, streamer) => {
    /**
     * Send a user message and start streaming a mock assistant response.
     * The streamer is a function provided by a hook (useMockStreamAssistant) that simulates token streaming.
     */
    if (!text || !text.trim()) return;
    setError(null);
    const trimmed = text.trim();

    const userMsg = {
      id: `m-${nextIdRef.current++}`,
      role: "user",
      content: trimmed,
      ts: new Date().toISOString(),
    };
    appendMessage(userMsg);

    // placeholder assistant message inserted so updates can append tokens
    const assistantSkeleton = {
      id: `m-${nextIdRef.current++}`,
      role: "assistant",
      content: "",
      ts: new Date().toISOString(),
    };
    appendMessage(assistantSkeleton);

    try {
      setIsStreaming(true);
      await streamer({
        userText: trimmed,
        onDelta: (token) => updateLastAssistantMessage(token),
      });
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
      logger.warn("Assistant streaming error", { message: msg });
      updateLastAssistantMessage("\n[Sorry, I ran into an issue while responding. Please try again.]");
    } finally {
      setIsStreaming(false);
    }
  }, [appendMessage, updateLastAssistantMessage]);

  const value = useMemo(() => ({ messages, isStreaming, error, sendMessage, reset }), [
    messages,
    isStreaming,
    error,
    sendMessage,
    reset,
  ]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
