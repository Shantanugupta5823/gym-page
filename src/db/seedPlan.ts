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

const REST_HEAVY_SEC = 180
const REST_COMPOUND_SEC = 120
const REST_ISOLATION_SEC = 75
const REST_SHORT_SEC = 60

const item = (exerciseId: string, sets: number, repMin: number, repMax: number, restSec: number): SeedItem => ({ exerciseId, sets, repMin, repMax, restSec })

// Heavy lifts get 4-5 sets; everything else 2-3, the way the plan was agreed
const heavy = (exerciseId: string, sets: number, repMin: number, repMax: number): SeedItem => item(exerciseId, sets, repMin, repMax, REST_HEAVY_SEC)
const compound = (exerciseId: string, sets: number, repMin: number, repMax: number): SeedItem => item(exerciseId, sets, repMin, repMax, REST_COMPOUND_SEC)
const isolation = (exerciseId: string, sets: number, repMin: number, repMax: number): SeedItem => item(exerciseId, sets, repMin, repMax, REST_ISOLATION_SEC)
const short = (exerciseId: string, sets: number, repMin: number, repMax: number): SeedItem => item(exerciseId, sets, repMin, repMax, REST_SHORT_SEC)

// Neck every day, light: front and back on days 1, 3 and 5; sides and chin tucks on days 2, 4 and 6
const NECK_FRONT_BACK = [short('Lying_Face_Up_Plate_Neck_Resistance', 2, 15, 20), short('Lying_Face_Down_Plate_Neck_Resistance', 2, 15, 20)]
const NECK_SIDES_TUCKS = [short('Isometric_Neck_Exercise_-_Sides', 2, 10, 15), short('Custom_Chin_Tuck', 2, 12, 12)]

// Forearms on days 1, 3 and 5; abs on days 2, 4 and 6. Farmer's walk and side plank reps are seconds
const FOREARMS = [
  isolation('Palms-Up_Barbell_Wrist_Curl_Over_A_Bench', 3, 15, 20),
  isolation('Palms-Down_Wrist_Curl_Over_A_Bench', 3, 15, 20),
  isolation('Reverse_Barbell_Curl', 3, 12, 15),
  short('Farmers_Walk', 2, 30, 40)
]
const ABS = [
  short('Hanging_Leg_Raise', 3, 12, 15),
  short('Cable_Crunch', 3, 12, 15),
  short('Dead_Bug', 2, 10, 12),
  short('Standing_Cable_Wood_Chop', 3, 12, 12),
  short('Side_Bridge', 2, 30, 45)
]

const CHEST_FLYES = [isolation('Cable_Crossover', 2, 12, 15), isolation('Butterfly', 2, 12, 15), isolation('Low_Cable_Crossover', 2, 12, 15)]
const BICEPS = [isolation('Dumbbell_Bicep_Curl', 2, 8, 12), isolation('Incline_Dumbbell_Curl', 2, 10, 12), isolation('Hammer_Curls', 2, 10, 12)]

