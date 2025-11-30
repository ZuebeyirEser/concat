import { createFileRoute } from '@tanstack/react-router'
import { Receipt } from 'lucide-react'
import { z } from 'zod'

import { GroupedProductsTable } from '@/components/Items/GroupedProductsTable'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useUserPurchases } from '@/hooks/useProductQueries'

const purchasesSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute('/_layout/purchases')({
  component: PurchasesPage,
  validateSearch: search => purchasesSearchSchema.parse(search),
})

function PurchasesPage() {
  const { page } = Route.useSearch()

  // Fetch purchases with bill information
  const { data: purchases = [], isLoading } = useUserPurchases({
    skip: (page - 1) * 100,
    limit: 100,
    include_bill: true,
  })

  if (isLoading) {
    return (
      <div className="w-full max-w-full">
        <h1 className="pt-12 text-2xl font-bold">Purchase History</h1>
        <p className="mb-6 text-muted-foreground">
          Loading your purchases grouped by receipt...
        </p>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="mb-2 h-4 w-1/3 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full">
      <div className="mb-6 flex items-center justify-between pt-12">
        <div>
          <h1 className="text-2xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground">
            Your purchases organized by receipt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Receipt className="mr-1 h-3 w-3" />
            {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <GroupedProductsTable purchases={purchases} isLoading={isLoading} />
    </div>
  )
}
