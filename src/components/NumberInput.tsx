import { useState } from 'react'
import { parseNumberInput } from '@/lib/sets'

interface NumberInputProps {
  value: number
  onCommit: (value: number) => void
  label: string
  className?: string
  // Called on every keystroke with the typed number (null while invalid), so a parent can act before blur
  onDraft?: (value: number | null) => void
}

export const NumberInput = ({ value, onCommit, label, className = '', onDraft }: NumberInputProps) => {
  const [text, setText] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(String(value))
  }

  function commit (): void {
    const parsed = parseNumberInput(text)
    if (parsed === null) {
      setText(String(value))
      onDraft?.(value)
      return
    }
    if (parsed !== value) onCommit(parsed)
  }

  return (
    <input
      className={`min-h-11 rounded-xl border border-border bg-surface-2 px-2 text-center font-heading text-base ${className}`}
      type="text"
      inputMode="decimal"
      aria-label={label}
      value={text}
      onChange={event => { setText(event.target.value); onDraft?.(parseNumberInput(event.target.value)) }}
      onBlur={commit}
      onFocus={event => event.target.select()}
    />
  )
}
