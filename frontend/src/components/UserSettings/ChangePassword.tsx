import { useMutation } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock } from "react-icons/fi"

import { type ApiError, type UpdatePassword, UsersService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"
import { Button } from "../ui/button"
import { PasswordInput } from "@/components/ui/password-input"

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
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Password updated successfully.")
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Security Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Update your password to keep your account secure
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Current Password
            </label>
            <PasswordInput
              type="current_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register("current_password", passwordRules())}
              placeholder="Enter your current password"
              errors={errors}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              New Password
            </label>
            <PasswordInput
              type="new_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register("new_password", passwordRules())}
              placeholder="Enter your new password"
              errors={errors}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <PasswordInput
              type="confirm_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder="Confirm your new password"
              errors={errors}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-6"
          >
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  )
}
export default ChangePassword
