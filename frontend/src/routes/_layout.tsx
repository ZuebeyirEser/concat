import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'

import Navbar from '@/components/Common/Navigation/Navbar'
import Sidebar from '@/components/Common/Navigation/Sidebar'
import CompactFooter from '@/components/Common/Layout/CompactFooter'
import useAuth, { isLoggedIn } from '@/hooks/useAuth'

export const Route = createFileRoute('/_layout')({
  component: Layout,
})

function Layout() {
  const { isUserLoading, user } = useAuth()
  const routerState = useRouterState()

  const showFooter = routerState.location.pathname === '/'

  if (!isLoggedIn()) {
    window.location.href = '/login'
    return null
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
    return null
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1 p-4 pt-16 md:pt-4">
            <Outlet />
          </main>
          {showFooter && <CompactFooter />}
        </div>
      </div>
    </div>
  )
}

export default Layout
