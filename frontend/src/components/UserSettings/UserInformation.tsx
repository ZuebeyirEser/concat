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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Profile Information
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update your personal details and contact information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </Label>
          {editMode ? (
            <Input
              id="full_name"
              {...register("full_name", { maxLength: 30 })}
              type="text"
              className="max-w-md bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500"
              placeholder="Enter your full name"
            />
          ) : (
            <div className="flex items-center justify-between max-w-md">
              <p className={`text-sm py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border ${
                !currentUser?.full_name ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
              }`}>
                {currentUser?.full_name || "Not provided"}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </Label>
          {editMode ? (
            <div className="space-y-2">
              <Input
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: emailPattern,
                })}
                type="email"
                className={`max-w-md bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500 ${
                  errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between max-w-md">
              <p className="text-sm py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border text-gray-900 dark:text-gray-100">
                {currentUser?.email}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={toggleEditMode}
            type={editMode ? "button" : "submit"}
            disabled={editMode ? (!isDirty || !getValues("email") || isSubmitting) : false}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            {editMode ? (isSubmitting ? "Saving..." : "Save Changes") : "Edit Profile"}
          </Button>
          {editMode && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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
