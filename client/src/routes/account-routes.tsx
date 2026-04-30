import { AccountLayout } from "@/layouts/account/layout";
import { Navigate } from "react-router";

export const accountRoutes = [
  {
    element: <AccountLayout />,
    children: [
      {
        index: true,
        lazy: () => import("@/pages/account/page"),
      },
      {
        path: "invoice",
        children: [
          {
            index: true,
            element: <Navigate to="/account" replace />,
          },
          {
            path: ":token",
            lazy: () => import("@/pages/account/invoice/page"),
          },
        ],
      },

      {
        path: "requests",
        children: [
          {
            index: true,
            element: <Navigate to="/account" replace />,
          },
          {
            path: ":id",
            lazy: () => import("@/pages/account/request/page"),
          },
          {
            path: ":id/confirmation",
            lazy: () => import("@/pages/account/request/confirmation/page"),
          },
          {
            path: ":id/reservation",
            lazy: () => import("@/pages/account/request/reservation/page"),
          },
          {
            path: ":requestId/inventory",
            lazy: () => import("@/pages/account/request/inventory/page"),
            children: [
              {
                index: true,
                path: "rooms/:roomId",
                lazy: () =>
                  import("@/pages/account/request/inventory/rooms/page"),
              },
            ],
          },
        ],
      },
    ],
  },
];
