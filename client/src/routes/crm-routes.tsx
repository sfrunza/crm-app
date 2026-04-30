import { CrmLayout } from "@/layouts/crm/layout";
import { Navigate } from "react-router";

export const crmRoutes = [
  {
    element: <CrmLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/crm/requests" replace />,
      },
      {
        path: "requests",
        lazy: () => import("@/pages/crm/requests/page"),
      },
      {
        path: "dispatch",
        lazy: () => import("@/pages/crm/dispatch/page"),
      },
      {
        path: "settings",
        lazy: () => import("@/pages/crm/settings/page"),
        children: [
          {
            index: true,
            element: <Navigate to="company" replace />,
          },
          {
            path: "company",
            lazy: () => import("@/pages/crm/settings/company/page"),
          },
          {
            path: "services",
            lazy: () => import("@/pages/crm/settings/services/page"),
          },
          {
            path: "extra-services",
            lazy: () => import("@/pages/crm/settings/extra-services/page"),
          },
          {
            path: "packing",
            lazy: () => import("@/pages/crm/settings/packing/page"),
          },
          {
            path: "inventory",
            lazy: () => import("@/pages/crm/settings/inventory/page"),
          },
          {
            path: "valuations",
            lazy: () => import("@/pages/crm/settings/valuations/page"),
          },
          {
            path: "trucks",
            lazy: () => import("@/pages/crm/settings/trucks/page"),
          },
          {
            path: "rates",
            lazy: () => import("@/pages/crm/settings/rates/page"),
          },
          {
            path: "calendar-rates",
            lazy: () => import("@/pages/crm/settings/calendar-rates/page"),
          },
          {
            path: "department",
            lazy: () => import("@/pages/crm/settings/department/page"),
          },
          {
            path: "calculator",
            lazy: () => import("@/pages/crm/settings/calculator/page"),
          },
          {
            path: "emails",
            lazy: () => import("@/pages/crm/settings/emails/page"),
          },
        ],
      },
      {
        path: "messages",
        lazy: () => import("@/pages/crm/messages/page"),
        children: [
          {
            path: ":requestId",
            lazy: () => import("@/pages/crm/messages/request-messages/page"),
          },
        ],
      },
      {
        path: "transactions",
        lazy: () => import("@/pages/crm/transactions/page"),
        children: [
          {
            index: true,
            element: <Navigate to="invoices" replace />,
          },
          {
            path: "invoices",
            lazy: () => import("@/pages/crm/transactions/invoices/page"),
          },
          {
            path: "payments",
            lazy: () => import("@/pages/crm/transactions/payments/page"),
          },
        ],
      },
    ],
  },
];
