"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSailyPocketBaseUrl } from "@/lib/pocketbase/config";

const LAST_SEEN_KEY = "ss_discoveries_last_seen";
const POLL_INTERVAL_MS = 90_000;

type LatestDiscovery = {
  headline: string;
  occurred_at: string;
};

/**
 * Nav-level headline surfacing the most recent cross-ecosystem discovery
 * (see systems/cross-game-discoveries-feed.md). Unread state is tracked
 * client-side via localStorage — same shape as Landnam's pendingRepick /
 * last-seen-confirmed pattern, just persisted per-browser instead of on a
 * player record since Daily Transit visitors aren't necessarily
 * authenticated Landnam players.
 */
export function DiscoveryHeadline() {
  const [latest, setLatest] = useState<LatestDiscovery | null>(null);
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const baseUrl = getBrowserSailyPocketBaseUrl().replace(/\/$/, "");
        const response = await fetch(
          `${baseUrl}/api/collections/discoveries/records?sort=-occurred_at&perPage=1`,
          { cache: "no-store" },
        );
        if (!response.ok || cancelled) {
          return;
        }

        const data = (await response.json()) as { items?: LatestDiscovery[] };
        const item = data.items?.[0];
        if (!item || cancelled) {
          return;
        }

        setLatest(item);
        const lastSeen = window.localStorage.getItem(LAST_SEEN_KEY);
        setUnread(!lastSeen || new Date(item.occurred_at) > new Date(lastSeen));
      } catch {
        // Network hiccup — just skip showing a headline this tick.
      }
    }

    poll();
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (!latest) {
    return null;
  }

  function markSeen() {
    if (latest) {
      window.localStorage.setItem(LAST_SEEN_KEY, latest.occurred_at);
    }
    setUnread(false);
  }

  return (
    <Link href="/discoveries" className="discovery-headline" onClick={markSeen} data-cy="discovery-headline">
      {unread && <span className="discovery-headline-dot" aria-hidden="true" />}
      <span className="discovery-headline-label">Discoveries</span>
      <span className="discovery-headline-text">{latest.headline}</span>
    </Link>
  );
}
