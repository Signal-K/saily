import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/pocketbase/server";

const REVIEW_STATUSES = ["pending_admin_review", "reviewed", "accepted", "rejected"] as const;
type ReviewStatus = (typeof REVIEW_STATUSES)[number];

function requireAdmin(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SYNC_SECRET?.trim();
  const providedSecret = request.headers.get("x-admin-secret")?.trim();
  return Boolean(adminSecret) && providedSecret === adminSecret;
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const statusParam = requestUrl.searchParams.get("status");
  const status: ReviewStatus = REVIEW_STATUSES.includes(statusParam as ReviewStatus)
    ? (statusParam as ReviewStatus)
    : "pending_admin_review";

  const pocketbase = await createClient();
  const { data, error } = await pocketbase
    .from("anomaly_submissions")
    .select("id,user_id,game_date,anomaly_id,tic_id,note,annotations,status,admin_decision,reviewed_by,reviewed_at,updated_at")
    .eq("status", status)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, submissions: data ?? [] });
}

type PatchBody = {
  id?: string;
  status?: string;
  adminDecision?: string;
  reviewedBy?: string;
};

export async function PATCH(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as PatchBody;
  const id = payload.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!REVIEW_STATUSES.includes(payload.status as ReviewStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const pocketbase = await createClient();
  const { data, error } = await pocketbase
    .from("anomaly_submissions")
    .update({
      status: payload.status,
      admin_decision: payload.adminDecision?.trim().slice(0, 2000) ?? null,
      reviewed_by: payload.reviewedBy?.trim() ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id,status,admin_decision,reviewed_by,reviewed_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, submission: data });
}
