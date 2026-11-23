import { getPrimaryGroup } from '@/lib/muscles'
import { summarizeSessions } from '@/lib/sessions'
import type { MuscleGroup } from '@/lib/muscles'
import type { Exercise, WorkoutSet } from '@/db/types'

export interface TrendPoint {
  date: number
  value: number
}

export interface ExerciseTrend {
  exerciseId: string
  sessionCount: number
  setCount: number
  lastDate: number
  latestE1rm: number | null
  changeE1rm: number | null
  changePct: number | null
  heaviest: number | null
  lastSets: WorkoutSet[]
  points: TrendPoint[]
}

const PERCENT = 100

function buildTrend (exerciseId: string, sets: WorkoutSet[], rangeStart: number): ExerciseTrend {
  const sessions = summarizeSessions(sets)
  const points = sessions
    .filter(session => session.bestE1rm > 0 && session.date >= rangeStart)
    .map(session => ({ date: session.date, value: session.bestE1rm }))
    .reverse()
  const first = points[0]
  const last = points[points.length - 1]

  return {
    exerciseId,
    sessionCount: sessions.length,
    setCount: sets.length,
    lastDate: sessions[0].date,
    latestE1rm: points.length > 0 ? last.value : null,
    changeE1rm: points.length > 1 ? last.value - first.value : null,
    heaviest: Math.max(0, ...sets.filter(set => set.reps > 0).map(set => set.weight)) || null,
    lastSets: sessions[0].sets,
    changePct: points.length > 1 ? Math.round(((last.value - first.value) / first.value) * PERCENT) : null,
    points
  }
}

// Exercises per muscle group, most-performed first (ties: most recent first)
export function buildGroupTrends (sets: WorkoutSet[], exerciseMap: Map<string, Exercise>, rangeStart: number): Map<MuscleGroup, ExerciseTrend[]> {
  const setsByExercise = new Map<string, WorkoutSet[]>()
  sets.forEach(set => setsByExercise.set(set.exerciseId, [...(setsByExercise.get(set.exerciseId) ?? []), set]))

  const groups = new Map<MuscleGroup, ExerciseTrend[]>()
  setsByExercise.forEach((exerciseSets, exerciseId) => {
    const group = getPrimaryGroup(exerciseMap.get(exerciseId))
    if (!group) return
    groups.set(group, [...(groups.get(group) ?? []), buildTrend(exerciseId, exerciseSets, rangeStart)])
  })
  groups.forEach(trends => trends.sort((a, b) => b.sessionCount - a.sessionCount || b.lastDate - a.lastDate))
  return groups
}
