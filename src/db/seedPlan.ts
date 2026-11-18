import type { ItemPhase } from './types.ts'

export interface SeedItem {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
  restSec: number
  phase?: ItemPhase
}

export interface SeedDay {
  name: string
  type: 'push' | 'pull' | 'legs'
  items: SeedItem[]
}

const REST_HEAVY_SEC = 150
const REST_MEDIUM_SEC = 90
const REST_LIGHT_SEC = 60

// Rep ranges by load: heavy 8-12, medium 12-15, light 15-20
const heavy = (exerciseId: string, sets: number): SeedItem => ({ exerciseId, sets, repMin: 8, repMax: 12, restSec: REST_HEAVY_SEC })
const medium = (exerciseId: string, sets: number): SeedItem => ({ exerciseId, sets, repMin: 12, repMax: 15, restSec: REST_MEDIUM_SEC })
const light = (exerciseId: string, sets: number): SeedItem => ({ exerciseId, sets, repMin: 15, repMax: 20, restSec: REST_LIGHT_SEC })

// Exercise ids are free-exercise-db ids and must exist in curatedExercises.ts
// Each muscle gets 3-5 exercises per day; items are grouped by muscle in the order trained
const MAIN_DAYS: SeedDay[] = [
  {
    name: 'Push A',
    type: 'push',
    items: [
      heavy('Barbell_Bench_Press_-_Medium_Grip', 3),
      heavy('Incline_Dumbbell_Press', 3),
      heavy('Leverage_Chest_Press', 3),
      medium('Cable_Crossover', 2),
      medium('Dumbbell_Flyes', 2),
      medium('Triceps_Pushdown', 2),
      medium('Cable_Rope_Overhead_Triceps_Extension', 2),
      medium('EZ-Bar_Skullcrusher', 2),
      light('Palms-Up_Barbell_Wrist_Curl_Over_A_Bench', 2),
      light('Palms-Down_Wrist_Curl_Over_A_Bench', 2),
      medium('Reverse_Barbell_Curl', 2),
      light('Finger_Curls', 2)
    ]
  },
  {
    name: 'Pull A',
    type: 'pull',
    items: [
      heavy('Pullups', 3),
      heavy('Bent_Over_Barbell_Row', 3),
      heavy('Seated_Cable_Rows', 3),
      medium('Straight-Arm_Pulldown', 2),
      heavy('One-Arm_Dumbbell_Row', 3),
      medium('Barbell_Curl', 2),
      medium('Incline_Dumbbell_Curl', 2),
      medium('Hammer_Curls', 2),
      medium('Preacher_Curl', 2),
      light('Cable_Crunch', 2),
      light('Hanging_Leg_Raise', 2),
      light('Ab_Crunch_Machine', 2)
    ]
  },
  {
    name: 'Legs A',
    type: 'legs',
    items: [
      heavy('Barbell_Full_Squat', 3),
      heavy('Leg_Press', 3),
      heavy('Dumbbell_Lunges', 3),
      medium('Leg_Extensions', 2),
      heavy('Standing_Military_Press', 3),
      heavy('Seated_Dumbbell_Press', 3),
      light('Side_Lateral_Raise', 2),
      light('Reverse_Machine_Flyes', 2),
      light('Seated_Dumbbell_Palms-Up_Wrist_Curl', 2),
      light('Seated_Dumbbell_Palms-Down_Wrist_Curl', 2),
      medium('Standing_Dumbbell_Reverse_Curl', 2)
    ]
  },
  {
    name: 'Push B',
    type: 'push',
    items: [
      heavy('Barbell_Incline_Bench_Press_-_Medium_Grip', 3),
      heavy('Dumbbell_Bench_Press', 3),
      medium('Incline_Cable_Flye', 2),
      medium('Butterfly', 2),
      heavy('Close-Grip_Barbell_Bench_Press', 3),
      heavy('Dips_-_Triceps_Version', 3),
      medium('Triceps_Pushdown_-_Rope_Attachment', 2),
      medium('Machine_Triceps_Extension', 2),
      light('Hanging_Leg_Raise', 2),
      light('Cable_Crunch', 2),
      light('Russian_Twist', 2)
    ]
  },
  {
    name: 'Pull B',
    type: 'pull',
    items: [
      heavy('Wide-Grip_Lat_Pulldown', 3),
      heavy('T-Bar_Row_with_Handle', 3),
      heavy('V-Bar_Pulldown', 3),
      medium('Leverage_High_Row', 2),
      medium('EZ-Bar_Curl', 2),
      medium('Cable_Hammer_Curls_-_Rope_Attachment', 2),
      medium('Concentration_Curls', 2),
      light('Cable_Wrist_Curl', 2),
      light('Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench', 2),
      medium('Reverse_Cable_Curl', 2),
      light('Seated_One-Arm_Dumbbell_Palms-Up_Wrist_Curl', 2)
    ]
  },
  {
    name: 'Legs B',
    type: 'legs',
    items: [
      heavy('Romanian_Deadlift', 3),
      medium('Lying_Leg_Curls', 2),
      medium('Seated_Leg_Curl', 2),
      heavy('Stiff-Legged_Dumbbell_Deadlift', 3),
      light('Standing_Calf_Raises', 2),
      light('Seated_Calf_Raise', 2),
      light('Calf_Press_On_The_Leg_Press_Machine', 2),
      heavy('Arnold_Dumbbell_Press', 3),
      light('Cable_Seated_Lateral_Raise', 2),
      light('Face_Pull', 2),
      light('Ab_Roller', 2),
      light('Reverse_Crunch', 2),
      light('Oblique_Crunches', 2)
    ]
  }
]

