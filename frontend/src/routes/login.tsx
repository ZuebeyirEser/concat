import { LoginForm } from '@/components/LoginForm'
import { isLoggedIn } from '@/hooks/useAuth'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: '/' })
    }
  },
})

function Login() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border/60 bg-card p-8 shadow-lg ring-1 ring-border/20">
          <LoginForm className="w-full" />
        </div>
      </div>
    </div>
  )
}
