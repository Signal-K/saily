"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { normalizeDateKey } from "@/lib/melbourne-date";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import { getRobotAvatarDataUri } from "@/lib/avatar";

type Thread = {
  id: string;
  puzzle_date: string;
  kind: "daily_live" | "ongoing";
  title: string;
  continue_thread_id: string | null;
  is_locked: boolean;
  is_hidden: boolean;
};

type DayAccess = {
  date: string;
  allowed: boolean;
  signInRequired: boolean;
  requiresUnlock: boolean;
  completed: boolean;
  unlocked: boolean;
};

type Post = {
  id: string;
  thread_id: string;
  parent_post_id: string | null;
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

const label = {
  fontFamily: "var(--font-data)",
  fontSize: "0.6rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
};

const dataText = {
  fontFamily: "var(--font-data)",
};

function displayName(post: Post) {
  const profile = Array.isArray(post.profiles) ? post.profiles[0] ?? null : post.profiles;
  return profile?.username ?? "player";
}

function buildTree(posts: Post[]): PostNode[] {
  const map = new Map<string, PostNode>();
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
        const lbl = asString(row.label) ?? `Answer ${idx + 1}`;
        const value = asString(row.value);
        if (value) answers.push({ label: lbl, value });
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
        const xStart = typeof row.xStart === "number" ? row.xStart.toFixed(3) : null;
        const xEnd = typeof row.xEnd === "number" ? row.xEnd.toFixed(3) : null;
        const note = asString(row.note);
        const range = xStart && xEnd ? `${xStart}-${xEnd}` : null;
        const parts = [tag, range].filter(Boolean);
        const lbl = parts.join(" • ");
        annotations.push(note ? `${lbl} — ${note}` : lbl);
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
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
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
  const [replyBodyByPost, setReplyBodyByPost] = useState<Record<string, string>>({});
  const [replyOpenByPost, setReplyOpenByPost] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dayAccess, setDayAccess] = useState<DayAccess | null>(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  );
  const dayRestrictedThread = selectedThread?.kind === "daily_live";
  const interactionLocked =
    Boolean(selectedThread?.is_locked) ||
    Boolean(selectedThread?.is_hidden) ||
    !isAuthenticated ||
    (dayRestrictedThread && dayAccess ? !dayAccess.allowed : false);
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
      defaultThreadId?: string | null;
      access?: DayAccess;
    };
    setDayAccess(payload.access ?? null);
    const threadsData = payload.threads ?? [];
    if (!response.ok || (threadsData.length === 0 && (payload.access?.allowed ?? true))) {
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

  const loadPosts = useCallback(async (threadId: string) => {
    setLoadingPosts(true);
    const response = await fetch(`/api/forum/posts?threadId=${threadId}`, { cache: "no-store" });
    const payload = (await response.json()) as { error?: string; posts?: Post[]; access?: DayAccess };
    if (payload.access) setDayAccess(payload.access);
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
    const handle = window.setTimeout(() => { void loadThreads(normalized); }, 0);
    return () => window.clearTimeout(handle);
  }, [date, loadThreads]);

  useEffect(() => {
    if (!selectedThreadId) return;
    const selectedThread = threads.find((thread) => thread.id === selectedThreadId);
    if (dayAccess && !dayAccess.allowed) return;
    if (selectedThread?.is_hidden) return;
    const handle = window.setTimeout(() => { void loadPosts(selectedThreadId); }, 0);
    return () => window.clearTimeout(handle);
  }, [selectedThreadId, loadPosts, dayAccess, threads]);

  async function createPost(parentPostId: string | null) {
    if (!isAuthenticated) { setFeedback("Sign in to post comments and replies."); return; }
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
      body: JSON.stringify({ threadId: selectedThreadId, parentPostId, body, resultPayload }),
    });
    const payload = (await response.json()) as { error?: string; continueThreadId?: string; post?: Post };
    if (!response.ok) {
      setFeedback(payload.error ?? "Could not post comment.");
      if (payload.continueThreadId) setSelectedThreadId(payload.continueThreadId);
      return;
    }
    setFeedback(null);
    if (payload.post) setPosts((current) => [...current, payload.post!]);
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
    queueSurveyTrigger({
      source: "discussion_flow",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      gameDate: date,
    });
  }

  // Only pulls the day's score — the old auto-imported annotations/hints
  // sourced from the now-deleted `planet` mission's /api/anomaly/submit
  // route, which had no crossword/dsmr equivalent (neither game persists a
  // per-round submission). The "Imported annotations"/"Hint summary" fields
  // in the composer below stay manually editable and degrade gracefully to
  // their empty state.
  async function preloadSharedResult() {
    try {
      const response = await fetch(`/api/game/today?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { completedGames?: { game: string; score: number }[] };
      const scores = (payload.completedGames ?? []).map((row) => row.score).filter((value) => Number.isFinite(value));
      if (scores.length > 0) {
        setSharedScore(Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length));
      }
    } catch {
      // keep composer usable even if preload fails
    }
  }

  async function toggleVote(postId: string) {
    if (!isAuthenticated) { setFeedback("Sign in to vote on posts."); return; }
    const response = await fetch("/api/forum/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const payload = (await response.json()) as { upvoted?: boolean; voteCount?: number; continueThreadId?: string };
    if (!response.ok) {
      setFeedback("Could not update vote.");
      if (payload.continueThreadId) setSelectedThreadId(payload.continueThreadId);
      return;
    }
    setFeedback(null);
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, upvoted_by_me: Boolean(payload.upvoted), vote_count: payload.voteCount ?? post.vote_count }
          : post,
      ),
    );
  }

  async function toggleReaction(postId: string, emoji: string) {
    if (!isAuthenticated) { setFeedback("Sign in to react on posts."); return; }
    const response = await fetch("/api/forum/reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, emoji }),
    });
    const payload = (await response.json()) as { reacted?: boolean; emojiCount?: number; continueThreadId?: string };
    if (!response.ok) {
      setFeedback("Could not update reaction.");
      if (payload.continueThreadId) setSelectedThreadId(payload.continueThreadId);
      return;
    }
    setFeedback(null);
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        const reactionCounts = { ...post.reaction_counts };
        reactionCounts[emoji] = payload.emojiCount ?? reactionCounts[emoji] ?? 0;
        const reactedByMe = new Set(post.reacted_by_me);
        if (payload.reacted) reactedByMe.add(emoji); else reactedByMe.delete(emoji);
        return { ...post, reaction_counts: reactionCounts, reacted_by_me: Array.from(reactedByMe) };
      }),
    );
  }

  function renderResultCard(resultCard: ResultCard) {
    return (
      <section
        className="border border-[var(--outline-variant)] p-4 my-3"
        style={{ background: "var(--surface-container)" }}
        aria-label="Shared puzzle results"
      >
        <div className="mb-2">
          <p className="m-0" style={{ ...dataText, fontSize: "0.75rem", fontWeight: 700, color: "var(--on-surface)" }}>{resultCard.title}</p>
          {resultCard.subtitle ? <p className="m-0" style={{ ...dataText, fontSize: "0.6rem", color: "var(--muted)" }}>{resultCard.subtitle}</p> : null}
        </div>
        {resultCard.score !== null ? (
          <p className="my-1" style={{ ...dataText, fontSize: "0.8rem", color: "var(--primary)" }}>
            Score <strong>{resultCard.score}</strong>
          </p>
        ) : null}
        {resultCard.summary ? <p className="my-2 text-sm">{resultCard.summary}</p> : null}
        {resultCard.images.length > 0 ? (
          <div className="my-2">
            {resultCard.images.map((src) => (
              <Image key={src} src={src} alt="Shared puzzle result" width={480} height={270} unoptimized className="max-w-full" />
            ))}
          </div>
        ) : null}
        {resultCard.answers.length > 0 ? (
          <dl className="my-2">
            {resultCard.answers.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <dt style={{ ...dataText, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>{item.label}</dt>
                <dd className="mb-2 text-sm">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {resultCard.annotations.length > 0 ? (
          <ul className="list-none p-0 my-2">
            {resultCard.annotations.map((item) => (
              <li key={item} className="py-1 border-b border-[var(--outline-variant)]" style={{ ...dataText, fontSize: "0.65rem", color: "var(--muted)" }}>{item}</li>
            ))}
          </ul>
        ) : null}
        {resultCard.meta.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {resultCard.meta.map((item) => (
              <span
                key={`${item.label}-${item.value}`}
                className="border border-[var(--outline-variant)] px-2 py-0.5"
                style={{ ...dataText, fontSize: "0.6rem", background: "var(--surface-container)", color: "var(--muted)" }}
              >
                <strong>{item.label}:</strong> {item.value}
              </span>
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  function renderNode(node: PostNode, depth = 0) {
    const resultCard = node.result_payload ? normalizeResultCard(node.result_payload) : null;
    const timeStr = new Date(node.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " UTC";

    return (
      <article
        key={node.id}
        className="border border-[var(--outline-variant)] p-4 mb-2"
        style={{ marginLeft: `${depth * 1.25}rem`, background: "var(--surface-container-low)" }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="flex items-center gap-2">
            <Image
              src={getRobotAvatarDataUri(node.user_id, 32)}
              alt=""
              width={24}
              height={24}
              unoptimized
              style={{ borderRadius: "50%" }}
            />
            <span style={{ ...dataText, fontSize: "0.75rem", color: "var(--primary)", letterSpacing: "0.04em" }}>
              {displayName(node)}
            </span>
          </span>
          <span style={{ ...dataText, fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.06em" }}>
            {timeStr}
          </span>
        </div>

        <p className="text-sm leading-relaxed mb-2">{node.body}</p>

        {resultCard ? renderResultCard(resultCard) : null}

        <div className="flex flex-wrap gap-1 mt-2">
          <button
            className={`border px-2 py-0.5 cursor-pointer transition-colors${node.upvoted_by_me ? " border-[var(--primary)] text-[var(--primary)]" : " border-[var(--outline-variant)] text-[var(--muted)]"}`}
            style={{ ...dataText, fontSize: "0.6rem", background: node.upvoted_by_me ? "color-mix(in oklab, var(--primary) 10%, transparent)" : "none" }}
            type="button"
            onClick={() => void toggleVote(node.id)}
            disabled={interactionLocked}
          >
            ▲ {node.vote_count}
          </button>

          {EMOJIS.map((emoji) => {
            const isActive = node.reacted_by_me.includes(emoji);
            const count = node.reaction_counts[emoji] ?? 0;
            return (
              <button
                key={`${node.id}-${emoji}`}
                className={`border px-2 py-0.5 cursor-pointer transition-colors${isActive ? " border-[var(--primary)]" : " border-[var(--outline-variant)]"}`}
                style={{ ...dataText, fontSize: "0.6rem", background: isActive ? "color-mix(in oklab, var(--primary) 10%, transparent)" : "none" }}
                type="button"
                onClick={() => void toggleReaction(node.id, emoji)}
                disabled={interactionLocked}
              >
                {emoji}{count > 0 ? ` ${count}` : ""}
              </button>
            );
          })}

          <button
            className="border border-[var(--outline-variant)] px-2 py-0.5 cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            style={{ ...dataText, fontSize: "0.6rem", color: "var(--muted)", background: "none" }}
            type="button"
            onClick={() => setReplyOpenByPost((current) => ({ ...current, [node.id]: !current[node.id] }))}
            disabled={interactionLocked}
          >
            Reply
          </button>
        </div>

        {replyOpenByPost[node.id] ? (
          <form
            className="mt-3 ml-4 flex flex-col gap-2"
            onSubmit={(event: FormEvent) => { event.preventDefault(); void createPost(node.id); }}
          >
            <textarea
              className="textarea"
              value={replyBodyByPost[node.id] ?? ""}
              onChange={(event) => setReplyBodyByPost((current) => ({ ...current, [node.id]: event.target.value }))}
              placeholder="Write a reply..."
              disabled={interactionLocked}
            />
            <button className="button" type="submit" disabled={interactionLocked}>
              Post reply
            </button>
          </form>
        ) : null}

        {node.children.map((child) => renderNode(child, depth + 1))}
      </article>
    );
  }

  function renderComposer() {
    return (
      <div className="mt-6 pt-4 border-t border-[var(--outline-variant)]">
        <p className="mb-2" style={{ ...label, color: "var(--muted)" }}>Input Terminal</p>
        <form onSubmit={(event) => { event.preventDefault(); void createPost(null); }}>
          <textarea
            className="textarea w-full"
            data-cy="forum-composer-body"
            value={composerBody}
            onChange={(event) => setComposerBody(event.target.value)}
            placeholder="Enter findings..."
            disabled={interactionLocked}
          />

          <div className="flex justify-between items-center mt-3 flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                data-cy="forum-composer-share"
                type="checkbox"
                checked={composerShareResult}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setComposerShareResult(checked);
                  if (checked) { setShowShareDetails(false); void preloadSharedResult(); }
                }}
                disabled={interactionLocked}
              />
              <span style={{ ...label, color: "var(--muted)" }}>Share Findings</span>
            </label>
            <button
              className="border border-[var(--primary)] px-6 py-2 cursor-pointer transition-colors hover:bg-[var(--primary)] hover:text-white disabled:opacity-40"
              style={{ ...label, color: "var(--primary)", background: "var(--surface-container-lowest)" }}
              data-cy="forum-post-submit"
              type="submit"
              disabled={interactionLocked}
            >
              Submit
            </button>
          </div>

          {composerShareResult ? (
            <div className="mt-4 border border-[var(--outline-variant)] p-4" style={{ background: "var(--surface-container-low)" }}>
              <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                <p className="muted m-0 text-sm">Log preview</p>
                <div className="flex gap-2">
                  <button className="button" type="button" onClick={() => void preloadSharedResult()} disabled={interactionLocked}>
                    Sync from today's games
                  </button>
                  <button className="button" type="button" onClick={() => setShowShareDetails((v) => !v)} disabled={interactionLocked}>
                    {showShareDetails ? "Hide fields" : "Edit fields"}
                  </button>
                </div>
              </div>

              {/* Preview card */}
              <div className="border border-[var(--outline-variant)] p-4" style={{ background: "var(--surface-container)" }}>
                <p className="m-0 mb-1" style={{ ...dataText, fontSize: "0.75rem", fontWeight: 700 }}>Daily Games Log</p>
                <p className="m-0 mb-2" style={{ ...dataText, fontSize: "0.6rem", color: "var(--muted)" }}>{date}</p>
                {sharedScore !== null ? <p className="my-1" style={{ ...dataText, fontSize: "0.8rem", color: "var(--primary)" }}>Score <strong>{sharedScore}</strong></p> : null}
                {composerBody.trim() ? <p className="text-sm my-2">{composerBody.trim().slice(0, 180)}</p> : null}
                <div className="my-2">
                  {RESULT_IMAGES.map((src) => (
                    <Image key={`preview-${src}`} src={src} alt="Shared puzzle preview" width={480} height={270} unoptimized className="max-w-full" />
                  ))}
                </div>
                {sharePreviewAnswers.length > 0 ? (
                  <dl className="my-2">
                    {sharePreviewAnswers.map((item) => (
                      <div key={`${item.label}-${item.value}`}>
                        <dt style={{ ...dataText, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>{item.label}</dt>
                        <dd className="mb-1 text-sm">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {sharedAnnotations.length > 0 ? (
                  <ul className="list-none p-0 my-2">
                    {sharedAnnotations.map((item) => (
                      <li key={item} style={{ ...dataText, fontSize: "0.65rem", color: "var(--muted)" }}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {sharePreviewMeta.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sharePreviewMeta.map((item) => (
                      <span key={`${item.label}-${item.value}`} className="border border-[var(--outline-variant)] px-2 py-0.5" style={{ ...dataText, fontSize: "0.6rem", color: "var(--muted)" }}>
                        <strong>{item.label}:</strong> {item.value}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {showShareDetails ? (
                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1" style={{ ...dataText, fontSize: "0.65rem", color: "var(--muted)" }}>
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
                    <label className="flex flex-col gap-1" key={`answer-${idx}`} style={{ ...dataText, fontSize: "0.65rem", color: "var(--muted)" }}>
                      <span>Game {idx + 1} analysis</span>
                      <input
                        className="input"
                        value={answer}
                        onChange={(event) =>
                          setSharedAnswers((current) => current.map((value, aIdx) => (aIdx === idx ? event.target.value : value)))
                        }
                        placeholder={`Enter analysis for component ${idx + 1}`}
                        disabled={interactionLocked}
                      />
                    </label>
                  ))}
                  <div style={{ ...dataText, fontSize: "0.65rem", color: "var(--muted)" }}>
                    <span>Imported annotations</span>
                    {sharedAnnotations.length > 0 ? (
                      <ul className="list-none p-0 mt-1">
                        {sharedAnnotations.map((entry) => <li key={entry} className="text-xs">{entry}</li>)}
                      </ul>
                    ) : (
                      <p className="muted text-xs mt-1">No saved annotations for this date.</p>
                    )}
                  </div>
                  <label className="flex flex-col gap-1" style={{ ...dataText, fontSize: "0.65rem", color: "var(--muted)" }}>
                    <span>Hint summary</span>
                    <input
                      className="input"
                      value={sharedHintSummary}
                      onChange={(event) => setSharedHintSummary(event.target.value)}
                      placeholder="phase fold • period 2.00d • reward x0.80"
                      disabled={interactionLocked}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          ) : null}
        </form>
      </div>
    );
  }

  const liveThread = threads.find((t) => t.kind === "daily_live") ?? null;
  const ongoingThreads = threads.filter((t) => t.kind === "ongoing");
  const returnTo = encodeURIComponent(`/discuss?date=${date}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 p-6 max-w-[1440px] mx-auto items-start">

      {/* ── Main column ── */}
      <div className="flex flex-col gap-4">

        {/* Page header */}
        <header className="flex justify-between items-end pb-5 border-b border-[var(--outline-variant)] flex-wrap gap-3">
          <div>
            <h1 className="m-0 mb-1" style={{ ...dataText, fontSize: "clamp(2rem,5vw,2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--on-surface)" }}>
              CONSENSUS
            </h1>
            <p className="m-0 muted">Collaborative research and findings.</p>
          </div>
          <span className="border border-[var(--outline-variant)] px-2 py-1" style={{ ...label, color: "var(--muted)", background: "var(--surface-container-low)" }}>
            SYS.DATE: {date}
          </span>
        </header>

        {/* Alerts */}
        {dayAccess && !dayAccess.allowed ? (
          <div className="flex justify-between items-center flex-wrap gap-3 border border-[var(--outline-variant)] p-4 text-sm" style={{ background: "var(--surface-container-low)" }}>
            <p className="m-0">
              {dayAccess.signInRequired
                ? "Sign in and unlock this archive day to open the discussion."
                : "Complete or unlock this day to open the discussion."}
            </p>
            <div className="flex gap-2">
              <Link
                className="button button-primary"
                href={dayAccess.signInRequired ? `/auth/sign-in?next=${returnTo}` : `/games/today?date=${date}&returnTo=${returnTo}`}
              >
                {dayAccess.signInRequired ? "Sign in" : "Play Today's Games"}
              </Link>
              <Link className="button" href="/calendar">Calendar</Link>
            </div>
          </div>
        ) : null}

        {dayAccess?.allowed && selectedThread?.is_hidden ? (
          <div className="flex justify-between items-center flex-wrap gap-3 border border-[var(--outline-variant)] p-4 text-sm" style={{ background: "var(--surface-container-low)" }}>
            <p className="m-0">Finish a game today before opening this puzzle discussion.</p>
            <div className="flex gap-2">
              <Link className="button button-primary" href={`/games/today?date=${date}&returnTo=${returnTo}`}>
                Play Today's Games
              </Link>
              <Link className="button" href="/calendar">Calendar</Link>
            </div>
          </div>
        ) : null}

        {!isAuthenticated ? (
          <div className="flex justify-between items-center flex-wrap gap-3 border border-[var(--outline-variant)] p-4 text-sm" style={{ background: "var(--surface-container-low)" }}>
            <p className="m-0">Sign in to comment, reply, upvote, and react.</p>
            <Link className="button button-primary" href="/auth/sign-in">Sign in</Link>
          </div>
        ) : null}

        {feedback ? (
          <div className="border border-[var(--outline-variant)] p-4 text-sm" style={{ background: "var(--surface-container-low)" }}>
            <p className="m-0 muted">{feedback}</p>
          </div>
        ) : null}

        {loadingThreads ? <p className="muted text-sm">Loading threads...</p> : null}

        {/* ── Daily Live thread ── */}
        {liveThread ? (
          <section
            className="forum-bracket border border-[var(--outline-variant)] p-7"
            style={{ background: "var(--surface-container-lowest)" }}
            onClick={() => selectedThreadId !== liveThread.id && setSelectedThreadId(liveThread.id)}
          >
            <div className="flex justify-between items-start pb-4 mb-4 border-b border-[var(--outline-variant)] gap-4">
              <div>
                <span
                  className="inline-block px-2 py-0.5 mb-2"
                  style={{ ...label, background: "var(--primary)", color: "white" }}
                >
                  Daily Live
                </span>
                <h2 className="m-0" style={{ ...dataText, fontSize: "1.35rem", fontWeight: 600, color: "var(--on-surface)" }}>
                  {liveThread.title}
                </h2>
              </div>
              <span style={{ ...label, color: "var(--muted)" }}>{liveThread.is_locked ? "Locked" : "Open"}</span>
            </div>

            {liveThread.is_locked ? (
              <div className="flex justify-between items-center flex-wrap gap-3 border border-[var(--outline-variant)] p-3 mb-4 text-sm" style={{ background: "var(--surface-container-low)" }}>
                <p className="m-0">This thread is locked. Continue in the unlocked thread.</p>
                <div className="flex gap-2">
                  <Link className="button" href={`/games/today?date=${date}&returnTo=${returnTo}`}>Open Puzzle</Link>
                  {liveThread.continue_thread_id ? (
                    <button className="button button-primary" type="button" onClick={() => setSelectedThreadId(liveThread.continue_thread_id)}>
                      Continue Discussion
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {selectedThreadId === liveThread.id && liveThread.is_hidden ? (
              <div className="border border-[var(--outline-variant)] p-4 text-sm" style={{ background: "var(--surface-container-low)" }}>
                <p className="m-0">Discussion opens after a game is completed for this day.</p>
              </div>
            ) : selectedThreadId === liveThread.id ? (
              <>
                {loadingPosts ? <p className="muted text-sm">Loading posts...</p> : null}
                {!loadingPosts && tree.length === 0 ? <p className="muted text-sm">No posts yet. Start the discussion.</p> : null}
                {!loadingPosts ? tree.map((node) => renderNode(node)) : null}
                {renderComposer()}
              </>
            ) : (
              <button
                className="cursor-pointer border-none bg-none p-0 mt-1"
                style={{ ...label, color: "var(--primary)", background: "none" }}
                type="button"
                onClick={() => setSelectedThreadId(liveThread.id)}
              >
                Access Logs →
              </button>
            )}
          </section>
        ) : null}

        {/* ── Ongoing threads ── */}
        {ongoingThreads.map((thread) => {
          const isSelected = selectedThreadId === thread.id;
          return (
            <section
              key={thread.id}
              className={`border p-7 transition-colors${isSelected ? " border-[var(--primary)]" : " border-[var(--outline-variant)]"}`}
              style={{ background: "var(--surface-container-lowest)" }}
            >
              <div className="flex justify-between items-start pb-4 mb-4 border-b border-[var(--outline-variant)] gap-4">
                <div>
                  <span
                    className="inline-block border px-2 py-0.5 mb-2"
                    style={{ ...label, borderColor: "var(--outline)", color: "var(--muted)" }}
                  >
                    Ongoing
                  </span>
                  <h2 className="m-0" style={{ ...dataText, fontSize: "1.1rem", fontWeight: 600, color: "var(--on-surface)" }}>
                    {thread.title}
                  </h2>
                </div>
                <span style={{ ...label, color: "var(--muted)" }}>
                  {isSelected && posts.length > 0 ? `${posts.length} replies` : thread.is_locked ? "Locked" : "Open"}
                </span>
              </div>

              {isSelected && thread.is_hidden ? (
                <div className="border border-[var(--outline-variant)] p-4 text-sm" style={{ background: "var(--surface-container-low)" }}>
                  <p className="m-0">Discussion opens after a game is completed for this day.</p>
                </div>
              ) : isSelected ? (
                <>
                  {loadingPosts ? <p className="muted text-sm">Loading posts...</p> : null}
                  {!loadingPosts && tree.length === 0 ? <p className="muted text-sm">No posts yet.</p> : null}
                  {!loadingPosts ? tree.map((node) => renderNode(node)) : null}
                  {renderComposer()}
                </>
              ) : (
                <button
                  className="cursor-pointer border-none bg-none p-0"
                  style={{ ...label, color: "var(--primary)", background: "none" }}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                >
                  Access Logs →
                </button>
              )}
            </section>
          );
        })}
      </div>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col gap-4">

        {/* ARCHIVES */}
        <div className="border border-[var(--outline-variant)]" style={{ background: "var(--surface-container-lowest)" }}>
          <div
            className="px-4 py-2 border-b border-[var(--outline-variant)]"
            style={{ ...label, background: "var(--surface-container-low)", color: "var(--on-surface)" }}
          >
            Archives
          </div>
          {quickDates.map((dateKey) => (
            <button
              key={dateKey}
              type="button"
              data-cy="forum-date-chip"
              className={`flex justify-between items-center w-full px-4 py-2.5 border-b border-[var(--outline-variant)] cursor-pointer transition-colors text-left${dateKey === date ? " text-[var(--primary)]" : ""}`}
              style={{
                ...label,
                letterSpacing: "0.06em",
                background: dateKey === date ? "var(--surface-container-low)" : "none",
                color: dateKey === date ? "var(--primary)" : "var(--on-surface)",
                border: "none",
                borderBottom: "1px solid var(--outline-variant)",
              }}
              onClick={() => setDate(dateKey)}
            >
              <span>SYS.DATE: {dateKey}</span>
              <span>›</span>
            </button>
          ))}
          <div className="p-3">
            <input
              data-cy="forum-date-input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full border border-[var(--outline-variant)] px-2 py-1.5"
              style={{ ...dataText, fontSize: "0.7rem", background: "var(--surface-container-low)", color: "var(--on-surface)" }}
            />
          </div>
        </div>

        {/* NODE STATUS */}
        <div className="border border-[var(--outline-variant)] p-4" style={{ background: "var(--surface-container-lowest)" }}>
          <p className="mb-3" style={{ ...label, color: "var(--muted)" }}>Node Status</p>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 flex-shrink-0"
              style={{ background: isAuthenticated ? "#10b981" : "var(--outline-variant)", border: isAuthenticated ? "1px solid #047857" : "none" }}
            />
            <span style={{ ...dataText, fontSize: "0.65rem", color: "var(--on-surface)" }}>
              Comms Relay: {isAuthenticated ? "Active" : "Standby"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 flex-shrink-0"
              style={{
                background: !dayAccess || dayAccess.allowed ? "#10b981" : "#f59e0b",
                border: !dayAccess || dayAccess.allowed ? "1px solid #047857" : "1px solid #b45309",
              }}
            />
            <span style={{ ...dataText, fontSize: "0.65rem", color: "var(--on-surface)" }}>
              Data Stream: {!dayAccess || dayAccess.allowed ? "Nominal" : "Restricted"}
            </span>
          </div>
        </div>

        <Link
          className="button button-full"
          href={`/games/today?date=${date}&returnTo=${returnTo}`}
        >
          Play Today's Games
        </Link>
      </aside>
    </div>
  );
}
