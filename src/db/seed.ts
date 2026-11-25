import { db, DEFAULT_PLAN_NAME } from '@/db/db'
import { AppError } from '@/lib/errors'
import { SEED_PLAN } from '@/db/seedPlan'
import { CUSTOM_EXERCISES } from '@/db/customExercises'
import { createPlan, setActivePlan } from '@/db/plans'
import type { Exercise } from '@/db/types'

const EXERCISES_URL = `${import.meta.env.BASE_URL}exercises/exercises.json`
const FETCH_TIMEOUT_MS = 30_000

export async function seedDefaultPlan (): Promise<void> {
  await setActivePlan(await createPlan(DEFAULT_PLAN_NAME, SEED_PLAN))
}

export async function seedDatabase (): Promise<void> {
  const [exerciseCount, planCount] = await Promise.all([db.exercises.count(), db.plans.count()])

  if (exerciseCount === 0) {
    const response = await fetch(EXERCISES_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!response.ok) throw new AppError(`Exercise library responded ${response.status}`)
    await db.exercises.bulkPut([...await response.json() as Exercise[], ...CUSTOM_EXERCISES])
  }

  if (planCount === 0) await seedDefaultPlan()
}
