"use client";

import Link from "next/link";
import Image from "next/image";
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
type ResultPair = { label: string; value: string };
type ResultCard = {
  title: string;
  subtitle: string | null;
  score: number | null;
  summary: string | null;
  images: string[];
  answers: ResultPair[];
  annotations: string[];
  meta: ResultPair[];
};

const EMOJIS = ["👍", "🔥", "🎉", "🤔", "😂"];
const RESULT_IMAGES = ["/puzzles/lightcurve-analysis.svg"];

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

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asImageArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter((item) => item.length > 0);
}

function normalizeResultCard(payload: Record<string, unknown>): ResultCard {
  const title = asString(payload.title) ?? "Shared Results";
  const puzzleDate = asString(payload.puzzleDate);
  const subtitle = puzzleDate ? `Puzzle ${puzzleDate}` : asString(payload.type);
  const score = typeof payload.score === "number" && Number.isFinite(payload.score) ? payload.score : null;
  const summary = asString(payload.summary);

  const images = asImageArray(payload.images);

  const answers: ResultPair[] = [];
  const answersRaw = payload.answers;
  if (Array.isArray(answersRaw)) {
    answersRaw.forEach((entry, idx) => {
      if (typeof entry === "string") {
        const text = entry.trim();
        if (text) answers.push({ label: `Answer ${idx + 1}`, value: text });
        return;
      }

      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const row = entry as Record<string, unknown>;
        const label = asString(row.label) ?? `Answer ${idx + 1}`;
        const value = asString(row.value);
        if (value) answers.push({ label, value });
      }
    });
  }

  const annotations: string[] = [];
  const rawAnnotations = payload.annotations;
  if (Array.isArray(rawAnnotations)) {
    rawAnnotations.forEach((entry) => {
      if (typeof entry === "string") {
        const text = entry.trim();
        if (text) annotations.push(text);
        return;
      }
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const row = entry as Record<string, unknown>;
        const tag = asString(row.tag) ?? "Annotation";
        const confidence = typeof row.confidence === "number" ? `${Math.round(row.confidence)}%` : null;
        const xStart = typeof row.xStart === "number" ? row.xStart.toFixed(3) : null;
        const xEnd = typeof row.xEnd === "number" ? row.xEnd.toFixed(3) : null;
        const note = asString(row.note);
        const range = xStart && xEnd ? `${xStart}-${xEnd}` : null;
        const parts = [tag, range, confidence].filter(Boolean);
        const label = parts.join(" • ");
        annotations.push(note ? `${label} — ${note}` : label);
      }
    });
  }

  const meta: ResultPair[] = [];
  const sharedAt = asString(payload.sharedAt);
  if (sharedAt) meta.push({ label: "Shared", value: new Date(sharedAt).toLocaleString() });
  if (puzzleDate) meta.push({ label: "Date", value: puzzleDate });

  const knownKeys = new Set(["title", "type", "summary", "sharedAt", "puzzleDate", "images", "answers", "annotations"]);
  Object.entries(payload).forEach(([key, value]) => {
    if (knownKeys.has(key) || value === null || value === undefined) return;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      meta.push({ label: key, value: String(value) });
    }
  });

  return { title, subtitle, score, summary, images, answers, annotations, meta };
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
  const [sharedScore, setSharedScore] = useState<number | null>(null);
  const [sharedAnswers, setSharedAnswers] = useState<string[]>(["", "", ""]);
  const [sharedAnnotations, setSharedAnnotations] = useState<string[]>([]);
  const [sharedHintSummary, setSharedHintSummary] = useState<string>("");
  const [showShareDetails, setShowShareDetails] = useState(false);
  const [replyBodyByPost, setReplyBodyByPost] = useState<Record<number, string>>({});
  const [replyOpenByPost, setReplyOpenByPost] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  );
  const interactionLocked = Boolean(selectedThread?.is_locked) || !isAuthenticated;
  const tree = useMemo(() => buildTree(posts), [posts]);
  const sharePreviewAnswers = useMemo(
    () =>
      sharedAnswers
        .map((value, idx) => ({ label: `Puzzle ${idx + 1}`, value: value.trim() }))
        .filter((item) => item.value.length > 0),
    [sharedAnswers],
  );
  const sharePreviewMeta = useMemo(() => {
    const rows: ResultPair[] = [{ label: "Date", value: date }];
    if (sharedHintSummary.trim()) rows.push({ label: "Hints", value: sharedHintSummary.trim() });
    return rows;
  }, [date, sharedHintSummary]);
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
            type: "daily_result",
            title: "Daily Lightcurve Analysis",
            sharedAt: new Date().toISOString(),
            puzzleDate: date,
            score: sharedScore,
            summary: body.slice(0, 180),
            images: RESULT_IMAGES,
            answers: sharedAnswers
              .map((value, idx) => ({ label: `Puzzle ${idx + 1}`, value: value.trim() }))
              .filter((item) => item.value.length > 0),
            annotations: sharedAnnotations,
            hintSummary: sharedHintSummary || undefined,
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
    setSharedScore(null);
    setSharedAnswers(["", "", ""]);
    setSharedAnnotations([]);
    setSharedHintSummary("");
    setShowShareDetails(false);
  }

  async function preloadSharedResult() {
    try {
      const response = await fetch(`/api/game/today?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        play?: { score?: number } | null;
        anomaly?: { id?: number } | null;
      };

      const maybeScore = payload.play?.score;
      if (typeof maybeScore === "number" && Number.isFinite(maybeScore)) {
        setSharedScore(maybeScore);
      }

      const anomalyId = Number(payload.anomaly?.id);
      if (!Number.isFinite(anomalyId) || anomalyId <= 0) return;

      const submissionResponse = await fetch(`/api/anomaly/submit?date=${encodeURIComponent(date)}&anomalyId=${anomalyId}`, { cache: "no-store" });
      if (!submissionResponse.ok) return;
      const submissionPayload = (await submissionResponse.json()) as {
        submission?: {
          annotations?: Array<{ tag?: string; xStart?: number; xEnd?: number; confidence?: number; note?: string }>;
          note?: string | null;
          hint_flags?: { phaseFold?: boolean; bin?: boolean } | null;
          reward_multiplier?: number | null;
          period_days?: number | null;
        } | null;
      };

      const submission = submissionPayload.submission;
      if (!submission) return;

      const annotations = Array.isArray(submission.annotations)
        ? submission.annotations.map((item) => {
            const tag = typeof item.tag === "string" ? item.tag : "Annotation";
            const range =
              typeof item.xStart === "number" && typeof item.xEnd === "number"
                ? `${item.xStart.toFixed(3)}-${item.xEnd.toFixed(3)}`
                : "";
            const confidence = typeof item.confidence === "number" ? `${Math.round(item.confidence)}%` : "";
            const base = [tag, range, confidence].filter(Boolean).join(" • ");
            const note = typeof item.note === "string" ? item.note.trim() : "";
            return note ? `${base} — ${note}` : base;
          })
        : [];
      setSharedAnnotations(annotations);

      setSharedAnswers((current) => {
        const next = [...current];
        if (annotations.length > 0) {
          next[0] = `Transit evidence: ${annotations.length} interval${annotations.length > 1 ? "s" : ""}`;
        }
        if (typeof submission.note === "string" && submission.note.trim().length > 0) {
          next[2] = submission.note.trim();
        }
        return next;
      });

      const hintParts: string[] = [];
      if (submission.hint_flags?.phaseFold) hintParts.push("phase fold");
      if (submission.hint_flags?.bin) hintParts.push("binning");
      if (typeof submission.period_days === "number") hintParts.push(`period ${submission.period_days.toFixed(2)}d`);
      if (typeof submission.reward_multiplier === "number") hintParts.push(`reward x${submission.reward_multiplier.toFixed(2)}`);
      setSharedHintSummary(hintParts.join(" • "));
    } catch {
      // keep composer usable even if preload fails
    }
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

    const resultCard = node.result_payload ? normalizeResultCard(node.result_payload) : null;

    return (
      <article className="forum-post" key={node.id} style={{ marginLeft: `${depth * 1.15}rem` }}>
        <div className="forum-post-head">
          <strong>{displayName(node)}</strong>
          <span className="muted">{new Date(node.created_at).toLocaleString()}</span>
        </div>
        <p>{node.body}</p>

        {resultCard ? (
          <section className="forum-result-card" aria-label="Shared puzzle results">
            <div className="forum-result-head">
              <p className="forum-result-title">{resultCard.title}</p>
              {resultCard.subtitle ? <p className="forum-result-subtitle">{resultCard.subtitle}</p> : null}
            </div>

            {resultCard.score !== null ? (
              <p className="forum-result-score">
                Score <strong>{resultCard.score}</strong>
              </p>
            ) : null}

            {resultCard.summary ? <p className="forum-result-summary">{resultCard.summary}</p> : null}

            {resultCard.images.length > 0 ? (
              <div className="forum-result-images">
                {resultCard.images.map((src) => (
                  <Image key={src} src={src} alt="Shared puzzle result" width={480} height={270} unoptimized />
                ))}
              </div>
            ) : null}

            {resultCard.answers.length > 0 ? (
              <dl className="forum-result-answers">
                {resultCard.answers.map((item) => (
                  <div key={`${item.label}-${item.value}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {resultCard.annotations.length > 0 ? (
              <ul className="forum-result-annotation-list">
                {resultCard.annotations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}

            {resultCard.meta.length > 0 ? (
              <div className="forum-result-meta">
                {resultCard.meta.map((item) => (
                  <span key={`${item.label}-${item.value}`} className="forum-result-pill">
                    <strong>{item.label}:</strong> {item.value}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
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
          <Link className="button" href={`/games/today?date=${date}&returnTo=${encodeURIComponent(`/discuss?date=${date}`)}`}>
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
            <Link className="button" href={`/games/today?date=${date}&returnTo=${encodeURIComponent(`/discuss?date=${date}`)}`}>
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
              onChange={(event) => {
                const checked = event.target.checked;
                setComposerShareResult(checked);
                if (checked) {
                  setShowShareDetails(false);
                  void preloadSharedResult();
                }
              }}
              disabled={interactionLocked}
            />
            Share my answers/results
          </label>

          {composerShareResult ? (
            <section className="forum-share-fields">
              <div className="forum-share-row">
                <p className="muted">Result preview (what will be posted)</p>
                <div className="forum-share-row-actions">
                  <button className="button" type="button" onClick={() => void preloadSharedResult()} disabled={interactionLocked}>
                    Refresh from puzzle
                  </button>
                  <button className="button" type="button" onClick={() => setShowShareDetails((value) => !value)} disabled={interactionLocked}>
                    {showShareDetails ? "Hide detail fields" : "Edit detail fields"}
                  </button>
                </div>
              </div>

              <section className="forum-result-card forum-result-preview-card" aria-label="Shared puzzle results preview">
                <div className="forum-result-head">
                  <p className="forum-result-title">Daily Puzzle Results</p>
                  <p className="forum-result-subtitle">Puzzle {date}</p>
                </div>

                {sharedScore !== null ? (
                  <p className="forum-result-score">
                    Score <strong>{sharedScore}</strong>
                  </p>
                ) : null}

                {composerBody.trim() ? <p className="forum-result-summary">{composerBody.trim().slice(0, 180)}</p> : null}

                <div className="forum-result-images">
                  {RESULT_IMAGES.map((src) => (
                    <Image key={`preview-${src}`} src={src} alt="Shared puzzle preview" width={480} height={270} unoptimized />
                  ))}
                </div>

                {sharePreviewAnswers.length > 0 ? (
                  <dl className="forum-result-answers">
                    {sharePreviewAnswers.map((item) => (
                      <div key={`${item.label}-${item.value}`}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {sharedAnnotations.length > 0 ? (
                  <ul className="forum-result-annotation-list">
                    {sharedAnnotations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {sharePreviewMeta.length > 0 ? (
                  <div className="forum-result-meta">
                    {sharePreviewMeta.map((item) => (
                      <span key={`${item.label}-${item.value}`} className="forum-result-pill">
                        <strong>{item.label}:</strong> {item.value}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>

              {showShareDetails ? (
                <>
              <label className="forum-share-field">
                <span>Score</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  value={sharedScore ?? ""}
                  onChange={(event) => {
                    const numeric = Number(event.target.value);
                    setSharedScore(Number.isFinite(numeric) ? numeric : null);
                  }}
                  placeholder="e.g. 88"
                  disabled={interactionLocked}
                />
              </label>

              {sharedAnswers.map((answer, idx) => (
                <label className="forum-share-field" key={`answer-${idx}`}>
                  <span>Puzzle {idx + 1} answer</span>
                  <input
                    className="input"
                    value={answer}
                    onChange={(event) =>
                      setSharedAnswers((current) => current.map((value, aIdx) => (aIdx === idx ? event.target.value : value)))
                    }
                    placeholder={`Enter answer for puzzle ${idx + 1}`}
                    disabled={interactionLocked}
                  />
                </label>
              ))}

              <label className="forum-share-field">
                <span>Imported annotations</span>
                {sharedAnnotations.length > 0 ? (
                  <ul className="forum-result-annotation-list">
                    {sharedAnnotations.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No saved annotations found for this date yet.</p>
                )}
              </label>

              <label className="forum-share-field">
                <span>Hint summary</span>
                <input
                  className="input"
                  value={sharedHintSummary}
                  onChange={(event) => setSharedHintSummary(event.target.value)}
                  placeholder="phase fold • period 2.00d • reward x0.80"
                  disabled={interactionLocked}
                />
              </label>
                </>
              ) : null}
            </section>
          ) : null}
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
