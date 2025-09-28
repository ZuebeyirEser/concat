import AddItem from '../ItemActions/AddItem'

export function ItemsHeader() {
  return (
    <>
      <div className="border-gray-200 pb-6 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="dark:text-white-900 text-3xl font-bold">
            Items Management
          </h1>
        </div>
        <div className="mt-4">
          <AddItem />
        </div>
      </div>
    </>
  )
}
