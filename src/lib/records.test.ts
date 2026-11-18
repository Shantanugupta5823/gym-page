import { describe, expect, it } from 'vitest'
import { getE1rm } from '@/lib/e1rm'
import { findPrs, getExerciseRecords } from '@/lib/records'
import type { SetPoint } from '@/lib/records'

function point (workoutId: number, weight: number, reps: number, createdAt: number): SetPoint {
  return { workoutId, exerciseId: 'bench', weight, reps, createdAt }
}

describe('getE1rm', () => {
  it('applies Epley', () => {
    expect(getE1rm(100, 5)).toBeCloseTo(116.667, 2)
  })
})

describe('getExerciseRecords', () => {
  const sets = [point(1, 60, 8, 1), point(1, 60, 8, 2), point(2, 80, 3, 3)]

  it('finds heaviest, best e1RM and best session volume', () => {
    const records = getExerciseRecords(sets)
    expect(records.heaviest?.weight).toBe(80)
    expect(records.bestE1rm?.weight).toBe(80)
    expect(records.bestSessionVolume).toMatchObject({ workoutId: 1, volume: 960 })
  })

  it('returns nulls for no sets', () => {
    expect(getExerciseRecords([])).toEqual({ heaviest: null, bestE1rm: null, bestSessionVolume: null })
  })
})

describe('findPrs', () => {
  it('skips the baseline and flags only improvements', () => {
    const prs = findPrs([point(1, 60, 8, 1), point(2, 60, 8, 2), point(3, 65, 8, 3)])
    expect(prs).toHaveLength(1)
    expect(prs[0].workoutId).toBe(3)
  })

  it('keeps one PR per exercise per workout', () => {
    const prs = findPrs([point(1, 60, 8, 1), point(2, 65, 8, 2), point(2, 70, 8, 3)])
    expect(prs).toHaveLength(1)
    expect(prs[0].weight).toBe(70)
  })
})
