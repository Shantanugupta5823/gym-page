import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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

export const TrendChart = ({ points, unitLabel, color }: TrendChartProps) => {
  if (points.length === 0) return <p className="py-10 text-center text-sm text-muted">No data in this range</p>

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="#222226" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#A1A1AA" fontSize={11} />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#A1A1AA" fontSize={11} tickFormatter={value => String(Math.round(value))} />
        <Tooltip
          contentStyle={{ background: '#17171A', border: '1px solid #1F1F23', borderRadius: 12 }}
          labelFormatter={value => formatShortDate(Number(value))}
          formatter={value => [`${value} ${unitLabel}`, '']}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
