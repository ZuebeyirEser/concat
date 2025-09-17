import { Link } from '@tanstack/react-router'
import Logo from '@/components/ui/logo'
import UserMenu from './UserMenu'

function Navbar() {
  return (
    <div className="sticky top-0 hidden w-full items-center justify-between border-b border-border bg-muted p-4 md:flex">
      <Link to="/" className="px-2">
        <Logo size="lg" />
      </Link>
      <div className="flex items-center gap-2">
        <UserMenu />
      </div>
    </div>
  )
}

export default Navbar
