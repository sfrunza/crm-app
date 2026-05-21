import { format, startOfToday } from "date-fns"
import { useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"

import { CalendarWithRates } from "@/components/calendar-with-rates"
import { CalendarDaysIcon, MapPinIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
    <FieldGroup>
      <Controller
        name="moving_date"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Moving date</FieldLabel>
            <Popover open={movingDateOpen} onOpenChange={setMovingDateOpen}>
              <PopoverTrigger id={field.name} asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start"
                  aria-invalid={fieldState.invalid}
                >
                  <CalendarDaysIcon className="mr-2 size-4 opacity-70" />
                  {field.value
                    ? format(parseDateOnly(field.value) ?? new Date(), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto overflow-hidden">
                <CalendarWithRates
                  rates={rates}
                  calendarRates={calendarRates}
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
                      "[&>button]:grayscale opacity-70 hover:cursor-not-allowed",
                  }}
                  className="p-0 [--cell-size:--spacing(9)]"
                  startMonth={startOfToday()}
                  defaultMonth={parseDateOnly(field.value) ?? startOfToday()}
                  showOutsideDays={false}
                  showFooter
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
            <FieldLabel htmlFor={field.name}>From ZIP</FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                id={field.name}
                inputMode="numeric"
                autoComplete="postal-code"
                aria-invalid={fieldState.invalid}
                placeholder="10002"
              />
              <InputGroupAddon align="inline-start">
                <MapPinIcon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="destination_zip"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>To ZIP</FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                id={field.name}
                inputMode="numeric"
                autoComplete="postal-code"
                aria-invalid={fieldState.invalid}
                placeholder="10002"
              />
              <InputGroupAddon align="inline-start">
                <MapPinIcon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="service_id"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Service type</FieldLabel>
            <Select
              value={field.value > 0 ? String(field.value) : ""}
              onValueChange={(v) => field.onChange(Number(v))}
              disabled={!services?.length}
            >
              <SelectTrigger
                id={field.name}
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
