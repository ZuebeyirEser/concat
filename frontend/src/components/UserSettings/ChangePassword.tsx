import { useMutation } from '@tanstack/react-query'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { FiLock } from 'react-icons/fi'

import { type ApiError, type UpdatePassword, UsersService } from '@/client'
import useCustomToast from '@/hooks/useCustomToast'
import { confirmPasswordRules, handleError, passwordRules } from '@/utils'
import { Button } from '../ui/button'
import { PasswordInput } from '@/components/ui/password-input'

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string
}

const ChangePassword = () => {
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast('Password updated successfully.')
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async data => {
    mutation.mutate(data)
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Security Header */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-red-500/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
            <FiLock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Password Security</h3>
            <p className="text-sm text-muted-foreground">
              Keep your account secure with a strong password
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <PasswordInput
              type="current_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register('current_password', passwordRules())}
              placeholder="••••••••"
              errors={errors}
            />

            <PasswordInput
              type="new_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register('new_password', passwordRules())}
              placeholder="••••••••"
              errors={errors}
            />

            <PasswordInput
              type="confirm_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register('confirm_password', confirmPasswordRules(getValues))}
              placeholder="••••••••"
              errors={errors}
            />
          </div>

          {/* Password Requirements */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-medium text-foreground">
              Password Requirements
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-8"
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default ChangePassword
