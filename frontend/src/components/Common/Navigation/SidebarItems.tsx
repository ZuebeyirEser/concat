import { useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { FiBriefcase, FiSettings, FiUsers } from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'

import type { UserPublic } from '@/client'

const items = [
  { icon: FiBriefcase, title: 'Items', path: '/items' },
  { icon: FiSettings, title: 'User Settings', path: '/settings' },
]

interface SidebarItemsProps {
  onClose?: () => void
  isCollapsed?: boolean
}

interface Item {
  icon: IconType
  title: string
  path: string
}

const SidebarItems = ({ onClose, isCollapsed = false }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(['currentUser'])

  const finalItems: Item[] = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: 'Admin', path: '/admin' }]
    : items

  const listItems = finalItems.map(({ icon: Icon, title, path }) => (
    <RouterLink key={title} to={path} onClick={onClose}>
      <div
        className={`group relative flex items-center rounded-lg py-2.5 text-sm hover:bg-accent/50 transition-all duration-200 ${isCollapsed ? 'px-2 justify-center mx-1' : 'px-3 gap-3 mx-2'
          }`}
      >
        <Icon className={`flex-shrink-0 transition-all duration-200 ${isCollapsed ? 'w-5 h-5 text-muted-foreground group-hover:text-foreground' : 'w-4 h-4 text-muted-foreground'
          }`} />
        {!isCollapsed && (
          <span className="font-medium text-foreground transition-all duration-200">
            {title}
          </span>
        )}

        {isCollapsed && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100]"
               style={{
                 top: '50%',
                 transform: 'translateY(-50%)'
               }}>
            {title}
            <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-r-[4px] border-transparent border-r-popover"></div>
          </div>
        )}
      </div>
    </RouterLink>
  ))

  return (
    <div className="space-y-1">
      {listItems}
    </div>
  )
}

export default SidebarItems
