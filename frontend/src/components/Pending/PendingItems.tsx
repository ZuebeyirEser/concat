import { Skeleton } from "../ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

const PendingItems = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[30%]">ID</TableHead>
        <TableHead className="w-[30%]">Title</TableHead>
        <TableHead className="w-[30%]">Description</TableHead>
        <TableHead className="w-[10%]">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-5 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default PendingItems
