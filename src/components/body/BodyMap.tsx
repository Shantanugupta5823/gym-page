import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { BACK_REGIONS, FRONT_REGIONS } from '@/components/body/bodyRegions'
import type { BodyRegion } from '@/components/body/bodyRegions'
import type { MuscleGroup } from '@/lib/muscles'

interface BodyMapProps {
  // 0..1 per muscle; a muscle that is missing stays grey
  ratios: Map<MuscleGroup, number>
  // Muscles the next workout trains get an outline in the day's colour
  outlined?: Set<MuscleGroup>
  outlineColor?: string
  selected?: MuscleGroup | null
  onSelect?: (group: MuscleGroup | null) => void
  // Pixel height of the figure
  height?: number
}

const MAX_ANGLE = 180
const DEGREES_PER_PX = 0.9
const TAP_SLOP_PX = 6
const SILHOUETTE = '#1D1D22'
const UNTRAINED = '#2C2C33'
const GAP = '#0B0B0C'

// Dark green for the first set, bright green once the rotation's target is reached
export function coverageColor (ratio: number): string {
  if (ratio <= 0) return UNTRAINED
  if (ratio >= 1) return '#4ADE80'
  const lightness = 20 + ratio * 30
  return `hsl(142 65% ${lightness}%)`
}

interface FigureProps extends Omit<BodyMapProps, 'height'> {
  regions: BodyRegion[]
  onTap: (group: MuscleGroup | null) => void
}

const Figure = ({ regions, ratios, outlined, outlineColor, selected, onTap }: FigureProps) => (
  <svg viewBox="-4 -2 108 206" className="h-full w-full overflow-visible" aria-hidden="true">
    {/* A thick stroke in one colour fuses the parts into one silhouette behind the muscles */}
    <g fill={SILHOUETTE} stroke={SILHOUETTE} strokeWidth={3.2} strokeLinejoin="round">
      {regions.map(region => <polygon key={`s-${region.points}`} points={region.points} />)}
    </g>
    <g strokeLinejoin="round">
      {regions.map(region => {
        const { group } = region
        const isSelected = group !== null && group === selected
        const isOutlined = group !== null && (outlined?.has(group) ?? false)
        const fill = group ? coverageColor(ratios.get(group) ?? 0) : SILHOUETTE

        return (
          <polygon
            key={region.points}
            points={region.points}
            fill={fill}
            stroke={isSelected ? '#F4F4F5' : isOutlined ? outlineColor : GAP}
            strokeWidth={isSelected ? 1.1 : isOutlined ? 0.8 : 0.6}
            className={group ? 'cursor-pointer transition-[fill] duration-500' : undefined}
            onClick={() => onTap(group)}
          />
        )
      })}
    </g>
  </svg>
)

// Drag sideways to turn the figure up to 180°; it settles on the front or the back when let go
export const BodyMap = ({ height = 380, onSelect, ...figureProps }: BodyMapProps) => {
  const [angle, setAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const drag = useRef<{ x: number, angle: number, moved: boolean } | null>(null)
  const wasDragged = useRef(false)

  const onPointerDown = (event: PointerEvent) => {
    drag.current = { x: event.clientX, angle, moved: false }
    wasDragged.current = false
  }

  const onPointerMove = (event: PointerEvent) => {
    const start = drag.current
    if (!start) return
    const dx = event.clientX - start.x
    if (!start.moved && Math.abs(dx) < TAP_SLOP_PX) return
    if (!start.moved) {
      start.moved = true
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    setAngle(Math.min(MAX_ANGLE, Math.max(0, start.angle + dx * DEGREES_PER_PX)))
  }

  const onPointerUp = () => {
    if (drag.current?.moved) {
      wasDragged.current = true
      setAngle(current => (current >= MAX_ANGLE / 2 ? MAX_ANGLE : 0))
    }
    drag.current = null
    setIsDragging(false)
  }

  const onTap = (group: MuscleGroup | null) => {
    if (wasDragged.current) return
    onSelect?.(group === figureProps.selected ? null : group)
  }

  const isBack = angle >= MAX_ANGLE / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-full touch-pan-y select-none"
        style={{ height, perspective: 900 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="absolute bottom-1 left-1/2 h-3 w-28 -translate-x-1/2 rounded-[50%] bg-black/60 blur-md" />
        <div
          className="relative mx-auto h-full"
          style={{
            width: height / 2,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            <Figure regions={FRONT_REGIONS} onTap={onTap} {...figureProps} />
          </div>
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <Figure regions={BACK_REGIONS} onTap={onTap} {...figureProps} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className={isBack ? '' : 'font-semibold text-text'}>Front</span>
        <button
          className="flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 text-text"
          onClick={() => setAngle(isBack ? 0 : MAX_ANGLE)}
        >
          <span aria-hidden="true">↻</span> Turn
        </button>
        <span className={isBack ? 'font-semibold text-text' : ''}>Back</span>
      </div>
    </div>
  )
}
