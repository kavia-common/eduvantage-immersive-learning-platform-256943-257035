"use strict";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../services/apiClient";
import { wsClient } from "../services/wsClient";
import { supabase } from "../supabaseClient";
import { logger } from "../services/logger";

/**
 * PUBLIC_INTERFACE
 * FeedContext - provides social feed data and actions with optimistic updates.
 *
 * State shape:
 * - posts: Array<Post>
 * - loading: boolean
 * - error: string|null
 *
 * Post shape:
 * {
 *   id: string,
 *   author: { id: string, name: string, avatar?: string },
 *   content: string,
 *   createdAt: string,
 *   reactions: { like: number },
 *   userHasLiked?: boolean,
 *   comments: Array<Comment>
 * }
 *
 * Comment shape:
 * {
 *   id: string,
 *   postId: string,
 *   author: { id: string, name: string },
 *   content: string,
 *   createdAt: string
 * }
 *
 * Actions:
 * - loadFeed()
 * - createPost(content)
 * - addComment(postId, content)
 * - toggleReaction(postId, reactionType='like')
 *
 * Integration points:
 * - Uses apiClient to call a placeholder REST API.
 * - Listens to wsClient for "feed:update" messages (placeholder).
 * - Supabase Realtime placeholder subscription commented for future schema.
 */

export const FeedContext = createContext({
  posts: [],
  loading: true,
  error: null,
  loadFeed: async () => {},
  createPost: async (_content) => {},
  addComment: async (_postId, _content) => {},
  toggleReaction: async (_postId, _reactionType) => {},
});

// PUBLIC_INTERFACE
export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}

// Mock helpers if backend not available.
async function fetchMockFeed() {
  await new Promise((r) => setTimeout(r, 350));
  const now = new Date();
  const makeId = () => Math.random().toString(36).slice(2, 10);
  return [
    {
      id: `p-${makeId()}`,
      author: { id: "u-1", name: "Ava Learner" },
      content: "Excited to start the VR Physics module today! 🚀",
      createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      reactions: { like: 3 },
      userHasLiked: false,
      comments: [
        {
          id: `c-${makeId()}`,
          postId: "demo",
          author: { id: "u-2", name: "Kai Mentor" },
          content: "You’ll love it—check the momentum section!",
          createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        },
      ],
    },
    {
      id: `p-${makeId()}`,
      author: { id: "u-3", name: "Noah Analyst" },
      content: "Hit a 7-day streak of practice quizzes. Analytics trending up 📈",
      createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
      reactions: { like: 5 },
      userHasLiked: true,
      comments: [],
    },
  ];
}

async function apiGetOrMock(path, fallback) {
  try {
    return await apiClient.get(path);
  } catch (e) {
    logger.warn("Feed GET fallback to mock", { path, error: String(e?.message || e) });
    return await fallback();
  }
}

async function apiPostOrMock(path, body, mockTransform) {
  try {
    return await apiClient.post(path, body);
  } catch (e) {
    logger.warn("Feed POST fallback to mock", { path, error: String(e?.message || e) });
    return mockTransform();
  }
}

// PUBLIC_INTERFACE
export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const loadFeed = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiGetOrMock("/api/feed", fetchMockFeed);
      if (!mountedRef.current) return;
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Optimistic Post create
  const createPost = useCallback(
    async (content) => {
      if (!content || !content.trim()) return;
      const trimmed = content.trim();
      // optimistic id
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        id: tempId,
        author: { id: "me", name: "You" },
        content: trimmed,
        createdAt: new Date().toISOString(),
        reactions: { like: 0 },
        userHasLiked: false,
        comments: [],
        _optimistic: true,
      };
      setPosts((prev) => [optimistic, ...prev]);

      try {
        const created = await apiPostOrMock(
          "/api/feed",
          { content: trimmed },
          () => ({
            ...optimistic,
            id: `p-${Math.random().toString(36).slice(2, 10)}`,
            _optimistic: false,
          })
        );
        // replace temp with actual
        setPosts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...created, _optimistic: false } : p))
        );
      } catch (e) {
        const msg = String(e?.message || e);
        setError(msg);
        // rollback
        setPosts((prev) => prev.filter((p) => p.id !== tempId));
      }
    },
    []
  );

  // Optimistic comment add
  const addComment = useCallback(async (postId, content) => {
    if (!postId || !content || !content.trim()) return;
    const trimmed = content.trim();
    const tempId = `ctemp-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      postId,
      author: { id: "me", name: "You" },
      content: trimmed,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), optimisticComment] } : p
      )
    );

    try {
      const created = await apiPostOrMock(
        `/api/feed/${postId}/comments`,
        { content: trimmed },
        () => ({
          ...optimisticComment,
          id: `c-${Math.random().toString(36).slice(2, 10)}`,
          _optimistic: false,
        })
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: (p.comments || []).map((c) =>
                  c.id === tempId ? { ...created, _optimistic: false } : c
                ),
              }
            : p
        )
      );
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
      // rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: (p.comments || []).filter((c) => c.id !== tempId) }
            : p
        )
      );
    }
  }, []);

  // Optimistic like/unlike
  const toggleReaction = useCallback(async (postId, reactionType = "like") => {
    if (!postId) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const has = !!p.userHasLiked;
        const delta = has ? -1 : 1;
        const current = p.reactions?.[reactionType] ?? 0;
        return {
          ...p,
          userHasLiked: !has,
          reactions: { ...(p.reactions || {}), [reactionType]: Math.max(0, current + delta) },
        };
      })
    );

    try {
      // best-effort; ignore response for now
      await apiPostOrMock(`/api/feed/${postId}/react`, { type: reactionType }, () => ({}));
    } catch (e) {
      const msg = String(e?.message || e);
      setError(msg);
      // rollback if failed
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const has = !!p.userHasLiked;
          const delta = has ? -1 : 1; // reverse
          const current = p.reactions?.[reactionType] ?? 0;
          return {
            ...p,
            userHasLiked: !has,
            reactions: { ...(p.reactions || {}), [reactionType]: Math.max(0, current + delta) },
          };
        })
      );
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadFeed();

    // WS realtime placeholder
    const offWs = wsClient.on("message", (evt) => {
      try {
        const data = typeof evt?.data === "string" ? JSON.parse(evt.data) : evt?.data;
        if (data?.type === "feed:update") {
          loadFeed(); // refresh on update
        }
      } catch {
        // ignore parse errors
      }
    });

    // Supabase realtime placeholder (adjust schema/table upon availability)
    // const channel = supabase
    //   .channel("realtime:feed")
    //   .on(
    //     "postgres_changes",
    //     { event: "*", schema: "public", table: "posts" },
    //     (_payload) => loadFeed()
    //   )
    //   .subscribe();

    return () => {
      mountedRef.current = false;
      try {
        offWs && offWs();
      } catch {}
      try {
        // channel && supabase.removeChannel(channel);
      } catch {}
    };
  }, [loadFeed]);

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      loadFeed,
      createPost,
      addComment,
      toggleReaction,
    }),
    [posts, loading, error, loadFeed, createPost, addComment, toggleReaction]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
