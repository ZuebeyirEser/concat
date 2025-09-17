import { useMutation } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiMail } from "react-icons/fi"

import { type ApiError, LoginService } from "@/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"

interface FormData {
  email: string
}

export function RecoverPasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const { showSuccessToast } = useCustomToast()

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      email: data.email,
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast("Password recovery email sent successfully.")
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 p-6"
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          Password Recovery
        </h1>
        <p className="text-center text-muted-foreground">
          A password recovery email will be sent to the registered account.
        </p>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: emailPattern,
              })}
              placeholder="Email"
              type="email"
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Sending..." : "Continue"}
        </Button>
      </form>
    </div>
  )
}