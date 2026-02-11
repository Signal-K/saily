import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { resolveGameDate } from "@/lib/game";

type ReviewBody = {
  submissionId?: number;
  status?: "reviewed" | "accepted" | "rejected";
  adminDecision?: string;
};

function parseAdminEmails() {
  return (process.env.ADMIN_USER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

async function ensureAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }

  const admins = parseAdminEmails();
  const email = (user.email ?? "").toLowerCase();
  if (!email || !admins.includes(email)) {
    return { ok: false as const, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { ok: true as const, user };
}

function getServiceRoleClient() {
  const url = process.env.SUPABASE_URL_INTERNAL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: Request) {
  const auth = await ensureAdminAccess();
  if (!auth.ok) return auth.response;

  const adminClient = getServiceRoleClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for admin anomaly review endpoint." },
      { status: 500 },
    );
  }

  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));
  const status = requestUrl.searchParams.get("status");

  let query = adminClient
    .from("anomaly_submissions")
    .select("id,user_id,game_date,anomaly_id,tic_id,status,admin_decision,note,annotations,hint_flags,reward_multiplier,period_days,reviewed_by,reviewed_at,created_at,updated_at")
    .eq("game_date", date)
    .order("created_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, date, submissions: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await ensureAdminAccess();
  if (!auth.ok) return auth.response;

  const adminClient = getServiceRoleClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for admin anomaly review endpoint." },
      { status: 500 },
    );
  }

  const payload = (await request.json().catch(() => ({}))) as ReviewBody;
  const submissionId = Number(payload.submissionId);
  const allowed = new Set(["reviewed", "accepted", "rejected"]);
  const status = payload.status;
  const adminDecision = (payload.adminDecision ?? "").trim().slice(0, 2000);

  if (!Number.isFinite(submissionId) || submissionId <= 0) {
    return NextResponse.json({ error: "Invalid submissionId" }, { status: 400 });
  }

  if (!status || !allowed.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("anomaly_submissions")
    .update({
      status,
      admin_decision: adminDecision || null,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select("id,status,admin_decision,reviewed_by,reviewed_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, submission: data });
}
