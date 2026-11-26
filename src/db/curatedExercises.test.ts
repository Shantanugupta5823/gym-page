import { describe, expect, it } from 'vitest'
import { SEED_PLAN } from '@/db/seedPlan'
import { CURATED_EXERCISES, PREP_EXERCISE_IDS } from '@/db/curatedExercises'

describe('curated exercises', () => {
  it('keeps at most 20 unique exercises per muscle group', () => {
    Object.values(CURATED_EXERCISES).forEach(ids => {
      expect(ids.length).toBeLessThanOrEqual(20)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  it('contains every exercise used by the seed plan', () => {
    const curatedIds = new Set([...Object.values(CURATED_EXERCISES).flat(), ...PREP_EXERCISE_IDS])
    const seedIds = SEED_PLAN.flatMap(day => day.items.map(item => item.exerciseId))
    expect(seedIds.filter(id => !curatedIds.has(id))).toEqual([])
  })

  it('keeps warm-up and stretch ids out of the strength library', () => {
    const strengthIds = new Set(Object.values(CURATED_EXERCISES).flat())
    expect([...PREP_EXERCISE_IDS].filter(id => strengthIds.has(id))).toEqual([])
  })

  it('never repeats an exercise within a day, since a workout keys its sets by exercise', () => {
    SEED_PLAN.forEach(day => {
      const ids = day.items.map(item => item.exerciseId)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  it('seeds warm-ups first and stretches last on every day', () => {
    SEED_PLAN.forEach(day => {
      expect(day.items[0].phase).toBe('warmup')
      expect(day.items[day.items.length - 1].phase).toBe('stretch')
    })
  })
})
