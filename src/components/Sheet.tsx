import type { ReactNode } from 'react'

interface SheetProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export const Sheet = ({ title, onClose, children }: SheetProps) => (
  <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={onClose}>
    <div
      className="mx-auto max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-5 pb-8"
      onClick={event => event.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <button className="min-h-11 min-w-11 text-muted" onClick={onClose} aria-label="Close">✕</button>
      </div>
      {children}
    </div>
  </div>
)
