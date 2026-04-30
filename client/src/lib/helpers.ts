export function formatCentsToDollars(cents: number) {
  return cents / 100;
}

export function formatCentsToDollarsString(
  price: number | null,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "BDT";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {},
) {
  if (!price) price = 0
  const { currency = "USD", notation = "standard" } = options;

  const numericPrice =
    typeof price === "string" ? parseFloat(price) / 100 : price / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
}

export function priceObjectToString(
  price?: { min: number; max: number }
): string {

  if (!price) return "To be determined";

  const { min, max } = price;

  if (min == null || max == null) return "To be determined";

  const minPrice = formatCentsToDollarsString(min);
  const maxPrice = formatCentsToDollarsString(max);

  if (min === max) {
    return maxPrice;
  }

  if (max === 0) {
    return minPrice;
  } else {
    return `${minPrice} - ${maxPrice}`;
  }
}

export function convertMinutesToHoursAndMinutes(minutes: number | null) {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = hours > 0 ? `${hours}h` : "";
  const formattedMinutes = remainingMinutes > 0 ? `${remainingMinutes}min` : "";
  return `${formattedHours} ${formattedMinutes}`.trim();
}

export function timeObjectToString(
  time?: { min: number; max: number } // Optional type
): string {

  if (!time) return "To be determined";

  const { min, max } = time;

  if (min == null || max == null) return "To be determined";

  const minTime = convertMinutesToHoursAndMinutes(min);
  const maxTime = convertMinutesToHoursAndMinutes(max);

  if (max === 0) {
    return minTime;
  } else {
    return `${minTime} - ${maxTime}`;
  }
}

export const formatTimeWindow = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return new Date(0, 0, 0, hours, mins).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};


export function timeWindowToString(
  start_time_window?: number | null,
  end_time_window?: number | null
): string {
  // If neither start nor end times are provided, return "TBD"
  if (!start_time_window && !end_time_window) {
    return "TBD";
  }

  // If only the start time is provided, return just the start time
  if (start_time_window && !end_time_window) {
    return formatTimeWindow(start_time_window)
  }

  if (start_time_window && start_time_window === end_time_window) {
    return formatTimeWindow(start_time_window)
  }

  // If both start and end times are provided, return them as a range
  if (start_time_window && end_time_window) {
    return `${formatTimeWindow(start_time_window)} - ${formatTimeWindow(end_time_window)}`;
  }
  return "TBD";
}