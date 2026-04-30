import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Employee } from "@/domains/employees/employee.types";
import { formatPhone } from "@/lib/format-phone";
import { MoreHorizontalIcon } from "@/components/icons";
import { useSearchParams } from "react-router";

export function EmployeesTableRow({ employee }: { employee: Employee }) {
  return (
    <TableRow>
      <TableCell className="text-foreground font-medium">{`${employee.first_name} ${employee.last_name}`}</TableCell>
      <TableCell>
        {employee.phone ? formatPhone(employee.phone) : "-"}
      </TableCell>
      <TableCell>{employee.email_address}</TableCell>
      <TableCell className="capitalize">{employee.role}</TableCell>
      <TableCell>
        <Switch checked={employee.active} />
      </TableCell>
      <TableCell className="text-right">
        <Actions employeeId={employee.id} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ employeeId }: { employeeId: number }) {
  const [_, setSearchParams] = useSearchParams();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-7">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setSearchParams((prev) => {
                prev.set("edit_employee", employeeId.toString());
                return prev;
              });
            }}
          >
            Edit employee
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
