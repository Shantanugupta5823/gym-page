import type { DayType } from '@/db/types'

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs'] as const

export type MuscleGroup = typeof MUSCLE_GROUPS[number]

const GROUP_BY_MUSCLE: Record<string, MuscleGroup> = {
  chest: 'Chest',
  lats: 'Back',
  'middle back': 'Back',
  'lower back': 'Back',
  traps: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quadriceps: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abdominals: 'Abs'
}

export function getMuscleGroup (muscle: string): MuscleGroup | null {
  return GROUP_BY_MUSCLE[muscle] ?? null
}

export const DAY_TYPE_BY_GROUP: Record<MuscleGroup, DayType> = {
  Chest: 'push',
  Triceps: 'push',
  Shoulders: 'push',
  Back: 'pull',
  Biceps: 'pull',
  Forearms: 'pull',
  Abs: 'pull',
  Quads: 'legs',
  Hamstrings: 'legs',
  Glutes: 'legs',
  Calves: 'legs'
}

// Gives each exercise the Push/Pull/Legs accent of its first recognised muscle
export function getExerciseDayType (primaryMuscles: string[]): DayType {
  const group = primaryMuscles.map(getMuscleGroup).find(item => item !== null)
  return group ? DAY_TYPE_BY_GROUP[group] : 'push'
}
