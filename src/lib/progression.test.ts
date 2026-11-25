import { describe, expect, it } from 'vitest'
import { getPrefill, shouldIncreaseWeight } from '@/lib/progression'

const hitTop = [{ weight: 60, reps: 8 }, { weight: 60, reps: 8 }]
const missed = [{ weight: 60, reps: 8 }, { weight: 60, reps: 6 }]

describe('shouldIncreaseWeight', () => {
  it('is true only when every set hit repMax', () => {
    expect(shouldIncreaseWeight(hitTop, 8)).toBe(true)
    expect(shouldIncreaseWeight(missed, 8)).toBe(false)
    expect(shouldIncreaseWeight([], 8)).toBe(false)
  })

  it('never adds weight to bodyweight sets logged at 0 kg', () => {
    expect(shouldIncreaseWeight([{ weight: 0, reps: 12 }, { weight: 0, reps: 12 }], 12)).toBe(false)
  })
})

describe('getPrefill', () => {
  it('adds the increment after hitting repMax', () => {
    expect(getPrefill({ lastSets: hitTop, setIndex: 0, repMin: 5, repMax: 8, increment: 2.5 })).toEqual({ weight: 62.5, reps: 8 })
  })

  it('repeats the same set otherwise and reuses the last set for extras', () => {
    expect(getPrefill({ lastSets: missed, setIndex: 1, repMin: 5, repMax: 8, increment: 2.5 })).toEqual({ weight: 60, reps: 6 })
    expect(getPrefill({ lastSets: missed, setIndex: 3, repMin: 5, repMax: 8, increment: 2.5 })).toEqual({ weight: 60, reps: 6 })
  })

  it('falls back to repMin with no history', () => {
    expect(getPrefill({ lastSets: [], setIndex: 0, repMin: 5, repMax: 8, increment: 2.5 })).toEqual({ weight: 0, reps: 5 })
  })
})
