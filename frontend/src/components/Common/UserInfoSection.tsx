import { FiLogOut } from 'react-icons/fi'
import useAuth from '@/hooks/useAuth'
import { Button } from '../ui/button'

interface UserInfoSectionProps {
    onClose?: () => void
    isCollapsed?: boolean
}

const UserInfoSection = ({ onClose, isCollapsed = false }: UserInfoSectionProps) => {
    const { user: currentUser, logout } = useAuth()

    const handleLogout = async () => {
        logout()
        onClose?.()
    }

    if (!currentUser) return null

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

    const initials = getInitials(currentUser?.full_name || undefined, currentUser.email)

    if (isCollapsed) {
        return (
            <div className="flex justify-center">
                <div className="relative group">
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                        {initials}
                    </button>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                    
                    {/* Tooltip with user info and logout hint */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        <div className="text-center">
                            <p className="font-medium">{currentUser.full_name || 'User'}</p>
                            <p className="text-muted-foreground">{currentUser.email}</p>
                            <p className="text-xs text-muted-foreground mt-1 border-t border-border pt-1">Click to logout</p>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-popover"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between p-2 bg-background/50 hover:bg-background/80 rounded-lg border border-border/50 transition-colors group">
            {/* User Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {initials}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>

                {/* User Details */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                        {currentUser.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
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
                    className="w-8 h-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                    <FiLogOut className="w-4 h-4" />
                </Button>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Logout
                    {/* Tooltip arrow */}
                    <div className="absolute top-full right-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-popover"></div>
                </div>
            </div>
        </div>
    )
}

export default UserInfoSection