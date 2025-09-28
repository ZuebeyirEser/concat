import { FiAlertTriangle } from "react-icons/fi"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Danger Zone
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
          What happens when you delete your account:
        </h4>
        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
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
