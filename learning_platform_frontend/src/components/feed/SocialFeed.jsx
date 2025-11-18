import React from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import "../../styles/utilities.css";

/**
 * PUBLIC_INTERFACE
 * SocialFeed
 * A presentational, glass-styled social feed with sample posts and a simple (non-functional) composer.
 * Intended for demo/preview without wiring to global feed state.
 *
 * Accessibility:
 * - Buttons include aria-labels and descriptive titles
 * - Semantic article/header/section usage
 * - Emoji avatars marked aria-hidden
 */
export default function SocialFeed() {
  const posts = getSamplePosts();

  return (
    <section aria-label="Social Feed" className="mt-0" style={{ display: "grid", gap: "1rem" }}>
      {/* Composer */}
      <Card variant="glass" className="is-interactive" aria-label="Create a post">
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div aria-hidden style={{ fontSize: "1.5rem" }}>📝</div>
          <div style={{ flex: 1 }}>
            <label htmlFor="socialfeed-composer" className="sr-only">Create a post</label>
            <textarea
              id="socialfeed-composer"
              placeholder="Share an update with your classmates..."
              rows={3}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.6)",
                resize: "vertical",
              }}
              aria-label="Create Post textarea (disabled)"
            />
            <div className="mt-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".5rem" }}>
              <span style={{ color: "var(--color-muted)", fontSize: ".9rem" }}>
                Posting is disabled in this demo.
              </span>
              <Button variant="glass" className="is-interactive" disabled aria-label="Post update (disabled)" title="Post update (disabled)">
                Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts */}
      {posts.map((p) => (
        <Card
          key={p.id}
          variant="glass"
          className="is-interactive"
          aria-label={`Post by ${p.name}`}
          style={{ padding: "1rem" }}
        >
          <article>
            <header style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div aria-hidden style={{ fontSize: "1.75rem" }}>{p.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ color: "var(--color-muted)", fontSize: ".85rem" }}>{p.timestamp}</div>
              </div>
            </header>
            <div className="glass-divider" style={{ margin: "0.65rem 0" }} />
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{p.content}</p>
            <div className="mt-2" role="group" aria-label="Post actions" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Button
                variant="glass"
                className="is-interactive"
                aria-label={`Like post by ${p.name}`}
                title="Like"
                onClick={(e) => e.preventDefault()}
              >
                👍 Like {p.likes > 0 ? `(${p.likes})` : ""}
              </Button>
              <Button
                variant="glass"
                className="is-interactive"
                aria-label={`Comment on post by ${p.name}`}
                title="Comment"
                onClick={(e) => e.preventDefault()}
              >
                💬 Comment {p.comments > 0 ? `(${p.comments})` : ""}
              </Button>
              <Button
                variant="glass"
                className="is-interactive"
                aria-label={`Share post by ${p.name}`}
                title="Share"
                onClick={(e) => e.preventDefault()}
              >
                🔗 Share
              </Button>
            </div>
          </article>
        </Card>
      ))}
    </section>
  );
}

// PUBLIC_INTERFACE
export function getSamplePosts() {
  /**
   * Returns an array of static sample posts for the SocialFeed component.
   */
  return [
    {
      id: "p1",
      avatar: "🎓",
      name: "Ava Singh",
      content: "Just completed the Algebra mastery quiz with 95%! The tips from the assistant really helped.",
      timestamp: "2h ago",
      likes: 12,
      comments: 4,
    },
    {
      id: "p2",
      avatar: "📚",
      name: "Noah Kim",
      content: "Study group tonight at 7pm for Biology. Drop your questions and we’ll cover them!",
      timestamp: "4h ago",
      likes: 7,
      comments: 9,
    },
    {
      id: "p3",
      avatar: "🚀",
      name: "Lena Torres",
      content: "My streak hit 10 days today. Small steps every day really add up. Keep going everyone!",
      timestamp: "Yesterday",
      likes: 22,
      comments: 6,
    },
  ];
}
