import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type UserPublic,
  type UserUpdateMe,
  UsersService,
} from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserPublic>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name,
      email: currentUser?.email,
    },
  })

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully.")
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<UserUpdateMe> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    toggleEditMode()
  }

  return (
    <div className="w-full max-w-full">
      <h3 className="text-lg font-semibold py-4">
        User Information
      </h3>
      <form
        className="w-full md:w-1/2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          {editMode ? (
            <Input
              id="full_name"
              {...register("full_name", { maxLength: 30 })}
              type="text"
              className="w-auto"
            />
          ) : (
            <p
              className={`text-sm py-2 truncate max-w-[250px] ${
                !currentUser?.full_name ? "text-muted-foreground" : ""
              }`}
            >
              {currentUser?.full_name || "N/A"}
            </p>
          )}
        </div>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="email">Email</Label>
          {editMode ? (
            <div className="space-y-1">
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: emailPattern,
                })}
                type="email"
                className={`w-auto ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          ) : (
            <p className="text-sm py-2 truncate max-w-[250px]">
              {currentUser?.email}
            </p>
          )}
        </div>
        
        <div className="flex mt-4 gap-3">
          <Button
            onClick={toggleEditMode}
            type={editMode ? "button" : "submit"}
            disabled={editMode ? (!isDirty || !getValues("email") || isSubmitting) : false}
          >
            {editMode ? (isSubmitting ? "Saving..." : "Save") : "Edit"}
          </Button>
          {editMode && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default UserInformation
