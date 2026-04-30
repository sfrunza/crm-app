import type { UserRole } from '@/types/user';
import { ADMIN_ROLES, CREW_ROLES } from '@/types/enums';

export function getPortalForRole(role: UserRole): string {
  if (ADMIN_ROLES.includes(role)) return '/crm';
  if (role === 'customer') return '/account';
  if (CREW_ROLES.includes(role)) return '/crew';
  return '/login';
}

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isCrewRole(role: UserRole): boolean {
  return CREW_ROLES.includes(role);
}
