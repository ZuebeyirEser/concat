import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useRef, useEffect } from "react"
import { FiEdit2, FiUser, FiMail } from "react-icons/fi"

import {
  type ApiError,
  type UserUpdateMe,
  UsersService,
} from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"
import { Input } from "../ui/input"

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { user: currentUser } = useAuth()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState({
    full_name: currentUser?.full_name || "",
    email: currentUser?.email || "",
  })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingField])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingField && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleSave()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editingField, tempValues])

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Profile updated successfully.")
      setEditingField(null)
    },
    onError: (err: ApiError) => {
      handleError(err)
      // Reset temp values on error
      setTempValues({
        full_name: currentUser?.full_name || "",
        email: currentUser?.email || "",
      })
      setEditingField(null)
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleDoubleClick = (field: string) => {
    setEditingField(field)
  }

  const handleSave = () => {
    if (!editingField) return

    const currentValue = tempValues[editingField as keyof typeof tempValues]
    const originalValue = editingField === 'full_name' ? currentUser?.full_name : currentUser?.email

    // Only save if value changed and is valid
    if (currentValue !== originalValue && currentValue.trim()) {
      if (editingField === 'email' && !emailPattern.pattern.test(currentValue)) {
        handleError({ detail: "Please enter a valid email address" } as ApiError)
        setTempValues({
          full_name: currentUser?.full_name || "",
          email: currentUser?.email || "",
        })
        setEditingField(null)
        return
      }

      mutation.mutate({
        [editingField]: currentValue.trim()
      } as UserUpdateMe)
    } else {
      setEditingField(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setTempValues({
        full_name: currentUser?.full_name || "",
        email: currentUser?.email || "",
      })
      setEditingField(null)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setTempValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Profile Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Double-click any field to edit. Changes save automatically.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Full Name Field */}
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <FiUser className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
          </div>
          <div className="relative">
            {editingField === 'full_name' ? (
              <Input
                ref={inputRef}
                value={tempValues.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your full name"
                maxLength={30}
              />
            ) : (
              <div
                onDoubleClick={() => handleDoubleClick('full_name')}
                className="group/field flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className={`${
                  !currentUser?.full_name ? "text-gray-500 dark:text-gray-400 italic" : "text-gray-900 dark:text-gray-100"
                }`}>
                  {currentUser?.full_name || "Not provided"}
                </span>
                <FiEdit2 className="h-4 w-4 text-gray-400 opacity-0 group-hover/field:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <FiMail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
          </div>
          <div className="relative">
            {editingField === 'email' ? (
              <Input
                ref={inputRef}
                type="email"
                value={tempValues.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your email address"
              />
            ) : (
              <div
                onDoubleClick={() => handleDoubleClick('email')}
                className="group/field flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-900 dark:text-gray-100">
                  {currentUser?.email}
                </span>
                <FiEdit2 className="h-4 w-4 text-gray-400 opacity-0 group-hover/field:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Quick Edit Tips
              </p>
              <ul className="mt-1 text-sm text-purple-700 dark:text-purple-200 space-y-1">
                <li>• Double-click any field to start editing</li>
                <li>• Press Enter to save or Escape to cancel</li>
                <li>• Click outside the field to auto-save</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInformation