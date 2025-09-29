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
      ? 'bg-blue-50 text-blue-700'
      : 'bg-emerald-50 text-emerald-700'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${badgeColorClass}`}
        >
          {badgeText}
        </span>
      </div>
      {children}
      <div className="mt-4 grid grid-cols-2 gap-3">{stats}</div>
    </div>
  )
}
