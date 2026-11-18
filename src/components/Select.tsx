import { useState } from 'react'
import { Sheet } from '@/components/Sheet'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  title: string
  value: string
  options: SelectOption[]
  className?: string
  onChange: (value: string) => void
}

const SEARCH_MIN_OPTIONS = 8

export const Select = ({ title, value, options, className = '', onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find(option => option.value === value)
  const hasSearch = options.length >= SEARCH_MIN_OPTIONS
  const visibleOptions = options.filter(option => option.label.toLowerCase().includes(query.trim().toLowerCase()))

  function close (): void {
    setIsOpen(false)
    setQuery('')
  }

  function pick (optionValue: string): void {
    onChange(optionValue)
    close()
  }

  return (
    <>
      <button
        className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-3 text-left ${className}`}
        aria-haspopup="listbox"
        aria-label={title}
        onClick={() => setIsOpen(true)}
      >
        <span className="truncate">{selected?.label ?? 'Select'}</span>
        <span className="text-xs text-muted" aria-hidden>▾</span>
      </button>

      {isOpen && (
        <Sheet title={title} onClose={close}>
          {hasSearch && (
            <input
              className="mb-3 min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3"
              placeholder="Search"
              aria-label="Search options"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          )}
          <ul role="listbox" className="flex flex-col gap-1">
            {visibleOptions.map(option => {
              const isSelected = option.value === value
              return (
                <li key={option.value}>
                  <button
                    role="option"
                    aria-selected={isSelected}
                    className={`flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left ${isSelected ? 'bg-surface-2 font-semibold text-push' : ''}`}
                    onClick={() => pick(option.value)}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span aria-hidden>✓</span>}
                  </button>
                </li>
              )
            })}
            {visibleOptions.length === 0 && <li className="p-3 text-sm text-muted">No matches</li>}
          </ul>
        </Sheet>
      )}
    </>
  )
}
