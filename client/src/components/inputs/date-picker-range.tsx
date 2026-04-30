import { useState } from "react";
import { type DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { ChevronDownIcon, XIcon } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

interface DatePickerRangeProps {
  dateRange: DateRange | undefined;
  id?: string;
  onChange: (dateRange: DateRange | undefined) => void;
}

export function DatePickerRange({
  dateRange,
  id,
  onChange,
}: DatePickerRangeProps) {
  const [open, setOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(dateRange);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex h-9">
          <div className="relative">
            <Button
              variant="outline"
              id={id}
              className="justify-between rounded-r-none border-r-0 pr-5 font-normal"
            >
              {selectedDateRange?.from
                ? formatDate(selectedDateRange.from)
                : "Select date"}
              {<ChevronDownIcon />}
            </Button>
            {selectedDateRange?.from && (
              <XIcon
                className="hover:text-muted-foreground absolute top-1/2 right-1 size-4 -translate-y-1/2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDateRange({
                    from: undefined,
                    to: selectedDateRange?.to,
                  });
                  onChange({
                    from: undefined,
                    to: selectedDateRange?.to,
                  });
                }}
              />
            )}
          </div>
          <Separator orientation="vertical" className="h-full" />
          <div className="relative">
            <Button
              variant="outline"
              id={id}
              className="justify-between rounded-l-none border-l-0 pr-5 font-normal"
            >
              {selectedDateRange?.to
                ? formatDate(selectedDateRange.to)
                : "Select date"}
              <ChevronDownIcon />
            </Button>
            {selectedDateRange?.to && (
              <XIcon
                className="hover:text-muted-foreground absolute top-1/2 right-1 size-4 -translate-y-1/2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDateRange({
                    from: selectedDateRange?.from,
                    to: undefined,
                  });
                  onChange({
                    from: selectedDateRange?.from,
                    to: undefined,
                  });
                }}
              />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={selectedDateRange?.from}
          selected={selectedDateRange}
          onSelect={(date) => {
            setSelectedDateRange(date);
            onChange(date);
          }}
          numberOfMonths={1}
          showOutsideDays={false}
        />
      </PopoverContent>
    </Popover>
  );
}
