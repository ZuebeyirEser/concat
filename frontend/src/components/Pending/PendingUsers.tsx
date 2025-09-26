import { Skeleton } from '../ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

const PendingUsers = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[20%]">Full name</TableHead>
        <TableHead className="w-[25%]">Email</TableHead>
        <TableHead className="w-[15%]">Role</TableHead>
        <TableHead className="w-[20%]">Status</TableHead>
        <TableHead className="w-[20%]">Actions</TableHead>
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
          <TableCell>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default PendingUsers
