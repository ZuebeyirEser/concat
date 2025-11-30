import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight, Receipt, Store } from 'lucide-react'
import React, { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { ProductPurchaseWithBill } from '@/hooks/useProductQueries'

interface GroupedProductsTableProps {
  purchases: ProductPurchaseWithBill[]
  isLoading?: boolean
}

export function GroupedProductsTable({
  purchases,
  isLoading = false,
}: GroupedProductsTableProps) {
  // Group purchases by bill (extracted_data_id)
  const groupedData = useMemo(() => {
    const groups = new Map<number, ProductPurchaseWithBill[]>()

    purchases.forEach(purchase => {
      const billId = purchase.extracted_data_id
      if (!groups.has(billId)) {
        groups.set(billId, [])
      }
      groups.get(billId)!.push(purchase)
    })

    return Array.from(groups.entries()).map(([billId, items]) => ({
      billId,
      bill: items[0]?.extracted_data,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.total_price, 0),
      itemCount: items.length,
    }))
  }, [purchases])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  if (groupedData.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center">
        <Receipt className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">No purchases yet</h3>
        <p className="text-muted-foreground">
          Upload some receipts to see your purchase history
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groupedData.map(group => (
        <BillGroup
          key={group.billId}
          group={group}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

interface BillGroupProps {
  group: {
    billId: number
    bill?: any
    items: ProductPurchaseWithBill[]
    totalAmount: number
    itemCount: number
  }
  formatDate: (date?: string) => string
  formatCurrency: (amount: number) => string
  isLoading: boolean
}

function BillGroup({
  group,
  formatDate,
  formatCurrency,
  isLoading,
}: BillGroupProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const columns: ColumnDef<ProductPurchaseWithBill>[] = useMemo(
    () => [
      {
        accessorKey: 'product.name',
        header: 'Product',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.product.name}</span>
            {row.original.receipt_item_name !== row.original.product.name && (
              <span className="text-xs text-muted-foreground">
                Receipt: {row.original.receipt_item_name}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'product.category',
        header: 'Category',
        cell: ({ row }) => {
          const category = row.original.product.category
          const categoryLabels: Record<string, string> = {
            fruits: 'Fruits',
            vegetables: 'Vegetables',
            dairy: 'Dairy',
            meat_fish: 'Meat & Fish',
            bakery: 'Bakery',
            pantry: 'Pantry',
            beverages: 'Beverages',
            snacks: 'Snacks',
            frozen: 'Frozen',
            household: 'Household',
            personal_care: 'Personal Care',
            other: 'Other',
          }
          return (
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[category] || category}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'quantity',
        header: () => <div className="text-right">Quantity</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.quantity}
            {row.original.unit_type && ` ${row.original.unit_type}`}
          </div>
        ),
      },
      {
        accessorKey: 'unit_price',
        header: () => <div className="text-right">Unit Price</div>,
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.unit_price)}
          </div>
        ),
      },
      {
        accessorKey: 'total_price',
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatCurrency(row.original.total_price)}
          </div>
        ),
      },
    ],
    [formatCurrency]
  )

  const table = useReactTable({
    data: group.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Bill Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-muted/50 p-4 text-left transition-colors hover:bg-muted"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {group.bill?.store_name || 'Unknown Store'}
              </h3>
              {group.bill?.receipt_number && (
                <Badge variant="outline" className="text-xs">
                  #{group.bill.receipt_number}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDate(group.bill?.transaction_date)}</span>
              {group.bill?.transaction_time && (
                <span>{group.bill.transaction_time}</span>
              )}
              <span>•</span>
              <span>{group.itemCount} items</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-bold">
              {formatCurrency(group.bill?.total_amount || group.totalAmount)}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Items Table */}
      {isExpanded && (
        <div className="border-t">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className={isLoading ? 'opacity-50' : ''}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
