import { DollarSign, ShoppingCart, Target, Users } from 'lucide-react'
import { ChartCard } from './ChartCard'
import { DashboardHeader } from './DashboardHeader'
import { RevenueChart } from './RevenueChart'
import { StatCard } from './StatsCard'
import { UserGrowthChart } from './UserGrowthChart'

export type ChartDataPoint = {
  month: string
  users: number
  revenue: number
}

const mockData: ChartDataPoint[] = [
  { month: 'Jan', users: 400, revenue: 2400 },
  { month: 'Feb', users: 300, revenue: 1340 },
  { month: 'Mar', users: 500, revenue: 3200 },
  { month: 'Apr', users: 278, revenue: 4400 },
  { month: 'May', users: 589, revenue: 5400 },
  { month: 'Jun', users: 639, revenue: 6100 },
]

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ChartCard
            title="User Growth"
            badgeText="6 months"
            badgeColor="blue"
            stats={
              <>
                <StatCard
                  title="Total Users"
                  value="12,345"
                  change="+12%"
                  icon={Users}
                  positive={true}
                />
                <StatCard
                  title="Conversion"
                  value="3.2%"
                  change="+0.5%"
                  icon={Target}
                  positive={true}
                />
              </>
            }
          >
            <UserGrowthChart data={mockData} />
          </ChartCard>

          <ChartCard
            title="Revenue"
            badgeText="6 months"
            badgeColor="emerald"
            stats={
              <>
                <StatCard
                  title="Revenue"
                  value="$23,456"
                  change="+8%"
                  icon={DollarSign}
                  positive={true}
                />
                <StatCard
                  title="Orders"
                  value="456"
                  change="-3%"
                  icon={ShoppingCart}
                  positive={false}
                />
              </>
            }
          >
            <RevenueChart data={mockData} />
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