const PREP_ROUND_SEC = 30
const WARMUP_CARDIO_SEC = 300
const STRETCH_ROUNDS = 2

// Warm-up and stretch items are timed: sets are rounds, repMin/repMax are seconds, and there is no rest
const warmup = (exerciseId: string, seconds: number = PREP_ROUND_SEC): SeedItem => ({ exerciseId, sets: 1, repMin: seconds, repMax: seconds, restSec: 0, phase: 'warmup' })
const stretch = (exerciseId: string): SeedItem => ({ exerciseId, sets: STRETCH_ROUNDS, repMin: PREP_ROUND_SEC, repMax: PREP_ROUND_SEC, restSec: 0, phase: 'stretch' })

const PREP_BY_TYPE: Record<SeedDay['type'], { warmups: SeedItem[], stretches: SeedItem[] }> = {
  push: {
    warmups: [warmup('Rowing_Stationary', WARMUP_CARDIO_SEC), warmup('Arm_Circles'), warmup('Shoulder_Circles'), warmup('Wrist_Circles')],
    stretches: [stretch('Behind_Head_Chest_Stretch'), stretch('Chest_And_Front_Of_Shoulder_Stretch'), stretch('Triceps_Stretch'), stretch('Kneeling_Forearm_Stretch')]
  },
  pull: {
    warmups: [warmup('Rowing_Stationary', WARMUP_CARDIO_SEC), warmup('Arm_Circles'), warmup('Cat_Stretch'), warmup('Band_Pull_Apart')],
    stretches: [stretch('Overhead_Lat'), stretch('Childs_Pose'), stretch('Standing_Biceps_Stretch'), stretch('Middle_Back_Stretch')]
  },
  legs: {
    warmups: [warmup('Walking_Treadmill', WARMUP_CARDIO_SEC), warmup('Standing_Hip_Circles'), warmup('Worlds_Greatest_Stretch'), warmup('Inchworm')],
    stretches: [stretch('Quad_Stretch'), stretch('Hamstring_Stretch'), stretch('Calf_Stretch_Hands_Against_Wall'), stretch('Seated_Glute'), stretch('Shoulder_Stretch')]
  }
}

// Warm-ups come first, stretches last, so a session runs warm-up, lifts, cool-down
export function addPrepItems (type: SeedDay['type'], items: SeedItem[]): SeedItem[] {
  const { warmups, stretches } = PREP_BY_TYPE[type]
  return [...warmups, ...items, ...stretches]
}

export const SEED_PLAN: SeedDay[] = MAIN_DAYS.map(day => ({ ...day, items: addPrepItems(day.type, day.items) }))
