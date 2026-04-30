import { TIME_OPTIONS_WITH_MERIDIEM } from "@/domains/requests/request.constants";

import { DatePickerRange } from "@/components/inputs/date-picker-range";
import { SelectWithSearch } from "@/components/inputs/select-with-search";
import { Label } from "@/components/ui/label";
import { useRequest } from "@/hooks/use-request";
import { formatDate, parseDateOnly } from "@/lib/format-date";

export function TransitDateTime() {
  const { draft, setField } = useRequest();
  if (!draft) return null;

  return (
    <div className="bg-muted flex flex-wrap justify-start gap-4 p-4">
      <div className="text-muted-foreground w-full md:w-auto">
        <p className="text-xl font-semibold uppercase">In Transit:</p>
        <p className="text-sm">Visible only in schedule</p>
      </div>
      {/* Move Date */}
      <div className="w-full space-y-2 md:w-auto">
        <Label htmlFor="schedule-date-window">Trucks delivery dates</Label>
        <DatePickerRange
          dateRange={{
            from: draft?.schedule_date_window_start
              ? parseDateOnly(draft?.schedule_date_window_start)
              : undefined,
            to: draft?.schedule_date_window_end
              ? parseDateOnly(draft?.schedule_date_window_end)
              : undefined,
          }}
          onChange={(dateRange) => {
            setField(
              "schedule_date_window_start",
              formatDate(dateRange?.from, "yyyy-MM-dd") ?? null,
            );
            setField(
              "schedule_date_window_end",
              formatDate(dateRange?.to, "yyyy-MM-dd") ?? null,
            );
          }}
          id="schedule-date-window"
        />
      </div>

      {/* Delivery truck start */}
      <div className="space-y-2">
        <Label htmlFor="start_time_window_schedule">Delivery truck start</Label>
        <SelectWithSearch
          options={TIME_OPTIONS_WITH_MERIDIEM}
          value={draft?.start_time_window_schedule}
          handleSelect={(val: number) =>
            setField("start_time_window_schedule", val)
          }
          id="start_time_window_schedule"
        />
      </div>

      {/* Delivery truck end */}
      <div className="space-y-2">
        <Label htmlFor="end_time_window_schedule">Delivery truck end</Label>
        <SelectWithSearch
          options={TIME_OPTIONS_WITH_MERIDIEM}
          value={draft?.end_time_window_schedule}
          handleSelect={(val: number) =>
            setField("end_time_window_schedule", val)
          }
          id="end_time_window_schedule"
        />
      </div>
    </div>
  );
}
