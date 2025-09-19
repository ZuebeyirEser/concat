import { FiAlertTriangle } from "react-icons/fi"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <div className="p-6">
      {/* Danger Zone Header */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-red-500/5 to-red-600/10 rounded-lg border border-red-500/20">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
          <FiAlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Account Deletion</h3>
          <p className="text-sm text-muted-foreground">Permanently remove your account and all data</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Warning Section */}
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                This action is irreversible
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                <li>• All your personal data will be permanently deleted</li>
                <li>• Your items and collections will be removed</li>
                <li>• Access to your account will be immediately revoked</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delete Action */}
        <div className="pt-2">
          <DeleteConfirmation />
        </div>
      </div>
    </div>
  )
}
export default DeleteAccount
