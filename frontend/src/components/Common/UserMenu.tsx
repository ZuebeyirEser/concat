import { Link } from "@tanstack/react-router"
import { FiLogOut, FiUser, FiMoon, FiSun } from "react-icons/fi"
import { useTheme } from "next-themes"

import useAuth from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const UserMenu = () => {
  const { user, logout } = useAuth()
  const { setTheme, theme } = useTheme()

  const handleLogout = async () => {
    logout()
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Get user initials for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const initials = getInitials(user?.full_name || undefined, user?.email || undefined)

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            data-testid="user-menu"
            className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-foreground/80 transition-all duration-200 rounded-md border border-border/30 hover:border-border/60 hover:bg-accent/50"
          >
            {user?.full_name || user?.email || "User"}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 bg-background/80 backdrop-blur-md border border-border/50 shadow-lg rounded-lg p-1"
          sideOffset={4}
        >
          <Link to="/settings">
            <DropdownMenuItem className="gap-2 py-2 cursor-pointer rounded-md hover:bg-accent/50 transition-colors">
              <FiUser className="w-4 h-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            className="gap-2 py-2 cursor-pointer rounded-md hover:bg-accent/50 transition-colors"
            onSelect={(e) => {
              e.preventDefault()
              toggleTheme()
            }}
          >
            {theme === "light" ? (
              <>
                <FiMoon className="w-4 h-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <FiSun className="w-4 h-4" />
                <span>Light Mode</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2 py-2 cursor-pointer text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors"
            onClick={handleLogout}
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserMenu
