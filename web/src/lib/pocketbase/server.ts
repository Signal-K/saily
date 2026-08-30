/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { POCKETBASE_COOKIE_NAME, getSharedPocketBaseUrl, type PocketBaseSession } from "./config";
import { RealPocketBaseQuery } from "./real-query";

type BadgeRow = { id: string; slug: string; kind: string; threshold: number };

// Awards any "comments"-kind badge the user has newly crossed the comment-count
// threshold for. Mirrors the wins/streak/games badge-award logic in
// app/api/game/complete/route.ts, but keyed on total comment count instead of
// game stats.
async function awardCommentBadges(userId: string): Promise<{ badgesAwarded: number }> {
  const { count } = await new RealPocketBaseQuery("comments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const [{ data: badges }, { data: earnedBadges }] = await Promise.all([
    new RealPocketBaseQuery("badges").select("id,slug,kind,threshold").eq("kind", "comments"),
    new RealPocketBaseQuery("user_badges").select("badge").eq("user_id", userId),
  ]);

  const earnedBadgeIds = new Set((earnedBadges ?? []).map((row: { badge: string }) => row.badge));
  const commentCount = count ?? 0;
  const toAward = ((badges ?? []) as BadgeRow[]).filter(
    (badge) => !earnedBadgeIds.has(badge.id) && commentCount >= badge.threshold,
  );

  if (toAward.length > 0) {
    await Promise.all(
      toAward.map((badge) =>
        new RealPocketBaseQuery("user_badges").insert({
          user_id: userId,
          badge: badge.id,
          awarded_at: new Date().toISOString(),
        }),
      ),
    );
  }

  return { badgesAwarded: toAward.length };
}

async function readSession(): Promise<PocketBaseSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(POCKETBASE_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as PocketBaseSession;
  } catch {
    return null;
  }
}

// Fly's PocketBase machines run with min_machines_running=0 — a sleeping
// instance takes ~10-15s to cold-start (see Landnam/web/lib/contexts/
// useAuthSync.ts, which documents the same figure). Without a client-side
// timeout, a sleeping shared backend left this fetch to hang on whatever
// the platform's own TCP connect timeout is, blocking every server-rendered
// page that awaits getUser() (home, calendar, discuss, search, profile).
// Bound each attempt and retry once so a cold start still resolves within
// the wake window instead of stalling navigation indefinitely — and so a
// real session isn't misreported as signed-out just because the first
// attempt landed mid-wake.
const AUTH_REFRESH_TIMEOUTS_MS = [4_000, 7_000];

async function fetchAuthRefresh(baseUrl: string, token: string, timeoutMs: number) {
  return fetch(`${baseUrl}/api/collections/users/auth-refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

// The cookie's `token` is client-supplied and its `user` field is derived
// from it client-side (see pocketbase/client.ts) — nothing here can trust
// either without checking. Mirrors backend/internal/sharedauth/verifier.go:
// exchange the token with the shared PocketBase's own auth-refresh endpoint,
// which validates the JWT signature/expiry and hands back the record that
// token actually belongs to. Only that verified record may be trusted as
// the acting user — never the cookie's embedded `user.id`/`email`, which a
// client can set to anything.
//
// Failure here (timeout, network error, or a non-OK response) only affects
// this one render — it never touches the session cookie, so a transient
// cold-start miss shows the page as signed-out for one request rather than
// actually signing the user out; the next navigation retries cleanly once
// the backend is warm.
async function verifySharedAuthToken(token: string): Promise<{ id: string; email: string } | null> {
  if (!token) return null;
  const baseUrl = getSharedPocketBaseUrl().replace(/\/$/, "");
  let lastError: unknown = null;
  for (const timeoutMs of AUTH_REFRESH_TIMEOUTS_MS) {
    try {
      const response = await fetchAuthRefresh(baseUrl, token, timeoutMs);
      if (!response.ok) return null;
      const payload = (await response.json()) as { record?: { id?: string; email?: string } };
      if (!payload?.record?.id) return null;
      return { id: payload.record.id, email: payload.record.email ?? "" };
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    console.warn("[pocketbase] shared auth-refresh unreachable after retry (backend cold start?)", lastError);
  }
  return null;
}

export async function createClient() {
  return {
    auth: {
      async getUser() {
        const session = await readSession();
        const verified = session?.token ? await verifySharedAuthToken(session.token) : null;
        return { data: { user: verified }, error: null };
      },
      async signOut() {
        const cookieStore = await cookies();
        cookieStore.delete(POCKETBASE_COOKIE_NAME);
        return { error: null };
      },
    },
    from(collection: string) {
      return new RealPocketBaseQuery(collection);
    },
    async rpc(fn: string, params?: any): Promise<any> {
      if (fn === "award_comment_badges") {
        const userId = params?.user_id;
        if (!userId) {
          return { data: null, error: { message: "award_comment_badges requires user_id" } };
        }
        try {
          const data = await awardCommentBadges(userId);
          return { data, error: null };
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : "award_comment_badges failed" } };
        }
      }
      console.warn(`[pocketbase] rpc("${fn}") called but is unknown — no-op.`);
      return Promise.resolve({ data: null, error: null });
    },
  };
}
