import { db } from '@/db/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { getLastSession } from '@/db/workouts'
import type { BodyweightEntry, Exercise, PlanDay, Workout, WorkoutSet } from '@/db/types'

export function usePlanDays (): PlanDay[] | undefined {
  return useLiveQuery(() => db.planDays.orderBy('order').toArray(), [])
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
  return useLiveQuery(() => db.sets.filter(set => set.done).toArray(), [])
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

export function useBodyweight (): BodyweightEntry[] | undefined {
  return useLiveQuery(() => db.bodyweight.orderBy('date').toArray(), [])
}

export async function logBodyweight (kg: number, date: number): Promise<void> {
  await db.bodyweight.add({ kg, date })
}
