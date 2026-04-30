import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeesTableRow } from "./employees-table-row";
import type { Employee } from "@/domains/employees/employee.types";

interface EmployeesTableProps {
  employees: Employee[];
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  return (
    <Table className="overflow-x-hidden overflow-y-hidden">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <EmployeesTableRow key={employee.id} employee={employee} />
        ))}
        {employees.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
