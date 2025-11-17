import React, { useState } from "react";
import Button from "../common/Button";

/**
 * PUBLIC_INTERFACE
 * PostComposer - text area to compose a new post with submit button.
 * Props:
 * - onSubmit: (text: string) => Promise<void>|void
 */
export default function PostComposer({ onSubmit }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    if (!text.trim()) return;
    try {
      setSubmitting(true);
      await onSubmit?.(text.trim());
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <div className="surface" style={{ padding: ".75rem", display: "grid", gap: ".5rem" }}>
      <div style={{ fontWeight: 700 }}>Share an update</div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="What's new in your learning journey?"
        style={{
          width: "100%",
          padding: "0.6rem 0.7rem",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          background: "transparent",
          color: "var(--color-text)",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem" }}>
        <Button variant="secondary" onClick={() => setText("")} disabled={submitting || !text.trim()}>
          Clear
        </Button>
        <Button onClick={handlePost} disabled={submitting || !text.trim()}>
          {submitting ? "Posting..." : "Post"}
        </Button>
      </div>
      <div style={{ color: "var(--color-muted)", fontSize: ".85rem" }}>
        Tip: Press Cmd/Ctrl+Enter to post quickly.
      </div>
    </div>
  );
}
