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
  const { showSuccessToast, showErrorToast } = useCustomToast()
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

    if (currentValue !== originalValue && currentValue.trim()) {
      if (editingField === 'email' && !emailPattern.value.test(currentValue)) {
        showErrorToast("Please enter a valid email address")
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
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Profile Information
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Double-click any field to edit. Changes save automatically.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Full Name Field */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiUser className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium text-foreground">
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
                className="w-full"
                placeholder="Enter your full name"
                maxLength={30}
              />
            ) : (
              <div
                onDoubleClick={() => handleDoubleClick('full_name')}
                className="group/field flex items-center justify-between w-full p-3 bg-muted/50 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors"
              >
                <span className={`${!currentUser?.full_name ? "text-muted-foreground italic" : "text-foreground"}`}>
                  {currentUser?.full_name || "Not provided"}
                </span>
                <FiEdit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover/field:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiMail className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium text-foreground">
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
                className="w-full"
                placeholder="Enter your email address"
              />
            ) : (
              <div
                onDoubleClick={() => handleDoubleClick('email')}
                className="group/field flex items-center justify-between w-full p-3 bg-muted/50 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors"
              >
                <span className="text-foreground">
                  {currentUser?.email}
                </span>
                <FiEdit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover/field:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-muted/30 border border-border/50 rounded-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Quick Edit Tips
              </p>
              <ul className="mt-1 text-sm text-muted-foreground space-y-1">
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