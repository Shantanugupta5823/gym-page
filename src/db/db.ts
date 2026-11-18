import { Dexie } from 'dexie'
import type { Table } from 'dexie'
import type { BodyweightEntry, Exercise, PlanDay, SettingRow, Workout, WorkoutSet } from '@/db/types'

class GymDb extends Dexie {
  exercises!: Table<Exercise, string>
  planDays!: Table<PlanDay, number>
  workouts!: Table<Workout, number>
  sets!: Table<WorkoutSet, number>
  bodyweight!: Table<BodyweightEntry, number>
  settings!: Table<SettingRow, string>

  constructor () {
    super('gym-log')
    this.version(1).stores({
      exercises: 'id, name',
      planDays: '++id, order',
      workouts: '++id, planDayId, startedAt, endedAt',
      sets: '++id, workoutId, exerciseId, [exerciseId+createdAt]',
      bodyweight: '++id, date',
      settings: 'key'
    })
  }
}

export const db = new GymDb()
