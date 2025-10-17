import { Body_login_login_access_token } from '@/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { emailPattern, passwordRules } from '@/utils'
import { SubmitHandler, useForm } from 'react-hook-form'
import Logo from './ui/logo'

interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
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
      // Error is handled by useAuth hook
    }
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <Logo />
            </a>
            <h1 className="text-xl font-bold">Welcome to Concat</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="m@example.com"
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
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 dark:bg-background dark:text-gray-400">
                Or
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <Button variant="outline" className="w-sm" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-4 w-4"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.6 1.6 2.7 2.3.3-.8.6-1.4.9-1.7-2.5-.3-5.1-1.2-5.1-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.3 10.3 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5.1 5.4.4.3.7 1 .7 2v3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.65 18.35.5 12 .5Z"
                  clipRule="evenodd"
                />
              </svg>
              Continue with GitHub
            </Button>
          </div>
        </div>
      </form>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Free to use. No tracking. No ads. No bullshit.{' '}
      </div>
    </div>
  )
}
