export const DAY_MS = 86_400_000

const DAYS_PER_WEEK = 7
const MORNING_END_HOUR = 12
const AFTERNOON_END_HOUR = 18
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

export function startOfDay (ms: number): number {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function startOfWeek (ms: number): number {
  const date = new Date(startOfDay(ms))
  const daysSinceMonday = (date.getDay() + 6) % DAYS_PER_WEEK
  date.setDate(date.getDate() - daysSinceMonday)
  return date.getTime()
}

export function getWeekDayStarts (ms: number): number[] {
  const weekStart = new Date(startOfWeek(ms))
  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date.getTime()
  })
}

export function getGreeting (ms: number): string {
  const hour = new Date(ms).getHours()
  if (hour < MORNING_END_HOUR) return 'Good morning'
  if (hour < AFTERNOON_END_HOUR) return 'Good afternoon'
  return 'Good evening'
}

export function formatLongDate (ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatShortDate (ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatWeekday (ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'short' })
}

export function formatDuration (totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / SECONDS_PER_HOUR)
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(2, '0')
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${rest}`
  return `${minutes}:${rest}`
}

const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60

export function formatMinutes (ms: number): string {
  const totalMinutes = Math.round(ms / MS_PER_MINUTE)
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR)
  return hours > 0 ? `${hours}h ${totalMinutes % MINUTES_PER_HOUR}m` : `${totalMinutes}m`
}
