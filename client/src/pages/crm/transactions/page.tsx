import { PageContainer, PageNavTabs } from "@/components/page-component";
import { Outlet } from "react-router";

const tabs = [
  {
    name: "Invoices",
    href: "invoices",
  },
  {
    name: "Payments",
    href: "payments",
  },
];

function TransactionsPage() {
  return (
    <PageContainer>
      <div className="px-4 pt-4 pb-2.5">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <PageNavTabs tabs={tabs} />
      </div>
      <Outlet />
    </PageContainer>
  );
}

export const Component = TransactionsPage;
