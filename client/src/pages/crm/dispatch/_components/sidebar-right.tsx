import { Calendar } from "@/components/ui/calendar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { useGetDispatchActiveDates } from "@/domains/dispatch/dispatch.queries";
import { parseDateOnly } from "@/lib/format-date";
import { PointerIcon } from "@/components/icons";
import { useMemo } from "react";
import { CrewAssignmentForm } from "./crew-assignment-form";

interface SidebarRightProps {
  selectedDate: string | null;
  setSelectedDate: (date: Date) => void;
  selectedMonth: string | null;
  setSelectedMonth: (month: Date) => void;
  selectedRequestId: number | null;
}

export function SidebarRight({
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
  selectedRequestId,
}: SidebarRightProps) {
  const { data: activeDates } = useGetDispatchActiveDates(selectedMonth!, {
    enabled: !!selectedMonth,
  });

  const highlightDates = useMemo(
    () =>
      activeDates?.map((date) => {
        const dateArray = date.split("-").map(Number);
        return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
      }) ?? [],
    [activeDates],
  );

  const modifiers = useMemo(
    () => ({
      highlight: highlightDates,
    }),
    [highlightDates],
  );

  const modifiersClassNames = useMemo(
    () => ({
      highlight: "[&>button]:bg-primary [&>button]:text-primary-foreground",
    }),
    [],
  );

  return (
    <div className="p-4 pb-10">
      <div className="flex items-center justify-center">
        <Calendar
          mode="single"
          selected={selectedDate ? parseDateOnly(selectedDate) : undefined}
          month={
            selectedMonth ? parseDateOnly(`${selectedMonth}-01`) : undefined
          }
          onMonthChange={setSelectedMonth}
          onSelect={setSelectedDate}
          captionLayout="dropdown"
          required
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="rounded-lg shadow [--cell-size:--spacing(9)]"
        />
      </div>

      {!selectedRequestId && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PointerIcon />
            </EmptyMedia>
            <EmptyDescription>Select a job to assign a crew</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {selectedRequestId && selectedDate && (
        <CrewAssignmentForm
          key={selectedRequestId}
          requestId={selectedRequestId}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
