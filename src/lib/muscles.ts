import type { DayType, Exercise } from '@/db/types'

// Every group is a region on the body map, so each one can turn green during a rotation
export const MUSCLE_GROUPS = [
  'Neck', 'Traps', 'Shoulders', 'Rear delts', 'Chest', 'Back', 'Lower back',
  'Biceps', 'Triceps', 'Forearms', 'Abs', 'Obliques',
  'Glutes', 'Quads', 'Hamstrings', 'Adductors', 'Calves'
] as const

export type MuscleGroup = typeof MUSCLE_GROUPS[number]

// How much one set counts towards a muscle: 1 for a primary mover, 0.5 for a secondary one
export type MuscleCredits = Partial<Record<MuscleGroup, number>>

export const PRIMARY_CREDIT = 1
export const SECONDARY_CREDIT = 0.5

const GROUP_BY_DATASET_MUSCLE: Record<string, MuscleGroup> = {
  neck: 'Neck',
  traps: 'Traps',
  shoulders: 'Shoulders',
  chest: 'Chest',
  lats: 'Back',
  'middle back': 'Back',
  'lower back': 'Lower back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abdominals: 'Abs',
  glutes: 'Glutes',
  abductors: 'Glutes',
  quadriceps: 'Quads',
  hamstrings: 'Hamstrings',
  adductors: 'Adductors',
  calves: 'Calves'
}

// The dataset files rear-delt and oblique work under "shoulders" and "abdominals", and some secondaries are wrong,
// so these exercises get their credits spelled out
const CREDIT_OVERRIDES: Record<string, MuscleCredits> = {
  Face_Pull: { 'Rear delts': 1, Traps: 0.5, Back: 0.5 },
  Reverse_Flyes: { 'Rear delts': 1, Traps: 0.5 },
  Reverse_Machine_Flyes: { 'Rear delts': 1, Traps: 0.5 },
  Cable_Rear_Delt_Fly: { 'Rear delts': 1 },
  Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench: { 'Rear delts': 1 },
  Upright_Barbell_Row: { Shoulders: 1, Traps: 1 },
  Cable_Seated_Lateral_Raise: { Shoulders: 1 },
  Barbell_Deadlift: { Back: 0.5, 'Lower back': 1, Hamstrings: 1, Glutes: 1, Traps: 0.5, Forearms: 0.5 },
  Hammer_Curls: { Biceps: 1, Forearms: 0.5 },
  Cross_Body_Hammer_Curl: { Biceps: 1, Forearms: 0.5 },
  'Cable_Hammer_Curls_-_Rope_Attachment': { Biceps: 1, Forearms: 0.5 },
  Zottman_Curl: { Biceps: 1, Forearms: 1 },
  Reverse_Barbell_Curl: { Forearms: 1, Biceps: 0.5 },
  Standing_Dumbbell_Reverse_Curl: { Forearms: 1, Biceps: 0.5 },
  Reverse_Cable_Curl: { Forearms: 1, Biceps: 0.5 },
  Russian_Twist: { Obliques: 1, Abs: 0.5 },
  Standing_Cable_Wood_Chop: { Obliques: 1, Abs: 0.5 },
  Dumbbell_Side_Bend: { Obliques: 1 },
  Side_Bridge: { Obliques: 1, Abs: 0.5 },
  Oblique_Crunches: { Obliques: 1, Abs: 0.5 },
  Pallof_Press: { Obliques: 1, Abs: 0.5 },
  Hanging_Leg_Raise: { Abs: 1, Obliques: 0.5 },
  Knee_Hip_Raise_On_Parallel_Bars: { Abs: 1, Obliques: 0.5 },
  Air_Bike: { Abs: 1, Obliques: 1 },
  Hyperextensions_Back_Extensions: { 'Lower back': 1, Glutes: 0.5, Hamstrings: 0.5 },
  Reverse_Hyperextension: { Glutes: 1, Hamstrings: 1, 'Lower back': 0.5 },
  Barbell_Hip_Thrust: { Glutes: 1, Hamstrings: 0.5 },
  Thigh_Adductor: { Adductors: 1 },
  Thigh_Abductor: { Glutes: 1 }
}

const ROW_PRIMARIES = new Set(['lats', 'middle back'])

export function getMuscleCredits (exercise: Pick<Exercise, 'id' | 'primaryMuscles' | 'secondaryMuscles'>): MuscleCredits {
  const override = CREDIT_OVERRIDES[exercise.id]
  if (override) return override

  const credits: MuscleCredits = {}
  const add = (group: MuscleGroup, credit: number) => { credits[group] = Math.max(credits[group] ?? 0, credit) }
  const isPull = exercise.primaryMuscles.some(muscle => ROW_PRIMARIES.has(muscle))

  exercise.primaryMuscles.forEach(muscle => {
    const group = GROUP_BY_DATASET_MUSCLE[muscle]
    if (group) add(group, PRIMARY_CREDIT)
  })
  exercise.secondaryMuscles.forEach(muscle => {
    // Calves barely work in squats and hinges, so the dataset's calf secondaries are ignored
    if (muscle === 'calves') return
    // Shoulders helping a row or pulldown are the rear delts
    const group = isPull && muscle === 'shoulders' ? 'Rear delts' : GROUP_BY_DATASET_MUSCLE[muscle]
    if (group) add(group, SECONDARY_CREDIT)
  })
  return credits
}

// The muscle an exercise is filed under: its strongest credit, in MUSCLE_GROUPS order on ties
export function getPrimaryGroup (exercise: Pick<Exercise, 'id' | 'primaryMuscles' | 'secondaryMuscles'> | undefined): MuscleGroup | null {
  if (!exercise) return null
  const credits = getMuscleCredits(exercise)
  let best: MuscleGroup | null = null
  let bestCredit = 0
  for (const group of MUSCLE_GROUPS) {
    const credit = credits[group] ?? 0
    if (credit > bestCredit) {
      best = group
      bestCredit = credit
    }
  }
  return best
}

export const DAY_TYPE_BY_GROUP: Record<MuscleGroup, DayType> = {
  Chest: 'push',
  Shoulders: 'push',
  Triceps: 'push',
  Neck: 'push',
  Back: 'pull',
  'Rear delts': 'pull',
  Traps: 'pull',
  'Lower back': 'pull',
  Biceps: 'arms',
  Forearms: 'arms',
  Abs: 'arms',
  Obliques: 'arms',
  Quads: 'legs',
  Hamstrings: 'legs',
  Glutes: 'legs',
  Adductors: 'legs',
  Calves: 'legs'
}

// Gives each exercise the accent colour of the muscle it is filed under
export function getExerciseDayType (exercise: Pick<Exercise, 'id' | 'primaryMuscles' | 'secondaryMuscles'> | undefined): DayType {
  const group = getPrimaryGroup(exercise)
  return group ? DAY_TYPE_BY_GROUP[group] : 'push'
}
