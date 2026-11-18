import { db } from '@/db/db'
import { ImportFileError } from '@/lib/errors'
import { seedPlanAndSettings } from '@/db/seed'
import type { BackupFile } from '@/db/types'

const BACKUP_VERSION = 1

function isBackupFile (value: unknown): value is BackupFile {
  if (typeof value !== 'object' || value === null) return false
  const file = value as Record<string, unknown>
  const keys = ['planDays', 'workouts', 'sets', 'bodyweight', 'settings']
  return file.version === BACKUP_VERSION && keys.every(key => Array.isArray(file[key]))
}

export async function exportBackup (): Promise<BackupFile> {
  const [planDays, workouts, sets, bodyweight, settings] = await Promise.all([
    db.planDays.toArray(),
    db.workouts.toArray(),
    db.sets.toArray(),
    db.bodyweight.toArray(),
    db.settings.toArray()
  ])
  return { version: BACKUP_VERSION, planDays, workouts, sets, bodyweight, settings }
}

export async function importBackup (text: string): Promise<void> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportFileError('The file is not valid JSON')
  }
  if (!isBackupFile(parsed)) throw new ImportFileError('The file is not a Gym Log backup')

  await db.transaction('rw', [db.planDays, db.workouts, db.sets, db.bodyweight, db.settings], async () => {
    await Promise.all([db.planDays.clear(), db.workouts.clear(), db.sets.clear(), db.bodyweight.clear(), db.settings.clear()])
    await db.planDays.bulkAdd(parsed.planDays)
    await db.workouts.bulkAdd(parsed.workouts)
    await db.sets.bulkAdd(parsed.sets)
    await db.bodyweight.bulkAdd(parsed.bodyweight)
    await db.settings.bulkAdd(parsed.settings)
  })
}

export async function resetData (): Promise<void> {
  await db.transaction('rw', [db.planDays, db.workouts, db.sets, db.bodyweight, db.settings], async () => {
    await Promise.all([db.planDays.clear(), db.workouts.clear(), db.sets.clear(), db.bodyweight.clear(), db.settings.clear()])
    await seedPlanAndSettings()
  })
}
