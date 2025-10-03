export const DashboardHeader = () => {
  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Track your business performance
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last Updated</p>
          <p className="text-sm font-semibold text-primary">Just Now</p>
        </div>
      </div>
    </div>
  )
}
