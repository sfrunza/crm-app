import { CalendarWithRates } from "@/components/calendar-with-rates";
import { PencilLineIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import type { CalendarRateMap, Rate } from "@/types/index";
import { parseDateOnly } from "@/lib/format-date";
import { useMemo, useState } from "react";

interface EditDateProps {
  rates: Rate[] | undefined;
  calendarRates: CalendarRateMap | undefined;
  id?: string;
  selected: Date | undefined;
  onSelectDate: (date: Date) => void;
  isLoading: boolean;
}

export function EditDate({
  rates,
  calendarRates,
  id,
  selected,
  onSelectDate,
  isLoading,
  ...props
}: EditDateProps) {
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
        <Button id={id} variant="outline" size="sm">
          <PencilLineIcon />
          Edit date
        </Button>
      </PopoverTrigger>
      <PopoverContent className="relative w-auto p-0" align="start">
        <CalendarWithRates
          rates={rates}
          calendarRates={calendarRates}
          showFooter={true}
          selected={selected}
          isLoading={!calendarRates}
          onDayClick={(date) => {
            onSelectDate(date);
            if (!isLoading) {
              setOpen(false);
            }
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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
