import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"

import type { ItemPublic } from "@/client"

interface ItemActionsMenuProps {
  item: ItemPublic
  onEdit: (item: ItemPublic) => void
  onDelete: (id: string) => void
}

export const ItemActionsMenu = ({ item, onEdit, onDelete }: ItemActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <BsThreeDotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
