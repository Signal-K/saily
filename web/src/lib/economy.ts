import { createClient } from "@/lib/pocketbase/client";
import { getBrowserSailyPocketBaseUrl } from "@/lib/pocketbase/config";

// Calls the Saily backend's custom chips routes (backend/internal/extensions/data_chips.go)
// directly, rather than routing through the generic PocketBase query-builder
// abstraction (which has no server-side function-call mechanism to speak of —
// these were never real PocketBase collections/RPCs, just plain REST
// endpoints the client stub used to special-case).
async function sailyChipsFetch(path: string, init?: RequestInit) {
  const pocketbase = createClient();
  const {
    data: { session },
  } = await pocketbase.auth.getSession();

  const response = await fetch(`${getBrowserSailyPocketBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Saily backend request failed");
  }
  return payload;
}

/**
 * Unlocks a historical puzzle for play (no score) using a Data Chip.
 */
export async function unlockArchive(date: string): Promise<boolean> {
  await sailyChipsFetch("/api/saily/chips/unlock-archive", {
    method: "POST",
    body: JSON.stringify({ target_date: date }),
  });
  return true;
}

/**
 * Fetches the current Data Chip balance for the signed-in user.
 */
export async function getDataChipsBalance(): Promise<number> {
  try {
    const payload = await sailyChipsFetch("/api/saily/chips/balance");
    return payload?.balance ?? 0;
  } catch {
    return 0;
  }
}
