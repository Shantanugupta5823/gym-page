import { DAY_TYPE_STYLES } from '@/lib/dayType'
import { formatWeekday, getWeekDayStarts, startOfDay } from '@/lib/dates'
import type { Workout } from '@/db/types'

interface WeekStripProps {
  workouts: Workout[]
  now: number
}

export const WeekStrip = ({ workouts, now }: WeekStripProps) => {
  const today = startOfDay(now)

  return (
    <section className="flex justify-between rounded-2xl bg-surface p-3">
      {getWeekDayStarts(now).map(dayStart => {
        const workout = workouts.find(item => item.endedAt !== undefined && startOfDay(item.endedAt) === dayStart)
        const isToday = dayStart === today
        const style = workout ? DAY_TYPE_STYLES[workout.dayType] : null

        return (
          <div key={dayStart} className="flex w-10 flex-col items-center gap-1.5">
            <span className={`text-xs ${isToday ? 'font-semibold text-text' : 'text-muted'}`}>{formatWeekday(dayStart)}</span>
            <span
              className={`flex size-9 items-center justify-center rounded-full border text-xs font-semibold ${
                style ? `${style.bg} ${style.border} text-bg` : isToday ? 'border-text text-text' : 'border-border text-muted'
              }`}
            >
              {style ? style.label[0] : new Date(dayStart).getDate()}
            </span>
          </div>
        )
      })}
    </section>
  )
}
