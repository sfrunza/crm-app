export type UserRole =
  | 'admin'
  | 'manager'
  | 'foreman'
  | 'driver'
  | 'helper'
  | 'customer';


export type ServiceCode =
  | 'local_move'
  | 'packing_only'
  | 'loading_help'
  | 'unloading_help'
  | 'moving_with_storage'
  | 'overnight_truck_storage'
  | 'flat_rate'

export type RequestStatus =
  | "pending"
  | "pending_info"
  | "pending_date"
  | "hold"
  | "not_confirmed"
  | "confirmed"
  | "not_available"
  | "completed"
  | "spam"
  | "canceled"
  | "refused"
  | "closed"
  | "expired"
  | "archived"
  | "reserved";

export type AddressType = 'pick_up' | 'drop_off';

export type PaymentType =
  | "deposit"
  | "charge"
  | "invoice_payment"
  | "cash"
  | "check"
  | "other";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded";

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void";


export type CrewRole = 'foreman' | 'driver' | 'helper';

export const STAFF_ROLES: UserRole[] = ['admin', 'manager', 'foreman', 'driver', 'helper'];
export const ADMIN_ROLES: UserRole[] = ['admin', 'manager'];
export const CREW_ROLES: UserRole[] = ['foreman', 'driver', 'helper'];
