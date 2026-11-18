import { db } from '@/db/db'
import { ImportFileError } from '@/lib/errors'
import { seedDefaultPlan } from '@/db/seed'
import { createPlan, getActivePlanId, setActivePlan } from '@/db/plans'
import { parsePlanFile } from '@/lib/planFile'
import type { BackupFile } from '@/db/types'

export type ResetPart = 'history' | 'plan' | 'settings'

const BACKUP_VERSION = 2
const DEFAULT_IMPORTED_PLAN_NAME = 'Imported plan'

function isBackupFile (value: unknown): value is BackupFile {
  if (typeof value !== 'object' || value === null) return false
  const file = value as Record<string, unknown>
  const keys = ['plans', 'planDays', 'workouts', 'sets', 'settings']
  return file.version === BACKUP_VERSION && keys.every(key => Array.isArray(file[key]))
}

export async function exportBackup (): Promise<BackupFile> {
  const [plans, planDays, workouts, sets, settings] = await Promise.all([
    db.plans.toArray(),
    db.planDays.toArray(),
    db.workouts.toArray(),
    db.sets.toArray(),
    db.settings.toArray()
  ])
  return { version: BACKUP_VERSION, plans, planDays, workouts, sets, settings }
}

export async function importBackup (text: string): Promise<void> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportFileError('The file is not valid JSON')
  }
  if (!isBackupFile(parsed)) throw new ImportFileError('The file is not a Gym Log backup')

  await db.transaction('rw', [db.plans, db.planDays, db.workouts, db.sets, db.settings], async () => {
    await Promise.all([db.plans.clear(), db.planDays.clear(), db.workouts.clear(), db.sets.clear(), db.settings.clear()])
    await db.plans.bulkAdd(parsed.plans)
    await db.planDays.bulkAdd(parsed.planDays)
    await db.workouts.bulkAdd(parsed.workouts)
    await db.sets.bulkAdd(parsed.sets)
    await db.settings.bulkAdd(parsed.settings)
  })
}

// Resets only the chosen parts: history = workouts + sets, plan = all plans back to the seed split, settings = defaults
export async function resetData (parts: ResetPart[]): Promise<void> {
  const activePlanId = await getActivePlanId()
  await db.transaction('rw', [db.plans, db.planDays, db.workouts, db.sets, db.settings], async () => {
    if (parts.includes('history')) await Promise.all([db.workouts.clear(), db.sets.clear()])
    if (parts.includes('settings')) {
      await db.settings.clear()
      if (!parts.includes('plan')) await db.settings.put({ key: 'activePlanId', value: activePlanId })
    }
    if (parts.includes('plan')) {
      await Promise.all([db.plans.clear(), db.planDays.clear()])
      await seedDefaultPlan()
    }
  })
}

// Adds the file as a new plan and switches to it; existing plans and history are untouched
export async function importPlan (text: string): Promise<number> {
  const exerciseIds = await db.exercises.toCollection().primaryKeys()
  const plan = parsePlanFile(text, new Set(exerciseIds))

  await setActivePlan(await createPlan(plan.name ?? DEFAULT_IMPORTED_PLAN_NAME, plan.days))
  return plan.days.length
}

export async function exportExerciseList (): Promise<string[]> {
  const exercises = await db.exercises.orderBy('name').toArray()
  return exercises.map(exercise => `${exercise.id}\t${exercise.name}\t${exercise.primaryMuscles.join(', ')}`)
}
