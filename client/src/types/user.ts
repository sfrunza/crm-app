export type UserRole = 'admin' | 'manager' | 'customer' | 'foreman' | 'driver' | 'helper';

export interface SessionUser {
  id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  phone: string | null;
  additional_email: string | null;
  additional_phone: string | null;
  role: UserRole;
  requests_count: number;
}

// export const STAFF_ROLES: UserRole[] = ['admin', 'manager', 'foreman', 'driver', 'helper'];
// export const ADMIN_ROLES: UserRole[] = ['admin', 'manager'];
// export const CREW_ROLES: UserRole[] = ['foreman', 'driver', 'helper'];