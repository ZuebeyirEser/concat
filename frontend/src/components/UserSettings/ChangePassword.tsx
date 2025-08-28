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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Security Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Update your password to keep your account secure
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <PasswordInput
              type="current_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register("current_password", passwordRules())}
              placeholder="Enter your current password"
              errors={errors}
              className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <PasswordInput
              type="new_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register("new_password", passwordRules())}
              placeholder="Enter your new password"
              errors={errors}
              className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <PasswordInput
              type="confirm_password"
              startElement={<FiLock className="h-4 w-4" />}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder="Confirm your new password"
              errors={errors}
              className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  )
}
export default ChangePassword
