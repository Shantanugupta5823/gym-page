import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImportFileError } from '@/lib/errors'
import { NumberInput } from '@/components/NumberInput'
import { setSetting, useSettings } from '@/db/settings'
import { exportBackup, exportExerciseList, importBackup, importPlan, resetData } from '@/db/backup'
import { loadSampleHistory } from '@/db/sampleHistory'
import { usePlanDays } from '@/db/queries'
import { RotationPanel } from '@/components/settings/RotationPanel'
import type { ResetPart } from '@/db/backup'
import { PLAN_TEMPLATE } from '@/lib/planFile'
import { fromDisplayWeight, toDisplayWeight } from '@/lib/units'
import type { Unit } from '@/db/types'

const UNITS: Unit[] = ['kg', 'lb']

const RESET_OPTIONS: { part: ResetPart, label: string, hint: string }[] = [
  { part: 'history', label: 'Workout history', hint: 'All logged workouts, sets and PRs' },
  { part: 'plan', label: 'Plans', hint: 'All plans, back to the default PPL split' },
  { part: 'settings', label: 'Settings', hint: 'Units, rest, increment, rotation' }
]
const ALL_PARTS = RESET_OPTIONS.map(option => option.part)

export const Settings = () => {
  const settings = useSettings()
  const planDays = usePlanDays()
  const [message, setMessage] = useState('')
  const [selectedParts, setSelectedParts] = useState<ResetPart[]>([])

  async function handleExport (): Promise<void> {
    const backup = await exportBackup()
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `gym-log-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport (file: File | undefined): Promise<void> {
    if (!file) return
    if (!window.confirm('Importing replaces all current data. Continue?')) return
    try {
      await importBackup(await file.text())
      setMessage('Backup imported')
    } catch (error) {
      if (!(error instanceof ImportFileError)) throw error
      setMessage(error.message)
    }
  }

  function downloadText (content: string, filename: string, type: string): void {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportPlan (file: File | undefined): Promise<void> {
    if (!file) return
    try {
      const dayCount = await importPlan(await file.text())
      setMessage(`Plan imported as a new plan: ${dayCount} days`)
    } catch (error) {
      if (!(error instanceof ImportFileError)) throw error
      setMessage(error.message)
    }
  }

  async function handleLoadSample (): Promise<void> {
    if (!window.confirm('Add sample workouts for testing? Remove them later with Reset > Workout history.')) return
    const count = await loadSampleHistory()
    setMessage(`Added ${count} sample workouts`)
  }

  async function handleReset (parts: ResetPart[]): Promise<void> {
    if (parts.length === 0) return
    const names = RESET_OPTIONS.filter(option => parts.includes(option.part)).map(option => option.label.toLowerCase())
    if (!window.confirm(`Reset ${names.join(', ')}? This cannot be undone.`)) return
    await resetData(parts)
    setSelectedParts([])
    setMessage(`Reset: ${names.join(', ')}`)
  }

  function togglePart (part: ResetPart): void {
    setSelectedParts(selectedParts.includes(part) ? selectedParts.filter(item => item !== part) : [...selectedParts, part])
  }

  const rowClass = 'flex items-center justify-between gap-3 text-sm'

  return (
    <main className="flex flex-col gap-4 p-5">
      <header className="flex items-center gap-2">
        <Link to="/plan" aria-label="Back" className="flex size-11 items-center justify-center text-xl text-muted">←</Link>
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
        <h2 className="font-heading text-base font-semibold">Preferences</h2>
        {planDays && <RotationPanel settings={settings} planDays={planDays} />}
        <div className={rowClass}>
          <span>Units</span>
          <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
            {UNITS.map(unit => (
              <button
                key={unit}
                className={`min-h-9 rounded-lg px-4 ${settings.unit === unit ? 'bg-push font-semibold text-bg' : 'text-muted'}`}
                onClick={() => setSetting('unit', unit)}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        <div className={rowClass}>
          <span>Rest timer</span>
          <button
            role="switch"
            aria-checked={settings.isRestTimerEnabled}
            aria-label="Rest timer"
            className={`min-h-9 rounded-lg px-4 font-semibold ${settings.isRestTimerEnabled ? 'bg-push text-bg' : 'bg-surface-2 text-muted'}`}
            onClick={() => setSetting('isRestTimerEnabled', !settings.isRestTimerEnabled)}
          >
            {settings.isRestTimerEnabled ? 'On' : 'Off'}
          </button>
        </div>
        {settings.isRestTimerEnabled && (
          <div className={rowClass}>
            <span>Default rest (sec)</span>
            <NumberInput className="w-20" label="Default rest seconds" value={settings.restDefault} onCommit={value => setSetting('restDefault', value)} />
          </div>
        )}
        <div className={rowClass}>
          <span>Weight increment ({settings.unit})</span>
          <NumberInput
            className="w-20"
            label="Weight increment"
            value={toDisplayWeight(settings.increment, settings.unit)}
            onCommit={value => setSetting('increment', fromDisplayWeight(value, settings.unit))}
          />
        </div>
        <div className={rowClass}>
          <span>Workouts per week</span>
          <NumberInput className="w-20" label="Workouts per week" value={settings.weeklyTarget} onCommit={value => setSetting('weeklyTarget', value)} />
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <button className="min-h-12 rounded-xl bg-surface-2" onClick={handleExport}>Export JSON</button>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-surface-2">
          Import JSON
          <input className="hidden" type="file" accept="application/json" onChange={event => handleImport(event.target.files?.[0])} />
        </label>
        <button className="min-h-12 rounded-xl bg-surface-2" onClick={handleLoadSample}>Load sample workouts</button>
        {message && <p className="text-center text-sm text-muted">{message}</p>}
      </section>

      <section className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <h2 className="font-heading text-base font-semibold">Workout plan file</h2>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-surface-2">
          Import plan JSON
          <input className="hidden" type="file" accept="application/json" onChange={event => handleImportPlan(event.target.files?.[0])} />
        </label>
        <button className="min-h-12 rounded-xl bg-surface-2" onClick={() => downloadText(JSON.stringify(PLAN_TEMPLATE, null, 2), 'gym-plan-template.json', 'application/json')}>
          Download plan template
        </button>
        <button className="min-h-12 rounded-xl bg-surface-2" onClick={async () => downloadText((await exportExerciseList()).join('\n'), 'gym-exercise-ids.tsv', 'text/tab-separated-values')}>
          Download exercise ID list
        </button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
        <h2 className="font-heading text-base font-semibold">Reset data</h2>
        {RESET_OPTIONS.map(option => (
          <label key={option.part} className="flex min-h-11 items-center gap-3 text-sm">
            <input
              className="size-5 accent-red-400"
              type="checkbox"
              checked={selectedParts.includes(option.part)}
              onChange={() => togglePart(option.part)}
            />
            <span>
              <span className="block">{option.label}</span>
              <span className="block text-xs text-muted">{option.hint}</span>
            </span>
          </label>
        ))}
        <button className="min-h-12 rounded-xl bg-surface-2 text-red-400 disabled:opacity-40" disabled={selectedParts.length === 0} onClick={() => handleReset(selectedParts)}>
          Reset selected
        </button>
        <button className="min-h-12 rounded-xl border border-red-400/40 text-red-400" onClick={() => handleReset(ALL_PARTS)}>
          Reset everything
        </button>
      </section>
    </main>
  )
}
