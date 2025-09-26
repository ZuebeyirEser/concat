import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { FiLock, FiUser } from 'react-icons/fi'

import type { UserRegister } from '@/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '../components/ui/password-input'
import Logo from '@/components/ui/logo'
import useAuth, { isLoggedIn } from '@/hooks/useAuth'
import { confirmPasswordRules, emailPattern, passwordRules } from '@/utils'

export const Route = createFileRoute('/signup')({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: '/',
      })
    }
  },
})

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  const { signUpMutation } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      email: '',
      full_name: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = data => {
    signUpMutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:flex-row">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border/60 bg-card p-8 shadow-lg ring-1 ring-border/20">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="mb-4 flex justify-center">
              <Logo size="xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  id="full_name"
                  minLength={3}
                  {...register('full_name', {
                    required: 'Full Name is required',
                  })}
                  placeholder="Full Name"
                  type="text"
                  className={`pl-10 ${errors.full_name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.full_name && (
                <p className="text-sm text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  id="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: emailPattern,
                  })}
                  placeholder="Email"
                  type="email"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <PasswordInput
              type="password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register('password', passwordRules())}
              placeholder="Password"
              errors={errors}
            />

            <PasswordInput
              type="confirm_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register('confirm_password', confirmPasswordRules(getValues))}
              placeholder="Confirm Password"
              errors={errors}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{' '}
              <RouterLink to="/login" className="text-primary hover:underline">
                Log In
              </RouterLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp
