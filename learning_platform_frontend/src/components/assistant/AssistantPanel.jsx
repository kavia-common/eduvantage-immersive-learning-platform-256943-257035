import React, { useCallback, useMemo, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import Button from "../common/Button";
import { useAssistant } from "../../state/assistantContext";
import { useMockStreamAssistant } from "../../hooks/useMockStreamAssistant";
import "./assistant.css";

/**
 * AssistantPanel
 * A collapsible panel showing chat history and an input field.
 * Provides basic send/receive with simulated streaming via useMockStreamAssistant.
 */

// PUBLIC_INTERFACE
export default function AssistantPanel({ defaultOpen = true }) {
  const { messages, isStreaming, error, sendMessage, reset } = useAssistant();
  const { streamReply } = useMockStreamAssistant();
  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const disabled = useMemo(() => isStreaming || !text.trim(), [isStreaming, text]);

  const onSend = useCallback(async () => {
    const value = text;
    setText("");
    await sendMessage(value, streamReply);
    // refocus input after sending
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [text, sendMessage, streamReply]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) onSend();
    }
  };

  return (
    <div className="assistant-panel surface" style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div className="assistant-header" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <div style={{ fontWeight: 700 }}>Learning Assistant</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
          <button className="btn secondary" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="assistant-body">
            {open ? "Hide" : "Show"}
          </button>
          <button className="btn" onClick={reset} disabled={isStreaming}>
            Clear
          </button>
        </div>
      </div>

      {error && <div style={{ color: "var(--color-error)", fontSize: ".9rem" }}>{error}</div>}

      {open && (
        <div id="assistant-body" className="assistant-body" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: ".5rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
          <div className="messages" style={{ maxHeight: 320, overflowY: "auto", paddingRight: ".25rem" }}>
            {messages.map((m) => (
              <ChatMessage key={m.id} role={m.role} content={m.content} />
            ))}
          </div>

          <div className="composer" style={{ display: "flex", gap: ".5rem", alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isStreaming ? "Assistant is responding..." : "Ask for a study plan, help with concepts, or analytics insights"}
              style={{
                flex: 1,
                padding: "0.6rem 0.7rem",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text)",
                resize: "vertical",
              }}
              disabled={isStreaming}
            />
            <Button onClick={onSend} disabled={disabled}>
              {isStreaming ? "Streaming..." : "Send"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
