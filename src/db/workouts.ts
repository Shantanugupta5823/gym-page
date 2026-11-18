import { Dexie } from 'dexie'
import { db } from '@/db/db'
import { getPrefill } from '@/lib/progression'
import type { LastSet } from '@/lib/progression'
import type { PlanDay, PlanItem, WorkoutSet } from '@/db/types'

interface BuildRowsInput {
  workoutId: number
  item: PlanItem
  lastSets: LastSet[]
  increment: number
  startIndex: number
  count: number
}

// Last completed session of one exercise, ordered by set
export async function getLastSession (exerciseId: string, excludeWorkoutId?: number): Promise<WorkoutSet[]> {
  const latest = await db.sets
    .where('[exerciseId+createdAt]')
    .between([exerciseId, Dexie.minKey], [exerciseId, Dexie.maxKey])
    .reverse()
    .filter(set => set.done && set.workoutId !== excludeWorkoutId)
    .first()
  if (!latest) return []

  return db.sets
    .where('workoutId')
    .equals(latest.workoutId)
    .filter(set => set.exerciseId === exerciseId && set.done)
    .sortBy('setIndex')
}

function buildSetRows ({ workoutId, item, lastSets, increment, startIndex, count }: BuildRowsInput): WorkoutSet[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, offset) => {
    const setIndex = startIndex + offset
    const prefill = getPrefill({ lastSets, setIndex, repMin: item.repMin, repMax: item.repMax, increment })
    return { workoutId, exerciseId: item.exerciseId, setIndex, weight: prefill.weight, reps: prefill.reps, done: false, createdAt: now }
  })
}

export async function startWorkout (day: PlanDay, increment: number): Promise<number> {
  const active = await db.workouts.filter(workout => workout.endedAt === undefined).first()
  if (active?.id !== undefined) return active.id

  return db.transaction('rw', db.workouts, db.sets, async () => {
    const workoutId = await db.workouts.add({
      planDayId: day.id ?? 0,
      dayName: day.name,
      dayType: day.type,
      items: day.items,
      startedAt: Date.now()
    })
    const lastSessions = await Promise.all(day.items.map(async item => (item.phase ? [] : getLastSession(item.exerciseId, workoutId))))
    const rows = day.items.flatMap((item, index) => {
      return buildSetRows({ workoutId, item, lastSets: lastSessions[index], increment, startIndex: 0, count: item.sets })
    })
    await db.sets.bulkAdd(rows)
    return workoutId
  })
}

export async function updateSet (id: number, patch: Partial<Pick<WorkoutSet, 'weight' | 'reps'>>): Promise<void> {
  await db.sets.update(id, patch)
}

export async function setSetDone (id: number, done: boolean): Promise<void> {
  await db.sets.update(id, { done, createdAt: Date.now() })
}

export async function addSet (workoutId: number, exerciseId: string): Promise<void> {
  const rows = await db.sets.where('workoutId').equals(workoutId).filter(set => set.exerciseId === exerciseId).sortBy('setIndex')
  const last = rows[rows.length - 1]
  await db.sets.add({
    workoutId,
    exerciseId,
    setIndex: (last?.setIndex ?? -1) + 1,
    weight: last?.weight ?? 0,
    reps: last?.reps ?? 0,
    done: false,
    createdAt: Date.now()
  })
}

export async function deleteSet (id: number): Promise<void> {
  await db.sets.delete(id)
}

export async function swapExercise (workoutId: number, itemIndex: number, newExerciseId: string, increment: number): Promise<void> {
  await db.transaction('rw', db.workouts, db.sets, async () => {
    const workout = await db.workouts.get(workoutId)
    const oldItem = workout?.items[itemIndex]
    if (!workout || !oldItem) return

    const newItem: PlanItem = { ...oldItem, exerciseId: newExerciseId }
    const items = workout.items.map((item, index) => (index === itemIndex ? newItem : item))
    const lastSets = await getLastSession(newExerciseId, workoutId)
    const rows = buildSetRows({ workoutId, item: newItem, lastSets, increment, startIndex: 0, count: oldItem.sets })

    await db.sets.where('workoutId').equals(workoutId).filter(set => set.exerciseId === oldItem.exerciseId && !set.done).delete()
    await db.workouts.update(workoutId, { items })
    await db.sets.bulkAdd(rows)
  })
}

export async function skipExercise (workoutId: number, itemIndex: number): Promise<void> {
  await db.transaction('rw', db.workouts, db.sets, async () => {
    const workout = await db.workouts.get(workoutId)
    const skipped = workout?.items[itemIndex]
    if (!workout || !skipped) return

    await db.sets.where('workoutId').equals(workoutId).filter(set => set.exerciseId === skipped.exerciseId && !set.done).delete()
    await db.workouts.update(workoutId, { items: workout.items.filter((_, index) => index !== itemIndex) })
  })
}

export async function setWorkoutNotes (workoutId: number, notes: string): Promise<void> {
  await db.workouts.update(workoutId, { notes })
}

// Returns false when nothing was logged, in which case the workout is discarded
export async function finishWorkout (workoutId: number): Promise<boolean> {
  return db.transaction('rw', db.workouts, db.sets, async () => {
    await db.sets.where('workoutId').equals(workoutId).filter(set => !set.done).delete()
    const loggedCount = await db.sets.where('workoutId').equals(workoutId).count()
    if (loggedCount === 0) {
      await db.workouts.delete(workoutId)
      return false
    }
    await db.workouts.update(workoutId, { endedAt: Date.now() })
    return true
  })
}

export async function discardWorkout (workoutId: number): Promise<void> {
  await db.transaction('rw', db.workouts, db.sets, async () => {
    await db.sets.where('workoutId').equals(workoutId).delete()
    await db.workouts.delete(workoutId)
  })
}
