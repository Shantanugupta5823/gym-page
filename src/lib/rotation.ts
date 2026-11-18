import type { PlanDay, RotationMode, Workout } from '@/db/types'

interface TodayInput {
  planDays: PlanDay[]
  workouts: Workout[]
  mode: RotationMode
  weekdayPlan: Record<number, number | null>
  now: number
}

export interface TodayResult {
  day: PlanDay | null
  isRestDay: boolean
}

// Rolling rotation follows completed workouts, never the weekday
export function getNextRollingDay (planDays: PlanDay[], workouts: Workout[]): PlanDay | null {
  if (planDays.length === 0) return null

  const sortedDays = [...planDays].sort((a, b) => a.order - b.order)
  const lastDone = workouts
    .filter(workout => workout.endedAt != null)
    .sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0))[0]
  const lastIndex = sortedDays.findIndex(day => day.id === lastDone?.planDayId)

  if (!lastDone || lastIndex === -1) return sortedDays[0]
  return sortedDays[(lastIndex + 1) % sortedDays.length]
}

export function getTodayDay ({ planDays, workouts, mode, weekdayPlan, now }: TodayInput): TodayResult {
  if (mode === 'rolling') return { day: getNextRollingDay(planDays, workouts), isRestDay: false }

  const plannedId = weekdayPlan[new Date(now).getDay()]
  const day = planDays.find(planDay => planDay.id === plannedId) ?? null
  return { day, isRestDay: day === null }
}
