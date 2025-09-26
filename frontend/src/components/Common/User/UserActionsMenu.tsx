import { BsThreeDotsVertical } from 'react-icons/bs'
import { Button } from '../../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'

import type { UserPublic } from '@/client'
import DeleteUser from '../../Admin/DeleteUser'
import EditUser from '../../Admin/EditUser'

interface UserActionsMenuProps {
  user: UserPublic
  disabled?: boolean
}

export const UserActionsMenu = ({ user, disabled }: UserActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled}>
          <BsThreeDotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <EditUser user={user} />
        <DeleteUser id={user.id} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
