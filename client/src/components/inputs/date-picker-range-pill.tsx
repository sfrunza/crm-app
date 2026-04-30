import { PlusIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/format-date";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";

function rangeSignature(range: DateRange | undefined): string {
  if (!range?.from) return "";
  const a = format(range.from, "yyyy-MM-dd");
  const b = range.to ? format(range.to, "yyyy-MM-dd") : "";
  return `${a}|${b}`;
}

export interface DatePickerRangePillProps {
  /** Applied range (e.g. from URL). Shown on the pill when the popover is closed. */
  value: DateRange | undefined;
  /** Called when the user applies from the popover or clears from the pill. */
  onApply: (range: DateRange | undefined) => void;
  /** Label before the range (reference UI uses “Date and time”). */
  label?: string;
  id?: string;
}

export function DatePickerRangePill({
  value,
  onApply,
  label = "Date range",
  id,
}: DatePickerRangePillProps) {
  const [open, setOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(
    undefined
  );

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPendingRange(value);
    }
    setOpen(next);
  };

  const rangeLabel = useMemo(() => {
    if (!value?.from) return "Select range";
    const fromLabel = formatDate(value.from, "MMM d, yyyy");
    if (!value.to) return `${fromLabel} – …`;
    return `${fromLabel} - ${formatDate(value.to, "MMM d, yyyy")}`;
  }, [value]);

  const hasRange = Boolean(value?.from);

  const canApply = useMemo(
    () => rangeSignature(pendingRange) !== rangeSignature(value),
    [pendingRange, value]
  );

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onApply(undefined);
    handleOpenChange(false);
  };

  const handleApply = () => {
    onApply(pendingRange);
    handleOpenChange(false);
  };

  return (
    <div>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            id={id}
            className="rounded-full"
          >
            {hasRange && (
              <Button
                type="button"
                aria-label="Clear date range"
                size="icon-xs"
                className="rounded-full"
                onClick={clear}
                variant="ghost"
              >
                <XIcon />
              </Button>
            )}
            {!hasRange && (
              <Button
                aria-label="Add date range"
                size="icon-xs"
                className="rounded-full"
                variant="ghost"
              >
                <PlusIcon />
              </Button>
            )}
            {label}
            {hasRange && (
              <span className="min-w-0 flex-1 truncate font-medium text-primary">
                {rangeLabel}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <Calendar
              mode="range"
              defaultMonth={pendingRange?.from ?? value?.from}
              selected={pendingRange}
              onSelect={setPendingRange}
              numberOfMonths={1}
              showOutsideDays={false}
            />
            <div className="border-t border-border bg-muted/20 p-2">
              <Button
                type="button"
                className="w-full"
                size="sm"
                onClick={handleApply}
                disabled={!canApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
