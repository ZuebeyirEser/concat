import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartDataPoint } from './AnalyticsDashboardDemo'
import { AnalyticsToolTip } from './AnalyticsToolTip'

export const UserGrowthChart = ({ data }: { data: ChartDataPoint[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
      <Tooltip content={<AnalyticsToolTip />} />
      <Line
        type="monotone"
        dataKey="users"
        stroke="#3b82f6"
        strokeWidth={3}
        dot={{ fill: '#3b82f6', r: 4 }}
        activeDot={{ r: 6 }}
        name="Users"
      />
    </LineChart>
  </ResponsiveContainer>
)
