import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";

type Annotation = {
  xStart: number;
  xEnd: number;
  confidence: number;
  tag: string;
  note?: string;
  coordinateMode?: "time" | "phase";
  sourcePeriodDays?: number;
};

type SubmitBody = {
  date?: string;
  anomalyId?: number;
  ticId?: string;
  note?: string;
  annotations?: Annotation[];
  hintFlags?: {
    phaseFold?: boolean;
    bin?: boolean;
  };
  rewardMultiplier?: number;
  periodDays?: number;
};

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeAnnotations(value: unknown): Annotation[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const annotation = row as Partial<Annotation>;
      if (!isFiniteNumber(annotation.xStart) || !isFiniteNumber(annotation.xEnd) || !isFiniteNumber(annotation.confidence)) {
        return null;
      }
      if (typeof annotation.tag !== "string" || annotation.tag.trim().length === 0) {
        return null;
      }
      const rawStart = Number(annotation.xStart);
      const rawEnd = Number(annotation.xEnd);
      const rawConfidence = Number(annotation.confidence);
      const xStart = Math.max(0, Math.min(1, rawStart));
      const xEnd = Math.max(0, Math.min(1, rawEnd));
      const confidence = Math.max(0, Math.min(100, Math.round(rawConfidence)));
      const coordinateMode: Annotation["coordinateMode"] = annotation.coordinateMode === "phase" ? "phase" : "time";
      const sourcePeriodRaw = Number(annotation.sourcePeriodDays);
      const sourcePeriodDays = coordinateMode === "phase" && Number.isFinite(sourcePeriodRaw) ? Math.max(0.2, Math.min(30, Number(sourcePeriodRaw.toFixed(4)))) : undefined;

      const base: Annotation = {
        xStart: Number(Math.min(xStart, xEnd).toFixed(5)),
        xEnd: Number(Math.max(xStart, xEnd).toFixed(5)),
        confidence,
        tag: annotation.tag.trim().slice(0, 60),
        coordinateMode,
        sourcePeriodDays,
      };
      if (typeof annotation.note === "string") {
        return { ...base, note: annotation.note.trim().slice(0, 300) };
      }
      return base;
    })
    .filter((row): row is Annotation => row !== null);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as SubmitBody;
  const date = resolveGameDate(payload.date);
  const anomalyId = Number(payload.anomalyId);
  const ticId = (payload.ticId ?? "").replace(/^TIC\s*/i, "").trim();
  const note = (payload.note ?? "").trim().slice(0, 2000);
  const annotations = normalizeAnnotations(payload.annotations);
  const hintFlags = {
    phaseFold: Boolean(payload.hintFlags?.phaseFold),
    bin: Boolean(payload.hintFlags?.bin),
  };
  const rewardMultiplierRaw = Number(payload.rewardMultiplier);
  const rewardMultiplier = Number.isFinite(rewardMultiplierRaw)
    ? Math.max(0.5, Math.min(1, Number(rewardMultiplierRaw.toFixed(2))))
    : 1;
  const periodDaysRaw = Number(payload.periodDays);
  const periodDays = Number.isFinite(periodDaysRaw) ? Math.max(0.2, Math.min(30, Number(periodDaysRaw.toFixed(4)))) : null;

  if (!Number.isFinite(anomalyId) || anomalyId <= 0) {
    return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
  }

  if (!ticId) {
    return NextResponse.json({ error: "Invalid ticId" }, { status: 400 });
  }

  if (annotations.length === 0) {
    return NextResponse.json({ error: "At least one annotation is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("anomaly_submissions")
    .upsert(
      {
        user_id: user.id,
        game_date: date,
        anomaly_id: anomalyId,
        tic_id: ticId,
        note,
        annotations,
        hint_flags: hintFlags,
        reward_multiplier: rewardMultiplier,
        period_days: periodDays,
        status: "pending_admin_review",
        admin_decision: null,
        reviewed_by: null,
        reviewed_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,game_date,anomaly_id" },
    )
    .select("id,status,updated_at,reward_multiplier")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    submission: data,
    gameDate: date,
    reviewState: "pending_admin_review",
    rewardMultiplier: data?.reward_multiplier ?? rewardMultiplier,
  });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const date = resolveGameDate(requestUrl.searchParams.get("date"));
  const anomalyId = Number(requestUrl.searchParams.get("anomalyId"));

  if (!Number.isFinite(anomalyId) || anomalyId <= 0) {
    return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("anomaly_submissions")
    .select("id,annotations,note,status,updated_at,hint_flags,reward_multiplier,period_days")
    .eq("user_id", user.id)
    .eq("game_date", date)
    .eq("anomaly_id", anomalyId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, submission: data ?? null, gameDate: date });
}
