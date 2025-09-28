import { Link } from "@tanstack/react-router"
import Logo from "@/components/ui/logo"
import UserMenu from "./UserMenu"

function Navbar() {
  return (
    <div className="hidden md:flex justify-between items-center sticky top-0 w-full p-4 bg-muted border-b border-border">
      <Link to="/" className="px-2">
        <Logo size="lg" />
      </Link>
      <div className="flex gap-2 items-center">
        <UserMenu />
      </div>
    </div>
  )
}

export default Navbar
