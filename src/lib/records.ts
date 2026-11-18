import { getE1rm } from '@/lib/e1rm'

export interface SetPoint {
  workoutId: number
  exerciseId: string
  weight: number
  reps: number
  createdAt: number
}

export interface E1rmPoint extends SetPoint {
  e1rm: number
}

export interface ExerciseRecords {
  heaviest: SetPoint | null
  bestE1rm: E1rmPoint | null
  bestSessionVolume: { workoutId: number, volume: number, createdAt: number } | null
}

function toE1rmPoint (set: SetPoint): E1rmPoint {
  return { ...set, e1rm: getE1rm(set.weight, set.reps) }
}

export function getExerciseRecords (sets: SetPoint[]): ExerciseRecords {
  const weighted = sets.filter(set => set.weight > 0 && set.reps > 0)
  const heaviest = weighted.reduce<SetPoint | null>((best, set) => (!best || set.weight > best.weight ? set : best), null)
  const bestE1rm = weighted.map(toE1rmPoint).reduce<E1rmPoint | null>((best, set) => (!best || set.e1rm > best.e1rm ? set : best), null)

  const volumeByWorkout = new Map<number, { volume: number, createdAt: number }>()
  weighted.forEach(set => {
    const entry = volumeByWorkout.get(set.workoutId) ?? { volume: 0, createdAt: set.createdAt }
    volumeByWorkout.set(set.workoutId, { volume: entry.volume + set.weight * set.reps, createdAt: Math.max(entry.createdAt, set.createdAt) })
  })
  const bestSessionVolume = [...volumeByWorkout.entries()]
    .map(([workoutId, entry]) => ({ workoutId, ...entry }))
    .reduce<ExerciseRecords['bestSessionVolume']>((best, entry) => (!best || entry.volume > best.volume ? entry : best), null)

  return { heaviest, bestE1rm, bestSessionVolume }
}

// A PR beats the best e1RM of every earlier set; an exercise's first set is the baseline, not a PR
export function findPrs (sets: SetPoint[]): E1rmPoint[] {
  const sorted = sets.filter(set => set.weight > 0 && set.reps > 0).sort((a, b) => a.createdAt - b.createdAt)
  const bestByExercise = new Map<string, number>()
  const prByWorkoutExercise = new Map<string, E1rmPoint>()

  sorted.map(toE1rmPoint).forEach(point => {
    const previousBest = bestByExercise.get(point.exerciseId)
    bestByExercise.set(point.exerciseId, Math.max(previousBest ?? 0, point.e1rm))
    if (previousBest === undefined || point.e1rm <= previousBest) return

    const key = `${point.workoutId}:${point.exerciseId}`
    const existing = prByWorkoutExercise.get(key)
    if (!existing || point.e1rm > existing.e1rm) prByWorkoutExercise.set(key, point)
  })

  return [...prByWorkoutExercise.values()].sort((a, b) => b.createdAt - a.createdAt)
}
