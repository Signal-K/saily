import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AsteroidAnnotation = {
  x: number;
  y: number;
  label: string;
  note: string;
};

type SubmitBody = {
  anomalyKey?: string;
  label?: string;
  imagePath?: string;
  note?: string;
  annotations?: AsteroidAnnotation[];
};

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeAnnotations(value: unknown): AsteroidAnnotation[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const entry = row as Partial<AsteroidAnnotation>;
      const x = Number(entry.x);
      const y = Number(entry.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return {
        x: Number(Math.max(0, Math.min(1, x)).toFixed(4)),
        y: Number(Math.max(0, Math.min(1, y)).toFixed(4)),
        label: normalizeText(entry.label, 80) || "Possible anomaly",
        note: normalizeText(entry.note, 400),
      };
    })
    .filter((row): row is AsteroidAnnotation => row !== null);
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
  const anomalyKey = normalizeText(requestUrl.searchParams.get("anomalyKey"), 80);
  if (!anomalyKey) {
    return NextResponse.json({ error: "Invalid anomalyKey" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("asteroid_annotation_drafts")
    .select("id,anomaly_key,label,image_path,note,annotations,updated_at")
    .eq("user_id", user.id)
    .eq("anomaly_key", anomalyKey)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    draft: data ?? null,
  });
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
  const anomalyKey = normalizeText(payload.anomalyKey, 80);
  const label = normalizeText(payload.label, 120);
  const imagePath = normalizeText(payload.imagePath, 240);
  const note = normalizeText(payload.note, 2000);
  const annotations = normalizeAnnotations(payload.annotations);

  if (!anomalyKey) {
    return NextResponse.json({ error: "Invalid anomalyKey" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("asteroid_annotation_drafts")
    .upsert(
      {
        user_id: user.id,
        anomaly_key: anomalyKey,
        label,
        image_path: imagePath,
        note,
        annotations,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,anomaly_key" },
    )
    .select("id,anomaly_key,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    draft: data,
    savedCount: annotations.length,
  });
}
