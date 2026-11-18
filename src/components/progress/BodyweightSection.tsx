import { useState } from 'react'
import { Sheet } from '@/components/Sheet'
import { useBodyweight, logBodyweight } from '@/db/queries'
import { TrendChart } from '@/components/progress/TrendChart'
import { fromDisplayWeight, toDisplayWeight } from '@/lib/units'
import type { Unit } from '@/db/types'

interface BodyweightSectionProps {
  unit: Unit
}

export const BodyweightSection = ({ unit }: BodyweightSectionProps) => {
  const entries = useBodyweight()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [valueText, setValueText] = useState('')

  async function handleSave (): Promise<void> {
    const parsed = Number(valueText.replace(',', '.'))
    if (Number.isNaN(parsed) || parsed <= 0) return
    await logBodyweight(fromDisplayWeight(parsed, unit), Date.now())
    setValueText('')
    setIsSheetOpen(false)
  }

  const points = (entries ?? []).map(entry => ({ date: entry.date, value: toDisplayWeight(entry.kg, unit) }))

  return (
    <section className="rounded-2xl bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold">Bodyweight</h2>
        <button className="min-h-11 text-sm text-push" onClick={() => setIsSheetOpen(true)}>+ log weight</button>
      </div>
      <TrendChart points={points} unitLabel={unit} color="#A3E635" />

      {isSheetOpen && (
        <Sheet title="Log bodyweight" onClose={() => setIsSheetOpen(false)}>
          <input
            className="min-h-12 w-full rounded-xl border border-border bg-surface-2 px-3 text-lg"
            inputMode="decimal"
            placeholder={`Weight in ${unit}`}
            value={valueText}
            onChange={event => setValueText(event.target.value)}
          />
          <button className="mt-3 min-h-12 w-full rounded-xl bg-push font-semibold text-bg" onClick={handleSave}>Save</button>
        </Sheet>
      )}
    </section>
  )
}
