import { DAY_MS, startOfDay } from '@/lib/dates'

// Two rest days between sessions keep the streak alive, so a missed day does not break it
const STREAK_MAX_GAP_DAYS = 3

export function getStreak (endedAts: number[], now: number): number {
  const days = [...new Set(endedAts.map(startOfDay))].sort((a, b) => b - a)
  if (days.length === 0) return 0
  if ((startOfDay(now) - days[0]) / DAY_MS > STREAK_MAX_GAP_DAYS) return 0

  let streak = 1
  while (streak < days.length && (days[streak - 1] - days[streak]) / DAY_MS <= STREAK_MAX_GAP_DAYS) streak++
  return streak
}
