import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'

interface DragState {
  from: number
  to: number
  offsetY: number
}

interface HandleProps {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
  onPointerMove: (event: PointerEvent<HTMLElement>) => void
  onPointerUp: () => void
  onPointerCancel: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

const ROW_GAP_PX = 8
const DRAG_TRANSITION = 'transform 150ms'

// Pointer-based list reorder: drag a handle, rows shift to show the drop slot, onReorder fires on release
export function useDragReorder (count: number, onReorder: (from: number, to: number) => void) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const rowElements = useRef<(HTMLElement | null)[]>([])
  const startY = useRef(0)
  const rowRects = useRef<DOMRect[]>([])

  const setRowRef = (index: number) => (element: HTMLElement | null) => {
    rowElements.current[index] = element
  }

  function getHandleProps (index: number): HandleProps {
    return {
      onPointerDown: event => {
        event.currentTarget.setPointerCapture(event.pointerId)
        startY.current = event.clientY
        rowRects.current = rowElements.current.slice(0, count).map(element => element?.getBoundingClientRect() ?? new DOMRect())
        setDrag({ from: index, to: index, offsetY: 0 })
      },
      onPointerMove: event => {
        if (!drag) return
        const offsetY = event.clientY - startY.current
        const rects = rowRects.current
        const center = rects[drag.from].top + rects[drag.from].height / 2 + offsetY
        const distances = rects.map(rect => Math.abs(rect.top + rect.height / 2 - center))
        setDrag({ from: drag.from, to: distances.indexOf(Math.min(...distances)), offsetY })
      },
      onPointerUp: finishDrag,
      onPointerCancel: () => setDrag(null),
      onKeyDown: event => {
        const target = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : index
        if (target === index || target < 0 || target >= count) return
        event.preventDefault()
        onReorder(index, target)
      }
    }
  }

  function finishDrag (): void {
    if (drag && drag.from !== drag.to) onReorder(drag.from, drag.to)
    setDrag(null)
  }

  function getRowStyle (index: number): CSSProperties | undefined {
    if (!drag) return undefined
    if (index === drag.from) return { transform: `translateY(${drag.offsetY}px) scale(1.02)`, zIndex: 10, position: 'relative' }

    const shift = rowRects.current[drag.from].height + ROW_GAP_PX
    const isPushedUp = drag.from < drag.to && index > drag.from && index <= drag.to
    const isPushedDown = drag.from > drag.to && index >= drag.to && index < drag.from
    if (isPushedUp) return { transform: `translateY(${-shift}px)`, transition: DRAG_TRANSITION }
    if (isPushedDown) return { transform: `translateY(${shift}px)`, transition: DRAG_TRANSITION }
    return { transition: DRAG_TRANSITION }
  }

  return { draggedIndex: drag?.from ?? null, setRowRef, getHandleProps, getRowStyle }
}
