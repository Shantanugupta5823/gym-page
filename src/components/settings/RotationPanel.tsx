import { Select } from '@/components/Select'
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
    <div className="flex flex-col">
      <h3 className="mb-2 text-sm">Rotation</h3>
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
              <Select
                title={`${formatWeekday(ANCHOR_SUNDAY_MS + weekday * DAY_MS)} workout`}
                className="w-36"
                value={String(settings.weekdayPlan[weekday] ?? '')}
                options={[{ value: '', label: 'Rest' }, ...planDays.map(day => ({ value: String(day.id), label: day.name }))]}
                onChange={value => setSetting('weekdayPlan', { ...settings.weekdayPlan, [weekday]: value === '' ? null : Number(value) })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
