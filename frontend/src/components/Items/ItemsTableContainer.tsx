import { useQuery } from '@tanstack/react-query'
import { FiSearch } from 'react-icons/fi'
import { useState } from 'react'

import { type ItemPublic, ItemsService } from '@/client'
import { EditItem } from '@/components/Items/EditItem'
import { DeleteItem } from '@/components/Items/DeleteItem'
import { ItemsTable } from '@/components/Items/ItemsTable'
import { createItemColumns } from '@/components/Items/columns'
import PendingItems from '@/components/Pending/PendingItems'
import useAuth from '@/hooks/useAuth'
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

const PER_PAGE = 5

function getItemsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ItemsService.readItems({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ['items', { page }] as const,
  }
}

interface ItemsTableContainerProps {
  page: number
  onPageChange: (page: number) => void
}

export function ItemsTableContainer({ page, onPageChange }: ItemsTableContainerProps) {
  const { user, isUserLoading } = useAuth()
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
          onPageChange={({ page }) => onPageChange(page)}
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