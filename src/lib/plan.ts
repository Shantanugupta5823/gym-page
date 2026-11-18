import { getMuscleGroup } from '@/lib/muscles'
import type { Exercise, PlanItem } from '@/db/types'

const SET_WORK_SEC = 40
const SECONDS_PER_MINUTE = 60

export function estimateMinutes (items: PlanItem[]): number {
  const totalSeconds = items.reduce((sum, item) => sum + item.sets * (item.restSec + SET_WORK_SEC), 0)
  return Math.round(totalSeconds / SECONDS_PER_MINUTE)
}

export function formatRepRange (item: PlanItem): string {
  return item.repMin === item.repMax ? `${item.repMin}` : `${item.repMin}–${item.repMax}`
}

export function getDayMuscles (items: PlanItem[], exerciseMap: Map<string, Exercise>): string[] {
  const groups = items.flatMap(item => exerciseMap.get(item.exerciseId)?.primaryMuscles ?? []).map(getMuscleGroup)
  return [...new Set(groups.filter(group => group !== null))]
}

export function capitalize (text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
