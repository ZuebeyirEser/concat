import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <div className="w-full max-w-full">
      <h3 className="text-lg font-semibold py-4">
        Delete Account
      </h3>
      <p className="text-sm text-muted-foreground">
        Permanently delete your data and everything associated with your
        account.
      </p>
      <DeleteConfirmation />
    </div>
  )
}
export default DeleteAccount
