import { Select } from '@/components/Select'
import { createPlan, deletePlan, duplicatePlan, renamePlan, setActivePlan } from '@/db/plans'
import type { Plan } from '@/db/types'

interface PlanSwitcherProps {
  plans: Plan[]
  activePlanId: number
  isEditing: boolean
}

export const PlanSwitcher = ({ plans, activePlanId, isEditing }: PlanSwitcherProps) => {
  const activePlan = plans.find(plan => plan.id === activePlanId)

  async function handleNew (): Promise<void> {
    const name = window.prompt('Name for the new plan?')?.trim()
    if (name) await setActivePlan(await createPlan(name, []))
  }

  async function handleRename (): Promise<void> {
    const name = window.prompt('Rename plan', activePlan?.name)?.trim()
    if (name) await renamePlan(activePlanId, name)
  }

  async function handleDelete (): Promise<void> {
    if (window.confirm(`Delete "${activePlan?.name}" and all its days? Past workouts are kept.`)) await deletePlan(activePlanId)
  }

  return (
    <section className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
      <p className="text-xs text-muted">Active plan</p>
      <Select
        title="Plan"
        className="min-h-12"
        value={String(activePlanId)}
        options={plans.map(plan => ({ value: String(plan.id), label: plan.name }))}
        onChange={value => setActivePlan(Number(value))}
      />
      {isEditing && (
        <div className="grid grid-cols-2 gap-2">
          <button className="min-h-11 rounded-xl bg-surface-2 text-sm" onClick={handleRename}>Rename</button>
          <button className="min-h-11 rounded-xl bg-surface-2 text-sm" onClick={() => duplicatePlan(activePlanId)}>Duplicate</button>
          <button className="min-h-11 rounded-xl bg-surface-2 text-sm" onClick={handleNew}>+ New plan</button>
          <button className="min-h-11 rounded-xl bg-surface-2 text-sm text-red-400 disabled:opacity-40" disabled={plans.length <= 1} onClick={handleDelete}>Delete plan</button>
        </div>
      )}
    </section>
  )
}
