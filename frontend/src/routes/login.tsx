import { Body_login_login_access_token } from '@/client'
import { LoginForm } from '@/components/login-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useAuth, { isLoggedIn } from '@/hooks/useAuth'
import { emailPattern, passwordRules } from '@/utils'
import { Label } from '@radix-ui/react-label'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SubmitHandler, useForm } from 'react-hook-form'

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
      {/* Use the new LoginForm and pass props */}
      <div className="w-full max-w-sm">
        <LoginForm
          className="w-full max-w-md"
          // wrap the form submission
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Pass in your controlled Inputs */}
          <div className="grid gap-2">
            <Label htmlFor="username">Email</Label>
            <Input
              id="username"
              type="email"
              placeholder="Email"
              {...register('username', {
                required: 'Username is required',
                pattern: emailPattern,
              })}
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              {...register('password', passwordRules())}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </LoginForm>
      </div>
    </div>
  )
}
