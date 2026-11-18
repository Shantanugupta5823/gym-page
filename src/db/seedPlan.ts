export interface SeedItem {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
  restSec: number
}

export interface SeedDay {
  name: string
  type: 'push' | 'pull' | 'legs'
  items: SeedItem[]
}

const REST_COMPOUND_SEC = 150
const REST_ISOLATION_SEC = 75

const compound = (exerciseId: string, sets: number, repMin: number, repMax: number): SeedItem => ({ exerciseId, sets, repMin, repMax, restSec: REST_COMPOUND_SEC })
const isolation = (exerciseId: string, sets: number, repMin: number, repMax: number): SeedItem => ({ exerciseId, sets, repMin, repMax, restSec: REST_ISOLATION_SEC })

// Exercise ids are free-exercise-db ids
export const SEED_PLAN: SeedDay[] = [
  {
    name: 'Push A',
    type: 'push',
    items: [
      compound('Barbell_Bench_Press_-_Medium_Grip', 4, 5, 8),
      compound('Incline_Dumbbell_Press', 3, 8, 10),
      compound('Standing_Military_Press', 3, 6, 8),
      isolation('Side_Lateral_Raise', 3, 12, 15),
      isolation('Cable_Crossover', 3, 12, 12),
      isolation('Triceps_Pushdown', 3, 10, 12)
    ]
  },
  {
    name: 'Pull A',
    type: 'pull',
    items: [
      compound('Barbell_Deadlift', 3, 3, 5),
      compound('Bent_Over_Barbell_Row', 4, 6, 8),
      compound('Wide-Grip_Lat_Pulldown', 3, 8, 10),
      isolation('Face_Pull', 3, 15, 15),
      isolation('Barbell_Curl', 3, 8, 10),
      isolation('Hammer_Curls', 3, 10, 12)
    ]
  },
  {
    name: 'Legs A',
    type: 'legs',
    items: [
      compound('Barbell_Full_Squat', 4, 5, 8),
      compound('Romanian_Deadlift', 3, 8, 10),
      compound('Leg_Press', 3, 10, 12),
      isolation('Seated_Leg_Curl', 3, 10, 12),
      isolation('Standing_Calf_Raises', 4, 10, 15),
      isolation('Hanging_Leg_Raise', 3, 12, 12)
    ]
  },
  {
    name: 'Push B',
    type: 'push',
    items: [
      compound('Standing_Military_Press', 4, 5, 8),
      compound('Barbell_Incline_Bench_Press_-_Medium_Grip', 3, 8, 10),
      compound('Dips_-_Triceps_Version', 3, 8, 12),
      isolation('Cable_Seated_Lateral_Raise', 3, 12, 15),
      isolation('Butterfly', 3, 12, 15),
      isolation('Cable_Rope_Overhead_Triceps_Extension', 3, 10, 12)
    ]
  },
  {
    name: 'Pull B',
    type: 'pull',
    items: [
      compound('Pullups', 4, 6, 10),
      compound('Seated_Cable_Rows', 3, 8, 12),
      compound('One-Arm_Dumbbell_Row', 3, 10, 10),
      isolation('Reverse_Flyes', 3, 15, 15),
      isolation('Incline_Dumbbell_Curl', 3, 10, 12),
      isolation('Dumbbell_Shrug', 3, 12, 12)
    ]
  },
  {
    name: 'Legs B',
    type: 'legs',
    items: [
      compound('Hack_Squat', 4, 8, 10),
      compound('Split_Squats', 3, 10, 10),
      isolation('Leg_Extensions', 3, 12, 15),
      isolation('Lying_Leg_Curls', 3, 12, 12),
      compound('Barbell_Hip_Thrust', 3, 10, 10),
      isolation('Seated_Calf_Raise', 4, 15, 15)
    ]
  }
]
