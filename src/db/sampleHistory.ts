import { db } from '@/db/db'
import { getActivePlanDays } from '@/db/plans'
import { DAY_MS } from '@/lib/dates'
import type { WorkoutSet } from '@/db/types'

// Three full rotations plus half of the current one, one workout a day
const SAMPLE_WORKOUT_COUNT = 14
const SPAN_DAYS = 14
const DAYS_BETWEEN_WORKOUTS = 1
const START_HOUR_MS = 18 * 3_600_000
const SESSION_MS = 80 * 60_000
const SET_GAP_MS = 90_000
const COMPOUND_REST_SEC = 120
const COMPOUND_BASE_KG = 60
const ISOLATION_BASE_KG = 15
const WEIGHT_STEP_KG = 2.5

// Adds workouts that walk the plan in order, with weight rising each cycle so charts, PRs and the +kg hint show up
export async function loadSampleHistory (): Promise<number> {
  const planDays = await getActivePlanDays()
  if (planDays.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await db.transaction('rw', db.workouts, db.sets, async () => {
    for (let index = 0; index < SAMPLE_WORKOUT_COUNT; index++) {
      const day = planDays[index % planDays.length]
      const cycle = Math.floor(index / planDays.length)
      const isLatestCycle = cycle === Math.floor((SAMPLE_WORKOUT_COUNT - 1) / planDays.length)
      const daysAgo = SPAN_DAYS - Math.round(index * DAYS_BETWEEN_WORKOUTS)
      const startedAt = today.getTime() - daysAgo * DAY_MS + START_HOUR_MS

      const workoutId = await db.workouts.add({
        planDayId: day.id ?? 0,
        dayName: day.name,
        dayType: day.type,
        items: day.items,
        startedAt,
        endedAt: startedAt + SESSION_MS
      })

      const rows: WorkoutSet[] = day.items.flatMap((item, itemIndex) => {
        const baseKg = item.restSec >= COMPOUND_REST_SEC ? COMPOUND_BASE_KG : ISOLATION_BASE_KG
        const weight = item.phase ? 0 : baseKg + cycle * WEIGHT_STEP_KG
        return Array.from({ length: item.sets }, (_, setIndex) => ({
          workoutId,
          exerciseId: item.exerciseId,
          setIndex,
          weight,
          reps: isLatestCycle || item.phase ? item.repMax : item.repMax - (setIndex % 2),
          done: true,
          createdAt: startedAt + (itemIndex * item.sets + setIndex) * SET_GAP_MS
        }))
      })
      await db.sets.bulkAdd(rows)
    }
  })

  return SAMPLE_WORKOUT_COUNT
}
