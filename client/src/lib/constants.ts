import type { RequestStatus, PaymentStatus, InvoiceStatus, UserRole } from '@/types/index';

export const REQUEST_STATUSES: RequestStatus[] = [
  "pending",
  "pending_info",
  "pending_date",
  "hold",
  "not_confirmed",
  "confirmed",
  "not_available",
  "completed",
  "spam",
  "canceled",
  "refused",
  "closed",
  "expired",
  "archived",
  "reserved",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "succeeded",
  "failed",
  "refunded",
];

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "open",
  "paid",
  "void",
];

export const USER_ROLES: UserRole[] = [
  'admin',
  'manager',
  'foreman',
  'driver',
  'helper',
  'customer',
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  foreman: 'Foreman',
  driver: 'Driver',
  helper: 'Helper',
  customer: 'Customer',
};

// Status Colors --------------------------------------
export const STATUS_TEXT_COLOR: Record<RequestStatus | "all", string> = {
  "all": "text-neutral-800 dark:text-neutral-400",
  "pending": "text-amber-600 dark:text-amber-400",
  "pending_info": "text-rose-600 dark:text-rose-400",
  "pending_date": "text-rose-600 dark:text-rose-400",
  "hold": "text-amber-600 dark:text-amber-400",
  "not_confirmed": "text-indigo-600 dark:text-indigo-400",
  "confirmed": "text-green-600 dark:text-green-400",
  "not_available": "text-neutral-800 dark:text-neutral-400",
  "completed": "text-sky-600 dark:text-sky-400",
  "spam": "text-neutral-800 dark:text-neutral-400",
  "canceled": "text-rose-600 dark:text-rose-400",
  "refused": "text-neutral-800 dark:text-neutral-400",
  "closed": "text-neutral-800 dark:text-neutral-400",
  "expired": "text-neutral-800 dark:text-neutral-400",
  "archived": "text-neutral-800 dark:text-neutral-400",
  "reserved": "text-purple-600 dark:text-purple-400",
};

// Status Soft Background Colors (for banners/badges) ---------------
export const STATUS_SOFT_BG_COLOR: Record<RequestStatus | "all", string> = {
  "all": "bg-neutral-900/12 dark:bg-neutral-50/12",
  "pending": "bg-amber-500/12 dark:bg-amber-400/12",
  "pending_info": "bg-rose-500/12 dark:bg-rose-400/12",
  "pending_date": "bg-rose-500/12 dark:bg-rose-400/12",
  "hold": "bg-amber-500/12 dark:bg-amber-400/12",
  "not_confirmed": "bg-indigo-500/12 dark:bg-indigo-400/12",
  "confirmed": "bg-green-600/12 dark:bg-green-400/12",
  "not_available": "bg-neutral-900/12 dark:bg-neutral-50/12",
  "completed": "bg-sky-500/12 dark:bg-sky-400/12",
  "spam": "bg-neutral-900/12 dark:bg-neutral-50/12",
  "canceled": "bg-rose-500/12 dark:bg-rose-400/12",
  "refused": "bg-neutral-900/12 dark:bg-neutral-50/12",
  "closed": "bg-neutral-900/12 dark:bg-neutral-50/12",
  "expired": "bg-neutral-900/12 dark:bg-neutral-50/12",
  "archived": "bg-neutral-900/12 dark:bg-neutral-50/12",
  "reserved": "bg-purple-500/12 dark:bg-purple-400/12",
};

// Status Background Colors --------------------------------------
export const STATUS_BG_COLOR: Record<RequestStatus | "all", string> = {
  "all": "bg-neutral-900",
  "pending": "bg-amber-500",
  "pending_info": "bg-rose-500",
  "pending_date": "bg-rose-500",
  "hold": "bg-amber-500",
  "not_confirmed": "bg-indigo-500",
  "confirmed": "bg-green-600",
  "not_available": "bg-neutral-900",
  "completed": "bg-sky-500",
  "spam": "bg-neutral-900",
  "canceled": "bg-rose-500",
  "refused": "bg-neutral-900",
  "closed": "bg-neutral-900",
  "expired": "bg-neutral-900",
  "archived": "bg-neutral-900",
  "reserved": "bg-purple-500",
};

export const PAYMENT_TYPE_LABELS = {
  deposit: 'Deposit',
  charge: 'Charge',
  invoice_payment: 'Invoice Payment',
  cash: 'Cash',
  check: 'Check',
  other: 'Other',
};

export type StorageIconKey = "Moving with Storage" | "Overnight Truck Storage"

