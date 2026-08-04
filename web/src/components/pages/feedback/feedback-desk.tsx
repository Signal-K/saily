"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import posthog from "posthog-js";
import { ASSET_REVIEW_ITEMS, ASSET_REVIEW_KINDS, AssetReviewItem } from "./asset-review-data";
import { ASSET_REVIEW_VOTE_KEY, SUGGESTION_EVENT_KEY } from "@/lib/posthog/survey-ids";
import { createClient as createPocketBaseClient } from "@/lib/pocketbase/client";
import s from "./feedback-desk.module.css";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type AssetStats = Record<string, { count: number; average: number }>;

// ─── Compact gallery tile ──────────────────────────────────────────────────

function AssetTile({
  item,
  stats,
  rated,
  onRate,
}: {
  item: AssetReviewItem;
  stats: AssetStats;
  rated: number | null;
  onRate: (slug: string, rating: number, identified: boolean) => void;
}) {
  const [pending, setPending] = useState<boolean | null>(null);
  const live = stats[item.slug];

  function submit(identified: boolean) {
    if (rated !== null || pending !== null) return;
    setPending(identified);
    onRate(item.slug, identified ? 2 : 1, identified);
  }

  const didVoteYes = pending !== null ? pending : rated === 2;
  const hasVoted = rated !== null || pending !== null;

  return (
    <div className={s.tile}>
      {/* ── Image ── */}
      <div className={s.tileArt}>
        <Image src={item.file} alt={item.title} width={200} height={200} unoptimized />
        <span className={s.tileTier}>{item.tier}</span>
      </div>

      {/* ── Footer strip ── */}
      <div className={s.tileFooter}>
        <p className={s.tileName}>{item.title}</p>
        <p className={s.tileMeta}>
          {item.price} · {item.gate}
        </p>

        {hasVoted ? (
          <>
            <div className={`${s.votedBadge}${didVoteYes ? "" : ` ${s.votedBadgeNo}`}`}>
              {didVoteYes ? "✓ Clear" : "✗ Unclear"}
            </div>
            {live && live.count > 0 && (
              <p className={s.voteLive}>
                {Math.round(((live.average - 1) / 1) * 100)}% clear · {live.count.toLocaleString()} votes
              </p>
            )}
          </>
        ) : (
          <div className={s.voteRow}>
            <button
              type="button"
              className={`${s.voteBtn} ${s.voteBtnYes}`}
              onClick={() => submit(true)}
              title="Yes, I could tell at a glance"
            >
              ✓ Clear
            </button>
            <button
              type="button"
              className={`${s.voteBtn} ${s.voteBtnNo}`}
              onClick={() => submit(false)}
              title="Not really, hard to read"
            >
              ✗ No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function FeedbackDesk() {
  const [assetStats, setAssetStats] = useState<AssetStats>({});
  const [ratedSlugs, setRatedSlugs] = useState<Record<string, number>>({});

  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionRelatesTo, setSuggestionRelatesTo] = useState("");
  const [suggestionState, setSuggestionState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [suggestionTotal, setSuggestionTotal] = useState<number | null>(null);

  // Signed-in visitors are already identified to PostHog by their shared
  // Star Sailors user id (see components/posthog-runtime.tsx), which is what
  // actually links their feedback across Landnam/Atlas/TDT — different
  // domains can't share cookies, so that identify() call is the real sync
  // mechanism, not a cookie. For anonymous visitors we offer an optional
  // email field below and identify() by that instead.
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [emailLinked, setEmailLinked] = useState(false);

  useEffect(() => {
    const pocketbase = createPocketBaseClient();
    void pocketbase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setSignedInEmail(data.user.email);
    });
  }, []);

  function linkEmailIfNeeded(): string | null {
    if (signedInEmail) return signedInEmail;
    const trimmed = contactEmail.trim();
    if (!isValidEmail(trimmed)) return null;
    if (typeof window !== "undefined" && !emailLinked) {
      posthog.identify(trimmed, { email: trimmed });
      setEmailLinked(true);
    }
    return trimmed;
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/feedback/asset-review/results")
      .then((res) => res.json())
      .then((data: { assets?: AssetStats }) => {
        if (!cancelled && data.assets) setAssetStats(data.assets);
      })
      .catch(() => {
        // Leave empty — real zero, not a fabricated fallback.
      });
    fetch("/api/feedback/suggestions/results")
      .then((res) => res.json())
      .then((data: { total?: number }) => {
        if (!cancelled) setSuggestionTotal(typeof data.total === "number" ? data.total : 0);
      })
      .catch(() => {
        if (!cancelled) setSuggestionTotal(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleRate(slug: string, rating: number, identified: boolean) {
    setRatedSlugs((prev) => ({ ...prev, [slug]: rating }));
    setAssetStats((prev) => {
      const existing = prev[slug] ?? { count: 0, average: 0 };
      const totalScore = existing.average * existing.count + rating;
      const count = existing.count + 1;
      return { ...prev, [slug]: { count, average: totalScore / count } };
    });

    if (typeof window !== "undefined") {
      const email = linkEmailIfNeeded();
      posthog.capture("survey sent", {
        $survey_id: ASSET_REVIEW_VOTE_KEY,
        $survey_response: `${slug}:${rating}`,
        email,
      });
      posthog.capture("asset_review_submitted", {
        asset_slug: slug,
        identified_easily: identified,
        survey_id: ASSET_REVIEW_VOTE_KEY,
        email,
      });
    }
  }

  async function handleSuggestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!suggestionText.trim() || suggestionState === "sending") return;
    setSuggestionState("sending");
    try {
      if (typeof window !== "undefined") {
        const email = linkEmailIfNeeded();
        posthog.capture("tdt_suggestion_submitted", {
          $suggestion_key: SUGGESTION_EVENT_KEY,
          suggestion: suggestionText.trim(),
          relates_to: suggestionRelatesTo.trim() || null,
          email,
        });
      }
      setSuggestionState("sent");
      setSuggestionTotal((prev) => (prev === null ? 1 : prev + 1));
    } catch {
      setSuggestionState("error");
    }
  }

  return (
    <>
      {/* ── Hero ── */}
      <div className={s.hero}>
        <p className="eyebrow">Suggestions Desk</p>
        <h1>Help shape what we build next</h1>
        <p className="muted">
          Real in-review art from the KES-92 pass: 4 room kinds, 5 tiers each, 20 renders. Vote
          on whether each reads clearly at a glance, then use the box below to propose ideas or
          flag other assets worth reviewing.
        </p>

        {signedInEmail ? (
          <p className={s.identity}>
            Signed in as {signedInEmail} — your feedback links to your activity across Star Sailors
            automatically.
          </p>
        ) : (
          <div className={s.identityForm}>
            <label className={s.label}>
              Email (optional) — link this feedback to your other Star Sailors activity
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <p className={s.identityNote}>
              Different domains can&apos;t share cookies — signing in links your account; this
              email does the same job for anonymous visitors.
            </p>
          </div>
        )}
      </div>

      {/* ── Asset gallery ── */}
      <div id="assets">
        {ASSET_REVIEW_KINDS.map((kindInfo) => (
          <div className={s.kindBlock} key={kindInfo.kind}>
            <div className={s.kindHead}>
              <h3>{kindInfo.kind}</h3>
              <span className={s.kindSub}>{kindInfo.kindSub}</span>
            </div>
            <p className={s.kindBlurb}>{kindInfo.blurb}</p>
            <div className={s.tileRow}>
              {ASSET_REVIEW_ITEMS.filter((item) => item.kind === kindInfo.kind).map((item) => (
                <AssetTile
                  key={item.slug}
                  item={item}
                  stats={assetStats}
                  rated={ratedSlugs[item.slug] ?? null}
                  onRate={handleRate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Suggestions form ── */}
      <div className={s.suggestions}>
        <p className="eyebrow">Propose an idea</p>
        <h2>Got a suggestion, feature idea, or another game we should feature?</h2>
        <p className={s.lede}>
          Mention a mechanic you&apos;d like to see, a citizen-science project we should cover, or
          another Star Sailors game/asset set worth reviewing here next.
        </p>

        {suggestionState !== "sent" ? (
          <form onSubmit={handleSuggestionSubmit} className={s.form}>
            <label className={s.label}>
              Your suggestion
              <textarea
                rows={4}
                value={suggestionText}
                onChange={(event) => setSuggestionText(event.target.value)}
                placeholder="e.g. Add a difficulty toggle for the crossword, or bring back Rubin Comet Catchers once the data path is real..."
                required
                disabled={suggestionState === "sending"}
              />
            </label>
            <label className={s.label}>
              Relates to (optional)
              <input
                type="text"
                value={suggestionRelatesTo}
                onChange={(event) => setSuggestionRelatesTo(event.target.value)}
                placeholder="e.g. Landnam, Mars Atlas, crossword mission"
                disabled={suggestionState === "sending"}
              />
            </label>
            <button className="button button-primary" type="submit" disabled={suggestionState === "sending"}>
              {suggestionState === "sending" ? "Sending..." : "Submit suggestion"}
            </button>
            {suggestionState === "error" && <p className="muted">Something went wrong. Please try again.</p>}
          </form>
        ) : (
          <p className="muted">Thanks — logged for the team. Feel free to send another.</p>
        )}

        {suggestionTotal !== null && (
          <p className={s.total}>
            {suggestionTotal.toLocaleString()} suggestion{suggestionTotal === 1 ? "" : "s"} submitted so far
          </p>
        )}
      </div>
    </>
  );
}
