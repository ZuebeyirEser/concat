import { FiAlertTriangle } from "react-icons/fi"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-destructive/10 rounded-md">
            <FiAlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Danger Zone
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-md p-4 mb-6">
        <h4 className="font-medium text-destructive mb-2">
          What happens when you delete your account:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• All your personal data will be permanently deleted</li>
          <li>• Your items and collections will be removed</li>
          <li>• This action cannot be undone</li>
        </ul>
      </div>

      <DeleteConfirmation />
    </div>
  )
}
export default DeleteAccount
