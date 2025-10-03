import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import { FiLogOut, FiMoon, FiSun, FiUser } from 'react-icons/fi'

import { Button } from '@/components/ui/button'
import useAuth from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'

const UserMenu = () => {
  const { user, logout } = useAuth()
  const { setTheme, theme } = useTheme()

  const handleLogout = async () => {
    logout()
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            data-testid="user-menu"
            className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            {user?.full_name || user?.email || 'User'}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 rounded-lg border border-border/50 bg-background/80 p-1 shadow-lg backdrop-blur-md"
          sideOffset={4}
        >
          <Link to="/settings">
            <DropdownMenuItem className="cursor-pointer gap-2 rounded-md py-2 transition-colors hover:bg-accent/50">
              <FiUser className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-md py-2 transition-colors hover:bg-accent/50"
            onSelect={e => {
              e.preventDefault()
              toggleTheme()
            }}
          >
            {theme === 'light' ? (
              <>
                <FiMoon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <FiSun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-md py-2 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            onClick={handleLogout}
          >
            <FiLogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserMenu
