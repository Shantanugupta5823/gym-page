import { db } from '@/db/db'
import { useLiveQuery } from 'dexie-react-hooks'
import type { DayType, Plan, PlanDay, PlanItem } from '@/db/types'

export interface NewPlanDay {
  name: string
  type: DayType
  items: PlanItem[]
}

export async function getActivePlanId (): Promise<number> {
  const row = await db.settings.get('activePlanId')
  return Number(row?.value ?? 0)
}

export async function getActivePlanDays (): Promise<PlanDay[]> {
  return db.planDays.where('planId').equals(await getActivePlanId()).sortBy('order')
}

export function usePlans (): Plan[] | undefined {
  return useLiveQuery(() => db.plans.orderBy('id').toArray(), [])
}

export async function createPlan (name: string, days: NewPlanDay[]): Promise<number> {
  return db.transaction('rw', db.plans, db.planDays, async () => {
    const planId = await db.plans.add({ name })
    await db.planDays.bulkAdd(days.map((day, index) => ({ ...day, planId, order: index + 1 })))
    return planId
  })
}

// Weekday mappings point at day ids of one plan, so they are cleared on every switch
export async function setActivePlan (planId: number): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    await db.settings.put({ key: 'activePlanId', value: planId })
    await db.settings.delete('weekdayPlan')
  })
}

export async function renamePlan (planId: number, name: string): Promise<void> {
  await db.plans.update(planId, { name })
}

export async function duplicatePlan (planId: number): Promise<void> {
  const [plan, days] = await Promise.all([db.plans.get(planId), db.planDays.where('planId').equals(planId).sortBy('order')])
  if (!plan) return
  const copyId = await createPlan(`${plan.name} copy`, days.map(({ name, type, items }) => ({ name, type, items })))
  await setActivePlan(copyId)
}

// The last remaining plan cannot be deleted; deleting the active one switches to the first other plan
export async function deletePlan (planId: number): Promise<void> {
  await db.transaction('rw', db.plans, db.planDays, db.settings, async () => {
    const plans = await db.plans.orderBy('id').toArray()
    const remaining = plans.filter(plan => plan.id !== planId)
    if (remaining.length === 0) return

    await db.planDays.where('planId').equals(planId).delete()
    await db.plans.delete(planId)
    if (await getActivePlanId() === planId) await setActivePlan(remaining[0].id ?? 0)
  })
}
