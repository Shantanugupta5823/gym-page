import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSettings } from '@/db/settings'
import { getE1rm } from '@/lib/e1rm'
import { DAY_TYPE_STYLES } from '@/lib/dayType'
import { summarizeSessions } from '@/lib/sessions'
import { capitalize } from '@/lib/plan'
import { toDisplayWeight } from '@/lib/units'
import { getExerciseDayType } from '@/lib/muscles'
import { getExerciseRecords } from '@/lib/records'
import { ExerciseImage } from '@/components/ExerciseImage'
import { TrendChart } from '@/components/progress/TrendChart'
import { formatShortDate, formatWeekday, DAY_MS } from '@/lib/dates'
import { useDoneSets, useExerciseMap } from '@/db/queries'

const RANGES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 }
]

export const ExerciseProgress = () => {
  const { exerciseId = '' } = useParams()
  const { unit } = useSettings()
  const doneSets = useDoneSets()
  const exerciseMap = useExerciseMap()
  const [rangeDays, setRangeDays] = useState(RANGES[1].days)

  if (!doneSets) return null

  const exercise = exerciseMap.get(exerciseId)
  const style = DAY_TYPE_STYLES[getExerciseDayType(exercise)]
  const exerciseSets = doneSets.filter(set => set.exerciseId === exerciseId)
  const records = getExerciseRecords(exerciseSets)
  const rangeStart = Date.now() - rangeDays * DAY_MS
  const format = (kg: number): string => `${toDisplayWeight(kg, unit)} ${unit}`

  const bestBySession = new Map<number, { date: number, value: number }>()
  exerciseSets.filter(set => set.weight > 0 && set.createdAt >= rangeStart).forEach(set => {
    const e1rm = getE1rm(set.weight, set.reps)
    const existing = bestBySession.get(set.workoutId)
    if (!existing || e1rm > existing.value) bestBySession.set(set.workoutId, { date: set.createdAt, value: e1rm })
  })
  const points = [...bestBySession.values()]
    .sort((a, b) => a.date - b.date)
    .map(point => ({ date: point.date, value: toDisplayWeight(point.value, unit) }))
  const rangeChange = points.length > 1 ? points[points.length - 1].value - points[0].value : null

  const sessions = summarizeSessions(exerciseSets)
  const prCount = sessions.filter(session => session.isPr).length
  const totalSets = exerciseSets.length
  const daysSinceLast = sessions.length > 0 ? Math.floor((Date.now() - sessions[0].date) / DAY_MS) : 0

  const recordTiles = [
    { label: 'Heaviest', value: records.heaviest ? format(records.heaviest.weight) : '—', date: records.heaviest?.createdAt, type: DAY_TYPE_STYLES.push },
    { label: 'Best e1RM', value: records.bestE1rm ? format(records.bestE1rm.e1rm) : '—', date: records.bestE1rm?.createdAt, type: DAY_TYPE_STYLES.pull },
    { label: 'Best volume', value: records.bestSessionVolume ? format(records.bestSessionVolume.volume) : '—', date: records.bestSessionVolume?.createdAt, type: DAY_TYPE_STYLES.legs }
  ]

  return (
    <main className="flex flex-col gap-4 p-5">
      <header className="flex items-center gap-2">
        <Link to="/progress" aria-label="Back" className="flex size-11 items-center justify-center text-xl text-muted">←</Link>
        <h1 className="font-heading text-2xl font-semibold">Exercise details</h1>
      </header>

      {exerciseSets.length === 0
        ? <p className="rounded-2xl bg-surface p-5 text-sm text-muted">No logged sets for this exercise yet.</p>
        : (
          <>
            <section className={`flex items-center gap-4 rounded-3xl ${style.softBg} p-4`}>
              <ExerciseImage exercise={exercise} className="size-20 shrink-0 rounded-2xl" />
              <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>{style.label}</p>
                <h2 className="font-heading text-xl font-semibold leading-tight">{exercise?.name ?? exerciseId}</h2>
                <p className="mt-1 text-xs text-muted">{(exercise?.primaryMuscles ?? []).map(capitalize).join(', ')}</p>
                <p className="mt-2 text-xs text-muted">
                  {sessions.length} sessions · {totalSets} sets · {daysSinceLast === 0 ? 'today' : `${daysSinceLast}d ago`}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-3 gap-3">
              {recordTiles.map(tile => (
                <div key={tile.label} className={`rounded-2xl ${tile.type.softBg} p-3`}>
                  <p className={`text-xs font-semibold ${tile.type.text}`}>{tile.label}</p>
                  <p className="mt-1 font-heading text-lg leading-tight">{tile.value}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{tile.date ? formatShortDate(tile.date) : ''}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl bg-surface p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-base font-semibold">Estimated 1RM</h2>
                  {rangeChange !== null && (
                    <p className={`text-sm font-semibold ${rangeChange >= 0 ? 'text-push' : 'text-red-400'}`}>
                      {rangeChange >= 0 ? '↑' : '↓'} {Math.abs(Math.round(rangeChange * 10) / 10)} {unit} in range
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {RANGES.map(range => (
                    <button
                      key={range.label}
                      className={`min-h-9 rounded-lg px-3 text-xs ${rangeDays === range.days ? `${style.bg} font-semibold text-bg` : 'bg-surface-2 text-muted'}`}
                      onClick={() => setRangeDays(range.days)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <TrendChart points={points} unitLabel={unit} color={style.hex} />
            </section>

            <section className="rounded-2xl bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold">History</h2>
                <span className="text-xs text-muted">{prCount} {prCount === 1 ? 'PR' : 'PRs'}</span>
              </div>
              <ul className="flex flex-col gap-3">
                {sessions.map(session => (
                  <li key={session.workoutId} className="rounded-xl bg-surface-2 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {formatWeekday(session.date)} {formatShortDate(session.date)}
                        {session.isPr && <span className={`ml-2 rounded-full ${DAY_TYPE_STYLES.push.softBg} px-2 py-0.5 text-[10px] font-semibold text-push`}>PR</span>}
                      </p>
                      {session.volumeChangePct !== null && (
                        <span className={`text-xs font-semibold ${session.volumeChangePct >= 0 ? 'text-push' : 'text-red-400'}`}>
                          {session.volumeChangePct >= 0 ? '↑' : '↓'} {Math.abs(session.volumeChangePct)}% vol
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {session.sets.map(set => (
                        <span key={set.id} className={`rounded-lg ${style.softBg} px-2 py-1 text-xs ${style.text}`}>
                          {toDisplayWeight(set.weight, unit)}×{set.reps}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted">
                      <span>Top <b className="font-medium text-text">{session.topSet ? format(session.topSet.weight) : '—'}</b></span>
                      <span>Volume <b className="font-medium text-text">{format(session.volume)}</b></span>
                      <span>e1RM <b className="font-medium text-text">{session.bestE1rm > 0 ? format(session.bestE1rm) : '—'}</b></span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
    </main>
  )
}
