import { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'

import { Button } from '../../ui/button'
import SidebarItems from './SidebarItems'
import UserInfoSection from './UserInfoSection'

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false)
  }

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="fixed left-4 top-4 z-50 md:hidden"
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-full w-[280px] transform border-r border-border bg-background transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          className="h-full"
          style={{ display: 'grid', gridTemplateRows: '1fr 80px' }}
        >
          <div className="overflow-y-auto p-4">
            <SidebarItems onClose={closeMobileSidebar} />
          </div>
          <div className="p-3">
            <UserInfoSection onClose={closeMobileSidebar} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`sticky top-0 hidden border-r border-border/50 bg-muted/50 backdrop-blur-sm transition-all duration-300 ease-in-out md:block ${
          isDesktopCollapsed
            ? 'w-[64px] min-w-[64px]'
            : 'w-[280px] min-w-[280px]'
        }`}
        style={{
          height: 'calc(100vh - 73px)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr 80px',
        }}
      >
        {/* Smart Toggle Button */}
        <div
          className={`flex items-center transition-all duration-300 ${isDesktopCollapsed ? 'justify-center p-3' : 'justify-between p-4 pb-2'}`}
        >
          {!isDesktopCollapsed && (
            <h2 className="text-sm font-semibold text-foreground">
              Navigation
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDesktopSidebar}
            className="h-8 w-8 rounded-md text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
            aria-label="Toggle Sidebar"
          >
            <div className="flex flex-col gap-1">
              <div
                className={`h-0.5 bg-current transition-all duration-300 ${isDesktopCollapsed ? 'w-4' : 'w-3'}`}
              ></div>
              <div
                className={`h-0.5 bg-current transition-all duration-300 ${isDesktopCollapsed ? 'w-4' : 'w-4'}`}
              ></div>
              <div
                className={`h-0.5 bg-current transition-all duration-300 ${isDesktopCollapsed ? 'w-4' : 'w-2'}`}
              ></div>
            </div>
          </Button>
        </div>

        <div
          className={`transition-all duration-300 ${isDesktopCollapsed ? 'overflow-hidden px-2' : 'overflow-y-auto px-4'}`}
        >
          <SidebarItems isCollapsed={isDesktopCollapsed} />
        </div>
        <div
          className={`transition-all duration-300 ${isDesktopCollapsed ? 'p-2' : 'p-3'}`}
        >
          <UserInfoSection isCollapsed={isDesktopCollapsed} />
        </div>
      </div>
    </>
  )
}

export default Sidebar
