import React, { useState } from "react";
import Button from "../common/Button";

/**
 * PUBLIC_INTERFACE
 * Comments - renders a post's comments and an inline composer.
 * Props:
 * - comments: Array<{id, author:{name}, content, createdAt, _optimistic?}>
 * - onAdd: (text: string) => Promise<void>|void
 */
export default function Comments({ comments = [], onAdd }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    try {
      setSubmitting(true);
      await onAdd?.(text.trim());
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={{ display: "grid", gap: ".5rem" }}>
      <div style={{ display: "grid", gap: ".4rem" }}>
        {comments.length === 0 && (
          <div style={{ color: "var(--color-muted)", fontSize: ".9rem" }}>Be the first to comment.</div>
        )}
        {comments.map((c) => (
          <div key={c.id} className="surface" style={{ padding: ".5rem", borderStyle: c._optimistic ? "dashed" : "solid" }}>
            <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{c.author?.name || "User"}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
            <div style={{ color: "var(--color-muted)", fontSize: ".8rem", marginTop: ".25rem" }}>
              {formatTimeAgo(c.createdAt)}{c._optimistic ? " • sending..." : ""}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: ".5rem", alignItems: "flex-end" }}>
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a comment"
          style={{
            flex: 1,
            padding: "0.5rem 0.6rem",
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text)",
            resize: "vertical",
          }}
        />
        <Button onClick={handleAdd} disabled={submitting || !text.trim()}>
          {submitting ? "Posting..." : "Comment"}
        </Button>
      </div>
    </div>
  );
}

function formatTimeAgo(iso) {
  try {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}
