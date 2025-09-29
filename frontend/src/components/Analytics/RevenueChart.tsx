import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AnalyticsToolTip } from './AnalyticsToolTip'

interface ChartDataPoint {
  month: string
  users: number
  revenue: number
}

export const RevenueChart = ({ data }: { data: ChartDataPoint[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
      <Tooltip content={<AnalyticsToolTip />} />
      <Bar
        dataKey="revenue"
        fill="#10b981"
        radius={[8, 8, 0, 0]}
        name="Revenue"
      />
    </BarChart>
  </ResponsiveContainer>
)
