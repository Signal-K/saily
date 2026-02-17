import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toDailyAnomaly } from "@/lib/anomaly";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const anomalyId = Number(url.searchParams.get("anomalyId"));
  const label = (url.searchParams.get("label") ?? "").trim();

  if (!Number.isFinite(anomalyId) || anomalyId <= 0) {
    return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("anomalies")
    .select('id,content,"ticId",anomalytype,"anomalySet","anomalyConfiguration"')
    .eq("id", anomalyId)
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const row = rows?.[0];
  if (!row) {
    return NextResponse.json({ error: "Anomaly not found" }, { status: 404 });
  }

  const anomaly = toDailyAnomaly(row);
  const width = 1280;
  const height = 560;
  const left = 66;
  const right = width - 24;
  const top = 30;
  const bottom = height - 56;
  const plotWidth = right - left;
  const plotHeight = bottom - top;
  const points = anomaly.lightcurve;

  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  points.forEach((point) => {
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });
  const pad = Math.max((maxY - minY) * 0.18, 0.002);
  const yMin = minY - pad;
  const yMax = maxY + pad;
  const ySpan = yMax - yMin || 1;

  const toX = (x: number) => left + clamp01(x) * plotWidth;
  const toY = (y: number) => top + (1 - (y - yMin) / ySpan) * plotHeight;
  const path = points
    .map((point, idx) => `${idx === 0 ? "M" : "L"} ${toX(point.x).toFixed(2)} ${toY(point.y).toFixed(2)}`)
    .join(" ");

  const displayLabel = escapeXml(label || anomaly.label || `TIC ${anomaly.ticId}`);
  const ticText = escapeXml(`TIC ${anomaly.ticId}`);
  const sourceText = escapeXml(anomaly.sourceName || "MAST / TESS");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Light curve for ${ticText}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#eef2ff"/>
    </linearGradient>
    <linearGradient id="curveArea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(15, 23, 42, 0.22)"/>
      <stop offset="100%" stop-color="rgba(15, 23, 42, 0.03)"/>
    </linearGradient>
  </defs>
  <rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" fill="url(#bg)" stroke="#cbd5e1" />
  <g stroke="rgba(100,116,139,0.18)" stroke-width="1">
    <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" />
    <line x1="${(left + plotWidth * 0.25).toFixed(2)}" y1="${top}" x2="${(left + plotWidth * 0.25).toFixed(2)}" y2="${bottom}" />
    <line x1="${(left + plotWidth * 0.5).toFixed(2)}" y1="${top}" x2="${(left + plotWidth * 0.5).toFixed(2)}" y2="${bottom}" />
    <line x1="${(left + plotWidth * 0.75).toFixed(2)}" y1="${top}" x2="${(left + plotWidth * 0.75).toFixed(2)}" y2="${bottom}" />
    <line x1="${right}" y1="${top}" x2="${right}" y2="${bottom}" />
  </g>
  <path d="${path} L ${right} ${bottom} L ${left} ${bottom} Z" fill="url(#curveArea)" />
  <path d="${path}" fill="none" stroke="#111827" stroke-width="2" />
  <text x="${left}" y="20" font-size="16" font-family="ui-sans-serif, system-ui" fill="#0f172a">${displayLabel}</text>
  <text x="${right}" y="20" text-anchor="end" font-size="12" font-family="ui-sans-serif, system-ui" fill="#475569">${ticText} • ${sourceText}</text>
  <text x="${left}" y="${height - 20}" font-size="12" font-family="ui-sans-serif, system-ui" fill="#64748b">Time (normalized 27-day segment)</text>
  <text x="16" y="${top + 2}" font-size="12" font-family="ui-sans-serif, system-ui" fill="#64748b">Flux</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, max-age=60",
    },
  });
}
