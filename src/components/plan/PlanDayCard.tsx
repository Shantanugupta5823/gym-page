import { useState } from 'react'
import { Select } from '@/components/Select'
import { ExercisePicker } from '@/components/ExercisePicker'
import { PlanItemRow } from '@/components/plan/PlanItemRow'
import { useDragReorder } from '@/lib/useDragReorder'
import { deletePlanDay, updatePlanDay } from '@/db/plan'
import { DAY_TYPES, DAY_TYPE_STYLES } from '@/lib/dayType'
import { CURATED_EXERCISES, STRETCH_EXERCISES, WARMUP_EXERCISES } from '@/db/curatedExercises'
import { estimateMinutes, getMainItems } from '@/lib/plan'
import type { DayType, Exercise, ItemPhase, PlanDay, PlanItem } from '@/db/types'

interface PlanDayCardProps {
  day: PlanDay
  dayNumber: number
  exerciseMap: Map<string, Exercise>
  isEditing: boolean
  restDefault: number
  isRestTimerEnabled: boolean
}

const DEFAULT_SETS = 3
const DEFAULT_REP_MIN = 8
const DEFAULT_REP_MAX = 12
const DEFAULT_PREP_SEC = 30
const DEFAULT_STRETCH_ROUNDS = 2

type PickerKind = 'main' | ItemPhase

const PICKERS = {
  main: { title: 'Exercise library', library: CURATED_EXERCISES },
  warmup: { title: 'Warm-up exercises', library: WARMUP_EXERCISES },
  stretch: { title: 'Stretches', library: STRETCH_EXERCISES }
}

export const PlanDayCard = ({ day, dayNumber, exerciseMap, isEditing, restDefault, isRestTimerEnabled }: PlanDayCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [pickerKind, setPickerKind] = useState<PickerKind | null>(null)
  const style = DAY_TYPE_STYLES[day.type]
  const dayId = day.id ?? 0
  const isExpanded = isOpen || isEditing

  const saveItems = (items: PlanItem[]) => updatePlanDay(dayId, { items })
  const patchItem = (index: number, patch: Partial<PlanItem>) => {
    return saveItems(day.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }
  const moveItem = (from: number, to: number) => {
    const items = [...day.items]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    return saveItems(items)
  }
  // Warm-ups go before the first non-warm-up item, everything else is appended
  const buildItem = (exercise: Exercise, kind: PickerKind): PlanItem => {
    if (kind === 'main') return { exerciseId: exercise.id, sets: DEFAULT_SETS, repMin: DEFAULT_REP_MIN, repMax: DEFAULT_REP_MAX, restSec: restDefault }
    const rounds = kind === 'stretch' ? DEFAULT_STRETCH_ROUNDS : 1
    return { exerciseId: exercise.id, sets: rounds, repMin: DEFAULT_PREP_SEC, repMax: DEFAULT_PREP_SEC, restSec: 0, phase: kind }
  }
  const insertItem = (item: PlanItem) => {
    if (item.phase !== 'warmup') return saveItems([...day.items, item])
    const firstOtherIndex = day.items.findIndex(existing => existing.phase !== 'warmup')
    const insertAt = firstOtherIndex === -1 ? day.items.length : firstOtherIndex
    return saveItems([...day.items.slice(0, insertAt), item, ...day.items.slice(insertAt)])
  }
  const { draggedIndex, setRowRef, getHandleProps, getRowStyle } = useDragReorder(day.items.length, moveItem)

  async function handleDelete (): Promise<void> {
    if (window.confirm(`Delete ${day.name}? Past workouts are kept.`)) await deletePlanDay(dayId)
  }

  return (
    <section className={`rounded-2xl border-l-4 bg-surface p-4 ${style.border}`}>
      <button className="flex min-h-11 w-full items-center justify-between text-left" onClick={() => setIsOpen(!isOpen)}>
        <span>
          <span className="block text-xs text-muted">Day {dayNumber}</span>
          <span className="block font-heading text-lg font-semibold">{day.name}</span>
        </span>
        <span className="text-right">
          <span className={`block text-sm font-semibold ${style.text}`}>{style.label}</span>
          <span className="block text-xs text-muted">{getMainItems(day.items).length} ex · ~{estimateMinutes(day.items)} min</span>
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
          <Select
            title="Day type"
            className="w-28"
            value={day.type}
            options={DAY_TYPES.map(type => ({ value: type, label: DAY_TYPE_STYLES[type].label }))}
            onChange={value => updatePlanDay(dayId, { type: value as DayType })}
          />
        </div>
      )}

      {isExpanded && (
        <ul className="mt-3 flex flex-col gap-2">
          {day.items.map((item, index) => (
            <PlanItemRow
              key={item.exerciseId}
              item={item}
              exercise={exerciseMap.get(item.exerciseId)}
              isEditing={isEditing}
              isRestTimerEnabled={isRestTimerEnabled}
              isDragged={draggedIndex === index}
              style={getRowStyle(index)}
              rowRef={setRowRef(index)}
              handleProps={getHandleProps(index)}
              onPatch={patch => patchItem(index, patch)}
              onRemove={() => saveItems(day.items.filter((_, itemIndex) => itemIndex !== index))}
            />
          ))}
        </ul>
      )}

      {isEditing && (
        <div className="mt-3 flex flex-col gap-2">
          <button className="min-h-11 rounded-xl border border-border text-sm" onClick={() => setPickerKind('main')}>+ Add exercise</button>
          <div className="flex gap-2">
            <button className="min-h-11 flex-1 rounded-xl bg-legs/15 text-sm text-legs" onClick={() => setPickerKind('warmup')}>+ Warm-up</button>
            <button className="min-h-11 flex-1 rounded-xl bg-pull/15 text-sm text-pull" onClick={() => setPickerKind('stretch')}>+ Stretch</button>
          </div>
          <button className="min-h-11 rounded-xl text-sm text-red-400" onClick={handleDelete}>Delete day</button>
        </div>
      )}

      {pickerKind && (
        <ExercisePicker
          title={PICKERS[pickerKind].title}
          library={PICKERS[pickerKind].library}
          excludeIds={day.items.map(item => item.exerciseId)}
          onClose={() => setPickerKind(null)}
          onPick={async exercise => {
            setPickerKind(null)
            await insertItem(buildItem(exercise, pickerKind))
          }}
        />
      )}
    </section>
  )
}
