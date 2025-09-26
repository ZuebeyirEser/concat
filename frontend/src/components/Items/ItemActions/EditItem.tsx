import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type SubmitHandler, useForm } from 'react-hook-form'

import { type ItemPublic, type ItemUpdate, ItemsService } from '@/client'
import type { ApiError } from '@/client/core/ApiError'
import useCustomToast from '@/hooks/useCustomToast'
import { itemUpdateSchema } from '@/lib/validations'
import { handleError } from '@/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'

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
    resolver: zodResolver(itemUpdateSchema),
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      title: item?.title,
      description: item?.description ?? '',
    },
  })

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

  const onSubmit: SubmitHandler<ItemUpdate> = data => {
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
      <DialogContent className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:max-w-[500px]">
        <DialogHeader className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-700">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Item
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Make changes to your item here. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="edit-title"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                {...register('title')}
                placeholder="Enter item title"
                className={`border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-description"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </Label>
              <Textarea
                id="edit-description"
                {...register('description')}
                placeholder="Enter item description (optional)"
                className={`border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full min-w-[120px] bg-blue-600 font-medium text-white hover:bg-blue-700 sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
