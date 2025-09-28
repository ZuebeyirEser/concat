import AddItem from '@/components/Items/AddItem'

export function ItemsHeader() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="pt-12 text-2xl font-bold">Items Management</h1>
      </div>
      <div className="mt-4">
        <AddItem />
      </div>
    </>
  )
}