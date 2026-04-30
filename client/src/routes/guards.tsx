import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/user";
import { getPortalForRole } from "@/lib/role-guards";

export function RequireAuth() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function RequireRole({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getPortalForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export function RootRedirect() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Navigate to={getPortalForRole(user.role)} replace />;
}
