import React from "react";

/**
 * ChatMessage renders a single chat bubble aligned by role.
 * - role: "user" | "assistant" | "system"
 * - content: string
 */

// PUBLIC_INTERFACE
export default function ChatMessage({ role = "assistant", content = "" }) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const bubbleStyle = {
    padding: "0.65rem 0.8rem",
    borderRadius: 12,
    maxWidth: "85%",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-sm)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };
  const userStyle = {
    background: "rgba(37, 99, 235, 0.08)",
    borderColor: "rgba(37, 99, 235, 0.35)",
  };
  const assistantStyle = {
    background: "var(--color-surface)",
  };
  const systemStyle = {
    background: "transparent",
    borderStyle: "dashed",
    color: "var(--color-muted)",
  };

  const style = isUser ? { ...bubbleStyle, ...userStyle } : isAssistant ? { ...bubbleStyle, ...assistantStyle } : { ...bubbleStyle, ...systemStyle };

  return (
    <div
      className="chat-message"
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "0.5rem",
      }}
    >
      <div aria-live="polite" style={style}>
        {content}
      </div>
    </div>
  );
}
