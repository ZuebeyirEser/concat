import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { ItemsService } from "@/client"
import { ItemActionsMenu } from "@/components/Common/ItemActionsMenu"
import AddItem from "@/components/Items/AddItem"
import PendingItems from "@/components/Pending/PendingItems"
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getItemsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ItemsService.readItems({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["items", { page }],
  }
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

function ItemsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getItemsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev) => ({ ...prev, page }),
    })

  const items = data?.data.slice(0, PER_PAGE) ?? []
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">ID</TableHead>
            <TableHead className="w-[30%]">Title</TableHead>
            <TableHead className="w-[30%]">Description</TableHead>
            <TableHead className="w-[10%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <TableRow key={item.id} className={isPlaceholderData ? "opacity-50" : ""}>
              <TableCell className="truncate max-w-[30%]">
                {item.id}
              </TableCell>
              <TableCell className="truncate max-w-[30%]">
                {item.title}
              </TableCell>
              <TableCell
                className={`truncate max-w-[30%] ${!item.description ? "text-muted-foreground" : ""
                  }`}
              >
                {item.description || "N/A"}
              </TableCell>
              <TableCell className="w-[10%]">
                <ItemActionsMenu item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-4">
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
    </>
  )
}

function Items() {
  return (
    <div className="w-full max-w-full">
      <h1 className="text-2xl font-bold pt-12">
        Items Management
      </h1>
      <AddItem />
      <ItemsTable />
    </div>
  )
}
