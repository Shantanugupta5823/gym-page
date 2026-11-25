import { useEffect, useRef, useState } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { SwipeRow } from '@/components/workout/SwipeRow'
import { fromDisplayWeight, toDisplayWeight } from '@/lib/units'
import { getSetProblem } from '@/lib/sets'
import { completeSet, deleteSet, setSetDone, updateSet } from '@/db/workouts'
import type { SetProblem } from '@/lib/sets'
import type { Exercise, Unit, WorkoutSet } from '@/db/types'

interface SetRowProps {
  set: WorkoutSet
  position: number
  lastSet: WorkoutSet | undefined
  exercise: Exercise | undefined
  unit: Unit
  accentBg: string
  onDone: () => void
}

const PROBLEM_SHOW_MS = 2500

const PROBLEM_TEXT: Record<Exclude<SetProblem, null>, string> = {
  weight: 'Enter the weight first',
  reps: 'Enter the reps first'
}

export const SetRow = ({ set, position, lastSet, exercise, unit, accentBg, onDone }: SetRowProps) => {
  const setId = set.id ?? 0
  // What is typed right now: the ✓ tap can arrive before the box's blur has been saved
  const draftWeight = useRef<number | null>(null)
  const draftReps = useRef<number | null>(null)
  const [problem, setProblem] = useState<SetProblem>(null)

  useEffect(() => {
    if (!problem) return
    const timer = setTimeout(() => setProblem(null), PROBLEM_SHOW_MS)
    return () => clearTimeout(timer)
  }, [problem])

  async function toggleDone (): Promise<void> {
    if (set.done) {
      await setSetDone(setId, false)
      return
    }
    const weight = draftWeight.current !== null ? fromDisplayWeight(draftWeight.current, unit) : set.weight
    const reps = draftReps.current ?? set.reps
    const found = getSetProblem(weight, reps, exercise)
    if (found) {
      setProblem(found)
      navigator.vibrate?.(80)
      return
    }
    setProblem(null)
    await completeSet(setId, { weight, reps })
    onDone()
  }

  const inputError = 'border-red-500 bg-red-500/10'

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
          className={problem === 'weight' ? inputError : ''}
          onDraft={value => { draftWeight.current = value }}
          onCommit={value => updateSet(setId, { weight: fromDisplayWeight(value, unit) })}
        />
        <NumberInput
          label="Reps"
          value={set.reps}
          className={problem === 'reps' ? inputError : ''}
          onDraft={value => { draftReps.current = value }}
          onCommit={value => updateSet(setId, { reps: value })}
        />
        <button
          className={`flex size-11 items-center justify-center rounded-xl font-bold ${set.done ? `${accentBg} text-bg` : 'bg-surface-2 text-muted'}`}
          onClick={toggleDone}
          aria-label={set.done ? 'Undo set' : 'Complete set'}
        >
          ✓
        </button>
      </div>
      {problem && (
        <p role="alert" className="px-2 pb-2 text-xs font-semibold text-red-400">
          {PROBLEM_TEXT[problem]}
        </p>
      )}
    </SwipeRow>
  )
}
