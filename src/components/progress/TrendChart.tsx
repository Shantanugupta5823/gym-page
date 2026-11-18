import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatShortDate } from '@/lib/dates'

export interface TrendPoint {
  date: number
  value: number
}

interface TrendChartProps {
  points: TrendPoint[]
  unitLabel: string
  color: string
}

const CHART_HEIGHT = 200
const GRADIENT_ID = 'trend-fill'

export const TrendChart = ({ points, unitLabel, color }: TrendChartProps) => {
  if (points.length === 0) return <p className="py-10 text-center text-sm text-muted">No data in this range</p>

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#222226" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#A1A1AA" fontSize={11} tickLine={false} />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#A1A1AA" fontSize={11} tickLine={false} axisLine={false} tickFormatter={value => String(Math.round(value))} />
        <Tooltip
          contentStyle={{ background: '#17171A', border: '1px solid #1F1F23', borderRadius: 12 }}
          labelFormatter={value => formatShortDate(Number(value))}
          formatter={value => [`${value} ${unitLabel}`, 'e1RM']}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${GRADIENT_ID})`} dot={{ r: 3, fill: color, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
