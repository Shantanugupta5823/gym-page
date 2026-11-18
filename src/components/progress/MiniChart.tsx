import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { formatShortDate } from '@/lib/dates'
import type { TrendPoint } from '@/lib/progressGroups'

interface MiniChartProps {
  points: TrendPoint[]
  color: string
  gradientId: string
}

const CHART_HEIGHT = 120
const Y_AXIS_WIDTH = 30
const TICK_FONT_SIZE = 10

// Only the first and last date and the min and max value are labelled, which is what a glance needs
export const MiniChart = ({ points, color, gradientId }: MiniChartProps) => {
  if (points.length < 2) return <p className="flex h-20 items-center text-xs text-muted">Log another session in this range to see a trend</p>

  const values = points.map(point => point.value)
  const dateTicks = [points[0].date, points[points.length - 1].date]

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" ticks={dateTicks} tickFormatter={formatShortDate} stroke="#A1A1AA" fontSize={TICK_FONT_SIZE} tickLine={false} axisLine={false} padding={{ left: 4, right: 4 }} interval={0} />
        <YAxis
          width={Y_AXIS_WIDTH}
          domain={[Math.min(...values), Math.max(...values)]}
          ticks={[Math.min(...values), Math.max(...values)]}
          tickFormatter={value => String(Math.round(value))}
          stroke="#A1A1AA"
          fontSize={TICK_FONT_SIZE}
          tickLine={false}
          axisLine={false}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} dot={{ r: 2.5, fill: color, strokeWidth: 0 }} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
