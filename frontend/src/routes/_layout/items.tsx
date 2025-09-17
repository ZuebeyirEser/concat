import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FiSearch } from 'react-icons/fi'
import { useState } from 'react'
import { z } from 'zod'

import { type ItemPublic, type ItemsPublic, ItemsService } from '@/client'
import AddItem from '@/components/Items/AddItem'
import { EditItem } from '@/components/Items/EditItem'
import { DeleteItem } from '@/components/Items/DeleteItem'
import { ItemsTable } from '@/components/Items/ItemsTable'
import { createItemColumns } from '@/components/Items/columns'
import PendingItems from '@/components/Pending/PendingItems'
import useAuth from '@/hooks/useAuth'
import useCustomToast from '@/hooks/useCustomToast'
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from '@/components/ui/pagination'

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getItemsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ItemsService.readItems({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ['items', { page }] as const,
  }
}

export const Route = createFileRoute('/_layout/items')({
  component: Items,
  validateSearch: search => itemsSearchSchema.parse(search),
})

function ItemsTableContainer() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()
  const { user, isUserLoading } = useAuth()
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [editingItem, setEditingItem] = useState<ItemPublic | null>(null)
  const [deletingItem, setDeletingItem] = useState<ItemPublic | null>(null)

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getItemsQueryOptions({ page }),
    enabled: !!user && !isUserLoading,
  })

  const handleEdit = (item: ItemPublic) => {
    setEditingItem(item)
  }

  const handleDelete = (id: string) => {
    const item = items.find(item => item.id === id)
    if (item) {
      setDeletingItem(item)
    }
  }

  const columns = createItemColumns(handleEdit, handleDelete)

  const setPage = (page: number) =>
    navigate({
      search: (prev) => ({ ...prev, page }),
    })

  if (isUserLoading) {
    return <PendingItems />
  }

  if (!user) {
    return null
  }

  const items = data?.data ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingItems />
  }

  if (items.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <FiSearch />
        </EmptyStateIcon>
        <EmptyStateTitle>You don't have any items yet</EmptyStateTitle>
        <EmptyStateDescription>
          Add a new item to get started
        </EmptyStateDescription>
      </EmptyState>
    )
  }

  return (
    <>
      <ItemsTable
        data={items}
        columns={columns}
        isLoading={isPlaceholderData}
      />
      
      <div className="mt-4 flex justify-end">
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
        </PaginationRoot>
      </div>

      <EditItem
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />

      <DeleteItem
        item={deletingItem}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
      />
    </>
  )
}

function Items() {
  const { user, isUserLoading } = useAuth()

  if (isUserLoading) {
    return <PendingItems />
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="pt-12 text-2xl font-bold">Items Management</h1>
      </div>
      <div className="mt-4">
        <AddItem />
      </div>
      <div className="mt-6">
        <ItemsTableContainer />
      </div>
    </div>
  )
}
