import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate, parseDateOnly } from "@/lib/format-date";
import type { CalendarRateMap, Rate } from "@/types/index";
import { ChevronDownIcon } from "@/components/icons";
import { useMemo, useState } from "react";
import { CalendarWithRates } from "@/components/calendar-with-rates";

interface DatePickerWithRatesProps {
  rates: Rate[] | undefined;
  calendarRates: CalendarRateMap | undefined;
  id?: string;
  selected: Date | undefined;
  onSelectDate: (date: Date) => void;
}

export function DatePickerWithRates({
  rates,
  calendarRates,
  id,
  selected,
  onSelectDate,
  ...props
}: DatePickerWithRatesProps) {
  const [open, setOpen] = useState(false);

  const disabledDates = useMemo(() => {
    return Object.values(calendarRates ?? {})
      .map((rate) =>
        rate.is_blocked
          ? (parseDateOnly(rate.formatted_date) ?? new Date())
          : null
      )
      .filter((date) => date !== null);
  }, [calendarRates]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline">
          {formatDate(selected, "MMMM d, yyyy")}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarWithRates
          rates={rates}
          calendarRates={calendarRates}
          showFooter={true}
          selected={selected}
          isLoading={!calendarRates}
          onDayClick={(date) => {
            onSelectDate(date);
            setOpen(false);
          }}
          modifiers={{
            disabled: disabledDates,
          }}
          modifiersClassNames={{
            disabled:
              "[&>button]:line-through opacity-50 hover:cursor-not-allowed",
          }}
          defaultMonth={selected}
          showOutsideDays={false}
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
}