// Six-day rotation, trained every day, with posture work (rounded shoulders, anterior pelvic tilt) daily.
// Pull A is back width (vertical pulls), Pull B back thickness (deadlift, rows). Legs are split quads / hamstrings,
// with extra volume for leg definition. Exercise ids must exist in curatedExercises.ts or customExercises.ts
const MAIN_DAYS: SeedDay[] = [
  {
    name: 'Push A · Chest & Triceps',
    type: 'push',
    items: [
      heavy('Incline_Dumbbell_Press', 5, 6, 8),
      compound('Dumbbell_Bench_Press', 4, 8, 10),
      ...CHEST_FLYES,
      isolation('Cable_Rope_Overhead_Triceps_Extension', 2, 10, 12),
      isolation('Triceps_Pushdown_-_Rope_Attachment', 2, 10, 15),
      isolation('Machine_Triceps_Extension', 2, 10, 12),
      compound('Dips_-_Triceps_Version', 2, 6, 12),
      ...FOREARMS,
      ...NECK_FRONT_BACK
    ]
  },
  {
    name: 'Pull A · Back Width & Biceps',
    type: 'pull',
    items: [
      heavy('Pullups', 4, 6, 8),
      compound('Wide-Grip_Lat_Pulldown', 3, 8, 10),
      isolation('One_Arm_Lat_Pulldown', 2, 10, 12),
      isolation('Straight-Arm_Pulldown', 2, 12, 15),
      short('Face_Pull', 3, 15, 20),
      ...BICEPS,
      ...ABS,
      ...NECK_SIDES_TUCKS
    ]
  },
  {
    name: 'Legs A · Quads & Shoulders',
    type: 'legs',
    items: [
      heavy('Barbell_Full_Squat', 5, 5, 8),
      item('Hack_Squat', 4, 8, 10, 150),
      compound('Leg_Press', 3, 10, 15),
      item('Split_Squat_with_Dumbbells', 3, 8, 10, 90),
      isolation('Leg_Extensions', 3, 12, 15),
      short('Thigh_Adductor', 2, 12, 15),
      short('Standing_Calf_Raises', 3, 10, 15),
      compound('Seated_Dumbbell_Press', 4, 6, 10),
      short('Side_Lateral_Raise', 3, 12, 20),
      short('Reverse_Machine_Flyes', 2, 15, 20),
      ...FOREARMS,
      ...NECK_FRONT_BACK
    ]
  },
  {
    name: 'Push B · Chest & Triceps',
    type: 'push',
    items: [
      heavy('Dumbbell_Bench_Press', 5, 6, 8),
      compound('Incline_Dumbbell_Press', 4, 8, 10),
      isolation('Low_Cable_Crossover', 2, 12, 15),
      isolation('Cable_Crossover', 2, 12, 15),
      isolation('Butterfly', 2, 12, 15),
      compound('Dips_-_Triceps_Version', 2, 6, 12),
      isolation('Cable_Rope_Overhead_Triceps_Extension', 2, 10, 12),
      isolation('Triceps_Pushdown_-_V-Bar_Attachment', 2, 10, 15),
      isolation('Machine_Triceps_Extension', 2, 10, 12),
      ...ABS,
      ...NECK_SIDES_TUCKS
    ]
  },
  {
    name: 'Pull B · Back Thickness & Biceps',
    type: 'pull',
    items: [
      heavy('Barbell_Deadlift', 5, 3, 6),
      item('T-Bar_Row_with_Handle', 4, 6, 10, 150),
      isolation('Dumbbell_Incline_Row', 2, 10, 12),
      item('Barbell_Shrug', 3, 10, 12, 90),
      short('Custom_Prone_Y_Raise', 2, 12, 15),
      isolation('Incline_Dumbbell_Curl', 2, 10, 12),
      isolation('Dumbbell_Bicep_Curl', 2, 8, 12),
      isolation('Hammer_Curls', 2, 10, 12),
      ...FOREARMS,
      ...NECK_FRONT_BACK
    ]
  },
  {
    name: 'Legs B · Hamstrings, Glutes & Shoulders',
    type: 'legs',
    items: [
      // Moderate weight: deadlifts were the day before
      item('Romanian_Deadlift', 4, 8, 10, 150),
      compound('Barbell_Hip_Thrust', 4, 8, 10),
      isolation('Lying_Leg_Curls', 4, 10, 12),
      compound('Custom_Wide_Leg_Press', 3, 10, 15),
      isolation('Custom_Single_Arm_DB_RDL', 2, 10, 12),
      short('Thigh_Abductor', 2, 15, 20),
      short('Seated_Calf_Raise', 3, 12, 15),
      compound('Machine_Shoulder_Military_Press', 3, 8, 12),
      short('Cable_Seated_Lateral_Raise', 3, 12, 15),
      short('Face_Pull', 2, 15, 20),
      ...ABS,
      ...NECK_SIDES_TUCKS
    ]
  }
]

const PREP_ROUND_SEC = 30
const STRETCH_ROUNDS = 2

// Warm-up and stretch items are timed: sets are rounds, repMin/repMax are seconds, and there is no rest
const warmup = (exerciseId: string, seconds: number = PREP_ROUND_SEC): SeedItem => ({ exerciseId, sets: 1, repMin: seconds, repMax: seconds, restSec: 0, phase: 'warmup' })
const stretch = (exerciseId: string): SeedItem => ({ exerciseId, sets: STRETCH_ROUNDS, repMin: PREP_ROUND_SEC, repMax: PREP_ROUND_SEC, restSec: 0, phase: 'stretch' })

// Block A, every day: activation first (rounded shoulders, then pelvic tilt), static stretches last
const POSTURE_WARMUPS = [
  { ...warmup('Band_Pull_Apart'), sets: 2 }, { ...warmup('Custom_Wall_Slide'), sets: 2 }, warmup('Rhomboids-SMR', 60),
  { ...warmup('Pelvic_Tilt_Into_Bridge'), sets: 2 }
]
const POSTURE_STRETCHES = [stretch('Chest_And_Front_Of_Shoulder_Stretch'), stretch('Intermediate_Hip_Flexor_and_Quad_Stretch')]

// Warm-ups come first, stretches last, so a session runs warm-up, lifts, cool-down
export function addPrepItems (_type: DayType, items: SeedItem[]): SeedItem[] {
  return [...POSTURE_WARMUPS, ...items, ...POSTURE_STRETCHES]
}

export const SEED_PLAN: SeedDay[] = MAIN_DAYS.map(day => ({ ...day, items: addPrepItems(day.type, day.items) }))
