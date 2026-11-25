import { getMuscleCredits, MUSCLE_GROUPS } from '@/lib/muscles'
import type { Exercise, PlanItem } from '@/db/types'

const SET_WORK_SEC = 40
const SECONDS_PER_MINUTE = 60

export function getMainItems (items: PlanItem[]): PlanItem[] {
  return items.filter(item => !item.phase)
}

export function estimateMinutes (items: PlanItem[]): number {
  const totalSeconds = items.reduce((sum, item) => {
    return sum + (item.phase ? item.sets * item.repMin : item.sets * (item.restSec + SET_WORK_SEC))
  }, 0)
  return Math.round(totalSeconds / SECONDS_PER_MINUTE)
}

// Timed items store seconds; whole minutes read better
export function formatPrepTime (seconds: number): string {
  return seconds >= SECONDS_PER_MINUTE && seconds % SECONDS_PER_MINUTE === 0 ? `${seconds / SECONDS_PER_MINUTE} min` : `${seconds} sec`
}

export function formatItemTarget (item: PlanItem): string {
  return item.phase ? `${item.sets} × ${formatPrepTime(item.repMin)}` : `${item.sets} × ${formatRepRange(item)}`
}

export function formatRepRange (item: PlanItem): string {
  return item.repMin === item.repMax ? `${item.repMin}` : `${item.repMin}–${item.repMax}`
}

// Muscles a day trains as a primary mover, most sets first, so the main focus reads first
export function getDayMuscles (items: PlanItem[], exerciseMap: Map<string, Exercise>): string[] {
  const setsByGroup = new Map<string, number>()
  getMainItems(items).forEach(item => {
    const exercise = exerciseMap.get(item.exerciseId)
    if (!exercise) return
    Object.entries(getMuscleCredits(exercise)).forEach(([group, credit]) => {
      if ((credit ?? 0) >= 1) setsByGroup.set(group, (setsByGroup.get(group) ?? 0) + item.sets)
    })
  })
  return MUSCLE_GROUPS.filter(group => setsByGroup.has(group)).sort((a, b) => (setsByGroup.get(b) ?? 0) - (setsByGroup.get(a) ?? 0))
}

export function capitalize (text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
