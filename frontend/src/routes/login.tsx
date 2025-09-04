import { Body_login_login_access_token } from '@/client'
import { LoginForm } from '@/components/login-form'
import useAuth, { isLoggedIn } from '@/hooks/useAuth'
import { emailPattern, passwordRules } from '@/utils'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: '/' })
    }
  },
})

function Login() {
  const { loginMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Body_login_login_access_token>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<Body_login_login_access_token> = async data => {
    if (isSubmitting) return
    resetError()
    try {
      await loginMutation.mutateAsync(data)
    } catch {
      // error handled in useAuth
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          className="w-full max-w-md"
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          error={error || undefined}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
