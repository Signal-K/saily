import { describe, it, expect } from 'vitest'
import { 
  clamp01, 
  normalizePeriodDays, 
  toDisplayPoints,
  mergeSegments,
  projectTimeIntervalToPhase
} from './planet-logic'

describe('Saily Planet Logic', () => {
  it('clamps values correctly between 0 and 1', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(0.7)).toBe(0.7)
  })

  it('normalizes period days within bounds', () => {
    expect(normalizePeriodDays(0.1)).toBe(0.2)
    expect(normalizePeriodDays(40)).toBe(30)
    expect(normalizePeriodDays(5)).toBe(5)
  })

  it('merges overlapping segments correctly', () => {
    const input = [
      { xStart: 0.1, xEnd: 0.3 },
      { xStart: 0.2, xEnd: 0.4 },
      { xStart: 0.6, xEnd: 0.7 }
    ]
    const merged = mergeSegments(input)
    expect(merged).toHaveLength(2)
    expect(merged[0]).toEqual({ xStart: 0.1, xEnd: 0.4 })
    expect(merged[1]).toEqual({ xStart: 0.6, xEnd: 0.7 })
  })

  it('projects time intervals to phase cycles correctly', () => {
    // Total days is 27. Period is 10. 
    // Dips should appear at phase matching (time % 10) / 10
    const annotation = {
      id: '1',
      xStart: 10.5 / 27, // Day 10.5 -> Phase 0.05
      xEnd: 11.5 / 27,   // Day 11.5 -> Phase 0.15
      confidence: 100,
      tag: 'test',
      coordinateMode: 'time' as const
    }
    const projected = projectTimeIntervalToPhase(annotation, 10)
    expect(projected[0].xStart).toBeCloseTo(0.05)
    expect(projected[0].xEnd).toBeCloseTo(0.15)
  })
})
