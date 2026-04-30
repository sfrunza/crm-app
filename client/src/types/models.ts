import type {
  UserRole,
  RequestStatus,
  PaymentType,
  PaymentStatus,
  InvoiceStatus,
  CrewRole,
  AddressType,
} from './enums';

export interface MinMax {
  min: number;
  max: number;
}

export interface FuelDiscount {
  percent: number;
  value: number;
  total: number;
}

export interface ValuationInfo {
  total: number;
  description: string;
  name: string;
  valuation_id: number | null;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Address {
  type: AddressType;
  street: string;
  city: string;
  state: string;
  zip: string;
  apt: string;
  floor_id: number | null;
  location: Location;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  phone: string | null;
  additional_email: string | null;
  additional_phone: string | null;
  requests_count: number;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanySetting {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  parking_address: string;
  parking_location: Location;
  company_logo_url: string | null;
}

export interface Service {
  id: number;
  name: string;
  active: boolean;
  miles_setting: number;
  position: number;
  is_default: boolean;
  code: string;
}

export interface Rate {
  id: number;
  name: string;
  extra_mover_rate: number;
  extra_truck_rate: number;
  active: boolean;
  color: string;
  is_default: boolean;
  movers_rates: Record<string, { hourly_rate: number }>;
}

export interface CalendarRate {
  id: number;
  date: string | null // only for create
  formatted_date: string
  rate_id: number | null;
  enable_automation: boolean;
  enable_auto_booking: boolean;
  is_blocked: boolean;
}

export type CalendarRateMap = Record<string, CalendarRate>;

export interface ExtraService {
  id: number;
  name: string;
  price: number;
  active: boolean
  position: number;
}

export interface Truck {
  id: number,
  name: string,
  active: boolean
  position: number
}

export interface PackingType {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
  labor_increase: number;
  position: number;
}

export interface PackingItem {
  id: number;
  name: string;
  price: number;
  position: number;
}

export interface Valuation {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
  active: boolean;
}

export type MoveSizeTotals = {
  items: number;
  boxes: number;
  volume: number;
  weight: number;
  volume_with_dispersion: MinMax;
};

export type MoveSize = {
  id: number;
  name: string;
  description: string;
  position: number;
  dispersion: number | null;
  truck_count: number;
  crew_size_settings: number[][]; // nested arrays like in your CRM
  image_url: string | null;
  totals: MoveSizeTotals;
  default_rooms: MoveSizeRoom[];
  suggested_rooms: MoveSizeRoom[];
};

export type MoveSizeRoom = {
  id: number;
  room_id: number;
  room_name: string;
  items: Record<string, number>;
  total_items: number;
  total_boxes?: number;
  total_volume: number;
  total_weight?: number;
  position: number;
};

export type MoveSizeRoomItem = {
  item_id: number;
  name: string;
  quantity: number;
  volume: number;
  weight: number;
  is_box: boolean;
  is_furniture: boolean;
  is_special_handling: boolean;
};

export interface EntranceType {
  id: number
  name: string
  form_name: string
  position: number
}

export interface Room {
  id: number;
  name: string;
  position: number;
  active: boolean;
  image_url: string | null;
}

export interface Item {
  id: number;
  name: string;
  description: string | null;
  volume: number | null;
  weight: number | null;
  is_box: boolean;
  is_furniture: boolean;
  is_special_handling: boolean;
  position: number;
  active: boolean;
  image_url: string | null;
  category_ids: number[];
}

export interface MoveRequest {
  id: number;
  status: RequestStatus;
  customer_id: number | null;
  foreman_id: number | null;
  delivery_foreman_id: number | null;
  service_id: number | null;
  packing_type_id: number | null;
  move_size_id: number | null;
  paired_request_id: number | null;
  selected_suggested_room_ids: number[];
  total_items: number;
  total_boxes: number;
  total_volume: number;
  total_weight: number;
  moving_date: string | null;
  delivery_date_window_start: string | null;
  delivery_date_window_end: string | null;
  schedule_date_window_start: string | null;
  schedule_date_window_end: string | null;
  is_same_day_delivery: boolean;
  is_delivery_now: boolean;
  is_calculator_enabled: boolean;
  is_moving_from_storage: boolean;
  is_deposit_accepted: boolean;
  rate: number;
  travel_time: number;
  deposit: number;
  min_total_time: number;
  extra_services_total: number;
  packing_items_total: number;
  work_time: MinMax;
  total_time: MinMax;
  transportation: MinMax;
  labor_price: MinMax;
  grand_total: MinMax;
  balance: MinMax;
  directions: Record<string, unknown>;
  fuel: FuelDiscount;
  discount: FuelDiscount;
  valuation: ValuationInfo;
  crew_size: number | null;
  crew_size_delivery: number | null;
  can_edit_request: boolean;
  sales_notes: string | null;
  driver_notes: string | null;
  customer_notes: string | null;
  dispatch_notes: string | null;
  stops: Address[];
  origin: Address;
  destination: Address;
  signed_at: string | null;
  booked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestExtraService {
  id: number;
  request_id: number;
  extra_service_id: number;
  price: number | null;
  quantity: number | null;
  created_at: string;
  updated_at: string;
}

export interface RequestPackingItem {
  id: number;
  request_id: number;
  packing_item_id: number;
  price: number | null;
  quantity: number | null;
  created_at: string;
  updated_at: string;
}

export interface RequestRoom extends Room {
  room_id: number | null;
  is_custom: boolean;
  totals: MoveSizeTotals;
}

export interface RequestItem {
  id: number;
  request_id: number;
  item_id: number;
  request_room_id: number | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface RequestTruck {
  id: number;
  request_id: number;
  truck_id: number;
  is_delivery: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrewAssignment {
  id: number;
  request_id: number;
  user_id: number;
  role: CrewRole;
  is_delivery: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  content: string;
  request_id: number;
  user_id: number;
  viewed_by: number[];
  notified_user_ids: number[];
  created_at: string;
  updated_at: string;
  user: User;
}

export interface Log {
  id: number;
  request_id: number;
  user_id: number;
  action: string;
  description: string | null;
  metadata: Record<string, unknown>;
  trackable_type: string | null;
  trackable_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  request_id: number;
  user_id: number;
  payment_type: PaymentType;
  amount: number;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  card_brand: string | null;
  card_last_four: string | null;
  description: string | null;
  refunded_amount: number;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  position: number;
};

export type Invoice = {
  id: number;
  request_id: number;
  user_id: number;
  invoice_number: string | null;
  email: string | null;
  client_name: string | null;
  client_address: string | null;
  amount: number;
  subtotal: number;
  processing_fee_percent: number;
  processing_fee_amount: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  description: string | null;
  notes: string | null;
  paid_at: string | null;
  sent_at: string | null;
  public_url: string | null;
  invoice_items: InvoiceItem[];
  created_at: string;
  updated_at: string;
};

export interface Folder {
  id: number;
  name: string;
  position: number | null;
  is_default: boolean;
  email_templates_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: number;
  folder_id: number;
  name: string;
  event_key: string | null;
  subject: string;
  html: string;
  design: Record<string, unknown>;
  variables: Record<string, string>;
  position: number;
  active: boolean;
  system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  status: RequestStatus;
  customer: {
    first_name: string;
    last_name: string;
  } | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}
