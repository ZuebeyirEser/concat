import { createFileRoute } from '@tanstack/react-router'

import { isLoggedIn } from '@/hooks/useAuth'
import Home from '@/pages/Home'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  if (isLoggedIn()) {
    window.location.href = '/items'
    return null
  }

  return <Home />
}
