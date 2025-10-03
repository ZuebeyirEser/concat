interface ChartCardProps {
  title: string
  badgeText: string
  badgeColor: 'blue' | 'emerald'
  children: React.ReactNode
  stats: React.ReactNode
}

export const ChartCard = ({
  title,
  badgeText,
  badgeColor,
  children,
  stats,
}: ChartCardProps) => {
  const badgeColorClass =
    badgeColor === 'blue'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${badgeColorClass}`}
        >
          {badgeText}
        </span>
      </div>
      <div className="mb-6">
        {children}
      </div>
      <div className="grid grid-cols-2 gap-4">{stats}</div>
    </div>
  )
}
