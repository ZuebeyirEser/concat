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
      <div className="max-w-2xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-blue-500/5 to-indigo-500/10 rounded-lg border border-blue-500/20">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <FiUser className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            <p className="text-sm text-muted-foreground">Manage your profile details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Full Name Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FiUser className="h-4 w-4" />
              Full Name
            </label>
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
                className="group/field flex items-center justify-between w-full p-4 border border-border/60 rounded-lg cursor-pointer hover:border-border hover:bg-muted/20 transition-all duration-200"
              >
                <span className={`${!currentUser?.full_name ? "text-muted-foreground italic" : "text-foreground"}`}>
                  {currentUser?.full_name || "Not provided"}
                </span>
                <FiEdit2 className="h-4 w-4 text-muted-reground opacity-0 group-hover/field:opacity-100 transition-opacity" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">This is how your name will appear to other users</p>
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FiMail className="h-4 w-4" />
              Email Address
            </label>
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
                className="group/field flex items-center justify-between w-full p-4 border border-border/60 rounded-lg cursor-pointer hover:border-border hover:bg-muted/20 transition-all duration-200"
              >
                <span className="text-foreground">
                  {currentUser?.email}
                </span>
                <FiEdit2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover/field:opacity-100 transition-opacity" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">Used for login and important notifications</p>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Quick Edit</p>
                <p className="text-xs text-muted-foreground">Double-click any field to edit • Press Enter to save • Escape to cancel</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInformation