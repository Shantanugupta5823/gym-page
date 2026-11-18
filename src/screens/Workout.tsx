import { TodayCard } from '@/components/TodayCard'
import { useStartWorkout } from '@/lib/useStartWorkout'
import { DAY_TYPE_STYLES } from '@/lib/dayType'
import { ActiveSession } from '@/components/workout/ActiveSession'
import { useActiveWorkout, usePlanDays } from '@/db/queries'

export const Workout = () => {
  const activeWorkout = useActiveWorkout()
  const planDays = usePlanDays()
  const startWorkout = useStartWorkout()

  if (activeWorkout === undefined || !planDays) return null
  if (activeWorkout) return <ActiveSession workout={activeWorkout} />

  return (
    <main className="flex flex-col gap-4 p-5">
      <h1 className="font-heading text-2xl font-semibold">Workout</h1>
      <TodayCard />

      <section>
        <h2 className="mb-2 font-heading text-base font-semibold">Or pick a different day</h2>
        <ul className="flex flex-col gap-2">
          {planDays.map(day => (
            <li key={day.id}>
              <button className="flex min-h-14 w-full items-center justify-between rounded-xl bg-surface px-4 text-left" onClick={() => startWorkout(day)}>
                <span className="font-medium">{day.name}</span>
                <span className={`text-sm ${DAY_TYPE_STYLES[day.type].text}`}>{DAY_TYPE_STYLES[day.type].label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
