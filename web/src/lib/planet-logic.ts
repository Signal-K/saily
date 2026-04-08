export type LightcurvePoint = {
  x: number;
  y: number;
};

export type DisplayPoint = {
  x: number;
  y: number;
};

export type Annotation = {
  id: string;
  xStart: number;
  xEnd: number;
  confidence: number;
  tag: string;
  note?: string;
  coordinateMode: "time" | "phase";
  sourcePeriodDays?: number;
};

export const TOTAL_DAYS = 27;

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function normalizePeriodDays(value: number) {
  if (!Number.isFinite(value)) return 2;
  return Math.max(0.2, Math.min(30, value));
}

export function toDisplayPoints(base: LightcurvePoint[], opts: { phaseFold: boolean; bin: boolean; periodDays: number }) {
  const period = normalizePeriodDays(opts.periodDays);
  const withTime = base.map((point) => ({
    time: clamp01(point.x) * TOTAL_DAYS,
    y: point.y,
  }));

  const mapped: DisplayPoint[] = opts.phaseFold
    ? withTime
        .map((point) => ({
          x: ((point.time % period) + period) % period / period,
          y: point.y,
        }))
        .sort((a, b) => a.x - b.x)
    : withTime.map((point) => ({ x: point.time / TOTAL_DAYS, y: point.y }));

  if (!opts.bin) return mapped;

  const bins = 70;
  const bucket: { sumY: number; count: number }[] = Array.from({ length: bins }, () => ({ sumY: 0, count: 0 }));
  mapped.forEach((point) => {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor(point.x * bins)));
    bucket[idx].sumY += point.y;
    bucket[idx].count += 1;
  });

  return bucket
    .map((row, idx) => ({
      x: (idx + 0.5) / bins,
      y: row.count > 0 ? row.sumY / row.count : Number.NaN,
    }))
    .filter((row) => Number.isFinite(row.y));
}

export function mergeSegments(input: Array<{ xStart: number; xEnd: number }>) {
  if (input.length === 0) return [];
  const sorted = input
    .map((segment) => ({
      xStart: clamp01(Math.min(segment.xStart, segment.xEnd)),
      xEnd: clamp01(Math.max(segment.xStart, segment.xEnd)),
    }))
    .filter((segment) => segment.xEnd - segment.xStart > 0.00001)
    .sort((a, b) => a.xStart - b.xStart);
  if (sorted.length === 0) return [];
  const merged = [sorted[0]];
  sorted.slice(1).forEach((segment) => {
    const last = merged[merged.length - 1];
    if (segment.xStart <= last.xEnd + 0.00001) {
      last.xEnd = Math.max(last.xEnd, segment.xEnd);
      return;
    }
    merged.push(segment);
  });
  return merged;
}

export function projectTimeIntervalToPhase(annotation: Annotation, periodDays: number) {
  const period = normalizePeriodDays(periodDays);
  const startDay = clamp01(Math.min(annotation.xStart, annotation.xEnd)) * TOTAL_DAYS;
  const endDay = clamp01(Math.max(annotation.xStart, annotation.xEnd)) * TOTAL_DAYS;
  if (endDay - startDay <= 0.00001) return [];
  const startCycle = Math.floor(startDay / period);
  const endCycle = Math.ceil(endDay / period);
  const projected: Array<{ xStart: number; xEnd: number }> = [];
  for (let cycle = startCycle; cycle <= endCycle; cycle += 1) {
    const cycleStart = cycle * period;
    const cycleEnd = (cycle + 1) * period;
    const overlapStart = Math.max(startDay, cycleStart);
    const overlapEnd = Math.min(endDay, cycleEnd);
    if (overlapEnd - overlapStart <= 0.00001) continue;
    projected.push({
      xStart: (overlapStart - cycleStart) / period,
      xEnd: (overlapEnd - cycleStart) / period,
    });
  }
  return mergeSegments(projected);
}

export function projectPhaseIntervalToTime(annotation: Annotation) {
  const period = normalizePeriodDays(annotation.sourcePeriodDays ?? 2);
  const phaseStart = clamp01(Math.min(annotation.xStart, annotation.xEnd));
  const phaseEnd = clamp01(Math.max(annotation.xStart, annotation.xEnd));
  if (phaseEnd - phaseStart <= 0.00001) return [];
  const intervalStart = phaseStart * period;
  const intervalEnd = phaseEnd * period;
  const projected: Array<{ xStart: number; xEnd: number }> = [];
  for (let cycleStart = 0; cycleStart < TOTAL_DAYS; cycleStart += period) {
    const absStart = cycleStart + intervalStart;
    const absEnd = cycleStart + intervalEnd;
    if (absStart >= TOTAL_DAYS) break;
    const clippedStart = Math.max(0, absStart);
    const clippedEnd = Math.min(TOTAL_DAYS, absEnd);
    if (clippedEnd - clippedStart <= 0.00001) continue;
    projected.push({
      xStart: clippedStart / TOTAL_DAYS,
      xEnd: clippedEnd / TOTAL_DAYS,
    });
  }
  return mergeSegments(projected);
}

export function projectAnnotationToView(annotation: Annotation, opts: { phaseFold: boolean; periodDays: number }) {
  if (opts.phaseFold) {
    if (annotation.coordinateMode === "phase") {
      return [{ xStart: clamp01(annotation.xStart), xEnd: clamp01(annotation.xEnd) }];
    }
    return projectTimeIntervalToPhase(annotation, opts.periodDays);
  }

  if (annotation.coordinateMode === "time") {
    return [{ xStart: clamp01(annotation.xStart), xEnd: clamp01(annotation.xEnd) }];
  }
  return projectPhaseIntervalToTime(annotation);
}
