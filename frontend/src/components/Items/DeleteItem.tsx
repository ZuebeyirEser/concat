import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FiTrash2 } from 'react-icons/fi'

import { type ItemPublic, ItemsService } from '@/client'
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

interface DeleteItemProps {
  item: ItemPublic | null
  isOpen: boolean
  onClose: () => void
}

export function DeleteItem({ item, isOpen, onClose }: DeleteItemProps) {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (itemId: string) => ItemsService.deleteItem({ id: itemId }),
    onSuccess: () => {
      showSuccessToast('Item deleted successfully.')
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const handleDelete = () => {
    if (!item) return
    mutation.mutate(item.id)
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-lg border border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:max-w-[500px]">
        <DialogHeader className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            <FiTrash2 className="h-6 w-6 text-red-500" />
            Delete Item
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. This will permanently delete the item
            from your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                You are about to delete:
              </p>
              <div className="rounded border border-red-200 bg-white p-3 dark:border-red-700 dark:bg-gray-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
            className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="w-full min-w-[120px] bg-red-600 font-medium text-white hover:bg-red-700 sm:w-auto"
          >
            {mutation.isPending ? 'Deleting...' : 'Delete Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
