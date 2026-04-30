import { TIME_OPTIONS_WITH_MERIDIEM } from "@/domains/requests/request.constants";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerRange } from "@/components/inputs/date-picker-range";
import { SelectWithSearch } from "@/components/inputs/select-with-search";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useRequest } from "@/hooks/use-request";
import { formatDate, parseDateOnly } from "@/lib/format-date";
// import { useRequestStore } from '@/stores/use-draft-store';
// import { useRequestDraft } from '@/stores/use-draft-draft';

export function DeliveryDateTime() {
  // const draft = useRequestStore((state) => state.draft);
  // const updateField = useRequestStore((state) => state.updateField);

  const { draft, setField } = useRequest();

  if (!draft) return null;

  return (
    <div className="bg-background flex flex-wrap justify-start gap-4 p-4">
      {/* Move Date */}
      <div className="space-y-2">
        <Label htmlFor="delivery-date-window">Delivery window</Label>
        <DatePickerRange
          dateRange={{
            from: draft.delivery_date_window_start
              ? parseDateOnly(draft.delivery_date_window_start)
              : undefined,
            to: draft.delivery_date_window_end
              ? parseDateOnly(draft.delivery_date_window_end)
              : undefined,
          }}
          onChange={(dateRange) => {
            setField(
              "delivery_date_window_start",
              formatDate(dateRange?.from, "yyyy-MM-dd") ?? null,
            );
            setField(
              "delivery_date_window_end",
              formatDate(dateRange?.to, "yyyy-MM-dd") ?? null,
            );
          }}
          id="delivery-date-window"
        />
      </div>

      {/* Start time window */}
      <div className="space-y-2">
        <Label htmlFor="delivery-time-window">Delivery time window</Label>
        {/* <StartTimeRangeSelect /> */}
        <div className="flex h-9">
          <SelectWithSearch
            options={TIME_OPTIONS_WITH_MERIDIEM}
            value={draft.start_time_window_delivery}
            handleSelect={(val: number) =>
              setField("start_time_window_delivery", val)
            }
            className="min-w-28 rounded-r-none border-r-0"
            id="delivery-time-window"
          />
          <Separator orientation="vertical" className="h-full" />
          <SelectWithSearch
            options={TIME_OPTIONS_WITH_MERIDIEM}
            value={draft.end_time_window_delivery}
            handleSelect={(val: number) =>
              setField("end_time_window_delivery", val)
            }
            className="min-w-28 rounded-l-none border-l-0"
          />
        </div>
      </div>

      {/* Crew size */}
      <div className="space-y-2">
        <Label htmlFor="crew-size-delivery">Crew size</Label>
        <Input
          id="crew-size-delivery"
          pattern="[0-9]+"
          inputMode="numeric"
          value={draft.crew_size_delivery || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setField("crew_size_delivery", parseInt(value));
            }
          }}
          className="w-16"
        />
      </div>

      {/* Is delivery now */}
      <div className="space-y-2">
        <Label htmlFor="is_delivery_now">Is delivery now</Label>
        <div className="flex h-9 items-center justify-center">
          <Switch
            id="is_delivery_now"
            checked={draft.is_delivery_now}
            onCheckedChange={(checked) => setField("is_delivery_now", checked)}
          />
        </div>
      </div>
    </div>
  );
}
