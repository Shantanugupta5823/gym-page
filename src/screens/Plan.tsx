import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '@/db/settings'
import { addPlanDay } from '@/db/plan'
import { usePlans } from '@/db/plans'
import { useExerciseMap, usePlanDays } from '@/db/queries'
import { PlanDayCard } from '@/components/plan/PlanDayCard'
import { PlanSwitcher } from '@/components/plan/PlanSwitcher'

export const Plan = () => {
  const settings = useSettings()
  const planDays = usePlanDays()
  const plans = usePlans()
  const exerciseMap = useExerciseMap()
  const [isEditing, setIsEditing] = useState(false)

  if (!planDays || !plans) return null

  return (
    <main className="flex flex-col gap-4 p-5">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Plan</h1>
        <div className="flex items-center gap-1">
          <button className="min-h-11 rounded-xl px-4 text-sm text-push" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <Link to="/settings" aria-label="Settings" className="flex size-11 items-center justify-center text-xl text-muted">⚙</Link>
        </div>
      </header>

      <PlanSwitcher plans={plans} activePlanId={settings.activePlanId} isEditing={isEditing} />

      {planDays.map((day, index) => (
        <PlanDayCard
          key={day.id}
          day={day}
          dayNumber={index + 1}
          exerciseMap={exerciseMap}
          isEditing={isEditing}
          restDefault={settings.restDefault}
          isRestTimerEnabled={settings.isRestTimerEnabled}
        />
      ))}

      {isEditing && (
        <button className="min-h-12 rounded-xl border border-dashed border-border text-sm text-muted" onClick={() => addPlanDay(settings.activePlanId)}>
          + Add day
        </button>
      )}
    </main>
  )
}
