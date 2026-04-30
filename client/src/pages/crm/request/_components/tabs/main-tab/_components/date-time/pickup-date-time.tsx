import { DatePickerWithRates } from "@/components/inputs/date-picker-with-rates"
import { SelectWithSearch } from "@/components/inputs/select-with-search"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { getRequestUIBehavior } from "@/domains/requests/request.behavior"
import { TIME_OPTIONS } from "@/domains/requests/request.constants"
import { useRequest } from "@/hooks/use-request"
import { formatCentsToDollars } from "@/lib/helpers"
// import { useRequestStore } from "@/stores/use-request-store";
import { formatDate, parseDateOnly } from "@/lib/format-date"
import { StartTimeRangeSelect } from "../start-time-range-select"
import { useParklot } from "@/hooks/use-parklot"
import { useCalendarRates } from "@/hooks/api/use-calendar-rates"
import { useRates } from "@/hooks/api/use-rates"

export function PickupDateTime() {
  const { data: calendarRates } = useCalendarRates()
  const { data: rates } = useRates()

  const { draft, setField } = useRequest()
  const { setSelectedDate } = useParklot()

  const { showIfFlatRate } = getRequestUIBehavior(draft)

  if (!draft) return null

  return (
    <div className="flex flex-wrap justify-start gap-4 bg-background p-4">
      {/* Move Date */}
      <div className="space-y-2">
        <Label htmlFor="moving-date">Move Date</Label>
        <DatePickerWithRates
          id="moving-date"
          rates={rates}
          calendarRates={calendarRates}
          selected={parseDateOnly(draft.moving_date)}
          onSelectDate={(date) => {
            if (!date) return

            const ymd = formatDate(date, "yyyy-MM-dd") // normalize for lookup
            // update moving_date field
            setField("moving_date", ymd)
            setSelectedDate(ymd)

            if (!calendarRates || !rates) return

            if (draft?.is_calculator_enabled) return

            // find matching rate_id
            const dayInfo = calendarRates[ymd]
            const rateId = dayInfo?.rate_id ?? 1
            const rate = rates.find((rate) => rate.id === rateId)
            console.log("rate", rate)
            if (rate) {
              setField("rate", rate.movers_rates[draft.crew_size].hourly_rate) // or rate.id, depending on schema
            }
          }}
        />
      </div>

      {/* Start time window */}
      <div className="space-y-2">
        <Label htmlFor="start-time-window">Start time window</Label>
        <StartTimeRangeSelect
          startTimeWindow={draft.start_time_window}
          endTimeWindow={draft.end_time_window}
          handleSelect={(filed, value) => {
            setField(filed, value)
          }}
        />
      </div>

      {/* Work time window */}
      <div className="space-y-2">
        <Label htmlFor="work-time">Work time</Label>
        <div className="flex h-9">
          <SelectWithSearch
            options={TIME_OPTIONS}
            value={draft.work_time.min}
            handleSelect={(val) => {
              setField("work_time", {
                ...draft.work_time,
                min: val,
              })
            }}
            id="work-time"
            className="rounded-r-none border-r-0"
          />
          <Separator orientation="vertical" />
          <SelectWithSearch
            options={TIME_OPTIONS}
            value={draft.work_time.max}
            handleSelect={(val) => {
              setField("work_time", {
                ...draft.work_time,
                max: val,
              })
            }}
            className="rounded-l-none border-l-0"
          />
        </div>
      </div>

      {/* Travel time */}
      {!showIfFlatRate && (
        <div className="space-y-2">
          <Label htmlFor="travel-time">Travel time</Label>
          <SelectWithSearch
            options={TIME_OPTIONS}
            value={draft.travel_time}
            handleSelect={(val) => setField("travel_time", val)}
            id="travel-time"
          />
        </div>
      )}

      {/* Crew size */}
      <div className="space-y-2">
        <Label htmlFor="crew-size">Crew size</Label>
        <Input
          id="crew-size"
          pattern="[0-9]+"
          inputMode="numeric"
          value={draft.crew_size || ""}
          onChange={(e) => {
            const value = e.target.value
            if (/^\d*$/.test(value)) {
              setField("crew_size", parseInt(value))
            }
          }}
          className="w-16"
        />
      </div>

      {/* Rate */}
      <div className="space-y-2">
        <Label htmlFor="rate">{`${showIfFlatRate ? "Flat " : ""}Rate`}</Label>
        <Input
          id="rate"
          pattern="[0-9]+"
          inputMode="numeric"
          value={formatCentsToDollars(draft.rate!) || ""}
          onChange={(e) => {
            const value = e.target.value
            if (/^\d*$/.test(value)) {
              setField("rate", Math.round(parseFloat(value) * 100))
            }
          }}
          className="w-24"
        />
      </div>

      {/* Min. hours */}
      <div className="space-y-2">
        <Label htmlFor="min-total-time">Min. hours</Label>
        <SelectWithSearch
          options={TIME_OPTIONS}
          value={draft.min_total_time}
          handleSelect={(val: number) => setField("min_total_time", val)}
          id="min-total-time"
        />
      </div>

      {/* Is one day delivery */}
      {showIfFlatRate && (
        <div className="space-y-2">
          <Label htmlFor="is_same_day_delivery">Is one day delivery</Label>
          <div className="flex h-9 items-center justify-center">
            <Switch
              id="is_same_day_delivery"
              checked={draft.is_same_day_delivery}
              onCheckedChange={(checked) =>
                setField("is_same_day_delivery", checked)
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
