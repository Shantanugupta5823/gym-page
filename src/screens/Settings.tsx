import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImportFileError } from '@/lib/errors'
import { NumberInput } from '@/components/NumberInput'
import { setSetting, useSettings } from '@/db/settings'
import { exportBackup, importBackup, resetData } from '@/db/backup'
import { fromDisplayWeight, toDisplayWeight } from '@/lib/units'
import type { Unit } from '@/db/types'

const UNITS: Unit[] = ['kg', 'lb']

export const Settings = () => {
  const settings = useSettings()
  const [message, setMessage] = useState('')

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

  async function handleReset (): Promise<void> {
    if (!window.confirm('Delete all workouts, bodyweight and plan edits? This cannot be undone.')) return
    await resetData()
    setMessage('Data reset to the seed plan')
  }

  const rowClass = 'flex items-center justify-between gap-3 text-sm'

  return (
    <main className="flex flex-col gap-4 p-5">
      <header className="flex items-center gap-2">
        <Link to="/plan" aria-label="Back" className="flex size-11 items-center justify-center text-xl text-muted">←</Link>
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
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
          <span>Default rest (sec)</span>
          <NumberInput className="w-20" label="Default rest seconds" value={settings.restDefault} onCommit={value => setSetting('restDefault', value)} />
        </div>
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
        <button className="min-h-12 rounded-xl bg-surface-2 text-red-400" onClick={handleReset}>Reset data</button>
        {message && <p className="text-center text-sm text-muted">{message}</p>}
      </section>
    </main>
  )
}
