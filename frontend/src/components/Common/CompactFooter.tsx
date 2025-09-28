import { FiHeart } from 'react-icons/fi'

const CompactFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30 py-4">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between space-y-2 text-sm text-muted-foreground sm:flex-row sm:space-y-0">
          <div>
            © {currentYear} concat. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <FiHeart className="h-3 w-3 text-red-500" />
            <span>by the concat team</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default CompactFooter