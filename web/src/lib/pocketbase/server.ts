/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { POCKETBASE_COOKIE_NAME, getSharedPocketBaseUrl, getSailyPocketBaseUrl, type PocketBaseSession } from "./config";
import { RealPocketBaseQuery } from "./real-query";

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

// Calls saily/backend's atomic POST /api/comments/award-badges (see
// internal/extensions/comment_badges.go), replacing the old client-side
// read-diff-write that had no unique-constraint backstop and awarded off a
// client-supplied user id. The backend re-derives the acting user from this
// same session token via sharedauth, so there's nothing left to spoof here.
export async function awardCommentBadges(): Promise<{ badgesAwarded: number }> {
  const session = await readSession();
  if (!session?.token) return { badgesAwarded: 0 };

  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/comments/award-badges`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`award-badges failed: ${response.status}`);
  }
  const payload = (await response.json()) as { badgesAwarded?: number };
  return { badgesAwarded: payload.badgesAwarded ?? 0 };
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
    async rpc(fn: string): Promise<any> {
      console.warn(`[pocketbase] rpc("${fn}") called but is unknown — no-op.`);
      return Promise.resolve({ data: null, error: null });
    },
  };
}
