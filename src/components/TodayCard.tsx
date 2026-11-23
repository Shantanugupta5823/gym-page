import { Link } from 'react-router-dom'
import { useSettings } from '@/db/settings'
import { getNextRollingDay, getTodayDay } from '@/lib/rotation'
import { useStartWorkout } from '@/lib/useStartWorkout'
import { DAY_TYPE_STYLES } from '@/lib/dayType'
import { estimateMinutes, getDayMuscles, getMainItems } from '@/lib/plan'
import { useActiveWorkout, useExerciseMap, useFinishedWorkouts, usePlanDays } from '@/db/queries'

export const TodayCard = () => {
  const settings = useSettings()
  const planDays = usePlanDays()
  const activeWorkout = useActiveWorkout()
  const finishedWorkouts = useFinishedWorkouts()
  const exerciseMap = useExerciseMap()
  const startWorkout = useStartWorkout()

  if (!planDays || !finishedWorkouts || activeWorkout === undefined) return null

  if (activeWorkout) {
    const style = DAY_TYPE_STYLES[activeWorkout.dayType]
    return (
      <section className={`rounded-3xl border ${style.border} ${style.softBg} p-5`}>
        <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>In progress</p>
        <h2 className="mt-1 font-heading text-2xl font-semibold">{activeWorkout.dayName}</h2>
        <Link to="/workout" className={`mt-4 flex min-h-12 items-center justify-center rounded-xl font-semibold text-bg ${style.bg}`}>
          Resume workout
        </Link>
      </section>
    )
  }

  const { day, isRestDay } = getTodayDay({
    planDays,
    workouts: finishedWorkouts,
    mode: settings.rotationMode,
    weekdayPlan: settings.weekdayPlan,
    now: Date.now()
  })
  const rollingDay = getNextRollingDay(planDays, finishedWorkouts)
  const dayToStart = day ?? rollingDay

  if (!dayToStart) {
    return (
      <section className="rounded-3xl border border-border bg-surface p-5">
        <h2 className="font-heading text-xl font-semibold">No plan yet</h2>
        <Link to="/plan" className="mt-3 inline-flex min-h-11 items-center text-push">Add days in Plan →</Link>
      </section>
    )
  }

  const style = DAY_TYPE_STYLES[dayToStart.type]
  const dayNumber = [...planDays].sort((a, b) => a.order - b.order).findIndex(planDay => planDay.id === dayToStart.id) + 1
  const muscles = getDayMuscles(dayToStart.items, exerciseMap)

  return (
    <section className="rounded-3xl border border-border bg-surface p-5">
      <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
        {isRestDay ? 'Rest day · or train anyway' : 'Next up'} · Day {dayNumber} of {planDays.length}
      </p>
      <h2 className="mt-1 font-heading text-2xl font-semibold">{dayToStart.name}</h2>
      <p className="mt-1 text-sm text-muted">{muscles.join(' · ')}</p>
      <p className="mt-1 text-sm text-muted">
        {getMainItems(dayToStart.items).length} exercises · ~{estimateMinutes(dayToStart.items)} min
      </p>
      <button className={`mt-4 min-h-12 w-full rounded-xl font-semibold text-bg ${style.bg}`} onClick={() => startWorkout(dayToStart)}>
        Start workout
      </button>
    </section>
  )
}
