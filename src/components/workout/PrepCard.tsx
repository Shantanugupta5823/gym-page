import { ExerciseImage } from '@/components/ExerciseImage'
import { setSetDone } from '@/db/workouts'
import { capitalize, formatPrepTime } from '@/lib/plan'
import type { Exercise, ItemPhase, PlanItem, WorkoutSet } from '@/db/types'

interface PrepCardProps {
  item: PlanItem
  phase: ItemPhase
  exercise: Exercise | undefined
  sets: WorkoutSet[]
  accentBg: string
}

const PHASE_LABELS: Record<ItemPhase, { label: string, badge: string }> = {
  warmup: { label: 'Warm-up', badge: 'bg-legs/15 text-legs' },
  stretch: { label: 'Stretch', badge: 'bg-pull/15 text-pull' }
}

export const PrepCard = ({ item, phase, exercise, sets, accentBg }: PrepCardProps) => {
  const { label, badge } = PHASE_LABELS[phase]

  return (
    <section className="rounded-3xl bg-surface p-4">
      <div className="flex gap-3">
        <ExerciseImage exercise={exercise} className="size-24 shrink-0 rounded-2xl" />
        <div className="min-w-0">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badge}`}>{label}</span>
          <h2 className="mt-1 font-heading text-xl font-semibold leading-tight">{exercise?.name ?? item.exerciseId}</h2>
          <p className="mt-1 text-xs text-muted">{(exercise?.primaryMuscles ?? []).map(capitalize).join(', ')}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {sets.map((set, index) => (
          <button
            key={set.id}
            className={`flex min-h-12 items-center justify-between rounded-xl px-3 text-sm ${set.done ? `${accentBg} font-semibold text-bg` : 'bg-surface-2'}`}
            onClick={() => setSetDone(set.id ?? 0, !set.done)}
            aria-label={set.done ? 'Undo round' : 'Complete round'}
          >
            <span>Round {index + 1} · {formatPrepTime(item.repMin)}</span>
            <span className="font-bold">{set.done ? '✓' : '○'}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
