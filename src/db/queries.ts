import { db } from '@/db/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { getLastSession } from '@/db/workouts'
import { PREP_EXERCISE_IDS } from '@/db/curatedExercises'
import { getActivePlanDays } from '@/db/plans'
import type { Exercise, PlanDay, Workout, WorkoutSet } from '@/db/types'

export function usePlanDays (): PlanDay[] | undefined {
  return useLiveQuery(getActivePlanDays, [])
}

export function useActiveWorkout (): Workout | null | undefined {
  return useLiveQuery(async () => (await db.workouts.filter(workout => workout.endedAt === undefined).first()) ?? null, [])
}

export function useFinishedWorkouts (): Workout[] | undefined {
  return useLiveQuery(async () => {
    const finished = await db.workouts.filter(workout => workout.endedAt !== undefined).toArray()
    return finished.sort((a, b) => b.startedAt - a.startedAt)
  }, [])
}

export function useDoneSets (): WorkoutSet[] | undefined {
  return useLiveQuery(() => db.sets.filter(set => set.done && !PREP_EXERCISE_IDS.has(set.exerciseId)).toArray(), [])
}

export function useWorkoutSets (workoutId: number | undefined): WorkoutSet[] | undefined {
  return useLiveQuery(async () => {
    if (workoutId === undefined) return []
    return db.sets.where('workoutId').equals(workoutId).sortBy('setIndex')
  }, [workoutId])
}

export function useLastSession (exerciseId: string, workoutId: number): WorkoutSet[] | undefined {
  return useLiveQuery(() => getLastSession(exerciseId, workoutId), [exerciseId, workoutId])
}

export function useExercises (): Exercise[] | undefined {
  return useLiveQuery(() => db.exercises.orderBy('name').toArray(), [])
}

export function useExerciseMap (): Map<string, Exercise> {
  const exercises = useExercises()
  return new Map((exercises ?? []).map(exercise => [exercise.id, exercise]))
}

// Finished workouts plus the one in progress, oldest first
export function useAllWorkouts (): Workout[] | undefined {
  return useLiveQuery(() => db.workouts.orderBy('startedAt').toArray(), [])
}

export function useSetsForWorkouts (workoutIds: number[]): WorkoutSet[] | undefined {
  const key = workoutIds.join(',')
  return useLiveQuery(
    () => db.sets.where('workoutId').anyOf(workoutIds).filter(set => set.done && !PREP_EXERCISE_IDS.has(set.exerciseId)).toArray(),
    [key]
  )
}
