import { ItemsHeader } from '@/components/Items/ItemsHeader'
import { ItemsTableContainer } from '@/components/Items/ItemsTableContainer'
import PendingItems from '@/components/Pending/PendingItems'
import useAuth from '@/hooks/useAuth'

interface ItemsManagementProps {
  page: number
  onPageChange: (page: number) => void
}

export function ItemsManagement({ page, onPageChange }: ItemsManagementProps) {
  const { user, isUserLoading } = useAuth()

  if (isUserLoading) {
    return <PendingItems />
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full max-w-full">
      <ItemsHeader />
      <div className="mt-6">
        <ItemsTableContainer 
          page={page}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}