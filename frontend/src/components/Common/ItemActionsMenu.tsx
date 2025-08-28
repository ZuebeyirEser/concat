import { BsThreeDotsVertical } from "react-icons/bs"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

import type { ItemPublic } from "@/client"
import DeleteItem from "../Items/DeleteItem"
import EditItem from "../Items/EditItem"

interface ItemActionsMenuProps {
  item: ItemPublic
}

export const ItemActionsMenu = ({ item }: ItemActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <BsThreeDotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <EditItem item={item} />
        <DeleteItem id={item.id} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
