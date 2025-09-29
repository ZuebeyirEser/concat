import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  positive: boolean
}

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  positive,
}: StatCardProps) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        <div className="mt-1 flex items-center gap-1">
          {positive ? (
            <TrendingUp className="h-3 w-3 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span
            className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {change}
          </span>
        </div>
      </div>
      <div
        className={`rounded-lg p-2 ${positive ? 'bg-emerald-50' : 'bg-red-50'}`}
      >
        <Icon
          className={`h-5 w-5 ${positive ? 'text-emerald-600' : 'text-red-600'}`}
        />
      </div>
    </div>
  </div>
)
