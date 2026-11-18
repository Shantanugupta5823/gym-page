import { setSetting } from '@/db/settings'
import { DAY_MS, formatWeekday } from '@/lib/dates'
import type { PlanDay, RotationMode, Settings } from '@/db/types'

interface RotationPanelProps {
  settings: Settings
  planDays: PlanDay[]
}

const MODES: { value: RotationMode, label: string, hint: string }[] = [
  { value: 'rolling', label: 'Rolling', hint: 'Next day follows your last completed workout, whatever the weekday' },
  { value: 'fixed', label: 'Fixed weekdays', hint: 'Each weekday maps to a plan day' }
]

// Monday 2026-11-16 anchors weekday labels; the Date index is the getDay() value (Sun=0)
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const ANCHOR_SUNDAY_MS = new Date(2026, 10, 15).getTime()

export const RotationPanel = ({ settings, planDays }: RotationPanelProps) => {
  const activeMode = MODES.find(mode => mode.value === settings.rotationMode)

  return (
    <section className="rounded-2xl bg-surface p-4">
      <h2 className="mb-2 font-heading text-base font-semibold">Rotation</h2>
      <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
        {MODES.map(mode => (
          <button
            key={mode.value}
            className={`min-h-11 flex-1 rounded-lg text-sm ${settings.rotationMode === mode.value ? 'bg-push font-semibold text-bg' : 'text-muted'}`}
            onClick={() => setSetting('rotationMode', mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{activeMode?.hint}</p>

      {settings.rotationMode === 'fixed' && (
        <ul className="mt-3 flex flex-col gap-2">
          {WEEKDAY_ORDER.map(weekday => (
            <li key={weekday} className="flex items-center justify-between text-sm">
              <span>{formatWeekday(ANCHOR_SUNDAY_MS + weekday * DAY_MS)}</span>
              <select
                className="min-h-11 rounded-xl border border-border bg-surface-2 px-2"
                value={settings.weekdayPlan[weekday] ?? ''}
                onChange={event => setSetting('weekdayPlan', { ...settings.weekdayPlan, [weekday]: event.target.value === '' ? null : Number(event.target.value) })}
              >
                <option value="">Rest</option>
                {planDays.map(day => <option key={day.id} value={day.id}>{day.name}</option>)}
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
