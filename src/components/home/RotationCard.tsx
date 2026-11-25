import { useState } from 'react'
import { BodyMap, coverageColor } from '@/components/body/BodyMap'
import { DAY_TYPE_STYLES } from '@/lib/dayType'
import { getNextRollingDay } from '@/lib/rotation'
import { getCurrentRotation, getDayTargets, getRotationCoverage, makeCreditLookup } from '@/lib/coverage'
import { useAllWorkouts, useExerciseMap, usePlanDays, useSetsForWorkouts } from '@/db/queries'
import type { MuscleGroup } from '@/lib/muscles'

const formatSets = (value: number): string => (Number.isInteger(value) ? String(value) : value.toFixed(1))

export const RotationCard = () => {
  const planDays = usePlanDays()
  const workouts = useAllWorkouts()
  const exerciseMap = useExerciseMap()
  const rotation = getCurrentRotation(planDays ?? [], workouts ?? [])
  const rotationSets = useSetsForWorkouts(rotation.workouts.map(workout => workout.id ?? 0))
  const [selected, setSelected] = useState<MuscleGroup | null>(null)
  const [isShowingList, setIsShowingList] = useState(false)

  if (!planDays || !workouts || !rotationSets || planDays.length === 0) return null

  const lookup = makeCreditLookup(exerciseMap)
  const coverage = getRotationCoverage(planDays, rotationSets, lookup)
  const planned = coverage.filter(item => item.target > 0)
  const completeCount = planned.filter(item => item.ratio >= 1).length
  const ratios = new Map(coverage.map(item => [item.group, item.ratio]))

  const activeWorkout = workouts.find(workout => workout.endedAt === undefined)
  const nextDay = activeWorkout
    ? planDays.find(day => day.id === activeWorkout.planDayId)
    : rotation.isComplete ? null : getNextRollingDay(planDays, workouts.filter(workout => workout.endedAt !== undefined))
  const nextStyle = nextDay ? DAY_TYPE_STYLES[nextDay.type] : null
  const outlined = new Set(nextDay ? getDayTargets(nextDay.items, lookup) : [])

  const selectedCoverage = coverage.find(item => item.group === selected)
  const selectedDays = selected ? planDays.filter(day => getDayTargets(day.items, lookup).includes(selected)) : []

  return (
    <section className="rounded-3xl bg-surface p-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold">Rotation {rotation.number}</h2>
          <p className="text-xs text-muted">
            {rotation.isComplete ? 'Complete. Day 1 starts the next one' : `${rotation.doneDayIds.size} of ${planDays.length} days done`}
          </p>
        </div>
        <p className="text-right">
          <span className="font-heading text-2xl font-semibold text-done">{completeCount}</span>
          <span className="text-sm text-muted">/{planned.length}</span>
          <span className="block text-xs text-muted">muscles done</span>
        </p>
      </header>

      <ol className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${planDays.length}, minmax(0, 1fr))` }}>
        {planDays.map((day, index) => {
          const style = DAY_TYPE_STYLES[day.type]
          const isDone = rotation.doneDayIds.has(day.id ?? -1)
          const isNext = day.id === nextDay?.id
          return (
            <li
              key={day.id}
              className={`flex min-h-12 flex-col justify-center rounded-xl border px-1.5 py-1.5 ${
                isDone ? `${style.bg} border-transparent text-bg` : isNext ? `${style.border} ${style.softBg}` : 'border-border'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDone ? 'text-bg/70' : 'text-muted'}`}>
                {planDays.length > 4 ? `D${index + 1}` : `Day ${index + 1}`} {isDone && '✓'}
              </span>
              <span className={`text-xs font-semibold leading-tight ${isDone ? '' : isNext ? style.text : 'text-muted'}`}>{day.name.split(' · ')[0]}</span>
            </li>
          )
        })}
      </ol>

      <div className="mt-2">
        <BodyMap
          ratios={ratios}
          outlined={outlined}
          outlineColor={nextStyle?.hex}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      {selectedCoverage
        ? (
          <div className="mt-3 rounded-2xl bg-surface-2 p-3">
            <div className="flex items-baseline justify-between">
              <p className="font-heading font-semibold">{selectedCoverage.group}</p>
              <p className="text-sm">
                <span className="font-heading font-semibold">{formatSets(selectedCoverage.done)}</span>
                <span className="text-muted"> / {formatSets(selectedCoverage.target)} sets</span>
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
              <div className="h-full rounded-full transition-all" style={{ width: `${selectedCoverage.ratio * 100}%`, background: coverageColor(Math.max(selectedCoverage.ratio, 0.01)) }} />
            </div>
            <p className="mt-2 text-xs text-muted">
              {selectedDays.length > 0
                ? `Main work on ${selectedDays.map(day => day.name).join(' · ')}`
                : selectedCoverage.target > 0 ? 'Worked as a helper muscle in compound lifts' : 'Not in this plan yet. Add an exercise in Plan'}
            </p>
          </div>
          )
        : (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: coverageColor(0) }} />Not yet</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-6 rounded-sm" style={{ background: `linear-gradient(90deg, ${coverageColor(0.1)}, ${coverageColor(0.9)})` }} />In progress
            </span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: coverageColor(1) }} />Done</span>
            {nextStyle && <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border" style={{ borderColor: nextStyle.hex }} />Next workout</span>}
          </div>
          )}

      <button className="mt-2 min-h-10 w-full text-sm text-muted" onClick={() => setIsShowingList(value => !value)}>
        {isShowingList ? 'Hide muscle list ▴' : 'Show all muscles ▾'}
      </button>
      {isShowingList && (
        <ul className="flex flex-col gap-2">
          {planned.map(item => (
            <li key={item.group}>
              <button className="flex w-full items-center gap-3 text-left text-sm" onClick={() => setSelected(item.group)}>
                <span className={`w-20 shrink-0 ${item.group === selected ? 'font-semibold text-text' : 'text-muted'}`}>{item.group}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full" style={{ width: `${item.ratio * 100}%`, background: coverageColor(Math.max(item.ratio, 0.01)) }} />
                </span>
                <span className="w-14 shrink-0 text-right font-heading text-xs">{formatSets(item.done)}/{formatSets(item.target)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
