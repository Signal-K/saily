"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import posthog from "posthog-js";
import { ASSET_REVIEW_ITEMS, ASSET_REVIEW_KINDS, AssetReviewItem } from "./asset-review-data";
import { ASSET_REVIEW_VOTE_KEY, SUGGESTION_EVENT_KEY } from "@/lib/posthog/survey-ids";
import { createClient as createPocketBaseClient } from "@/lib/pocketbase/client";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type AssetStats = Record<string, { count: number; average: number }>;

function AssetCard({
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
  const [pending, setPending] = useState<{ identified: boolean } | null>(null);
  const live = stats[item.slug];

  function submit(rating: number, identified: boolean) {
    if (rated) return;
    setPending({ identified });
    onRate(item.slug, rating, identified);
  }

  return (
    <div className="fb-card">
      <div className="fb-card-art">
        <Image src={item.file} alt={item.title} width={240} height={240} unoptimized />
        <span className="fb-card-tier">{item.tier}</span>
      </div>
      <div className="fb-card-body">
        <h4>{item.title}</h4>
        <p className="fb-card-meta">
          {item.price} &middot; {item.gate}
        </p>

        {rated || pending ? (
          <div className="fb-card-result">
            <p className="fb-card-thanks">
              {(pending?.identified ?? rated === 2)
                ? "Thanks — logged as easy to identify."
                : "Thanks — logged as hard to identify."}
            </p>
            {live && (
              <p className="fb-card-live">
                {live.count.toLocaleString()} review{live.count === 1 ? "" : "s"} &middot;{" "}
                {Math.round((live.average - 1) * 100)}% found it easy to identify
              </p>
            )}
          </div>
        ) : (
          <div className="fb-card-actions">
            <p className="fb-card-prompt">Could you tell what this was at a glance?</p>
            <div className="fb-card-buttons">
              <button type="button" className="fb-pill" onClick={() => submit(2, true)}>
                Yes, obvious
              </button>
              <button type="button" className="fb-pill fb-pill-muted" onClick={() => submit(1, false)}>
                Not really
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

  // Returns the email to attach to this event, identifying the PostHog
  // person by it the first time (idempotent after that).
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
      <style jsx>{`
        .fb-hero {
          max-width: 68ch;
        }

        .fb-hero h1 {
          margin: 0.35rem 0 0.75rem;
        }

        .fb-identity {
          margin-top: 1rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.72rem;
          color: var(--primary, #0a82b3);
        }

        .fb-identity-form {
          margin-top: 1.1rem;
          max-width: 46ch;
        }

        .fb-identity-form .fb-label input {
          width: 100%;
        }

        .fb-identity-note {
          margin: 0.4rem 0 0;
          font-size: 0.72rem;
          color: var(--fg-muted, #5b636f);
          line-height: 1.5;
        }

        .fb-kind-block {
          margin-top: 2.5rem;
        }

        .fb-kind-head {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--rule, #d9dde3);
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }

        .fb-kind-head h3 {
          margin: 0;
          font-family: var(--font-display, "Turret Road", Georgia, serif);
        }

        .fb-kind-sub {
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--primary, #0a82b3);
        }

        .fb-kind-blurb {
          margin: 0 0 1rem;
          color: var(--fg-muted, #5b636f);
          max-width: 62ch;
          line-height: 1.6;
        }

        .fb-row {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(190px, 1fr);
          gap: 0.85rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        @media (min-width: 900px) {
          .fb-row {
            grid-auto-flow: unset;
            grid-template-columns: repeat(5, 1fr);
            overflow-x: visible;
          }
        }

        .fb-card {
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface, #fff);
          display: flex;
          flex-direction: column;
        }

        .fb-card-art {
          position: relative;
          aspect-ratio: 1;
          background: var(--bg-surface-warm, #f4efe6);
          border-bottom: 1px solid var(--rule, #d9dde3);
        }

        .fb-card-art :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .fb-card-tier {
          position: absolute;
          top: 6px;
          left: 6px;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          background: var(--ink, #16181c);
          color: #fff;
          padding: 2px 6px;
        }

        .fb-card-body {
          padding: 0.65rem 0.7rem 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .fb-card-body h4 {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.25;
        }

        .fb-card-meta {
          margin: 0;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.65rem;
          color: var(--fg-muted, #5b636f);
        }

        .fb-card-prompt {
          margin: 0.3rem 0 0.4rem;
          font-size: 0.75rem;
          color: var(--fg-muted, #5b636f);
        }

        .fb-card-buttons {
          display: flex;
          gap: 0.4rem;
        }

        .fb-pill {
          flex: 1;
          border: 1px solid var(--primary, #0a82b3);
          background: var(--primary, #0a82b3);
          color: #fff;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 0.45rem 0.3rem;
          cursor: pointer;
        }

        .fb-pill-muted {
          background: transparent;
          color: var(--fg-muted, #5b636f);
          border-color: var(--rule, #d9dde3);
        }

        .fb-card-thanks {
          margin: 0.3rem 0 0.15rem;
          font-size: 0.75rem;
        }

        .fb-card-live {
          margin: 0;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.62rem;
          color: var(--fg-muted, #5b636f);
        }

        .fb-suggestions {
          margin-top: 3rem;
          border-top: 3px double var(--ink, #16181c);
          padding-top: 2rem;
        }

        .fb-suggestions h2 {
          margin: 0.35rem 0 0.5rem;
        }

        .fb-suggestions p.fb-lede {
          max-width: 60ch;
          color: var(--fg-muted, #5b636f);
          line-height: 1.6;
        }

        .fb-form {
          margin-top: 1.25rem;
          display: grid;
          gap: 0.75rem;
          max-width: 60ch;
        }

        .fb-label {
          display: grid;
          gap: 0.3rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--fg-muted, #5b636f);
        }

        .fb-label textarea,
        .fb-label input {
          font-family: var(--font-system, system-ui, sans-serif);
          font-size: 0.95rem;
          padding: 0.6rem 0.7rem;
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface, #fff);
          color: var(--ink, #16181c);
        }

        .fb-total {
          margin-top: 1rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.68rem;
          color: var(--fg-muted, #5b636f);
        }
      `}</style>

      <div className="fb-hero">
        <p className="eyebrow">Suggestions Desk</p>
        <h1>Help shape what we build next</h1>
        <p className="muted">
          Below is a real, in-review art set from the Landnam side of Star Sailors — the KES-92
          &quot;Room Tier Art Review&quot;: 4 room kinds, 5 tiers each, 20 renders. Tell us whether
          each one reads clearly at a glance, then use the box further down to propose ideas,
          suggest features, or mention other games or assets you&apos;d like to see covered here.
        </p>

        {signedInEmail ? (
          <p className="fb-identity">
            Signed in as {signedInEmail} — your feedback here links to your activity across
            Star Sailors games automatically.
          </p>
        ) : (
          <div className="fb-identity-form">
            <label className="fb-label">
              Email (optional) — link this feedback to your activity in other Star Sailors games
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <p className="fb-identity-note">
              We can&apos;t read cookies from playlandnam.space or youratlas.cc directly — different
              sites can&apos;t see each other&apos;s cookies. Signing in links your account for you;
              otherwise this email does the same job.
            </p>
          </div>
        )}
      </div>

      <div id="assets">
        {ASSET_REVIEW_KINDS.map((kindInfo) => (
          <div className="fb-kind-block" key={kindInfo.kind}>
            <div className="fb-kind-head">
              <h3>{kindInfo.kind}</h3>
              <span className="fb-kind-sub">{kindInfo.kindSub}</span>
            </div>
            <p className="fb-kind-blurb">{kindInfo.blurb}</p>
            <div className="fb-row">
              {ASSET_REVIEW_ITEMS.filter((item) => item.kind === kindInfo.kind).map((item) => (
                <AssetCard
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

      <div className="fb-suggestions">
        <p className="eyebrow">Propose an idea</p>
        <h2>Got a suggestion, feature idea, or another game we should feature?</h2>
        <p className="fb-lede">
          Mention a mechanic you&apos;d like to see, a citizen-science project we should cover, or
          another Star Sailors game/asset set worth reviewing here next.
        </p>

        {suggestionState !== "sent" ? (
          <form onSubmit={handleSuggestionSubmit} className="fb-form">
            <label className="fb-label">
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
            <label className="fb-label">
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
          <p className="fb-total">
            {suggestionTotal.toLocaleString()} suggestion{suggestionTotal === 1 ? "" : "s"} submitted so far
          </p>
        )}
      </div>
    </>
  );
}
