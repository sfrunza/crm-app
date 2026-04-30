import { GlobalFallback } from "@/components/global-fallback";
import { appLoader, rootLoader } from "@/lib/auth";
import { ErrorPage } from "@/pages/error/page";
import { ADMIN_ROLES } from "@/types/index";
import { createBrowserRouter } from "react-router";
import { accountRoutes } from "./account-routes";
import { authRoutes } from "./auth-routes";
import { crmRoutes } from "./crm-routes";
import { RequireAuth, RequireRole, RootRedirect } from "./guards";

export const router = createBrowserRouter([
  {
    path: "/",
    loader: rootLoader,
    element: <RootRedirect />,
    hydrateFallbackElement: <GlobalFallback />,
    errorElement: <ErrorPage />,
  },
  ...authRoutes,
  {
    loader: appLoader,
    shouldRevalidate: () => false,
    element: <RequireAuth />,
    hydrateFallbackElement: <GlobalFallback />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "account",
        element: <RequireRole allowedRoles={["customer", ...ADMIN_ROLES]} />,
        children: accountRoutes,
      },
      {
        path: "crm",
        element: <RequireRole allowedRoles={ADMIN_ROLES} />,
        children: crmRoutes,
      },
      {
        path: "crm/requests/:id/pdf",
        element: <RequireRole allowedRoles={ADMIN_ROLES} />,
        lazy: () => import("@/pages/crm/request/pdf-viewer/page"),
      },
    ],
  },
]);
