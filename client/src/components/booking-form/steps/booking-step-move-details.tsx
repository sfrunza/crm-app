import { format, startOfToday } from "date-fns"
import { CalendarDaysIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"

import { CalendarWithRates } from "@/components/calendar-with-rates"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useCalendarRates } from "@/hooks/api/use-calendar-rates"
import { useRates } from "@/hooks/api/use-rates"
import { useServices } from "@/hooks/api/use-services"
import { parseDateOnly } from "@/lib/format-date"
import { cn } from "@/lib/utils"
import type { BookingFormValues } from "../booking-form-schema"

export function BookingStepMoveDetails() {
  const form = useFormContext<BookingFormValues>()
  const [movingDateOpen, setMovingDateOpen] = useState(false)
  const { data: calendarRates } = useCalendarRates()
  const { data: rates } = useRates()
  const calendarLoading = !calendarRates

  const disabledDates = useMemo(() => {
    const blocked = Object.values(calendarRates ?? {})
      .map((rate) =>
        rate.is_blocked ? (parseDateOnly(rate.formatted_date) ?? null) : null
      )
      .filter((date): date is Date => date !== null)

    return [{ before: startOfToday() }, ...blocked]
  }, [calendarRates])

  const { data: services } = useServices({
    select: (rows) =>
      rows.filter((s) => s.active).sort((a, b) => a.position - b.position),
  })

  return (
    <FieldGroup className="gap-6">
      <Controller
        name="moving_date"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Moving date</FieldLabel>
            <Popover open={movingDateOpen} onOpenChange={setMovingDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-9 w-full justify-start px-2.5 font-normal md:text-sm",
                    !field.value && "text-muted-foreground"
                  )}
                  aria-invalid={fieldState.invalid}
                >
                  <CalendarDaysIcon className="mr-2 size-4 opacity-70" />
                  {field.value
                    ? format(parseDateOnly(field.value) ?? new Date(), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="relative w-auto p-0" align="start">
                <CalendarWithRates
                  rates={rates}
                  calendarRates={calendarRates}
                  showFooter
                  selected={parseDateOnly(field.value)}
                  isLoading={calendarLoading}
                  onDayClick={(date) => {
                    field.onChange(format(date, "yyyy-MM-dd"))
                    if (!calendarLoading) {
                      setMovingDateOpen(false)
                    }
                  }}
                  modifiers={{
                    disabled: disabledDates,
                  }}
                  modifiersClassNames={{
                    disabled:
                      "[&>button]:line-through opacity-50 hover:cursor-not-allowed",
                  }}
                  defaultMonth={parseDateOnly(field.value)}
                  showOutsideDays={false}
                />
                {calendarLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80">
                    <Spinner />
                  </div>
                ) : null}
              </PopoverContent>
            </Popover>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="origin_zip"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Origin ZIP code</FieldLabel>
            <Input
              {...field}
              id={field.name}
              inputMode="numeric"
              autoComplete="postal-code"
              aria-invalid={fieldState.invalid}
              placeholder="10001"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="destination_zip"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Destination ZIP code</FieldLabel>
            <Input
              {...field}
              id={field.name}
              inputMode="numeric"
              autoComplete="postal-code"
              aria-invalid={fieldState.invalid}
              placeholder="10002"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="service_id"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Service type</FieldLabel>
            <Select
              value={field.value > 0 ? String(field.value) : ""}
              onValueChange={(v) => field.onChange(Number(v))}
              disabled={!services?.length}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {services?.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  )
}
