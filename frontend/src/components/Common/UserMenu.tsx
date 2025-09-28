import { Link } from "@tanstack/react-router"
import { FaUserAstronaut } from "react-icons/fa"
import { FiLogOut, FiUser } from "react-icons/fi"

import useAuth from "@/hooks/useAuth"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const UserMenu = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    logout()
  }

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            data-testid="user-menu"
            variant="default"
            className="flex items-center gap-2 max-w-[150px] truncate"
          >
            <FaUserAstronaut className="text-lg" />
            <span className="hidden md:inline">{user?.full_name || "User"}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <Link to="/settings">
            <DropdownMenuItem className="gap-2 gray py-2 cursor-pointer">
              <FiUser className="text-lg" />
              <div className="flex-1">My Profile</div>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            className="gap-2 py-2 cursor-pointer"
            onClick={handleLogout}
          >
            <FiLogOut />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserMenu
