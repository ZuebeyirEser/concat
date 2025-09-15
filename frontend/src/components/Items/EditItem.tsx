import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useEffect } from 'react'

import { type ItemPublic, type ItemUpdate, ItemsService } from '@/client'
import type { ApiError } from '@/client/core/ApiError'
import useCustomToast from '@/hooks/useCustomToast'
import { handleError } from '@/utils'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface EditItemProps {
  item: ItemPublic | null
  isOpen: boolean
  onClose: () => void
}

export function EditItem({ item, isOpen, onClose }: EditItemProps) {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ItemUpdate>({
    mode: 'onBlur',
    criteriaMode: 'all',
  })

  useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        description: item.description || '',
      })
    }
  }, [item, reset])

  const mutation = useMutation({
    mutationFn: (data: ItemUpdate) =>
      ItemsService.updateItem({ id: item!.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast('Item updated successfully.')
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const onSubmit: SubmitHandler<ItemUpdate> = (data) => {
    if (!item) return
    mutation.mutate(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg">
        <DialogHeader className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Edit Item</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Make changes to your item here. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                {...register('title', {
                  required: 'Title is required.',
                  minLength: {
                    value: 2,
                    message: 'Title must be at least 2 characters long.',
                  },
                })}
                placeholder="Enter item title"
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                id="edit-description"
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Description must be less than 500 characters.',
                  },
                })}
                placeholder="Enter item description (optional)"
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full sm:w-auto min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}