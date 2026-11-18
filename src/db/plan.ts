import { db } from '@/db/db'
import type { DayType, PlanItem } from '@/db/types'

export async function updatePlanDay (id: number, patch: { name?: string, type?: DayType, items?: PlanItem[] }): Promise<void> {
  await db.planDays.update(id, patch)
}

export async function addPlanDay (): Promise<void> {
  const days = await db.planDays.toArray()
  const nextOrder = Math.max(0, ...days.map(day => day.order)) + 1
  await db.planDays.add({ order: nextOrder, name: `Day ${nextOrder}`, type: 'push', items: [] })
}

export async function deletePlanDay (id: number): Promise<void> {
  await db.planDays.delete(id)
}
