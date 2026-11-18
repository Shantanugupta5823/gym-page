import { describe, expect, it } from 'vitest'
import { DAY_MS } from '@/lib/dates'
import { getStreak } from '@/lib/streak'

const now = new Date(2026, 10, 18, 12).getTime()
const daysAgo = (count: number): number => now - count * DAY_MS

describe('getStreak', () => {
  it('is 0 with no workouts or a long gap', () => {
    expect(getStreak([], now)).toBe(0)
    expect(getStreak([daysAgo(6)], now)).toBe(0)
  })

  it('counts sessions with up to two rest days between them', () => {
    expect(getStreak([daysAgo(0), daysAgo(1), daysAgo(3), daysAgo(6)], now)).toBe(4)
  })

  it('stops at a longer gap and counts one session per day', () => {
    expect(getStreak([daysAgo(0), daysAgo(0), daysAgo(1), daysAgo(8)], now)).toBe(2)
  })
})
