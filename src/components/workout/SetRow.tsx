import { NumberInput } from '@/components/NumberInput'
import { SwipeRow } from '@/components/workout/SwipeRow'
import { fromDisplayWeight, toDisplayWeight } from '@/lib/units'
import { deleteSet, setSetDone, updateSet } from '@/db/workouts'
import type { Unit, WorkoutSet } from '@/db/types'

interface SetRowProps {
  set: WorkoutSet
  position: number
  lastSet: WorkoutSet | undefined
  unit: Unit
  accentBg: string
  onDone: () => void
}

export const SetRow = ({ set, position, lastSet, unit, accentBg, onDone }: SetRowProps) => {
  const setId = set.id ?? 0

  async function toggleDone (): Promise<void> {
    await setSetDone(setId, !set.done)
    if (!set.done) onDone()
  }

  return (
    <SwipeRow onDelete={() => deleteSet(setId)}>
      <div className={`grid grid-cols-[2rem_1fr_4.5rem_4rem_2.75rem] items-center gap-2 p-2 ${set.done ? 'opacity-60' : ''}`}>
        <span className="text-center font-heading text-muted">{position}</span>
        <span className="text-xs text-muted">
          {lastSet ? `${toDisplayWeight(lastSet.weight, unit)} × ${lastSet.reps}` : '—'}
        </span>
        <NumberInput
          label={`Weight ${unit}`}
          value={toDisplayWeight(set.weight, unit)}
          onCommit={value => updateSet(setId, { weight: fromDisplayWeight(value, unit) })}
        />
        <NumberInput label="Reps" value={set.reps} onCommit={value => updateSet(setId, { reps: value })} />
        <button
          className={`flex size-11 items-center justify-center rounded-xl font-bold ${set.done ? `${accentBg} text-bg` : 'bg-surface-2 text-muted'}`}
          onClick={toggleDone}
          aria-label={set.done ? 'Undo set' : 'Complete set'}
        >
          ✓
        </button>
      </div>
    </SwipeRow>
  )
}
