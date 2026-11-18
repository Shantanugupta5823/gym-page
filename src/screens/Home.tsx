import { Link } from 'react-router-dom'
import { getStreak } from '@/lib/streak'
import { findPrs } from '@/lib/records'
import { useSettings } from '@/db/settings'
import { TodayCard } from '@/components/TodayCard'
import { useNow } from '@/lib/useNow'
import { getMuscleGroup } from '@/lib/muscles'
import { WeekStrip } from '@/components/home/WeekStrip'
import { StatTile } from '@/components/home/StatTile'
import { MuscleBars } from '@/components/home/MuscleBars'
import { toDisplayWeight } from '@/lib/units'
import type { MuscleGroup } from '@/lib/muscles'
import { formatLongDate, formatShortDate, getGreeting, startOfWeek } from '@/lib/dates'
import { useDoneSets, useExerciseMap, useFinishedWorkouts } from '@/db/queries'

const RECENT_PR_COUNT = 3
const KG_PER_TONNE = 1000
const CLOCK_TICK_MS = 60_000

export const Home = () => {
  const now = useNow(CLOCK_TICK_MS)
  const settings = useSettings()
  const doneSets = useDoneSets()
  const workouts = useFinishedWorkouts()
  const exerciseMap = useExerciseMap()

  if (!doneSets || !workouts) return null

  const weekStart = startOfWeek(now)
  const weekSets = doneSets.filter(set => set.createdAt >= weekStart)
  const weekWorkouts = workouts.filter(workout => (workout.endedAt ?? 0) >= weekStart)
  const volumeTonnes = weekSets.reduce((sum, set) => sum + set.weight * set.reps, 0) / KG_PER_TONNE
  const streak = getStreak(workouts.map(workout => workout.endedAt ?? 0), now)

  const muscleCounts = new Map<MuscleGroup, number>()
  weekSets.forEach(set => {
    const groups = new Set(exerciseMap.get(set.exerciseId)?.primaryMuscles.map(getMuscleGroup))
    groups.forEach(group => {
      if (group) muscleCounts.set(group, (muscleCounts.get(group) ?? 0) + 1)
    })
  })

  const recentPrs = findPrs(doneSets).slice(0, RECENT_PR_COUNT)

  return (
    <main className="flex flex-col gap-4 p-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{formatLongDate(now)}</p>
          <h1 className="font-heading text-3xl font-semibold">{getGreeting(now)}</h1>
        </div>
        <Link to="/settings" aria-label="Settings" className="flex size-11 items-center justify-center text-xl text-muted">⚙</Link>
      </header>

      <TodayCard />
      <WeekStrip workouts={workouts} now={now} />

      <section className="flex gap-3">
        <StatTile label="Streak" value={String(streak)} hint={streak === 1 ? 'workout' : 'workouts'} />
        <StatTile label="This week" value={`${weekWorkouts.length}/${settings.weeklyTarget}`} hint="workouts" />
        <StatTile label="Volume" value={volumeTonnes.toFixed(1)} hint="tonnes" />
      </section>

      <MuscleBars counts={muscleCounts} />

      <section className="rounded-2xl bg-surface p-4">
        <h2 className="mb-3 font-heading text-base font-semibold">Recent PRs</h2>
        {recentPrs.length === 0 && <p className="text-sm text-muted">Beat your best estimated 1RM to set a PR.</p>}
        <ul className="flex flex-col gap-3">
          {recentPrs.map(pr => (
            <li key={`${pr.workoutId}-${pr.exerciseId}`} className="flex items-center justify-between text-sm">
              <span>
                <span className="block font-medium">{exerciseMap.get(pr.exerciseId)?.name ?? pr.exerciseId}</span>
                <span className="text-xs text-muted">{formatShortDate(pr.createdAt)}</span>
              </span>
              <span className="font-heading text-push">
                {toDisplayWeight(pr.weight, settings.unit)} {settings.unit} × {pr.reps}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
