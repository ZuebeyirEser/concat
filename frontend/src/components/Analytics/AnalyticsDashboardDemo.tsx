import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
const mockData = [
  { month: 'Jan', users: 400, revenue: 2400 },
  { month: 'Jan', users: 300, revenue: 1340 },
  { month: 'Jan', users: 200, revenue: 9400 },
  { month: 'Jan', users: 278, revenue: 4400 },
  { month: 'Jan', users: 189, revenue: 5400 },
  { month: 'Jan', users: 239, revenue: 3400 },
]

export function AnalyticsDashboardDemo() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <h3 className="text-3xl font-medium text-gray-500">Total Users</h3>
        <p>123,4</p>
        <p className="text-sm text-green-400">12 percent up</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
        <p className="text-3xl font-bold text-green-600">$12,345</p>
        <p className="text-sm text-green-600">↑ 8% from last month</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Orders</h3>
        <p className="text-3xl font-bold text-purple-600">456</p>
        <p className="text-sm text-red-600">↓ 3% from last month</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Conversion</h3>
        <p className="text-3xl font-bold text-orange-600">3.2%</p>
        <p className="text-sm text-green-600">↑ 0.5% from last month</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
