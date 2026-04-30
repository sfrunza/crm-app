import { PageContainer, PageNavTabs } from "@/components/page-component";
import { Outlet } from "react-router";

const tabs = [
  {
    name: "Company",
    href: "company",
  },
  {
    name: "Services",
    href: "services",
  },
  {
    name: "Extra services",
    href: "extra-services",
  },
  {
    name: "Packing",
    href: "packing",
  },
  {
    name: "Inventory",
    href: "inventory",
  },
  {
    name: "Trucks",
    href: "trucks",
  },
  {
    name: "Valuation",
    href: "valuations",
  },
  {
    name: "Rates",
    href: "rates",
  },
  {
    name: "Calendar Rates",
    href: "calendar-rates",
  },
  {
    name: "Department",
    href: "department",
  },
  {
    name: "Calculator",
    href: "calculator",
  },
  {
    name: "Emails",
    href: "emails",
  },
];

function SettingsPage() {
  return (
    <PageContainer>
      <div className="px-4 pt-4 pb-2.5">
        <h1 className="text-2xl font-bold">Settings</h1>
        <PageNavTabs tabs={tabs} />
      </div>
      <Outlet />
    </PageContainer>
  );
}

export const Component = SettingsPage;
