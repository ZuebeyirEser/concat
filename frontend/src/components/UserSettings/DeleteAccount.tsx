import { FiAlertTriangle } from 'react-icons/fi'
import DeleteConfirmation from './DeleteConfirmation'

const DeleteAccount = () => {
  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Danger Zone Header */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-red-500/20 bg-gradient-to-r from-red-500/5 to-red-600/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Account Deletion</h3>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all data
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Warning Section */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="mb-2 font-medium text-red-800 dark:text-red-200">
                  This action is irreversible
                </h4>
                <p className="mb-3 text-sm text-red-700 dark:text-red-300">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
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
    </div>
  )
}
export default DeleteAccount
