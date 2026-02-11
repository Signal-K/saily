"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { normalizeDateKey } from "@/lib/forum";

type Thread = {
  id: number;
  puzzle_date: string;
  kind: "daily_live" | "ongoing";
  title: string;
  continue_thread_id: number | null;
  is_locked: boolean;
};

type Post = {
  id: number;
  thread_id: number;
  parent_post_id: number | null;
  user_id: string;
  body: string;
  result_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  profiles: { username?: string } | { username?: string }[] | null;
  vote_count: number;
  upvoted_by_me: boolean;
  reaction_counts: Record<string, number>;
  reacted_by_me: string[];
};

type PostNode = Post & { children: PostNode[] };

const EMOJIS = ["👍", "🔥", "🎉", "🤔", "😂"];

function displayName(post: Post) {
  const profile = Array.isArray(post.profiles) ? profileFromArray(post.profiles) : post.profiles;
  return profile?.username ?? "player";
}

function profileFromArray(items: { username?: string }[]) {
  return items[0] ?? null;
}

function buildTree(posts: Post[]): PostNode[] {
  const map = new Map<number, PostNode>();
  posts.forEach((post) => map.set(post.id, { ...post, children: [] }));

  const roots: PostNode[] = [];

  map.forEach((post) => {
    if (post.parent_post_id && map.has(post.parent_post_id)) {
      map.get(post.parent_post_id)!.children.push(post);
      return;
    }
    roots.push(post);
  });

  return roots;
}

