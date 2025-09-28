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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to your item here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">
              Title <span className="text-destructive">*</span>
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
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description must be less than 500 characters.',
                },
              })}
              placeholder="Enter item description (optional)"
              disabled={isSubmitting}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}