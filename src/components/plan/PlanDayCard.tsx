import { useState } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { ExercisePicker } from '@/components/ExercisePicker'
import { ExerciseImage } from '@/components/ExerciseImage'
import { deletePlanDay, updatePlanDay } from '@/db/plan'
import { DAY_TYPES, DAY_TYPE_STYLES } from '@/lib/dayType'
import { estimateMinutes, formatRepRange } from '@/lib/plan'
import type { DayType, Exercise, PlanDay, PlanItem } from '@/db/types'

interface PlanDayCardProps {
  day: PlanDay
  dayNumber: number
  exerciseMap: Map<string, Exercise>
  isEditing: boolean
  restDefault: number
}

const DEFAULT_SETS = 3
const DEFAULT_REP_MIN = 8
const DEFAULT_REP_MAX = 12

export const PlanDayCard = ({ day, dayNumber, exerciseMap, isEditing, restDefault }: PlanDayCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const style = DAY_TYPE_STYLES[day.type]
  const dayId = day.id ?? 0
  const isExpanded = isOpen || isEditing

  const saveItems = (items: PlanItem[]) => updatePlanDay(dayId, { items })
  const patchItem = (index: number, patch: Partial<PlanItem>) => {
    return saveItems(day.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }
  const moveItem = (index: number, direction: -1 | 1) => {
    const items = [...day.items]
    const [moved] = items.splice(index, 1)
    items.splice(index + direction, 0, moved)
    return saveItems(items)
  }

  async function handleDelete (): Promise<void> {
    if (window.confirm(`Delete ${day.name}? Past workouts are kept.`)) await deletePlanDay(dayId)
  }

  return (
    <section className="rounded-2xl bg-surface p-4">
      <button className="flex min-h-11 w-full items-center justify-between text-left" onClick={() => setIsOpen(!isOpen)}>
        <span>
          <span className="block text-xs text-muted">Day {dayNumber}</span>
          <span className="block font-heading text-lg font-semibold">{day.name}</span>
        </span>
        <span className="text-right">
          <span className={`block text-sm font-semibold ${style.text}`}>{style.label}</span>
          <span className="block text-xs text-muted">{day.items.length} ex · ~{estimateMinutes(day.items)} min</span>
        </span>
      </button>

      {isEditing && (
        <div className="mt-3 flex gap-2">
          <input
            className="min-h-11 flex-1 rounded-xl border border-border bg-surface-2 px-3"
            defaultValue={day.name}
            aria-label="Day name"
            onBlur={event => updatePlanDay(dayId, { name: event.target.value.trim() || day.name })}
          />
          <select
            className="min-h-11 rounded-xl border border-border bg-surface-2 px-2"
            value={day.type}
            aria-label="Day type"
            onChange={event => updatePlanDay(dayId, { type: event.target.value as DayType })}
          >
            {DAY_TYPES.map(type => <option key={type} value={type}>{DAY_TYPE_STYLES[type].label}</option>)}
          </select>
        </div>
      )}

      {isExpanded && (
        <ul className="mt-3 flex flex-col gap-2">
          {day.items.map((item, index) => {
            const exercise = exerciseMap.get(item.exerciseId)
            return (
              <li key={item.exerciseId} className="rounded-xl bg-surface-2 p-2">
                <div className="flex items-center gap-3">
                  <ExerciseImage exercise={exercise} className="size-10 shrink-0 rounded-lg" />
                  <span className="flex-1 text-sm">{exercise?.name ?? item.exerciseId}</span>
                  {!isEditing && <span className="text-sm text-muted">{item.sets} × {formatRepRange(item)}</span>}
                </div>
                {isEditing && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <label className="flex items-center gap-1">Sets <NumberInput className="w-14" label="Sets" value={item.sets} onCommit={value => patchItem(index, { sets: value })} /></label>
                    <label className="flex items-center gap-1">Reps <NumberInput className="w-14" label="Min reps" value={item.repMin} onCommit={value => patchItem(index, { repMin: value })} /></label>
                    <label className="flex items-center gap-1">to <NumberInput className="w-14" label="Max reps" value={item.repMax} onCommit={value => patchItem(index, { repMax: value })} /></label>
                    <label className="flex items-center gap-1">Rest s <NumberInput className="w-16" label="Rest seconds" value={item.restSec} onCommit={value => patchItem(index, { restSec: value })} /></label>
                    <span className="ml-auto flex gap-1">
                      <button className="min-h-11 min-w-11 rounded-lg bg-surface disabled:opacity-30" disabled={index === 0} onClick={() => moveItem(index, -1)} aria-label="Move up">↑</button>
                      <button className="min-h-11 min-w-11 rounded-lg bg-surface disabled:opacity-30" disabled={index === day.items.length - 1} onClick={() => moveItem(index, 1)} aria-label="Move down">↓</button>
                      <button className="min-h-11 min-w-11 rounded-lg bg-surface text-red-400" onClick={() => saveItems(day.items.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove">✕</button>
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {isEditing && (
        <div className="mt-3 flex gap-2">
          <button className="min-h-11 flex-1 rounded-xl border border-border text-sm" onClick={() => setIsPickerOpen(true)}>+ Add exercise</button>
          <button className="min-h-11 rounded-xl px-4 text-sm text-red-400" onClick={handleDelete}>Delete day</button>
        </div>
      )}

      {isPickerOpen && (
        <ExercisePicker
          excludeIds={day.items.map(item => item.exerciseId)}
          onClose={() => setIsPickerOpen(false)}
          onPick={async exercise => {
            setIsPickerOpen(false)
            await saveItems([...day.items, { exerciseId: exercise.id, sets: DEFAULT_SETS, repMin: DEFAULT_REP_MIN, repMax: DEFAULT_REP_MAX, restSec: restDefault }])
          }}
        />
      )}
    </section>
  )
}
