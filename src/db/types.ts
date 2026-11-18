export type DayType = 'push' | 'pull' | 'legs'
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

export interface PlanItem {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
  restSec: number
}

export interface PlanDay {
  id?: number
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

export interface BodyweightEntry {
  id?: number
  date: number
  kg: number
}

export interface Settings {
  unit: Unit
  rotationMode: RotationMode
  restDefault: number
  increment: number
  weeklyTarget: number
  weekdayPlan: Record<number, number | null>
}

export interface SettingRow {
  key: keyof Settings
  value: Settings[keyof Settings]
}

export interface BackupFile {
  version: 1
  planDays: PlanDay[]
  workouts: Workout[]
  sets: WorkoutSet[]
  bodyweight: BodyweightEntry[]
  settings: SettingRow[]
}
