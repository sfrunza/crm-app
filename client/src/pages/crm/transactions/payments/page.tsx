import { PageContent } from "@/components/page-component";
import { Outlet } from "react-router";

function PaymentsPage() {
  return (
    <PageContent>
      <div className="px-4 pt-4 pb-2.5">
        <h1 className="text-2xl font-bold">Payments</h1>
      </div>
      <Outlet />
    </PageContent>
  );
}

export const Component = PaymentsPage;
