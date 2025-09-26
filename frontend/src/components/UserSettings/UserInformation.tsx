import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { FiEdit2, FiUser, FiMail } from 'react-icons/fi'

import { type ApiError, type UserUpdateMe, UsersService } from '@/client'
import useAuth from '@/hooks/useAuth'
import useCustomToast from '@/hooks/useCustomToast'
import { emailPattern, handleError } from '@/utils'
import { Input } from '../ui/input'

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { user: currentUser } = useAuth()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState({
    full_name: currentUser?.full_name || '',
    email: currentUser?.email || '',
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
      if (
        editingField &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
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
      showSuccessToast('Profile updated successfully.')
      setEditingField(null)
    },
    onError: (err: ApiError) => {
      handleError(err)
      setTempValues({
        full_name: currentUser?.full_name || '',
        email: currentUser?.email || '',
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
    const originalValue =
      editingField === 'full_name' ? currentUser?.full_name : currentUser?.email

    if (currentValue !== originalValue && currentValue.trim()) {
      if (editingField === 'email' && !emailPattern.value.test(currentValue)) {
        showErrorToast('Please enter a valid email address')
        setTempValues({
          full_name: currentUser?.full_name || '',
          email: currentUser?.email || '',
        })
        setEditingField(null)
        return
      }

      mutation.mutate({
        [editingField]: currentValue.trim(),
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
        full_name: currentUser?.full_name || '',
        email: currentUser?.email || '',
      })
      setEditingField(null)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setTempValues(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Profile Header */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-indigo-500/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <FiUser className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Personal Information
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage your profile details
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Full Name Field */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FiUser className="h-4 w-4" />
              Full Name
            </label>
            {editingField === 'full_name' ? (
              <Input
                ref={inputRef}
                value={tempValues.full_name}
                onChange={e => handleInputChange('full_name', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
                placeholder="Enter your full name"
                maxLength={30}
              />
            ) : (
              <div
                onDoubleClick={() => handleDoubleClick('full_name')}
                className="group/field flex w-full cursor-pointer items-center justify-between rounded-lg border border-border/60 p-4 transition-all duration-200 hover:border-border hover:bg-muted/20"
              >
                <span
                  className={`${!currentUser?.full_name ? 'italic text-muted-foreground' : 'text-foreground'}`}
                >
                  {currentUser?.full_name || 'Not provided'}
                </span>
                <FiEdit2 className="text-muted-reground h-4 w-4 opacity-0 transition-opacity group-hover/field:opacity-100" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This is how your name will appear to other users
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FiMail className="h-4 w-4" />
              Email Address
            </label>
            {editingField === 'email' ? (
              <Input
                ref={inputRef}
                type="email"
                value={tempValues.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
                placeholder="Enter your email address"
              />
            ) : (
              <div
                onDoubleClick={() => handleDoubleClick('email')}
                className="group/field flex w-full cursor-pointer items-center justify-between rounded-lg border border-border/60 p-4 transition-all duration-200 hover:border-border hover:bg-muted/20"
              >
                <span className="text-foreground">{currentUser?.email}</span>
                <FiEdit2 className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover/field:opacity-100" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Used for login and important notifications
            </p>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Quick Edit
                </p>
                <p className="text-xs text-muted-foreground">
                  Double-click any field to edit • Press Enter to save • Escape
                  to cancel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInformation
