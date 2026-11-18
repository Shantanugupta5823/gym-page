import { NumberInput } from '@/components/NumberInput'
import { ExerciseImage } from '@/components/ExerciseImage'
import { formatItemTarget } from '@/lib/plan'
import type { CSSProperties, ReactNode } from 'react'
import type { Exercise, ItemPhase, PlanItem } from '@/db/types'

interface PlanItemRowProps {
  item: PlanItem
  exercise: Exercise | undefined
  isEditing: boolean
  isRestTimerEnabled: boolean
  isDragged: boolean
  style: CSSProperties | undefined
  rowRef: (element: HTMLElement | null) => void
  handleProps: object
  onPatch: (patch: Partial<PlanItem>) => void
  onRemove: () => void
}

const PHASE_STYLES: Record<ItemPhase, { label: string, badge: string }> = {
  warmup: { label: 'Warm-up', badge: 'bg-legs/15 text-legs' },
  stretch: { label: 'Stretch', badge: 'bg-pull/15 text-pull' }
}

const Field = ({ label, children }: { label: string, children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-muted">
    {label}
    {children}
  </label>
)

export const PlanItemRow = ({ item, exercise, isEditing, isRestTimerEnabled, isDragged, style, rowRef, handleProps, onPatch, onRemove }: PlanItemRowProps) => {
  const phaseStyle = item.phase ? PHASE_STYLES[item.phase] : null
  const mainGridClass = isRestTimerEnabled ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <li
      ref={rowRef}
      style={style}
      className={`rounded-2xl bg-surface-2 p-3 ${isDragged ? 'shadow-2xl ring-1 ring-white/20' : ''}`}
    >
      <div className="flex items-center gap-3">
        {isEditing && (
          <button
            {...handleProps}
            className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-lg text-muted active:cursor-grabbing"
            aria-label={`Reorder ${exercise?.name ?? item.exerciseId}. Drag, or use arrow keys`}
          >
            ⠿
          </button>
        )}
        <ExerciseImage exercise={exercise} className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{exercise?.name ?? item.exerciseId}</p>
          <p className="flex items-center gap-1.5 truncate text-xs capitalize text-muted">
            {phaseStyle && <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold normal-case ${phaseStyle.badge}`}>{phaseStyle.label}</span>}
            <span className="truncate">{exercise?.primaryMuscles.join(', ')}</span>
          </p>
        </div>
        {isEditing
          ? <button className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:text-red-400" onClick={onRemove} aria-label="Remove exercise">✕</button>
          : <span className="shrink-0 text-sm text-muted">{formatItemTarget(item)}</span>}
      </div>

      {isEditing && item.phase && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label="Rounds"><NumberInput className="w-full" label="Rounds" value={item.sets} onCommit={value => onPatch({ sets: value })} /></Field>
          <Field label="Seconds each"><NumberInput className="w-full" label="Seconds" value={item.repMin} onCommit={value => onPatch({ repMin: value, repMax: value })} /></Field>
        </div>
      )}

      {isEditing && !item.phase && (
        <div className={`mt-3 grid gap-2 ${mainGridClass}`}>
          <Field label="Sets"><NumberInput className="w-full" label="Sets" value={item.sets} onCommit={value => onPatch({ sets: value })} /></Field>
          <Field label="Min reps"><NumberInput className="w-full" label="Min reps" value={item.repMin} onCommit={value => onPatch({ repMin: value })} /></Field>
          <Field label="Max reps"><NumberInput className="w-full" label="Max reps" value={item.repMax} onCommit={value => onPatch({ repMax: value })} /></Field>
          {isRestTimerEnabled && (
            <Field label="Rest s"><NumberInput className="w-full" label="Rest seconds" value={item.restSec} onCommit={value => onPatch({ restSec: value })} /></Field>
          )}
        </div>
      )}
    </li>
  )
}
