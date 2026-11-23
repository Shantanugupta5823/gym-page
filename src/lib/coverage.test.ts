import { describe, expect, it } from 'vitest'
import { getCurrentRotation, getRotationCoverage, makeCreditLookup } from '@/lib/coverage'
import { MUSCLE_GROUPS, getMuscleCredits } from '@/lib/muscles'
import { SEED_PLAN } from '@/db/seedPlan'
import type { Exercise, PlanDay, Workout, WorkoutSet } from '@/db/types'
import library from '../../public/exercises/exercises.json'

const exerciseMap = new Map((library as Exercise[]).map(exercise => [exercise.id, exercise]))
const lookup = makeCreditLookup(exerciseMap)
const planDays: PlanDay[] = SEED_PLAN.map((day, index) => ({ ...day, id: index + 1, planId: 1, order: index + 1 }))

function workout (id: number, planDayId: number, isDone = true): Workout {
  return { id, planDayId, dayName: '', dayType: 'push', items: [], startedAt: id * 100, ...(isDone ? { endedAt: id * 100 + 50 } : {}) }
}

function setsFor (workoutId: number, day: PlanDay): WorkoutSet[] {
  return day.items.filter(item => !item.phase).flatMap(item => Array.from({ length: item.sets }, (_, setIndex) => ({
    workoutId, exerciseId: item.exerciseId, setIndex, weight: 20, reps: 10, done: true, createdAt: workoutId * 100
  })))
}

describe('seed plan coverage', () => {
  it('trains every body-map muscle at least once per rotation', () => {
    const coverage = getRotationCoverage(planDays, [], lookup)
    expect(coverage.filter(item => item.target === 0).map(item => item.group)).toEqual([])
  })

  it('turns every muscle fully green once each day is completed', () => {
    const sets = planDays.flatMap((day, index) => setsFor(index + 1, day))
    const coverage = getRotationCoverage(planDays, sets, lookup)
    expect(coverage.every(item => item.ratio === 1)).toBe(true)
  })

  it('credits rear delts, not front delts, for rows', () => {
    const row = exerciseMap.get('Seated_Cable_Rows')
    expect(row && getMuscleCredits(row)['Rear delts']).toBe(0.5)
    expect(row && getMuscleCredits(row).Shoulders).toBeUndefined()
  })

  it('has one map region per muscle group', () => {
    expect(new Set(MUSCLE_GROUPS).size).toBe(17)
  })
})

describe('getCurrentRotation', () => {
  it('starts a new rotation whenever day 1 is started', () => {
    const rotation = getCurrentRotation(planDays, [workout(1, 1), workout(2, 2), workout(3, 3), workout(4, 4), workout(5, 1), workout(6, 2, false)])
    expect(rotation.number).toBe(2)
    expect(rotation.workouts.map(item => item.id)).toEqual([5, 6])
    expect([...rotation.doneDayIds]).toEqual([1])
    expect(rotation.isComplete).toBe(false)
  })

  it('stays complete until the next day 1', () => {
    const rotation = getCurrentRotation(planDays, [1, 2, 3, 4].map(id => workout(id, id)))
    expect(rotation.isComplete).toBe(true)
  })

  it('ignores workouts from other plans', () => {
    expect(getCurrentRotation(planDays, [workout(1, 99)]).workouts).toEqual([])
  })
})
