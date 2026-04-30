import {
  PageAction,
  PageContent,
  PageHeader,
} from "@/components/page-component";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PlusIcon } from "@/components/icons";
import { Fragment } from "react";
import { useSearchParams } from "react-router";
import { EmployeeFormSheet } from "./employee-form-sheet";
import { EmployeesTable } from "./employees-table";
import { FilterTabs, type Tab } from "./filter-tabs";
import { useGetEmployees } from "@/domains/employees/employee.queries";

function DepartmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") as Tab;
  const { data: employees, isLoading, error } = useGetEmployees();

  const filteredEmployees = employees?.filter((user) =>
    filter === "all" || !filter ? user : user.role === filter,
  );

  return (
    <Fragment>
      {/* Actions based on search params */}
      <EmployeeFormSheet />

      {/* Filter tabs */}
      <FilterTabs />

      <PageHeader className="border-b">
        <PageAction className="flex flex-row justify-end">
          <Button
            size="sm"
            onClick={() => {
              setSearchParams((prev) => {
                prev.set("create_employee", "employee");
                return prev;
              });
            }}
          >
            <PlusIcon />
            Create employee
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center px-4 py-28">
            <Spinner />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center px-4 py-28">
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        )}

        {/* Employees table */}
        {filteredEmployees && <EmployeesTable employees={filteredEmployees} />}
      </PageContent>
    </Fragment>
  );
}

export const Component = DepartmentPage;
