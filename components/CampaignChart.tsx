'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface Metric {
  timestamp: string
  ctr: number
  cpc: number
  roas: number
  conversions: number
  bounceRate: number
  spend: number
  isAnomaly: boolean
  anomalyType: string | null
}

interface CampaignChartProps {
  metrics: Metric[]
  metricType: 'ctr' | 'cpc' | 'roas' | 'conversions' | 'bounceRate' | 'spend'
  title: string
}

export default function CampaignChart({ metrics, metricType, title }: CampaignChartProps) {
  const data = metrics.map((m) => ({
    timestamp: format(new Date(m.timestamp), 'MM/dd HH:mm'),
    value: m[metricType],
    isAnomaly: m.isAnomaly,
    fullDate: m.timestamp,
  }))

  const formatValue = (value: number) => {
    if (metricType === 'ctr' || metricType === 'bounceRate') {
      return `${value.toFixed(2)}%`
    }
    if (metricType === 'cpc' || metricType === 'spend') {
      return `$${value.toFixed(2)}`
    }
    if (metricType === 'roas') {
      return `${value.toFixed(2)}x`
    }
    return value.toString()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            angle={-45}
            textAnchor="end"
            height={80}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props
              const isAnomaly = payload.isAnomaly
              if (isAnomaly) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="red"
                    stroke="white"
                    strokeWidth={2}
                  />
                )
              }
              return null
            }}
            activeDot={{ r: 6 }}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

