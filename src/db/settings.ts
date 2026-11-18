import { db } from '@/db/db'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Settings } from '@/db/types'

export const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  rotationMode: 'rolling',
  restDefault: 90,
  increment: 2.5,
  weeklyTarget: 6,
  weekdayPlan: {}
}

export function useSettings (): Settings {
  const rows = useLiveQuery(() => db.settings.toArray(), [])
  const stored = Object.fromEntries((rows ?? []).map(row => [row.key, row.value]))
  return { ...DEFAULT_SETTINGS, ...stored }
}

export async function setSetting<K extends keyof Settings> (key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value })
}
