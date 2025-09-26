import { createFileRoute } from '@tanstack/react-router'

import useAuth from '@/hooks/useAuth'

export const Route = createFileRoute('/_layout/')({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <div className="w-full max-w-full">
      <div className="m-4 pt-12">
        <h1 className="text-2xl font-semibold">
          Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, nice to see you again!
        </p>
      </div>
    </div>
  )
}
