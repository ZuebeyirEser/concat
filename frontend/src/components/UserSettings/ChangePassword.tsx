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
    <div className="w-full max-w-full">
      <h3 className="text-lg font-semibold py-4">
        Change Password
      </h3>
      <form
        className="w-full md:w-[300px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
          <PasswordInput
            type="current_password"
            startElement={<FiLock className="h-4 w-4" />}
            {...register("current_password", passwordRules())}
            placeholder="Current Password"
            errors={errors}
          />
          <PasswordInput
            type="new_password"
            startElement={<FiLock className="h-4 w-4" />}
            {...register("new_password", passwordRules())}
            placeholder="New Password"
            errors={errors}
          />
          <PasswordInput
            type="confirm_password"
            startElement={<FiLock className="h-4 w-4" />}
            {...register("confirm_password", confirmPasswordRules(getValues))}
            placeholder="Confirm Password"
            errors={errors}
          />
        </div>
        <Button
          className="mt-4"
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  )
}
export default ChangePassword
