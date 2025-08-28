import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FaBars } from "react-icons/fa"
import { FiLogOut } from "react-icons/fi"

import type { UserPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import { Button } from "../ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet"
import SidebarItems from "./SidebarItems"

const Sidebar = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
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
            className="md:hidden absolute z-50 m-4"
            aria-label="Open Menu"
          >
            <FaBars />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px]">
          <div className="flex flex-col justify-between h-full">
            <div>
              <SidebarItems />
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-2 w-full text-left hover:bg-accent rounded-md"
              >
                <FiLogOut />
                <span>Log Out</span>
              </button>
            </div>
            {currentUser?.email && (
              <p className="text-sm p-2 text-muted-foreground">
                Logged in as: {currentUser.email}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <div className="hidden md:flex sticky top-0 min-w-[280px] h-screen p-4 bg-muted/50">
        <div className="w-full">
          <SidebarItems />
        </div>
      </div>
    </>
  )
}

export default Sidebar
