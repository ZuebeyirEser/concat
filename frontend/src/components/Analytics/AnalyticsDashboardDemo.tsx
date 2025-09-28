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
    </div>
  )
}
