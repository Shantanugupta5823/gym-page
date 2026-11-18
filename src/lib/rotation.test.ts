import { describe, expect, it } from 'vitest'
import { getNextRollingDay, getTodayDay } from '@/lib/rotation'
import type { PlanDay, Workout } from '@/db/types'

const days: PlanDay[] = [1, 2, 3].map(id => ({ id, planId: 1, order: id, name: `Day ${id}`, type: 'push', items: [] }))

function done (planDayId: number, endedAt: number): Workout {
  return { id: endedAt, planDayId, dayName: '', dayType: 'push', items: [], startedAt: endedAt - 1, endedAt }
}

describe('getNextRollingDay', () => {
  it('starts at the first day with no history', () => {
    expect(getNextRollingDay(days, [])?.id).toBe(1)
  })

  it('follows the last completed day, not the weekday', () => {
    expect(getNextRollingDay(days, [done(1, 100)])?.id).toBe(2)
    expect(getNextRollingDay(days, [done(1, 100), done(2, 200)])?.id).toBe(3)
  })

  it('wraps to the first day', () => {
    expect(getNextRollingDay(days, [done(3, 300)])?.id).toBe(1)
  })

  it('ignores unfinished workouts', () => {
    const unfinished: Workout = { ...done(2, 500), endedAt: undefined }
    expect(getNextRollingDay(days, [done(1, 100), unfinished])?.id).toBe(2)
  })

  it('returns null with no plan days', () => {
    expect(getNextRollingDay([], [])).toBeNull()
  })
})

describe('getTodayDay', () => {
  const monday = new Date(2026, 10, 16, 10).getTime()

  it('uses the weekday map in fixed mode', () => {
    const result = getTodayDay({ planDays: days, workouts: [], mode: 'fixed', weekdayPlan: { 1: 3 }, now: monday })
    expect(result.day?.id).toBe(3)
  })

  it('reports a rest day for an unmapped weekday', () => {
    const result = getTodayDay({ planDays: days, workouts: [], mode: 'fixed', weekdayPlan: {}, now: monday })
    expect(result).toEqual({ day: null, isRestDay: true })
  })
})
