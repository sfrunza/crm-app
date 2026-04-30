import type { RequestRoom } from "@/domains/request-rooms/request-room.types";
import type { Location, MoveSize, PackingType, Service, Truck } from '@/types/index';
import type { SessionUser } from "@/types/user";
import type { DateFilter, SortField, SortOrder, StatusFilter } from "@/stores/use-table-requests-store";

export type TableRequestParams = {
  page?: number;
  per_page?: number;
  statusFilter?: StatusFilter;
  dateFilter?: DateFilter;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  filter?: "current" | "past";
}

export type RequestInventory = {
  rooms: RequestRoom[];
  total_items: number;
  total_volume: number;
  total_weight: number;
  total_boxes: number;
}

export type RequestTotals = {
  items: number;
  boxes: number;
  volume: number;
  weight: number;
  volume_with_dispersion: { min: number; max: number };
};


export type Request = {
  id: number;
  status: Status;
  moving_date: string | null;
  delivery_date_window_start: string | null;
  delivery_date_window_end: string | null;
  schedule_date_window_start: string | null;
  schedule_date_window_end: string | null;
  is_same_day_delivery: boolean;
  is_delivery_now: boolean;
  is_calculator_enabled: boolean;
  is_deposit_accepted: boolean;
  service_id: number;
  packing_type_id: number;
  service: Service;
  packing_type: PackingType | null;
  packing_items_total: number;
  packing_items: RequestExtraItem[];
  extra_services: RequestExtraItem[];
  inventory: RequestInventory;
  extra_services_total: number;
  work_time: {
    min: number;
    max: number;
  };
  total_time: {
    min: number;
    max: number;
  };
  transportation: {
    min: number;
    max: number;
  };
  labor_price: {
    min: number;
    max: number;
  };
  grand_total: {
    min: number;
    max: number;
  };
  balance: {
    min: number;
    max: number;
  };
  fuel: {
    total: number;
    value: number;
    percent: number;
  };
  discount: {
    total: number;
    value: number;
    percent: number;
  };
  min_total_time: number;
  details: {
    delicate_items_question_answer: string;
    bulky_items_question_answer: string;
    disassemble_items_question_answer: string;
    comments: string;
    is_touched?: boolean;
  };
  valuation: {
    total: number;
    description: string;
    name: string;
    valuation_id: number;
  };
  move_size: MoveSize | null;
  move_size_id: number;
  start_time_window: number | null;
  end_time_window: number | null;
  start_time_window_delivery: number | null;
  end_time_window_delivery: number | null;
  start_time_window_schedule: number | null;
  end_time_window_schedule: number | null;
  travel_time: number;
  crew_size: number;
  crew_size_delivery: number;
  rate: number;
  paired_request_id: number | null;
  paired_request: Request | null;
  is_moving_from_storage: boolean;
  customer: Customer | null;
  customer_id: number;
  foreman_id: number | null;
  foreman: Pick<SessionUser, "id" | "first_name" | "last_name"> | null;
  foreman_id_delivery: number | null;
  delivery_foreman: Pick<SessionUser, "id" | "first_name" | "last_name"> | null;
  mover_ids: number[];
  pickup_mover_ids: number[];
  delivery_mover_ids: number[];
  origin: Address;
  destination: Address;
  stops: Address[];
  sales_notes: string;
  driver_notes: string;
  customer_notes: string;
  dispatch_notes: string;
  deposit: number;
  payments_total: number;
  can_edit_request: boolean;
  trucks: Truck[];
  truck_ids: number[];
  pickup_truck_ids: number[];
  delivery_truck_ids: number[];
  directions?: {
    "OD": {
      total_distance: number;
      total_time: number;
    }
    "DP": {
      total_distance: number;
      total_time: number;
    }
    "OP": {
      total_distance: number;
      total_time: number;
    }
  };
  customer_signature_url: string | null;
  image_urls: {
    id: number;
    url: string;
    thumb: string;
  }[];
  unread_messages_count: number;
  signed_at: string | null;
  booked_at: string | null;
  created_at: string;
  updated_at: string;
  move_size_snapshot: MoveSize;
  selected_suggested_room_ids: number[];
  totals: RequestTotals;
  request_rooms: RequestRoom[];
};

export type ParklotSlot = {
  id: number;
  slot_type: "pickup" | "delivery";
  is_moving_day: boolean;
  start_minutes: number;
  end_minutes: number;
  date: string;
  truck_id: number;
  request: Request;
};

export type CustomerRequest = Pick<Request, 'id' | 'moving_date' | 'start_time_window' | 'end_time_window' | 'service_id' | 'status' | 'move_size_id' | 'crew_size' | 'origin' | 'destination'>;

export type Status = "pending" | "pending_info" | "pending_date" | "hold" | "not_confirmed" | "confirmed" | "not_available" | "completed" | "spam" | "canceled" | "refused" | "closed" | "expired" | "archived" | "reserved";

export type Address = {
  type?: AddressType;
  street: string;
  city: string;
  state: string;
  zip: string;
  apt: string;
  floor_id: number | null;
  location?: Location;
}

export type AddressType = 'pick_up' | 'drop_off';

export interface Customer extends SessionUser {
  phone: string | null;
  additional_phone: string | null;
  additional_email: string | null;
  requests_count: number;
};

export type MenuRequest = {
  id: number;
  status: Status;
  origin: Address;
  destination: Address;
};


export type TableRequest = {
  id: number;
  moving_date: string | null;
  service: {
    name: string;
  };
  move_size: {
    name: string;
  };
  status: Status;
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
  booked_at: string | null;
  grand_total: {
    min: number;
    max: number;
  };
  crew_size: number | null;
  is_moving_from_storage: boolean;
  has_paired_request: boolean;
  origin: {
    city: string;
    state: string;
    zip: string;
  };
  destination: {
    city: '';
    state: '';
    zip: '';
  };
};

export type TableRequestResponse = {
  requests: TableRequest[];
  pagination: {
    total_pages: number;
    current_page: number;
    total_count: number;
  };
};


export type RequestExtraItem = {
  id: number;
  quantity: number;
  price: number;
  name: string;
};

export type InventoryCustomItem = {
  id: string;
  name: string;
  description?: string;
  item_type?: "furniture" | "box";
  filter_tags?: string[];
  quantity: number;
  volume_cuft: number;
  weight_lbs: number;
  box_count: number;
};

export type InventoryRoom = {
  id: string;
  source_room_id: number | null;
  room_name: string;
  is_custom: boolean;
  items: Record<string, number>;
  custom_items: InventoryCustomItem[];
  totals?: {
    count: number;
    furniture_count: number;
    box_count: number;
    boxes: number;
    weight: number;
    volume: number;
  };
  image_url: string | null;
};

export type InventoryTotals = {
  total_count: number;
  total_boxes: number;
  total_furniture_items: number;
  total_box_items: number;
  total_weight: number;
  total_volume: number;
};

export type RequestUpdatePayload = Partial<Request> & {
  inventory_rooms?: InventoryRoom[];
};


export type SearchData = {
  id: number;
  name: string;
  email_address: string;
  phone: string;
  status: string;
};

export type SearchResponseData = {
  data: SearchData;
  highlighting: {
    [K in keyof SearchData]?: string;
  };
};
