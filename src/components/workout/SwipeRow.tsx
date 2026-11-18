import { useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'

interface SwipeRowProps {
  onDelete: () => void
  children: ReactNode
}

const DELETE_THRESHOLD_PX = 90
const DRAG_START_PX = 10

export const SwipeRow = ({ onDelete, children }: SwipeRowProps) => {
  const startX = useRef<number | null>(null)
  const [offset, setOffset] = useState(0)

  function handleMove (event: PointerEvent<HTMLDivElement>): void {
    if (startX.current === null) return
    const delta = event.clientX - startX.current
    if (Math.abs(delta) < DRAG_START_PX) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setOffset(Math.min(0, delta))
  }

  function handleEnd (): void {
    if (offset <= -DELETE_THRESHOLD_PX) onDelete()
    startX.current = null
    setOffset(0)
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${offset < 0 ? 'bg-red-600/80' : ''}`}>
      {offset < 0 && <span className="absolute inset-y-0 right-4 flex items-center text-sm font-semibold">Delete</span>}
      <div
        className="relative touch-pan-y bg-surface"
        style={{ transform: `translateX(${offset}px)`, transition: startX.current === null ? 'transform 0.15s' : 'none' }}
        onPointerDown={event => { startX.current = event.clientX }}
        onPointerMove={handleMove}
        onPointerUp={handleEnd}
        onPointerCancel={handleEnd}
      >
        {children}
      </div>
    </div>
  )
}
