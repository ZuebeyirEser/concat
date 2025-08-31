import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FaBars } from 'react-icons/fa'
import { FiLogOut } from 'react-icons/fi'
import { Link } from '@tanstack/react-router'

import type { UserPublic } from '@/client'
import useAuth from '@/hooks/useAuth'
import { Button } from '../ui/button'
import Logo from '../ui/logo'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import SidebarItems from './SidebarItems'

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(['currentUser'])
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute z-50 m-4 md:hidden"
            aria-label="Open Menu"
          >
            <FaBars />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px]">
          <div className="flex h-full flex-col justify-between">
            <div>
              <Link to="/" className="mb-6 block px-4">
                <Logo size="md" />
              </Link>
              <SidebarItems />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-md px-4 py-2 text-left hover:bg-accent"
              >
                <FiLogOut />
                <span>Log Out</span>
              </button>
            </div>
            {currentUser?.email && (
              <p className="p-2 text-sm text-muted-foreground">
                Logged in as: {currentUser.email}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <div className="sticky top-0 hidden h-screen min-w-[280px] border-r border-border bg-muted p-4 md:flex">
        <div className="flex h-full w-full flex-col justify-between">
          <div>
            <SidebarItems />
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-4 rounded-md px-4 py-2 text-left hover:bg-accent"
            >
              <FiLogOut />
              <span>Log Out</span>
            </button>
          </div>
          {currentUser?.email && (
            <p className="p-2 text-sm text-muted-foreground">
              Logged in as: {currentUser.email}
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar
