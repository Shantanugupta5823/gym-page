import { db } from '@/db/db'
import { AppError } from '@/lib/errors'
import { SEED_PLAN } from '@/db/seedPlan'
import { DEFAULT_SETTINGS } from '@/db/settings'
import type { Exercise, SettingRow } from '@/db/types'

const EXERCISES_URL = `${import.meta.env.BASE_URL}exercises/exercises.json`
const FETCH_TIMEOUT_MS = 30_000

export async function seedPlanAndSettings (): Promise<void> {
  const settingRows = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value } as SettingRow))
  const planDays = SEED_PLAN.map((day, index) => ({ ...day, order: index + 1 }))

  await db.transaction('rw', db.planDays, db.settings, async () => {
    await db.settings.bulkPut(settingRows)
    await db.planDays.bulkAdd(planDays)
  })
}

export async function seedDatabase (): Promise<void> {
  const [exerciseCount, planDayCount] = await Promise.all([db.exercises.count(), db.planDays.count()])

  if (exerciseCount === 0) {
    const response = await fetch(EXERCISES_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!response.ok) throw new AppError(`Exercise library responded ${response.status}`)
    await db.exercises.bulkPut(await response.json() as Exercise[])
  }

  if (planDayCount === 0) await seedPlanAndSettings()
}
