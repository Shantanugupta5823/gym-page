import { useState } from 'react'
import { useSettings } from '@/db/settings'
import { getE1rm } from '@/lib/e1rm'
import { formatShortDate, DAY_MS } from '@/lib/dates'
import { toDisplayWeight } from '@/lib/units'
import { getExerciseRecords } from '@/lib/records'
import { TrendChart } from '@/components/progress/TrendChart'
import { BodyweightSection } from '@/components/progress/BodyweightSection'
import { useDoneSets, useExerciseMap } from '@/db/queries'

const RANGES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 }
]

export const Progress = () => {
  const { unit } = useSettings()
  const doneSets = useDoneSets()
  const exerciseMap = useExerciseMap()
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [rangeDays, setRangeDays] = useState(RANGES[1].days)

  if (!doneSets) return null

  const loggedIds = [...new Set(doneSets.map(set => set.exerciseId))]
  const latestSet = doneSets.reduce((latest, set) => (set.createdAt > latest.createdAt ? set : latest), doneSets[0])
  const exerciseId = pickedId ?? latestSet?.exerciseId
  const exerciseSets = doneSets.filter(set => set.exerciseId === exerciseId)
  const records = getExerciseRecords(exerciseSets)
  const rangeStart = Date.now() - rangeDays * DAY_MS

  const bestBySession = new Map<number, { date: number, value: number }>()
  exerciseSets.filter(set => set.weight > 0 && set.createdAt >= rangeStart).forEach(set => {
    const e1rm = getE1rm(set.weight, set.reps)
    const existing = bestBySession.get(set.workoutId)
    if (!existing || e1rm > existing.value) bestBySession.set(set.workoutId, { date: set.createdAt, value: e1rm })
  })
  const points = [...bestBySession.values()]
    .sort((a, b) => a.date - b.date)
    .map(point => ({ date: point.date, value: toDisplayWeight(point.value, unit) }))

  const sessions = [...new Set(exerciseSets.map(set => set.workoutId))]
    .map(workoutId => exerciseSets.filter(set => set.workoutId === workoutId).sort((a, b) => a.setIndex - b.setIndex))
    .sort((a, b) => b[0].createdAt - a[0].createdAt)

  const format = (kg: number): string => `${toDisplayWeight(kg, unit)} ${unit}`

  return (
    <main className="flex flex-col gap-4 p-5">
      <h1 className="font-heading text-2xl font-semibold">Progress</h1>

      {loggedIds.length === 0
        ? <p className="rounded-2xl bg-surface p-5 text-sm text-muted">Finish a workout to see your lifts here.</p>
        : (
          <>
            <select
              className="min-h-12 rounded-xl border border-border bg-surface px-3"
              value={exerciseId}
              onChange={event => setPickedId(event.target.value)}
            >
              {loggedIds
                .map(id => ({ id, name: exerciseMap.get(id)?.name ?? id }))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>

            <section className="rounded-2xl bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold">Estimated 1RM</h2>
                <div className="flex gap-1">
                  {RANGES.map(range => (
                    <button
                      key={range.label}
                      className={`min-h-9 rounded-lg px-3 text-xs ${rangeDays === range.days ? 'bg-push text-bg' : 'bg-surface-2 text-muted'}`}
                      onClick={() => setRangeDays(range.days)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <TrendChart points={points} unitLabel={unit} color="#A3E635" />
            </section>

            <section className="flex gap-3">
              <div className="flex-1 rounded-2xl bg-surface p-3">
                <p className="text-xs text-muted">Heaviest</p>
                <p className="mt-1 font-heading text-lg">{records.heaviest ? format(records.heaviest.weight) : '—'}</p>
              </div>
              <div className="flex-1 rounded-2xl bg-surface p-3">
                <p className="text-xs text-muted">Best e1RM</p>
                <p className="mt-1 font-heading text-lg">{records.bestE1rm ? format(records.bestE1rm.e1rm) : '—'}</p>
              </div>
              <div className="flex-1 rounded-2xl bg-surface p-3">
                <p className="text-xs text-muted">Best volume</p>
                <p className="mt-1 font-heading text-lg">{records.bestSessionVolume ? format(records.bestSessionVolume.volume) : '—'}</p>
              </div>
            </section>

            <section className="rounded-2xl bg-surface p-4">
              <h2 className="mb-3 font-heading text-base font-semibold">History</h2>
              <ul className="flex flex-col gap-3">
                {sessions.map(session => (
                  <li key={session[0].workoutId} className="text-sm">
                    <p className="text-xs text-muted">{formatShortDate(session[0].createdAt)}</p>
                    <p>{session.map(set => `${toDisplayWeight(set.weight, unit)}×${set.reps}`).join('  ·  ')}</p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

      <BodyweightSection unit={unit} />
    </main>
  )
}
