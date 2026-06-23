import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function authenticateSuperuser() {
  const email = process.env.SAILY_PB_SUPERUSER_EMAIL?.trim();
  const password = process.env.SAILY_PB_SUPERUSER_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error("PocketBase superuser credentials are not configured (SAILY_PB_SUPERUSER_EMAIL / SAILY_PB_SUPERUSER_PASSWORD)");
  }

  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`PocketBase superuser auth failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

// PocketBase superuser tokens are valid for several days; cache with a safety margin.
const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function getSailyPocketBaseSuperuserToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const token = await authenticateSuperuser();
  cachedToken = { token, expiresAt: now + TOKEN_TTL_MS };
  return token;
}
