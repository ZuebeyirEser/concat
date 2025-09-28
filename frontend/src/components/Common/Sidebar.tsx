import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { Link } from '@tanstack/react-router'

import { Button } from '../ui/button'
import Logo from '../ui/logo'
import SidebarItems from './SidebarItems'
import UserInfoSection from './UserInfoSection'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

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
        <div className="h-full" style={{ display: 'grid', gridTemplateRows: '1fr 80px' }}>
          <div className="p-4 overflow-y-auto">
            <SidebarItems onClose={closeSidebar} />
          </div>
          <div className="p-3">
            <UserInfoSection onClose={closeSidebar} />
          </div>
        </div>
      </div>

      <div className="sticky top-0 hidden min-w-[280px] border-r border-border bg-muted md:block" style={{ height: 'calc(100vh - 73px)', display: 'grid', gridTemplateRows: '1fr 80px' }}>
        <div className="p-4 overflow-y-auto">
          <SidebarItems />
        </div>
        <div className="p-3">
          <UserInfoSection />
        </div>
      </div>
    </>
  )
}

export default Sidebar
