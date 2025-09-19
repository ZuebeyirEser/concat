import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'

import { type ItemPublic } from '@/client'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ItemActionsProps {
    item: ItemPublic
    onEdit: (item: ItemPublic) => void
    onDelete: (id: string) => void
}

function ItemActions({ item, onEdit, onDelete }: ItemActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => onEdit(item)}
                    className="gap-2 py-2 cursor-pointer"
                >
                    <FiEdit className="text-lg" />
                    <div className="flex-1">Edit Item</div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDelete(item.id)}
                    className="gap-2 py-2 cursor-pointer text-destructive focus:text-destructive"
                >
                    <FiTrash2 className="text-lg" />
                    <div className="flex-1">Delete Item</div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function createItemColumns(
    onEdit: (item: ItemPublic) => void,
    onDelete: (id: string) => void
): ColumnDef<ItemPublic>[] {
    return [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => {
                const title = row.getValue('title') as string
                return (
                    <div className="max-w-[200px] truncate font-medium">
                        {title}
                    </div>
                )
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const description = row.getValue('description') as string | null | undefined
                return (
                    <div className="max-w-[300px] truncate text-muted-foreground">
                        {description || 'No description'}
                    </div>
                )
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <ItemActions
                        item={row.original}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ]
}