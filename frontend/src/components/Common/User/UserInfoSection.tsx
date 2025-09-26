import { FiLogOut } from 'react-icons/fi'
import useAuth from '@/hooks/useAuth'
import { Button } from '../../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'

interface UserInfoSectionProps {
  onClose?: () => void
  isCollapsed?: boolean
}

const UserInfoSection = ({
  onClose,
  isCollapsed = false,
}: UserInfoSectionProps) => {
  const { user: currentUser, logout } = useAuth()

  const handleLogout = async () => {
    logout()
    onClose?.()
  }

  if (!currentUser) return null

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const initials = getInitials(
    currentUser?.full_name || undefined,
    currentUser.email
  )

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md">
              {initials}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500"></div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            className="w-56 rounded-lg border border-border bg-popover p-1 shadow-lg"
            sideOffset={8}
          >
            {/* User Info Header */}
            <div className="border-b border-border/50 px-3 py-2">
              <p className="text-sm font-medium text-foreground">
                {currentUser.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>

            {/* Logout Option */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="m-1 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="group flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-2 transition-colors hover:bg-background/80">
      {/* User Info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-sm">
            {initials}
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500"></div>
        </div>

        {/* User Details */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {currentUser.full_name || 'User'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {currentUser.email}
          </p>
        </div>
      </div>

      {/* Logout Button with Tooltip */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 text-muted-foreground opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/50"
        >
          <FiLogOut className="h-4 w-4" />
        </Button>

        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          Logout
          {/* Tooltip arrow */}
          <div className="absolute right-2 top-full h-0 w-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-popover"></div>
        </div>
      </div>
    </div>
  )
}

export default UserInfoSection
