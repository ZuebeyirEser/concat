import { createFileRoute, redirect } from "@tanstack/react-router"

import { RecoverPasswordForm } from "@/components/RecoverPasswordForm"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function RecoverPassword() {
  return <RecoverPasswordForm />
}
