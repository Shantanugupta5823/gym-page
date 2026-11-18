import { describe, expect, it } from 'vitest'
import { summarizeSessions } from '@/lib/sessions'
import type { WorkoutSet } from '@/db/types'

function set (workoutId: number, setIndex: number, weight: number, reps: number, createdAt: number): WorkoutSet {
  return { workoutId, exerciseId: 'x', setIndex, weight, reps, done: true, createdAt }
}

describe('summarizeSessions', () => {
  const sets = [set(1, 0, 60, 10, 100), set(1, 1, 60, 10, 101), set(2, 0, 65, 10, 200), set(2, 1, 65, 8, 201), set(3, 0, 50, 10, 300)]
  const [latest, middle, first] = summarizeSessions(sets)

  it('orders sessions newest first', () => {
    expect([latest.workoutId, middle.workoutId, first.workoutId]).toEqual([3, 2, 1])
  })

  it('sums volume and picks the heaviest set as the top set', () => {
    expect(first.volume).toBe(1200)
    expect(middle.topSet?.weight).toBe(65)
  })

  it('marks a PR only when e1RM beats earlier sessions, never the first one', () => {
    expect([first.isPr, middle.isPr, latest.isPr]).toEqual([false, true, false])
  })

  it('reports volume change against the previous session', () => {
    expect(first.volumeChangePct).toBeNull()
    expect(middle.volumeChangePct).toBe(Math.round(((65 * 18 - 1200) / 1200) * 100))
  })
})
