import { Dexie } from 'dexie'
import type { Table } from 'dexie'
import { addPrepItems } from '@/db/seedPlan'
import type { Exercise, Plan, PlanDay, SettingRow, Workout, WorkoutSet } from '@/db/types'

export const DEFAULT_PLAN_NAME = 'My plan'

class GymDb extends Dexie {
  exercises!: Table<Exercise, string>
  plans!: Table<Plan, number>
  planDays!: Table<PlanDay, number>
  workouts!: Table<Workout, number>
  sets!: Table<WorkoutSet, number>
  settings!: Table<SettingRow, string>

  constructor () {
    super('gym-log')
    this.version(1).stores({
      exercises: 'id, name',
      planDays: '++id, order',
      workouts: '++id, planDayId, startedAt, endedAt',
      sets: '++id, workoutId, exerciseId, [exerciseId+createdAt]',
      settings: 'key'
    })
    // The library is now curated and the plan is the new PPL split, so both are reseeded on next start
    this.version(2).stores({ bodyweight: null }).upgrade(async transaction => {
      await transaction.table('exercises').clear()
      await transaction.table('planDays').clear()
    })
    // The plan now has 3-5 exercises per muscle group, so it is reseeded again
    this.version(3).upgrade(async transaction => {
      await transaction.table('planDays').clear()
    })
    // Seed plan now uses 2-3 sets and load-based rep ranges, so it is reseeded again
    this.version(4).upgrade(async transaction => {
      await transaction.table('planDays').clear()
    })
    // Existing plans keep their edits and just gain the default warm-up and stretch items
    this.version(5).upgrade(async transaction => {
      await transaction.table('planDays').toCollection().modify((day: PlanDay) => {
        if (day.items.some(item => item.phase)) return
        day.items = addPrepItems(day.type, day.items)
      })
    })
    // Several plans: existing days move into one plan, which stays active
    this.version(6).stores({ plans: '++id', planDays: '++id, order, planId' }).upgrade(async transaction => {
      if (await transaction.table('planDays').count() === 0) return
      const planId = await transaction.table('plans').add({ name: DEFAULT_PLAN_NAME })
      await transaction.table('planDays').toCollection().modify({ planId })
      await transaction.table('settings').put({ key: 'activePlanId', value: planId })
    })
  }
}

export const db = new GymDb()
