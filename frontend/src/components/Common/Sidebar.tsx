import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { FiLogOut } from 'react-icons/fi'
import { Link } from '@tanstack/react-router'

import type { UserPublic } from '@/client'
import useAuth from '@/hooks/useAuth'
import { Button } from '../ui/button'
import Logo from '../ui/logo'
import SidebarItems from './SidebarItems'

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(['currentUser'])
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    logout()
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden"
        aria-label="Toggle Menu"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-40 h-full w-[280px] transform bg-background border-r border-border transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div>
            <Link to="/" className="mb-6 block" onClick={closeSidebar}>
              <Logo size="md" />
            </Link>
            <SidebarItems onClose={closeSidebar} />
            <button
              onClick={() => {
                handleLogout()
                closeSidebar()
              }}
              className="flex w-full items-center gap-4 rounded-md px-4 py-2 text-left hover:bg-accent mt-4"
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
