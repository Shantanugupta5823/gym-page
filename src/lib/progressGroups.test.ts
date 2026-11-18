import { describe, expect, it } from 'vitest'
import { buildGroupTrends } from '@/lib/progressGroups'
import type { Exercise, WorkoutSet } from '@/db/types'

const exercise = (id: string, muscle: string): Exercise => ({ id, name: id, primaryMuscles: [muscle], secondaryMuscles: [], equipment: null, category: 'strength', images: [], instructions: [] })
const set = (workoutId: number, exerciseId: string, weight: number, createdAt: number): WorkoutSet => ({ workoutId, exerciseId, setIndex: 0, weight, reps: 10, done: true, createdAt })

describe('buildGroupTrends', () => {
  const exerciseMap = new Map([exercise('bench', 'chest'), exercise('fly', 'chest'), exercise('curl', 'biceps')].map(item => [item.id, item]))
  const groups = buildGroupTrends(
    [set(1, 'bench', 60, 100), set(2, 'bench', 66, 200), set(1, 'fly', 20, 100), set(1, 'curl', 15, 100)],
    exerciseMap,
    0
  )

  it('groups exercises by primary muscle and ranks by sessions performed', () => {
    expect(groups.get('Chest')?.map(trend => trend.exerciseId)).toEqual(['bench', 'fly'])
    expect(groups.get('Biceps')).toHaveLength(1)
  })

  it('reports e1RM change from first to latest session', () => {
    expect(groups.get('Chest')?.[0].changePct).toBe(10)
    expect(groups.get('Chest')?.[1].changePct).toBeNull()
  })
})
