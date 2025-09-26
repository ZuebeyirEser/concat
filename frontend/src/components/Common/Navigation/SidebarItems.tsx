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
        className={`group relative flex items-center rounded-lg py-2.5 text-sm transition-all duration-200 hover:bg-accent/50 ${
          isCollapsed ? 'mx-1 justify-center px-2' : 'mx-2 gap-3 px-3'
        }`}
      >
        <Icon
          className={`flex-shrink-0 transition-all duration-200 ${
            isCollapsed
              ? 'h-5 w-5 text-muted-foreground group-hover:text-foreground'
              : 'h-4 w-4 text-muted-foreground'
          }`}
        />
        {!isCollapsed && (
          <span className="font-medium text-foreground transition-all duration-200">
            {title}
          </span>
        )}

        {isCollapsed && (
          <div
            className="pointer-events-none absolute left-full z-[100] ml-3 whitespace-nowrap rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {title}
            <div className="absolute right-full top-1/2 h-0 w-0 -translate-y-1/2 transform border-b-[4px] border-r-[4px] border-t-[4px] border-transparent border-r-popover"></div>
          </div>
        )}
      </div>
    </RouterLink>
  ))

  return <div className="space-y-1">{listItems}</div>
}

export default SidebarItems
