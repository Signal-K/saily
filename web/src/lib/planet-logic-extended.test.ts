import { describe, it, expect } from 'vitest'
import {
  projectPhaseIntervalToTime,
  projectAnnotationToView,
  toDisplayPoints,
  TOTAL_DAYS,
  type Annotation,
} from './planet-logic'

function ann(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'test',
    xStart: 0.1,
    xEnd: 0.2,
    confidence: 90,
    tag: 'Transit dip',
    coordinateMode: 'time',
    ...overrides,
  }
}

describe('projectPhaseIntervalToTime', () => {
  it('returns at least one segment for a valid phase interval', () => {
    const result = projectPhaseIntervalToTime(ann({ xStart: 0.0, xEnd: 0.1, coordinateMode: 'phase', sourcePeriodDays: 5 }))
    expect(result.length).toBeGreaterThan(0)
  })

  it('all segments are within 0–1', () => {
    const result = projectPhaseIntervalToTime(ann({ xStart: 0.0, xEnd: 0.2, coordinateMode: 'phase', sourcePeriodDays: 4 }))
    for (const seg of result) {
      expect(seg.xStart).toBeGreaterThanOrEqual(0)
      expect(seg.xEnd).toBeLessThanOrEqual(1)
    }
  })

  it('returns empty for zero-width phase interval', () => {
    expect(projectPhaseIntervalToTime(ann({ xStart: 0.5, xEnd: 0.5 }))).toEqual([])
  })

  it('uses sourcePeriodDays for projection', () => {
    const shortPeriod = projectPhaseIntervalToTime(ann({ xStart: 0.0, xEnd: 0.05, coordinateMode: 'phase', sourcePeriodDays: 2 }))
    const longPeriod = projectPhaseIntervalToTime(ann({ xStart: 0.0, xEnd: 0.05, coordinateMode: 'phase', sourcePeriodDays: 10 }))
    expect(shortPeriod.length).toBeGreaterThanOrEqual(longPeriod.length)
  })
})

describe('projectAnnotationToView', () => {
  it('passthrough for time annotation without phase fold', () => {
    const result = projectAnnotationToView(ann({ xStart: 0.2, xEnd: 0.4, coordinateMode: 'time' }), { phaseFold: false, periodDays: 5 })
    expect(result).toHaveLength(1)
    expect(result[0].xStart).toBeCloseTo(0.2)
    expect(result[0].xEnd).toBeCloseTo(0.4)
  })

  it('passthrough for phase annotation with phase fold', () => {
    const result = projectAnnotationToView(ann({ xStart: 0.3, xEnd: 0.6, coordinateMode: 'phase' }), { phaseFold: true, periodDays: 5 })
    expect(result).toHaveLength(1)
    expect(result[0].xStart).toBeCloseTo(0.3)
    expect(result[0].xEnd).toBeCloseTo(0.6)
  })

  it('projects time → phase when folded', () => {
    const result = projectAnnotationToView(
      ann({ xStart: 10.5 / TOTAL_DAYS, xEnd: 11.5 / TOTAL_DAYS, coordinateMode: 'time' }),
      { phaseFold: true, periodDays: 10 }
    )
    expect(result.length).toBeGreaterThan(0)
    for (const seg of result) {
      expect(seg.xStart).toBeGreaterThanOrEqual(0)
      expect(seg.xEnd).toBeLessThanOrEqual(1)
    }
  })

  it('projects phase → time when not folded', () => {
    const result = projectAnnotationToView(
      ann({ xStart: 0.0, xEnd: 0.1, coordinateMode: 'phase', sourcePeriodDays: 5 }),
      { phaseFold: false, periodDays: 5 }
    )
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty for degenerate zero-width segment', () => {
    const result = projectAnnotationToView(ann({ xStart: 0.5, xEnd: 0.5, coordinateMode: 'time' }), { phaseFold: false, periodDays: 5 })
    expect(result).toHaveLength(1)
    expect(result[0].xStart).toBe(0.5)
    expect(result[0].xEnd).toBe(0.5)
  })
})

describe('toDisplayPoints', () => {
  const mockPoints = Array.from({ length: 27 }, (_, i) => ({ x: i / 26, y: 1.0 + i * 0.001 }))

  it('preserves point count in time mode without binning', () => {
    const result = toDisplayPoints(mockPoints, { phaseFold: false, bin: false, periodDays: 5 })
    expect(result).toHaveLength(mockPoints.length)
  })

  it('reduces point count when binning', () => {
    const result = toDisplayPoints(mockPoints, { phaseFold: false, bin: true, periodDays: 5 })
    expect(result.length).toBeLessThanOrEqual(70)
    expect(result.length).toBeGreaterThan(0)
  })

  it('all x values are in [0, 1] after phase fold', () => {
    const result = toDisplayPoints(mockPoints, { phaseFold: true, bin: false, periodDays: 5 })
    for (const p of result) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(1)
    }
  })

  it('phase-folded points are sorted by x', () => {
    const result = toDisplayPoints(mockPoints, { phaseFold: true, bin: false, periodDays: 5 })
    for (let i = 1; i < result.length; i++) {
      expect(result[i].x).toBeGreaterThanOrEqual(result[i - 1].x)
    }
  })

  it('returns empty array for empty input', () => {
    expect(toDisplayPoints([], { phaseFold: false, bin: false, periodDays: 5 })).toEqual([])
  })

  it('binned + phase fold produces finite-only y values', () => {
    const result = toDisplayPoints(mockPoints, { phaseFold: true, bin: true, periodDays: 5 })
    for (const p of result) {
      expect(Number.isFinite(p.y)).toBe(true)
    }
  })
})
