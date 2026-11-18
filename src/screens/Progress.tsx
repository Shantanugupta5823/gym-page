import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '@/db/settings'
import { DAY_TYPE_STYLES } from '@/lib/dayType'
import { toDisplayWeight } from '@/lib/units'
import { DAY_TYPE_BY_GROUP, MUSCLE_GROUPS, getExerciseDayType } from '@/lib/muscles'
import { MiniChart } from '@/components/progress/MiniChart'
import { buildGroupTrends } from '@/lib/progressGroups'
import { formatShortDate, DAY_MS } from '@/lib/dates'
import { useDoneSets, useExerciseMap } from '@/db/queries'
import type { MuscleGroup } from '@/lib/muscles'

const TOP_COUNT = 5
const RANGES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 }
]

export const Progress = () => {
  const { unit } = useSettings()
  const doneSets = useDoneSets()
  const exerciseMap = useExerciseMap()
  const [pickedGroup, setPickedGroup] = useState<MuscleGroup | null>(null)
  const [isShowingAll, setIsShowingAll] = useState(false)
  const [rangeDays, setRangeDays] = useState(RANGES[1].days)

  if (!doneSets) return null

  const groups = buildGroupTrends(doneSets, exerciseMap, Date.now() - rangeDays * DAY_MS)
  const availableGroups = MUSCLE_GROUPS.filter(group => groups.has(group))
  const mostTrained = [...availableGroups].sort((a, b) => (groups.get(b)?.length ?? 0) - (groups.get(a)?.length ?? 0))[0]
  const group = pickedGroup && groups.has(pickedGroup) ? pickedGroup : mostTrained
  const trends = group ? groups.get(group) ?? [] : []
  const visibleTrends = isShowingAll ? trends : trends.slice(0, TOP_COUNT)
  const groupStyle = DAY_TYPE_STYLES[DAY_TYPE_BY_GROUP[group ?? 'Chest']]

  return (
    <main className="flex flex-col gap-4 p-5">
      <h1 className="font-heading text-2xl font-semibold">Progress</h1>

      {availableGroups.length === 0
        ? <p className="rounded-2xl bg-surface p-5 text-sm text-muted">Finish a workout to see your lifts here.</p>
        : (
          <>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
              {availableGroups.map(item => {
                const itemStyle = DAY_TYPE_STYLES[DAY_TYPE_BY_GROUP[item]]
                return (
                  <button
                    key={item}
                    className={`min-h-10 shrink-0 rounded-full px-4 text-sm ${item === group ? `${itemStyle.bg} font-semibold text-bg` : `${itemStyle.softBg} ${itemStyle.text}`}`}
                    onClick={() => { setPickedGroup(item); setIsShowingAll(false) }}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                {trends.length} {trends.length === 1 ? 'exercise' : 'exercises'} · most performed first
              </p>
              <div className="flex gap-1">
                {RANGES.map(range => (
                  <button
                    key={range.label}
                    className={`min-h-9 rounded-lg px-3 text-xs ${rangeDays === range.days ? `${groupStyle.bg} font-semibold text-bg` : 'bg-surface-2 text-muted'}`}
                    onClick={() => setRangeDays(range.days)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {visibleTrends.map(trend => {
                const exercise = exerciseMap.get(trend.exerciseId)
                const style = DAY_TYPE_STYLES[getExerciseDayType(exercise?.primaryMuscles ?? [])]
                const points = trend.points.map(point => ({ date: point.date, value: toDisplayWeight(point.value, unit) }))
                const isUp = (trend.changeE1rm ?? 0) >= 0
                return (
                  <li key={trend.exerciseId}>
                    <Link to={`/progress/${encodeURIComponent(trend.exerciseId)}`} className="block rounded-2xl bg-surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-heading text-base font-semibold">{exercise?.name ?? trend.exerciseId}</h2>
                          <p className="text-xs text-muted">Last {formatShortDate(trend.lastDate)} · {trend.sessionCount} sessions</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`font-heading text-lg leading-tight ${style.text}`}>
                            {trend.latestE1rm === null ? '—' : `${toDisplayWeight(trend.latestE1rm, unit)} ${unit}`}
                          </p>
                          {trend.changeE1rm !== null && trend.changePct !== null && (
                            <p className={`text-xs font-semibold ${isUp ? 'text-push' : 'text-red-400'}`}>
                              {isUp ? '↑' : '↓'} {Math.abs(toDisplayWeight(trend.changeE1rm, unit))} {unit} ({trend.changePct >= 0 ? '+' : ''}{trend.changePct}%)
                            </p>
                          )}
                        </div>
                      </div>
                      <MiniChart points={points} color={style.hex} gradientId={`spark-${trend.exerciseId}`} />
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        {trend.lastSets.map(set => (
                          <span key={set.id} className={`rounded-lg ${style.softBg} px-2 py-1 ${style.text}`}>{toDisplayWeight(set.weight, unit)}×{set.reps}</span>
                        ))}
                        {trend.heaviest !== null && <span className="ml-auto self-center text-muted">Best {toDisplayWeight(trend.heaviest, unit)} {unit}</span>}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {trends.length > TOP_COUNT && (
              <button className={`min-h-11 rounded-xl ${groupStyle.softBg} text-sm ${groupStyle.text}`} onClick={() => setIsShowingAll(!isShowingAll)}>
                {isShowingAll ? 'Show top 5' : `Show all ${trends.length}`}
              </button>
            )}
          </>
        )}
    </main>
  )
}
