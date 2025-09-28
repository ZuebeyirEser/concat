import { Link } from "@tanstack/react-router"
import Logo from "/assets/images/fastapi-logo.svg"
import UserMenu from "./UserMenu"

function Navbar() {
  return (
    <div className="hidden md:flex justify-between items-center sticky top-0 w-full p-4 bg-muted text-white">
      <Link to="/">
        <img src={Logo} alt="Logo" className="w-44 max-w-xs px-2" />
      </Link>
      <div className="flex gap-2 items-center">
        <UserMenu />
      </div>
    </div>
  )
}

export default Navbar
