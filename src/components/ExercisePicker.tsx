import { useState } from 'react'
import { Sheet } from '@/components/Sheet'
import { useExercises } from '@/db/queries'
import { capitalize } from '@/lib/plan'
import { ExerciseImage } from '@/components/ExerciseImage'
import type { Exercise } from '@/db/types'

interface ExercisePickerProps {
  excludeIds: string[]
  onPick: (exercise: Exercise) => void
  onClose: () => void
}

const MAX_RESULTS = 40

export const ExercisePicker = ({ excludeIds, onPick, onClose }: ExercisePickerProps) => {
  const exercises = useExercises()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()

  const matches = (exercises ?? [])
    .filter(exercise => !excludeIds.includes(exercise.id))
    .filter(exercise => `${exercise.name} ${exercise.primaryMuscles.join(' ')} ${exercise.equipment ?? ''}`.toLowerCase().includes(needle))
    .slice(0, MAX_RESULTS)

  return (
    <Sheet title="Exercise library" onClose={onClose}>
      <input
        className="mb-3 min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3"
        placeholder="Search name, muscle or equipment"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <ul className="flex flex-col gap-2">
        {matches.map(exercise => (
          <li key={exercise.id}>
            <button className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-surface-2 p-2 text-left" onClick={() => onPick(exercise)}>
              <ExerciseImage exercise={exercise} className="size-12 shrink-0 rounded-lg" />
              <span>
                <span className="block text-sm font-medium">{exercise.name}</span>
                <span className="block text-xs text-muted">{exercise.primaryMuscles.map(capitalize).join(', ')}</span>
              </span>
            </button>
          </li>
        ))}
        {matches.length === 0 && <li className="py-6 text-center text-sm text-muted">No exercises found</li>}
      </ul>
    </Sheet>
  )
}
