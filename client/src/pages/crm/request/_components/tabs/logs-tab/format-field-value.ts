import type { Address, Request } from "@/domains/requests/request.types";
import { formatDate } from "@/lib/format-date";
import {
  convertMinutesToHoursAndMinutes,
  formatCentsToDollarsString,
  formatTimeWindow,
  priceObjectToString,
  timeObjectToString,
} from "@/lib/helpers";

// ─── Types ───────────────────────────────────────────────────────────

/**
 * Maps each Request field key to a formatter that receives the correctly
 * typed value for that field. Adding a wrong type will be a compile error.
 */
type FieldFormatters = {
  [K in keyof Request]?: (value: Request[K]) => string;
};

// ─── Reusable formatter functions ────────────────────────────────────

const formatStatus = (v: Request["status"]) =>
  String(v).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDateField = (v: string | null) =>
  formatDate(v, "MMM d, yyyy");

const formatTimeMinutes = (v: number | null) =>
  v != null ? formatTimeWindow(v) : "TBD";

const formatBoolean = (v: boolean) => (v ? "Yes" : "No");

const formatNumber = (v: number) => String(v);

const formatCents = (v: number) => formatCentsToDollarsString(v);

const formatAddress = (v: Address) => {
  const parts = [v.street, v.city, v.state, v.zip].filter(Boolean);
  return parts.join(", ") || "N/A";
};

const formatList = (v: unknown[]) =>
  `${v.length} item${v.length !== 1 ? "s" : ""}`;

// ─── Field → Formatter map ──────────────────────────────────────────
//
// To add a new field, add one line here. TypeScript enforces that the
// formatter parameter matches the field's type from Request.

const FIELD_FORMATTERS = {
  // Status
  status: formatStatus,

  // Dates
  moving_date: formatDateField,
  delivery_date_window_start: formatDateField,
  delivery_date_window_end: formatDateField,
  schedule_date_window_start: formatDateField,
  schedule_date_window_end: formatDateField,
  booked_at: formatDateField,

  // Time-of-day (minutes since midnight → "2:30 PM")
  start_time_window: formatTimeMinutes,
  end_time_window: formatTimeMinutes,
  start_time_window_delivery: formatTimeMinutes,
  end_time_window_delivery: formatTimeMinutes,
  start_time_window_schedule: formatTimeMinutes,
  end_time_window_schedule: formatTimeMinutes,

  // Booleans
  is_same_day_delivery: formatBoolean,
  is_delivery_now: formatBoolean,
  is_calculator_enabled: formatBoolean,
  is_moving_from_storage: formatBoolean,
  is_deposit_accepted: formatBoolean,

  // Numbers
  crew_size: formatNumber,
  crew_size_delivery: formatNumber,

  // Duration in minutes → "1h 30min"
  travel_time: (v: Request["travel_time"]) =>
    convertMinutesToHoursAndMinutes(v) || "0min",
  min_total_time: (v: Request["min_total_time"]) =>
    convertMinutesToHoursAndMinutes(v) || "0min",

  // Currency (cents → "$12.50")
  rate: formatCents,
  deposit: formatCents,
  extra_services_total: formatCents,
  packing_items_total: formatCents,
  fuel: (v: Request["fuel"]) => formatCentsToDollarsString(v.total),
  discount: (v: Request["discount"]) => formatCentsToDollarsString(v.total),

  // Addresses
  origin: formatAddress,
  destination: formatAddress,

  stops: (v: Request["stops"]) => v.map((stop) => {
    const type = stop.type === "pick_up" ? "Extra pickup" : "Extra dropoff";
    return `${type} - ${formatAddress(stop)}`;
  }).join("; "),

  // Lists / arrays
  // Extra services and packing items
  extra_services: formatList,
  packing_items: formatList,

  // Range objects
  work_time: (v: Request["work_time"]) => timeObjectToString(v),
  total_time: (v: Request["total_time"]) => timeObjectToString(v),
  transportation: (v: Request["transportation"]) => priceObjectToString(v),

  // Object fields
  valuation: (v: Request["valuation"]) =>
    `${v.name} (${formatCentsToDollarsString(v.total)})`,

  details: (v: Request["details"]) => {
    const pairs = Object.entries(v)
      .filter(([k]) => k !== "is_touched")
      .map(([k, val]) => `${k.replace(/_/g, " ")}: ${val}`);
    return pairs.join(", ") || "empty";
  },

  // Notes (plain strings)
  sales_notes: (v: Request["sales_notes"]) => v || "empty",
  driver_notes: (v: Request["driver_notes"]) => v || "empty",
  customer_notes: (v: Request["customer_notes"]) => v || "empty",
  dispatch_notes: (v: Request["dispatch_notes"]) => v || "empty",

  // FK fields (backend provides old_display/new_display, this is a fallback)
  customer_id: (v: Request["customer_id"]) => `#${v}`,
  foreman_id: (v: Request["foreman_id"]) => (v != null ? `#${v}` : ""),
  service_id: (v: Request["service_id"]) => `#${v}`,
  packing_type_id: (v: Request["packing_type_id"]) => `#${v}`,
  move_size_id: (v: Request["move_size_id"]) => `#${v}`,
  paired_request_id: (v: Request["paired_request_id"]) =>
    v != null ? `#${v}` : "",
} satisfies FieldFormatters;

// ─── Public API ──────────────────────────────────────────────────────

type TrackedField = keyof typeof FIELD_FORMATTERS;

const defaultFormatter = (v: unknown): string => {
  if (typeof v === "object" && v !== null) {
    if (Array.isArray(v))
      return `${v.length} item${v.length !== 1 ? "s" : ""}`;
    return Object.entries(v)
      .map(([k, val]) => `${k.replace(/_/g, " ")}: ${val}`)
      .join(", ");
  }
  return String(v);
};

/**
 * Format a raw field value for display in the activity log.
 *
 * For FK fields, prefer the backend-provided `old_display` / `new_display`
 * over calling this function (since those contain the resolved record name).
 * This function is the fallback when display strings are missing.
 */
export function formatFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "empty";

  if (field in FIELD_FORMATTERS) {
    const formatter = FIELD_FORMATTERS[field as TrackedField];
    // biome-ignore lint: value is typed at the formatter definition via satisfies
    return (formatter as (v: any) => string)(value);
  }

  return defaultFormatter(value);
}
