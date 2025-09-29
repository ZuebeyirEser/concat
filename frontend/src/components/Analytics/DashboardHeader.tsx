export const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {' '}
          Track your business performance
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Last Updated</p>
        <p className="text-sm font-semibold text-orange-900">Just Now</p>
      </div>
    </div>
  )
}
