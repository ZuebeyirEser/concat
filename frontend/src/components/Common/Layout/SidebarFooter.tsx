import { FiHeart } from 'react-icons/fi'

const SidebarFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className="mt-auto border-t border-border pt-4 px-4 pb-4">
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex items-center justify-center space-x-1">
          <span>Made with</span>
          <FiHeart className="h-3 w-3 text-red-500" />
          <span>by concat</span>
        </div>
        <div className="text-center">
          © {currentYear} concat
        </div>
      </div>
    </div>
  )
}

export default SidebarFooter