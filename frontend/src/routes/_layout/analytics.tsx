import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboardDemo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/analytics')({
  component: AnalyticsDashboard,
})
