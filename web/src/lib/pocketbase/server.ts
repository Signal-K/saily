/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { POCKETBASE_COOKIE_NAME, type PocketBaseSession } from "./config";
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

export async function createClient() {
  return {
    auth: {
      async getUser() {
        const session = await readSession();
        return { data: { user: session?.user ?? null }, error: null };
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
