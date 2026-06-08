import { describe, it, expect } from 'vitest'
import {
  getMelbourneDateKey,
  getMelbourneMinutesAfterMidnight,
  normalizeDateKey,
  resolveMelbourneDateKey,
  shiftDateKey,
  dateKeyToUtcDate,
  getMelbourneDayIndex,
} from './melbourne-date'

describe('normalizeDateKey', () => {
  it('accepts a valid YYYY-MM-DD key', () => expect(normalizeDateKey('2024-03-15')).toBe('2024-03-15'))
  it('returns null for null', () => expect(normalizeDateKey(null)).toBeNull())
  it('returns null for undefined', () => expect(normalizeDateKey(undefined)).toBeNull())
  it('returns null for empty string', () => expect(normalizeDateKey('')).toBeNull())
  it('returns null for wrong separator format', () => expect(normalizeDateKey('15-03-2024')).toBeNull())
  it('returns null for partial date', () => expect(normalizeDateKey('2024-03')).toBeNull())
  it('returns null for date with extra chars', () => expect(normalizeDateKey('2024-03-15T00:00')).toBeNull())
})

describe('shiftDateKey', () => {
  it('adds days correctly', () => expect(shiftDateKey('2024-01-10', 5)).toBe('2024-01-15'))
  it('subtracts days correctly', () => expect(shiftDateKey('2024-01-10', -3)).toBe('2024-01-07'))
  it('zero shift returns same date', () => expect(shiftDateKey('2024-06-15', 0)).toBe('2024-06-15'))
  it('handles end-of-month boundary', () => expect(shiftDateKey('2024-01-31', 1)).toBe('2024-02-01'))
  it('handles end-of-year boundary', () => expect(shiftDateKey('2023-12-31', 1)).toBe('2024-01-01'))
  it('handles leap year Feb', () => expect(shiftDateKey('2024-02-28', 1)).toBe('2024-02-29'))
  it('skips leap day in non-leap year', () => expect(shiftDateKey('2023-02-28', 1)).toBe('2023-03-01'))
})

describe('dateKeyToUtcDate', () => {
  it('creates a UTC midnight date', () => {
    const d = dateKeyToUtcDate('2024-03-15')
    expect(d.getUTCFullYear()).toBe(2024)
    expect(d.getUTCMonth()).toBe(2)
    expect(d.getUTCDate()).toBe(15)
    expect(d.getUTCHours()).toBe(0)
    expect(d.getUTCMinutes()).toBe(0)
  })
  it('round-trips with shiftDateKey at +0 days', () => {
    const key = '2024-06-01'
    const d = dateKeyToUtcDate(key)
    expect(d.toISOString().slice(0, 10)).toBe(key)
  })
})

describe('resolveMelbourneDateKey', () => {
  it('returns today for null', () => {
    expect(resolveMelbourneDateKey(null)).toBe(getMelbourneDateKey())
  })
  it('returns today for undefined', () => {
    expect(resolveMelbourneDateKey(undefined)).toBe(getMelbourneDateKey())
  })
  it('returns today for an invalid format', () => {
    expect(resolveMelbourneDateKey('not-a-date')).toBe(getMelbourneDateKey())
  })
  it('returns today for a future date', () => {
    expect(resolveMelbourneDateKey('2099-12-31')).toBe(getMelbourneDateKey())
  })
  it('returns a valid past date unchanged', () => {
    expect(resolveMelbourneDateKey('2020-01-01')).toBe('2020-01-01')
  })
})

describe('getMelbourneDateKey', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(getMelbourneDateKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('returns a consistent key for the same moment', () => {
    const t = new Date()
    expect(getMelbourneDateKey(t)).toBe(getMelbourneDateKey(t))
  })
})

describe('getMelbourneMinutesAfterMidnight', () => {
  it('returns a value between 0 and 1439', () => {
    const m = getMelbourneMinutesAfterMidnight()
    expect(m).toBeGreaterThanOrEqual(0)
    expect(m).toBeLessThan(1440)
  })
})

describe('getMelbourneDayIndex', () => {
  it('returns a positive integer', () => {
    expect(getMelbourneDayIndex()).toBeGreaterThan(0)
  })
  it('increments by 1 across day boundaries', () => {
    const d1 = dateKeyToUtcDate('2024-01-01')
    const d2 = dateKeyToUtcDate('2024-01-02')
    expect(getMelbourneDayIndex(d2) - getMelbourneDayIndex(d1)).toBe(1)
  })
})
