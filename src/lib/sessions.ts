import { getE1rm } from '@/lib/e1rm'
import type { WorkoutSet } from '@/db/types'

export interface SessionSummary {
  workoutId: number
  date: number
  sets: WorkoutSet[]
  volume: number
  topSet: WorkoutSet | null
  bestE1rm: number
  isPr: boolean
  volumeChangePct: number | null
}

const PERCENT = 100

// One summary per workout, newest first. A PR beats every earlier session's best e1RM; the first session is the baseline
export function summarizeSessions (sets: WorkoutSet[]): SessionSummary[] {
  const byWorkout = new Map<number, WorkoutSet[]>()
  sets.forEach(set => byWorkout.set(set.workoutId, [...(byWorkout.get(set.workoutId) ?? []), set]))

  const oldestFirst = [...byWorkout.entries()]
    .map(([workoutId, workoutSets]) => ({ workoutId, sets: [...workoutSets].sort((a, b) => a.setIndex - b.setIndex) }))
    .sort((a, b) => a.sets[0].createdAt - b.sets[0].createdAt)

  let bestSoFar = 0
  let previousVolume = 0
  const summaries = oldestFirst.map((session, index): SessionSummary => {
    const weighted = session.sets.filter(set => set.weight > 0 && set.reps > 0)
    const volume = weighted.reduce((sum, set) => sum + set.weight * set.reps, 0)
    const bestE1rm = Math.max(0, ...weighted.map(set => getE1rm(set.weight, set.reps)))
    const topSet = weighted.reduce<WorkoutSet | null>((top, set) => (!top || set.weight > top.weight ? set : top), null)
    const summary: SessionSummary = {
      workoutId: session.workoutId,
      date: session.sets[session.sets.length - 1].createdAt,
      sets: session.sets,
      volume,
      topSet,
      bestE1rm,
      isPr: index > 0 && bestE1rm > bestSoFar,
      volumeChangePct: previousVolume > 0 ? Math.round(((volume - previousVolume) / previousVolume) * PERCENT) : null
    }
    bestSoFar = Math.max(bestSoFar, bestE1rm)
    previousVolume = volume
    return summary
  })

  return summaries.reverse()
}
