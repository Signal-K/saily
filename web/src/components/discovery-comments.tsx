"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/pocketbase/client";
import { getRobotAvatarDataUri } from "@/lib/avatar";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
};

type LoadState = "loading" | "ready" | "error";

// Flat comment list for a single `discoveries` row — no threaded replies, no
// real-time updates (spec non-goals). Reads are public; posting requires an
// authenticated shared-backend session, matching the rest of this app's
// delegated-auth pattern (see components/auth-status.tsx). Backed by the
// polymorphic comments collection extended in
// backend/migrations/e_comments_polymorphic.go and served through
// app/api/comments/route.ts's record_type="discovery" branch.
export function DiscoveryComments({ discoveryId }: { discoveryId: string }) {
  const pocketbase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [signedIn, setSignedIn] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadComments() {
    setState("loading");
    try {
      const response = await fetch(
        `/api/comments?recordType=discovery&recordId=${encodeURIComponent(discoveryId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json().catch(() => ({}))) as { comments?: Comment[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Failed to load comments");
      setComments(payload.comments ?? []);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    void loadComments();

    let mounted = true;
    pocketbase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(Boolean(data.session?.user));
    });
    const {
      data: { subscription },
    } = pocketbase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoveryId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordType: "discovery", recordId: discoveryId, body }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Failed to post comment");
      setDraft("");
      await loadComments();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--rule)" }}>
      <p className="data-label" style={{ marginBottom: "0.75rem" }}>Comments</p>

      {state === "loading" && <p className="muted">Loading comments…</p>}
      {state === "error" && <p className="muted">Couldn&apos;t load comments — try refreshing.</p>}
      {state === "ready" && comments.length === 0 && (
        <p className="muted">No comments yet — be the first to weigh in.</p>
      )}
      {state === "ready" && comments.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
          {comments.map((comment) => (
            <li key={comment.id} style={{ borderLeft: "2px solid var(--rule)", paddingLeft: "0.75rem" }}>
              <p style={{ margin: 0 }}>{comment.body}</p>
              <p
                className="muted"
                style={{ fontSize: "0.75rem", margin: "0.25rem 0 0", display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Image
                  src={getRobotAvatarDataUri(comment.user_id, 32)}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                  style={{ borderRadius: "50%" }}
                />
                {comment.profiles?.username ?? "Anonymous"} · {new Date(comment.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {signedIn ? (
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Add a comment…"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid var(--rule)",
              background: "var(--bg-surface)",
              color: "var(--ink)",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          {submitError && (
            <p className="muted" style={{ color: "var(--danger, #c0392b)" }}>{submitError}</p>
          )}
          <div>
            <button type="submit" className="button" disabled={submitting || draft.trim().length === 0}>
              {submitting ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="muted" style={{ marginTop: "1rem" }}>
          <Link href="/auth/sign-in">Sign in</Link> to leave a comment.
        </p>
      )}
    </div>
  );
}
