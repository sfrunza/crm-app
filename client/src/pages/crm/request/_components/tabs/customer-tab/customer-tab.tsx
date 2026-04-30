import { CustomerForm } from "./customer-form";
import { RequestsTable } from "./requests-table";

export function CustomerTab() {
  return (
    <div className="p-4 pb-10">
      <CustomerForm />
      <RequestsTable />
    </div>
  );
}
