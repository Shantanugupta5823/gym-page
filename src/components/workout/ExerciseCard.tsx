import { SetRow } from '@/components/workout/SetRow'
import { ExerciseImage } from '@/components/ExerciseImage'
import { addSet, deleteSet } from '@/db/workouts'
import { capitalize, formatRepRange } from '@/lib/plan'
import { shouldIncreaseWeight } from '@/lib/progression'
import { toDisplayWeight } from '@/lib/units'
import { isBodyweight } from '@/lib/sets'
import { useLastSession } from '@/db/queries'
import type { Exercise, PlanItem, Unit, WorkoutSet } from '@/db/types'

interface ExerciseCardProps {
  workoutId: number
  item: PlanItem
  exercise: Exercise | undefined
  sets: WorkoutSet[]
  unit: Unit
  increment: number
  accentBg: string
  onSetDone: () => void
}

export const ExerciseCard = ({ workoutId, item, exercise, sets, unit, increment, accentBg, onSetDone }: ExerciseCardProps) => {
  const lastSession = useLastSession(item.exerciseId, workoutId) ?? []
  const hasHint = shouldIncreaseWeight(lastSession, item.repMax)

  return (
    <section className="rounded-3xl bg-surface p-4">
      <div className="flex gap-3">
        <ExerciseImage exercise={exercise} className="size-24 shrink-0 rounded-2xl" />
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold leading-tight">{exercise?.name ?? item.exerciseId}</h2>
          <p className="mt-1 text-xs text-muted">{(exercise?.primaryMuscles ?? []).map(capitalize).join(', ')}</p>
          <p className="mt-1 text-sm">{item.sets} × {formatRepRange(item)} reps</p>
          {isBodyweight(exercise) && <p className="mt-0.5 text-xs text-muted">Bodyweight: enter added weight, or 0</p>}
          {hasHint && (
            <span className="mt-1 inline-block rounded-full bg-push/15 px-2 py-0.5 text-xs font-semibold text-push">
              ↑ try +{toDisplayWeight(increment, unit)} {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[2rem_1fr_4.5rem_4rem_2.75rem] gap-2 px-2 text-xs text-muted">
        <span className="text-center">SET</span>
        <span>LAST TIME</span>
        <span className="text-center">{unit.toUpperCase()}</span>
        <span className="text-center">REPS</span>
        <span />
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        {sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            position={index + 1}
            lastSet={lastSession[Math.min(index, lastSession.length - 1)]}
            exercise={exercise}
            unit={unit}
            accentBg={accentBg}
            onDone={onSetDone}
          />
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button className="min-h-11 flex-1 rounded-xl border border-border text-sm text-muted" onClick={() => addSet(workoutId, item.exerciseId)}>
          + Add set
        </button>
        <button
          className="min-h-11 flex-1 rounded-xl border border-border text-sm text-muted disabled:opacity-40"
          disabled={sets.length <= 1}
          onClick={() => deleteSet(sets[sets.length - 1].id ?? 0)}
        >
          − Remove set
        </button>
      </div>
    </section>
  )
}
