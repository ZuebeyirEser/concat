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
  <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        <div className="mt-2 flex items-center gap-1.5">
          {positive ? (
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-sm font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {change}
          </span>
        </div>
      </div>
      <div
        className={`rounded-xl p-3 ${positive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
      >
        <Icon
          className={`h-5 w-5 ${positive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}
        />
      </div>
    </div>
  </div>
)
