import type { DayType, ItemPhase } from './types.ts'

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
  type: DayType
  items: SeedItem[]
}

const REST_STRENGTH_SEC = 180
const REST_COMPOUND_SEC = 120
const REST_ISOLATION_SEC = 75
const REST_PUMP_SEC = 60

const item = (exerciseId: string, sets: number, repMin: number, repMax: number, restSec: number): SeedItem => ({ exerciseId, sets, repMin, repMax, restSec })

// One heavy lift a day builds strength; the rest is hypertrophy work for shape
const strength = (exerciseId: string): SeedItem => item(exerciseId, 4, 5, 8, REST_STRENGTH_SEC)
const compound = (exerciseId: string, sets = 3, repMin = 8, repMax = 12): SeedItem => item(exerciseId, sets, repMin, repMax, REST_COMPOUND_SEC)
const isolation = (exerciseId: string, sets = 3, repMin = 10, repMax = 15): SeedItem => item(exerciseId, sets, repMin, repMax, REST_ISOLATION_SEC)
const pump = (exerciseId: string, sets = 3, repMin = 12, repMax = 20): SeedItem => item(exerciseId, sets, repMin, repMax, REST_PUMP_SEC)

// Four-day rotation trained every day: every body-map muscle is hit at least once per rotation, and the
// aesthetic priorities (delts, arms, back width, neck, core) twice. Exercise ids must exist in curatedExercises.ts
const MAIN_DAYS: SeedDay[] = [
  {
    name: 'Push',
    type: 'push',
    items: [
      strength('Barbell_Bench_Press_-_Medium_Grip'),
      compound('Incline_Dumbbell_Press'),
      compound('Seated_Dumbbell_Press'),
      isolation('Low_Cable_Crossover', 3, 12, 15),
      pump('Side_Lateral_Raise', 4),
      isolation('Triceps_Pushdown_-_Rope_Attachment'),
      isolation('Cable_Rope_Overhead_Triceps_Extension'),
      pump('Lying_Face_Up_Plate_Neck_Resistance', 2, 15, 20)
    ]
  },
  {
    name: 'Pull',
    type: 'pull',
    items: [
      strength('Pullups'),
      item('Bent_Over_Barbell_Row', 3, 6, 10, 150),
      compound('Seated_Cable_Rows'),
      pump('Face_Pull'),
      item('Barbell_Shrug', 3, 8, 12, 90),
      isolation('Incline_Dumbbell_Curl', 3, 8, 12),
      isolation('Hammer_Curls'),
      pump('Lying_Face_Down_Plate_Neck_Resistance', 2, 15, 20)
    ]
  },
  {
    name: 'Legs',
    type: 'legs',
    items: [
      strength('Barbell_Full_Squat'),
      item('Romanian_Deadlift', 3, 6, 10, 150),
      compound('Leg_Press', 3, 10, 15),
      compound('Barbell_Hip_Thrust'),
      isolation('Lying_Leg_Curls'),
      pump('Thigh_Adductor', 2, 12, 15),
      pump('Standing_Calf_Raises', 4, 10, 15),
      pump('Hanging_Leg_Raise', 3, 10, 15)
    ]
  },
  {
    name: 'Delts & Arms',
    type: 'arms',
    items: [
      strength('Standing_Military_Press'),
      compound('Chin-Up', 3, 6, 10),
      pump('Cable_Seated_Lateral_Raise'),
      pump('Cable_Rear_Delt_Fly'),
      isolation('EZ-Bar_Curl', 3, 8, 12),
      isolation('EZ-Bar_Skullcrusher', 3, 8, 12),
      pump('Reverse_Barbell_Curl', 2, 10, 15),
      pump('Cable_Crunch', 3, 10, 15),
      pump('Standing_Cable_Wood_Chop', 3, 12, 15),
      item('Isometric_Neck_Exercise_-_Sides', 2, 10, 15, 45)
    ]
  }
]

const PREP_ROUND_SEC = 30
const WARMUP_CARDIO_SEC = 300
const STRETCH_ROUNDS = 2

// Warm-up and stretch items are timed: sets are rounds, repMin/repMax are seconds, and there is no rest
const warmup = (exerciseId: string, seconds: number = PREP_ROUND_SEC): SeedItem => ({ exerciseId, sets: 1, repMin: seconds, repMax: seconds, restSec: 0, phase: 'warmup' })
const stretch = (exerciseId: string): SeedItem => ({ exerciseId, sets: STRETCH_ROUNDS, repMin: PREP_ROUND_SEC, repMax: PREP_ROUND_SEC, restSec: 0, phase: 'stretch' })

const PREP_BY_TYPE: Record<DayType, { warmups: SeedItem[], stretches: SeedItem[] }> = {
  push: {
    warmups: [warmup('Rowing_Stationary', WARMUP_CARDIO_SEC), warmup('Arm_Circles'), warmup('Shoulder_Circles'), warmup('Wrist_Circles')],
    stretches: [stretch('Behind_Head_Chest_Stretch'), stretch('Chest_And_Front_Of_Shoulder_Stretch'), stretch('Triceps_Stretch'), stretch('Side_Neck_Stretch')]
  },
  pull: {
    warmups: [warmup('Rowing_Stationary', WARMUP_CARDIO_SEC), warmup('Arm_Circles'), warmup('Cat_Stretch'), warmup('Band_Pull_Apart')],
    stretches: [stretch('Overhead_Lat'), stretch('Childs_Pose'), stretch('Standing_Biceps_Stretch'), stretch('Chin_To_Chest_Stretch')]
  },
  legs: {
    warmups: [warmup('Walking_Treadmill', WARMUP_CARDIO_SEC), warmup('Standing_Hip_Circles'), warmup('Worlds_Greatest_Stretch'), warmup('Inchworm')],
    stretches: [stretch('Quad_Stretch'), stretch('Hamstring_Stretch'), stretch('Calf_Stretch_Hands_Against_Wall'), stretch('Seated_Glute'), stretch('Kneeling_Hip_Flexor')]
  },
  arms: {
    warmups: [warmup('Rowing_Stationary', WARMUP_CARDIO_SEC), warmup('Arm_Circles'), warmup('Shoulder_Circles'), warmup('Elbow_Circles'), warmup('Wrist_Circles')],
    stretches: [stretch('Shoulder_Stretch'), stretch('Standing_Biceps_Stretch'), stretch('Overhead_Triceps'), stretch('Kneeling_Forearm_Stretch'), stretch('Side_Neck_Stretch')]
  }
}

// Warm-ups come first, stretches last, so a session runs warm-up, lifts, cool-down
export function addPrepItems (type: SeedDay['type'], items: SeedItem[]): SeedItem[] {
  const { warmups, stretches } = PREP_BY_TYPE[type]
  return [...warmups, ...items, ...stretches]
}

export const SEED_PLAN: SeedDay[] = MAIN_DAYS.map(day => ({ ...day, items: addPrepItems(day.type, day.items) }))