function previousDateKeys(startDate: string, count: number) {
  const [year, month, day] = startDate.split("-").map(Number);
  const startUtc = new Date(Date.UTC(year, month - 1, day));
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(startUtc);
    d.setUTCDate(startUtc.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${weekdays[utcDate.getUTCDay()]}, ${day} ${months[month - 1]}`;
}

export function DiscussForum({ initialDate, isAuthenticated }: { initialDate: string; isAuthenticated: boolean }) {
  const [date, setDate] = useState(initialDate);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [composerBody, setComposerBody] = useState("");
  const [composerShareResult, setComposerShareResult] = useState(false);
  const [replyBodyByPost, setReplyBodyByPost] = useState<Record<number, string>>({});
  const [replyOpenByPost, setReplyOpenByPost] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  );
  const interactionLocked = Boolean(selectedThread?.is_locked) || !isAuthenticated;
  const tree = useMemo(() => buildTree(posts), [posts]);
  const quickDates = useMemo(() => {
    const base = previousDateKeys(initialDate, 10);
    if (base.includes(date)) return base;
    return [date, ...base.slice(0, 9)];
  }, [date, initialDate]);

  const loadThreads = useCallback(async (targetDate: string) => {
    setLoadingThreads(true);
    const response = await fetch(`/api/forum/threads?date=${encodeURIComponent(targetDate)}`, { cache: "no-store" });
    const payload = (await response.json()) as {
      error?: string;
      threads?: Thread[];
      defaultThreadId?: number | null;
    };

    const threadsData = payload.threads ?? [];

    if (!response.ok || threadsData.length === 0) {
      setThreads([]);
      setSelectedThreadId(null);
      setFeedback(payload.error ?? "Could not load threads.");
      setLoadingThreads(false);
      return;
    }

    setThreads(threadsData);
    setSelectedThreadId((current) => current ?? payload.defaultThreadId ?? threadsData[0]?.id ?? null);
    setFeedback(null);
    setLoadingThreads(false);
  }, []);

  const loadPosts = useCallback(async (threadId: number) => {
    setLoadingPosts(true);
    const response = await fetch(`/api/forum/posts?threadId=${threadId}`, { cache: "no-store" });
    const payload = (await response.json()) as { error?: string; posts?: Post[] };

    if (!response.ok || !payload.posts) {
      setPosts([]);
      setFeedback(payload.error ?? "Could not load posts.");
      setLoadingPosts(false);
      return;
    }

    setPosts(payload.posts);
    setFeedback(null);
    setLoadingPosts(false);
  }, []);

  useEffect(() => {
    const normalized = normalizeDateKey(date);
    if (!normalized) return;
    const handle = window.setTimeout(() => {
      void loadThreads(normalized);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [date, loadThreads]);

  useEffect(() => {
    if (!selectedThreadId) return;
    const handle = window.setTimeout(() => {
      void loadPosts(selectedThreadId);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [selectedThreadId, loadPosts]);

  async function createPost(parentPostId: number | null) {
    if (!isAuthenticated) {
      setFeedback("Sign in to post comments and replies.");
      return;
    }
    if (!selectedThreadId) return;

    const body = parentPostId ? replyBodyByPost[parentPostId]?.trim() : composerBody.trim();
    if (!body) return;

    const resultPayload =
      !parentPostId && composerShareResult
        ? {
            sharedAt: new Date().toISOString(),
            puzzleDate: date,
            summary: "Shared puzzle results snapshot",
          }
        : null;

    const response = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId: selectedThreadId,
        parentPostId,
        body,
        resultPayload,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      continueThreadId?: number;
      post?: Post;
    };

    if (!response.ok) {
      setFeedback(payload.error ?? "Could not post comment.");
      if (payload.continueThreadId) {
        setSelectedThreadId(payload.continueThreadId);
      }
      return;
    }
    setFeedback(null);

    const createdPost = payload.post;
    if (createdPost) {
      setPosts((current) => [...current, createdPost]);
    }

    if (parentPostId) {
      setReplyBodyByPost((current) => ({ ...current, [parentPostId]: "" }));
      setReplyOpenByPost((current) => ({ ...current, [parentPostId]: false }));
      return;
    }

    setComposerBody("");
    setComposerShareResult(false);
  }

  async function toggleVote(postId: number) {
    if (!isAuthenticated) {
      setFeedback("Sign in to vote on posts.");
      return;
    }
    const response = await fetch("/api/forum/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });

    const payload = (await response.json()) as {
      upvoted?: boolean;
      voteCount?: number;
      continueThreadId?: number;
    };

    if (!response.ok) {
      setFeedback("Could not update vote.");
      if (payload.continueThreadId) {
        setSelectedThreadId(payload.continueThreadId);
      }
      return;
    }
    setFeedback(null);

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              upvoted_by_me: Boolean(payload.upvoted),
              vote_count: payload.voteCount ?? post.vote_count,
            }
          : post,
      ),
    );
  }

  async function toggleReaction(postId: number, emoji: string) {
    if (!isAuthenticated) {
      setFeedback("Sign in to react on posts.");
      return;
    }
    const response = await fetch("/api/forum/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, emoji }),
    });

    const payload = (await response.json()) as {
      reacted?: boolean;
      emojiCount?: number;
      continueThreadId?: number;
    };

    if (!response.ok) {
      setFeedback("Could not update reaction.");
      if (payload.continueThreadId) {
        setSelectedThreadId(payload.continueThreadId);
      }
      return;
    }
    setFeedback(null);

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;

        const reactionCounts = { ...post.reaction_counts };
        reactionCounts[emoji] = payload.emojiCount ?? reactionCounts[emoji] ?? 0;

        const reactedByMe = new Set(post.reacted_by_me);
        if (payload.reacted) {
          reactedByMe.add(emoji);
        } else {
          reactedByMe.delete(emoji);
        }

        return {
          ...post,
          reaction_counts: reactionCounts,
          reacted_by_me: Array.from(reactedByMe),
        };
      }),
    );
  }

  function renderNode(node: PostNode, depth = 0) {
    const isLocked = interactionLocked;

    return (
      <article className="forum-post" key={node.id} style={{ marginLeft: `${depth * 1.15}rem` }}>
        <div className="forum-post-head">
          <strong>{displayName(node)}</strong>
          <span className="muted">{new Date(node.created_at).toLocaleString()}</span>
        </div>
        <p>{node.body}</p>

        {node.result_payload ? (
          <pre className="forum-result-box">{JSON.stringify(node.result_payload, null, 2)}</pre>
        ) : null}

        <div className="forum-actions-row">
          <button
            className={`forum-action-btn${node.upvoted_by_me ? " is-active" : ""}`}
            type="button"
            onClick={() => void toggleVote(node.id)}
            disabled={isLocked}
          >
            ▲ {node.vote_count}
          </button>

          {EMOJIS.map((emoji) => {
            const isActive = node.reacted_by_me.includes(emoji);
            const count = node.reaction_counts[emoji] ?? 0;
            return (
              <button
                key={`${node.id}-${emoji}`}
                className={`forum-action-btn${isActive ? " is-active" : ""}`}
                type="button"
                onClick={() => void toggleReaction(node.id, emoji)}
                disabled={isLocked}
              >
                {emoji} {count > 0 ? count : ""}
              </button>
            );
          })}

          <button
            className="forum-action-btn"
            type="button"
            onClick={() =>
              setReplyOpenByPost((current) => ({
                ...current,
                [node.id]: !current[node.id],
              }))
            }
            disabled={isLocked}
          >
            Reply
          </button>
        </div>

        {replyOpenByPost[node.id] ? (
          <form
            className="forum-reply-form"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              void createPost(node.id);
            }}
          >
            <textarea
              className="textarea"
              value={replyBodyByPost[node.id] ?? ""}
              onChange={(event) =>
                setReplyBodyByPost((current) => ({
                  ...current,
                  [node.id]: event.target.value,
                }))
              }
              placeholder="Write a reply..."
              disabled={isLocked}
            />
            <button className="button" type="submit" disabled={isLocked}>
              Post reply
            </button>
          </form>
        ) : null}

        {node.children.map((child) => renderNode(child, depth + 1))}
      </article>
    );
  }

  return (
    <section className="forum-layout">
      <div className="panel forum-header">
        <div>
          <h1>Discuss</h1>
          <p className="muted">Two daily threads, replies, votes, reactions, and result sharing.</p>
        </div>
        <div className="forum-header-actions">
          <label className="forum-date-field">
            <span className="muted">Puzzle date</span>
            <input data-cy="forum-date-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <Link className="button" href={`/games/today?date=${date}`}>
            View Puzzle
          </Link>
        </div>
      </div>

      <div className="panel forum-quick-days">
        {quickDates.map((dateKey) => (
          <button
            key={dateKey}
            type="button"
            data-cy="forum-date-chip"
            className={`forum-date-chip${dateKey === date ? " is-active" : ""}`}
            onClick={() => setDate(dateKey)}
          >
            {formatDateLabel(dateKey)}
          </button>
        ))}
      </div>

      <div className="forum-thread-tabs panel">
        {loadingThreads ? <p className="muted">Loading threads...</p> : null}
        {!loadingThreads
          ? threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                data-cy={`forum-thread-tab-${thread.kind}`}
                className={`forum-thread-tab${selectedThreadId === thread.id ? " is-active" : ""}`}
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <span>{thread.kind === "daily_live" ? "Live Thread" : "Ongoing Thread"}</span>
                {thread.is_locked ? <small>Locked</small> : <small>Open</small>}
              </button>
            ))
          : null}
      </div>

      {!isAuthenticated ? (
        <div className="panel forum-auth-banner">
          <p>Sign in to comment, reply, upvote, and react.</p>
          <Link className="button button-primary" href="/auth/sign-in">
            Sign in
          </Link>
        </div>
      ) : null}

      {feedback ? (
        <div className="panel forum-feedback">
          <p>{feedback}</p>
        </div>
      ) : null}

      {selectedThread?.is_locked ? (
        <div className="panel forum-lock-banner">
          <p>This thread is locked. Continue in the unlocked thread.</p>
          <div className="forum-lock-actions">
            <Link className="button" href={`/games/today?date=${date}`}>
              Open Puzzle
            </Link>
            {selectedThread.continue_thread_id ? (
              <button className="button button-primary" type="button" onClick={() => setSelectedThreadId(selectedThread.continue_thread_id)}>
                Continue Discussion
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="panel forum-composer">
        <form
          className="forum-composer-form"
          onSubmit={(event) => {
            event.preventDefault();
            void createPost(null);
          }}
        >
          <textarea
            className="textarea"
            data-cy="forum-composer-body"
            value={composerBody}
            onChange={(event) => setComposerBody(event.target.value)}
            placeholder="Share your thoughts on today's puzzle..."
            disabled={interactionLocked}
          />
          <label className="forum-share-toggle">
            <input
              data-cy="forum-composer-share"
              type="checkbox"
              checked={composerShareResult}
              onChange={(event) => setComposerShareResult(event.target.checked)}
              disabled={interactionLocked}
            />
            Share my answers/results
          </label>
          <button className="button button-primary" data-cy="forum-post-submit" type="submit" disabled={interactionLocked}>
            Post comment
          </button>
        </form>
      </div>

      <div className="panel forum-post-list">
        {loadingPosts ? <p className="muted">Loading posts...</p> : null}
        {!loadingPosts && tree.length === 0 ? <p className="muted">No posts yet. Start the discussion.</p> : null}
        {!loadingPosts ? tree.map((node) => renderNode(node)) : null}
      </div>
    </section>
  );
}
