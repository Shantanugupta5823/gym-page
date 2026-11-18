import { formatDuration } from '@/lib/dates'

interface RestTimerProps {
  endsAt: number
  totalSec: number
  now: number
  accentBg: string
  onAddTime: () => void
  onSkip: () => void
}

const MS_PER_SECOND = 1000

export const RestTimer = ({ endsAt, totalSec, now, accentBg, onAddTime, onSkip }: RestTimerProps) => {
  const remainingSec = Math.max(0, Math.ceil((endsAt - now) / MS_PER_SECOND))
  const fraction = Math.min(1, remainingSec / totalSec)

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="rounded-2xl border border-border bg-surface-2 p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Rest</p>
            <p className="font-heading text-2xl font-semibold">{formatDuration(remainingSec)}</p>
          </div>
          <div className="flex gap-2">
            <button className="min-h-11 rounded-xl bg-surface px-4 text-sm" onClick={onAddTime}>+30s</button>
            <button className="min-h-11 rounded-xl bg-surface px-4 text-sm" onClick={onSkip}>Skip</button>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
          <div className={`h-full ${accentBg}`} style={{ width: `${fraction * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
