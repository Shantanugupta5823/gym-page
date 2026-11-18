import { useState } from 'react'

interface NumberInputProps {
  value: number
  onCommit: (value: number) => void
  label: string
  className?: string
}

export const NumberInput = ({ value, onCommit, label, className = '' }: NumberInputProps) => {
  const [text, setText] = useState(String(value))
  const [syncedValue, setSyncedValue] = useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(String(value))
  }

  function commit (): void {
    const parsed = Number(text.replace(',', '.'))
    if (text.trim() === '' || Number.isNaN(parsed) || parsed < 0) {
      setText(String(value))
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
      onChange={event => setText(event.target.value)}
      onBlur={commit}
      onFocus={event => event.target.select()}
    />
  )
}
