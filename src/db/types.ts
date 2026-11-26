export type DayType = 'push' | 'pull' | 'legs' | 'arms'
export type Unit = 'kg' | 'lb'
export type RotationMode = 'rolling' | 'fixed'

export interface Exercise {
  id: string
  name: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipment: string | null
  category: string
  images: string[]
  instructions: string[]
}

// Warm-up and stretch items are timed: sets are rounds and repMin/repMax hold the seconds
export type ItemPhase = 'warmup' | 'stretch'

export interface PlanItem {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
  restSec: number
  phase?: ItemPhase
}

export interface Plan {
  id?: number
  name: string
}

export interface PlanDay {
  id?: number
  planId: number
  order: number
  name: string
  type: DayType
  items: PlanItem[]
}

export interface Workout {
  id?: number
  planDayId: number
  dayName: string
  dayType: DayType
  items: PlanItem[]
  startedAt: number
  endedAt?: number
  notes?: string
}

export interface WorkoutSet {
  id?: number
  workoutId: number
  exerciseId: string
  setIndex: number
  weight: number
  reps: number
  done: boolean
  createdAt: number
}

export interface Settings {
  unit: Unit
  rotationMode: RotationMode
  activePlanId: number
  isRestTimerEnabled: boolean
  restDefault: number
  increment: number
  weeklyTarget: number
  weekdayPlan: Record<number, number | null>
  // Exercise id -> YouTube video id the user picked instead of the built-in tutorial
  tutorialVideos: Record<string, string>
}

export interface SettingRow {
  key: keyof Settings
  value: Settings[keyof Settings]
}

export interface BackupFile {
  version: 2
  plans: Plan[]
  planDays: PlanDay[]
  workouts: Workout[]
  sets: WorkoutSet[]
  settings: SettingRow[]
}
