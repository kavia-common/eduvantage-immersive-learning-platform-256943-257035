import React from "react";
import { useFeed } from "../../state/feedSlice";
import PostComposer from "./PostComposer";
import Comments from "./Comments";
import Button from "../common/Button";

/**
 * PUBLIC_INTERFACE
 * Feed - renders the social feed with optimistic updates.
 * Uses FeedProvider higher up to supply state/actions.
 */
// PUBLIC_INTERFACE
export default function Feed() {
  const { posts, loading, error, createPost, addComment, toggleReaction, loadFeed } = useFeed();

  return (
    <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
      <PostComposer onSubmit={createPost} />

      <div className="surface" style={{ padding: ".75rem", display: "flex", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>Latest updates</div>
        <div style={{ marginLeft: "auto" }}>
          <Button variant="secondary" onClick={loadFeed} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="surface" style={{ padding: ".75rem", borderColor: "var(--color-error)", color: "var(--color-error)" }}>
          Failed to load feed: {error}
        </div>
      )}

      {loading && posts.length === 0 && (
        <div className="surface" style={{ padding: ".75rem" }}>Loading feed...</div>
      )}

      {!loading && posts.length === 0 && (
        <div className="surface" style={{ padding: ".75rem", color: "var(--color-muted)" }}>
          No posts yet. Share your first update!
        </div>
      )}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {posts.map((p) => (
          <article
            key={p.id}
            className="surface"
            style={{
              padding: ".75rem",
              borderStyle: p._optimistic ? "dashed" : "solid",
            }}
          >
            <header style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <div
                aria-hidden
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary))",
                }}
              />
              <div>
                <div style={{ fontWeight: 700 }}>{p.author?.name || "User"}</div>
                <div style={{ color: "var(--color-muted)", fontSize: ".85rem" }}>{formatTimeAgo(p.createdAt)}</div>
              </div>
              {p._optimistic && (
                <div style={{ marginLeft: "auto", color: "var(--color-muted)", fontSize: ".85rem" }}>posting…</div>
              )}
            </header>

            <div className="mt-2" style={{ whiteSpace: "pre-wrap" }}>{p.content}</div>

            <div className="mt-2" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <button
                className="btn secondary"
                onClick={() => toggleReaction(p.id, "like")}
                aria-pressed={!!p.userHasLiked}
                title={p.userHasLiked ? "Unlike" : "Like"}
              >
                {p.userHasLiked ? "💙 Liked" : "👍 Like"} {Number(p.reactions?.like || 0) > 0 ? `(${p.reactions.like})` : ""}
              </button>
            </div>

            <div className="mt-2">
              <Comments comments={p.comments || []} onAdd={(text) => addComment(p.id, text)} />
            </div>
          </article>
        ))}
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
