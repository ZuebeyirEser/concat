import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import Navbar from "@/components/Common/Navbar"
import Sidebar from "@/components/Common/Sidebar"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  const { isUserLoading, user } = useAuth()

  // If no token in localStorage, redirect immediately
  if (!isLoggedIn()) {
    window.location.href = "/login"
    return null
  }

  // Show loading state while verifying token with server
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If we have a token but no user data, something went wrong
  if (!user) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
