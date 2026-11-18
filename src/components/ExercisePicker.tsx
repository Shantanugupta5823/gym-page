import { useState } from 'react'
import { Sheet } from '@/components/Sheet'
import { useExercises } from '@/db/queries'
import { capitalize } from '@/lib/plan'
import { ExerciseImage } from '@/components/ExerciseImage'
import type { Exercise } from '@/db/types'
import type { ExerciseLibrary } from '@/db/curatedExercises'

interface ExercisePickerProps {
  title: string
  library: ExerciseLibrary
  excludeIds: string[]
  onPick: (exercise: Exercise) => void
  onClose: () => void
}

export const ExercisePicker = ({ title, library, excludeIds, onPick, onClose }: ExercisePickerProps) => {
  const exercises = useExercises()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string | null>(null)
  const needle = query.trim().toLowerCase()

  const exerciseMap = new Map((exercises ?? []).map(exercise => [exercise.id, exercise]))
  const groupIds = group ? library[group] : [...new Set(Object.values(library).flat())]
  const matches = groupIds
    .filter(id => !excludeIds.includes(id))
    .map(id => exerciseMap.get(id))
    .filter(exercise => exercise !== undefined)
    .filter(exercise => `${exercise.name} ${exercise.primaryMuscles.join(' ')} ${exercise.equipment ?? ''}`.toLowerCase().includes(needle))

  const chipClass = (isActive: boolean) => `min-h-9 shrink-0 rounded-full px-3 text-xs ${isActive ? 'bg-push font-semibold text-bg' : 'bg-surface-2 text-muted'}`

  return (
    <Sheet title={title} onClose={onClose}>
      <input
        className="mb-3 min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3"
        placeholder="Search name, muscle or equipment"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
        <button className={chipClass(group === null)} onClick={() => setGroup(null)}>All</button>
        {Object.keys(library).map(item => (
          <button key={item} className={chipClass(group === item)} onClick={() => setGroup(item)}>{item}</button>
        ))}
      </div>
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
