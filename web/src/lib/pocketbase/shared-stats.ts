import { getSharedPocketBaseUrl } from "@/lib/pocketbase/config";

export type EcosystemStats = {
  landnamBalance: number | null;
  landnamMissions: number | null;
  sailyDaysLogged: number | null;
};

type LeaderboardStatsRecord = {
  landnam_balance?: number;
  landnam_missions?: number;
  saily_days_logged?: number;
};

// Reads the shared backend's cross-game leaderboard_stats row for a user.
// This collection lives on the central shared PocketBase instance (:8090)
// per the shared-vs-per-game placement rule (see
// ~/Navigation/workspace/systems/pocketbase-architecture.md) and has a
// public ViewRule/ListRule, so no auth token is needed to read it.
export async function getEcosystemStatsForUser(sharedUserId: string): Promise<EcosystemStats | null> {
  const baseUrl = getSharedPocketBaseUrl().replace(/\/$/, "");
  const params = new URLSearchParams({
    filter: `user = "${sharedUserId}"`,
    fields: "landnam_balance,landnam_missions,saily_days_logged",
  });

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/collections/leaderboard_stats/records?${params.toString()}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.warn("[shared-stats] failed to reach shared PocketBase", error);
    return null;
  }

  if (!response.ok) return null;

  const payload = (await response.json().catch(() => null)) as { items?: LeaderboardStatsRecord[] } | null;
  const record = payload?.items?.[0];
  if (!record) return null;

  return {
    landnamBalance: record.landnam_balance ?? null,
    landnamMissions: record.landnam_missions ?? null,
    sailyDaysLogged: record.saily_days_logged ?? null,
  };
}
