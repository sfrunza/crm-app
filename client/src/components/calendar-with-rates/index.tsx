import { memo, useCallback, useMemo, type CSSProperties } from "react";

import {
  Calendar,
  CalendarDayButton,
  type CalendarProps,
} from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import type { CalendarRateMap, Rate } from "@/types/index";
import { hexToRgb } from "@/lib/helpers";
import { formatDate } from "@/lib/format-date";

type CalendarWithRatesProps = CalendarProps & {
  rates: Rate[] | undefined;
  calendarRates: CalendarRateMap | undefined;
  isLoading: boolean;
  showFooter?: boolean;
};

// Constants for blocked day styling
const BLOCKED_DAY_STYLES = {
  color: "#000000",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
} as const;

const BASE_DAY_STYLES: CSSProperties = {
  color: "inherit",
  backgroundColor: "inherit",
  opacity: 1,
};

/**
 * Calculate the day cell styles based on rate and blocked status
 */
function getDayStyles(
  isBlocked: boolean,
  rateColor: string | undefined
): CSSProperties {
  if (isBlocked) {
    return {
      ...BASE_DAY_STYLES,
      ...BLOCKED_DAY_STYLES,
    };
  }

  if (rateColor) {
    return {
      ...BASE_DAY_STYLES,
      color: rateColor,
      backgroundColor: `rgba(${hexToRgb(rateColor)}, 0.1)`,
    };
  }

  return BASE_DAY_STYLES;
}

export const CalendarWithRates = memo(function ({
  rates,
  calendarRates,
  showFooter = false,
  isLoading = false,
  className,
  ...calendarProps
}: CalendarWithRatesProps) {
  const defaultRate = useMemo(() => {
    return rates?.find((rate) => rate.is_default) ?? null;
  }, [rates]);

  // Create a map for faster rate lookups
  const ratesMap = useMemo(() => {
    if (!rates) return new Map();
    return new Map(rates.map((rate) => [rate.id, rate]));
  }, [rates]);

  const getRateInfo = useCallback(
    (id: number | null | undefined) => {
      const rateId = id ?? defaultRate?.id ?? null;
      return ratesMap.get(rateId);
    },
    [ratesMap, rates]
  );

  const getDayInfo = useCallback(
    (date: Date) => {
      if (!calendarRates) return null;
      // console.log("date", date);
      // console.log("formatDate", formatDate(date, "yyyy-MM-dd"));
      return calendarRates[formatDate(date, "yyyy-MM-dd")] ?? null;
    },
    [calendarRates]
  );

  return (
    <Calendar
      mode="single"
      showOutsideDays={false}
      className={cn(className)}
      components={{
        DayButton: ({ children, modifiers, day, ...props }) => {
          const date = day.date;
          const dayInfo = getDayInfo(date);
          const rateInfo = getRateInfo(dayInfo?.rate_id);

          const isBlocked = dayInfo?.is_blocked ?? false;
          const dayStyles = getDayStyles(isBlocked, rateInfo?.color);

          return (
            <CalendarDayButton
              {...props}
              day={day}
              modifiers={modifiers}
              style={dayStyles}
              className="transition-all duration-150 ease-in-out hover:ring"
            >
              {isLoading ? <Skeleton className="h-full w-full" /> : children}
            </CalendarDayButton>
          );
        },
      }}
      {...calendarProps}
    />
  );
});