export const storageIcons: Record<StorageIconKey, string> = {
  "Moving with Storage": "/svg-icons/warehouse.svg",
  "Overnight Truck Storage": "/svg-icons/truck.svg",
};

type StatusOptions = Record<RequestStatus, string>;

export const statusesMap: StatusOptions = {
  pending: "Pending",
  pending_info: "Pending Info",
  pending_date: "Pending Date",
  hold: "Hold",
  not_confirmed: "Not Confirmed",
  confirmed: "Confirmed",
  not_available: "Not Available",
  completed: "Completed",
  spam: "Spam",
  canceled: "Canceled",
  refused: "Refused",
  closed: "Closed",
  expired: "Expired",
  archived: "Archived",
  reserved: "Reserved",
};

type StatusOption = {
  label: string;
  value: RequestStatus;
};

export const STATUS_OPTIONS: StatusOption[] = Object.entries(statusesMap).map(
  ([key, label]) => ({
    label: label,
    value: key as RequestStatus,
  })
);

export const VALUATION_OPTIONS_MAP: Record<number, string> = {
  1: "Option A",
  2: "Option B",
  3: "Option C",
  4: "Option D",
  5: "Option E",
  6: "Option F",
  7: "Option G",
  8: "Option H",
  9: "Option I",
  10: "Option J",
  11: "Option K",
  12: "Option L",
  13: "Option M",
  14: "Option N",
  15: "Option O",
  16: "Option P",
  17: "Option Q",
  18: "Option R",
  19: "Option S",
  20: "Option T",
  21: "Option U",
  22: "Option V",
  23: "Option W",
  24: "Option X",
  25: "Option Y",
  26: "Option Z",
};


// Ttabs --------------------------------------

type StatusFilter = StatusOptions[keyof StatusOptions];

type StatusFilterKey = Exclude<RequestStatus, "pending_info" | "pending_date" | "hold"> | "all";

type StatusFilterOptionsMap = Record<StatusFilterKey, StatusFilter>;

const statusFilterOptionsMap: StatusFilterOptionsMap = {
  all: "All Requests",
  pending: "Pending",
  not_confirmed: "Not Confirmed",
  confirmed: "Confirmed",
  not_available: "Not Available",
  completed: "Completed",
  spam: "Spam",
  canceled: "Canceled",
  refused: "Refused",
  closed: "Closed",
  expired: "Expired",
  archived: "Archived",
  reserved: "Reserved",
};

type StatusFilterOption = {
  label: StatusFilter;
  value: keyof StatusFilterOptionsMap;
};

export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = Object.entries(statusFilterOptionsMap).map(
  ([key, label]) => ({
    label: label,
    value: key as keyof StatusFilterOptionsMap,
  })
);

type DateFilterOptions = Record<"booked_this_month" | "upcoming_this_month" | "upcoming_all" | "booked_all", string>;

const dateFilterOptionsMap: DateFilterOptions = {
  booked_this_month: "Booked this month",
  upcoming_this_month: "Upcoming this month",
  upcoming_all: "Upcoming all",
  booked_all: "Booked all",
};

type DateFilterOption = {
  label: string;
  value: keyof DateFilterOptions;
};

export const DATE_FILTER_OPTIONS: DateFilterOption[] = Object.entries(dateFilterOptionsMap).map(
  ([key, label]) => ({
    label: label,
    value: key as keyof DateFilterOptions,
  })
);

function generateWorkTimeOptions() {
  const options: { value: number; label: string }[] = [];
  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const timeInMinutes = hours * 60 + minutes;
      options.push({
        value: timeInMinutes,
        label: `${hours.toString()}:${minutes.toString().padStart(2, "0")}`,
      });
    }
  }
  return options;
}

const generateTimeOptions = (options?: { withMeridiem?: boolean | null }) => {
  const withMeridiem = options?.withMeridiem ?? false;
  const timeOptions: { value: number; label: string }[] = [];
  for (let i = 0; i < 24 * 60; i += 15) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;

    // Format time based on `withMeridiem` parameter
    const timeString = withMeridiem
      ? new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    timeOptions.push({ label: timeString, value: i });
  }
  return timeOptions;
};

export const TIME_OPTIONS_WITH_MERIDIEM = generateTimeOptions({ withMeridiem: true });
export const TIME_OPTIONS = generateWorkTimeOptions();

export const STALE_TIME_CATALOG = 1000 * 60 * 60; // 1 hour;
export const STALE_TIME_LIVE = 0;
