import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { ItemsManagement } from '@/components/Items/ItemsManagement'

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute('/_layout/items')({
  component: Items,
  validateSearch: search => itemsSearchSchema.parse(search),
})

function Items() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const setPage = (page: number) =>
    navigate({
      search: prev => ({ ...prev, page }),
    })

  return <ItemsManagement page={page} onPageChange={setPage} />
}
