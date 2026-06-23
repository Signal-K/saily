import { NextRequest, NextResponse } from "next/server";
import { getSailyPocketBaseSuperuserToken } from "@/lib/pocketbase/admin";
import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";
import { isResendConfigured, upsertResendContact } from "@/lib/resend";

type LandingInterestRecord = {
  id: string;
  email: string;
};

type PocketBaseListResponse = {
  items: LandingInterestRecord[];
  page: number;
  totalPages: number;
};

async function fetchLandingInterestPage(token: string, page: number) {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const params = new URLSearchParams({
    page: String(page),
    perPage: "200",
    filter: 'email != ""',
    fields: "id,email",
  });

  const response = await fetch(`${baseUrl}/api/collections/landing_interest/records?${params.toString()}`, {
    headers: { Authorization: token },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`PocketBase landing_interest list failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as PocketBaseListResponse;
}

// Backfills the Resend audience from existing landing_interest emails.
// Triggered manually by an operator - not part of the public request flow.
export async function POST(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SYNC_SECRET?.trim();
  const providedSecret = request.headers.get("x-admin-secret")?.trim();

  if (!adminSecret || !providedSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "resend_not_configured" }, { status: 501 });
  }

  let token: string;
  try {
    token = await getSailyPocketBaseSuperuserToken();
  } catch (error) {
    console.error("[newsletter-sync] PocketBase superuser auth failed", error);
    return NextResponse.json({ error: "pocketbase_auth_failed" }, { status: 502 });
  }

  let synced = 0;
  let failed = 0;
  let page = 1;
  let totalPages = 1;

  do {
    let result: PocketBaseListResponse;
    try {
      result = await fetchLandingInterestPage(token, page);
    } catch (error) {
      console.error("[newsletter-sync] PocketBase list failed", error);
      return NextResponse.json({ error: "pocketbase_list_failed", synced, failed }, { status: 502 });
    }

    totalPages = result.totalPages;

    for (const item of result.items) {
      try {
        await upsertResendContact(item.email);
        synced += 1;
      } catch (error) {
        failed += 1;
        console.error("[newsletter-sync] Resend upsert failed", { email: item.email, error });
      }
    }

    page += 1;
  } while (page <= totalPages);

  return NextResponse.json({ ok: true, synced, failed });
}
