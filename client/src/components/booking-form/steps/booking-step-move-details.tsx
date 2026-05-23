import { format, startOfToday } from "date-fns"
import { useMemo, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

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
import { useCalendarRates } from "@/hooks/api/use-calendar-rates"
import { useRates } from "@/hooks/api/use-rates"
import { useServices } from "@/hooks/api/use-services"
import { formatDate, parseDateOnly } from "@/lib/format-date"
import {
  serviceCodesForDeliveryDate,
  serviceCodesForDestinationZip,
  serviceCodesForOriginZip,
  type AddressSchema,
  type FormSchema,
} from "../booking-form-schema"
import { FormCard } from "../form-card"
import { toast } from "sonner"
import { api } from "@/lib/axios"

export type CityData = Pick<
  AddressSchema,
  "city" | "state" | "zip" | "location"
>

interface BookingStepMoveDetailsProps {
  goNext: () => void
}

type LookupCityResponse = {
  data: CityData
  error: string
}

export function BookingStepMoveDetails({
  goNext,
}: BookingStepMoveDetailsProps) {
  const { data: calendarRates } = useCalendarRates()
  const { data: rates } = useRates()
  const { data: services } = useServices({
    select: (rows) =>
      rows.filter((s) => s.active).sort((a, b) => a.position - b.position),
  })
  const calendarLoading = !calendarRates

  const { control, setValue, setError, trigger } = useFormContext<FormSchema>()
  const [movingDateOpen, setMovingDateOpen] = useState(false)
  const [deliveryDateOpen, setDeliveryDateOpen] = useState(false)

  const moveDate = useWatch({
    control: control,
    name: "moving_date",
  })

  const movingServiceCode = useWatch({
    control: control,
    name: "service_code",
  })
  const showOriginZip = serviceCodesForOriginZip.includes(movingServiceCode!)
  const showDestinationZip = serviceCodesForDestinationZip.includes(
    movingServiceCode!
  )
  const showDeliveryDate = serviceCodesForDeliveryDate.includes(
    movingServiceCode!
  )

  const disabledDates = useMemo(() => {
    const blocked = Object.values(calendarRates ?? {})
      .map((rate) =>
        rate.is_blocked ? (parseDateOnly(rate.formatted_date) ?? null) : null
      )
      .filter((date): date is Date => date !== null)

    return [{ before: startOfToday() }, ...blocked]
  }, [calendarRates])

  const deliveryDateDisabled = useMemo(() => {
    const blocked = Object.values(calendarRates ?? {})
      .map((rate) =>
        rate.is_blocked ? (parseDateOnly(rate.formatted_date) ?? null) : null
      )
      .filter((date): date is Date => date !== null)

    if (!moveDate) return blocked

    return [{ before: parseDateOnly(moveDate) as Date }, ...blocked]
  }, [calendarRates, moveDate])

  async function handleLookupCity(zip: string, type: "origin" | "destination") {
    if (zip.length !== 5) return null

    const zipField = type === "origin" ? "origin.zip" : "destination.zip"
    const cityField = type === "origin" ? "origin.city" : "destination.city"
    const stateField = type === "origin" ? "origin.state" : "destination.state"
    const locationField =
      type === "origin" ? "origin.location" : "destination.location"

    try {
      const res = await api.post<LookupCityResponse>("/lookup_city", {
        zip,
      })

      const { data, error } = res.data

      if (error) {
        setError(zipField, {
          message: error,
        })
        toast.error(error)
      }

      if (data) {
        toast(
          <div>
            <span className="mr-2 font-bold">
              {type === "origin" ? "Origin" : "Destination"}
            </span>
            {data.city}, {data.state} {data.zip}
          </div>
        )

        setValue(cityField, data.city)
        setValue(stateField, data.state)
        setValue(locationField, data.location)
      }
    } catch (error) {
      setError(zipField, {
        message: "Lookup failed",
      })
      toast.error("Lookup failed")
    }
  }

  return (
    <FormCard title="Get your Instant Quote" handleNext={goNext}>
      <FieldGroup>
        <Controller
          name="moving_date"
          control={control}
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
                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto overflow-hidden"
                >
                  <CalendarWithRates
                    rates={rates}
                    calendarRates={calendarRates}
                    selected={parseDateOnly(field.value) ?? undefined}
                    isLoading={calendarLoading}
                    onDayClick={(date) => {
                      field.onChange(formatDate(date, "yyyy-MM-dd"))
                      if (!calendarLoading) {
                        setMovingDateOpen(false)
                      }
                    }}
                    modifiers={{
                      disabled: disabledDates,
                    }}
                    startMonth={startOfToday()}
                    defaultMonth={parseDateOnly(field.value) ?? undefined}
                    showFooter
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {showOriginZip && (
          <Controller
            name="origin.zip"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>From ZIP</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    placeholder="12345"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    onChange={async (e) => {
                      field.onChange(e)
                      const newZip = e.target.value
                      const isValid = await trigger("origin.zip")
                      if (isValid) {
                        await handleLookupCity(newZip, "origin")
                      }
                    }}
                  />
                  <InputGroupAddon align="inline-start">
                    <MapPinIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        {showDestinationZip && (
          <Controller
            name="destination.zip"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>To ZIP</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    placeholder="12345"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    onChange={async (e) => {
                      field.onChange(e)
                      const newZip = e.target.value
                      const isValid = await trigger("destination.zip")
                      if (isValid) {
                        await handleLookupCity(newZip, "destination")
                      }
                    }}
                  />
                  <InputGroupAddon align="inline-start">
                    <MapPinIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        {showDeliveryDate && (
          <Controller
            name="delivery_date"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Delivery date</FieldLabel>
                <Popover
                  open={deliveryDateOpen}
                  onOpenChange={setDeliveryDateOpen}
                >
                  <PopoverTrigger id={field.name} asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start"
                      aria-invalid={fieldState.invalid}
                      disabled={!moveDate}
                    >
                      <CalendarDaysIcon className="mr-2 size-4 opacity-70" />
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto overflow-hidden"
                  >
                    <CalendarWithRates
                      rates={rates}
                      calendarRates={calendarRates}
                      selected={parseDateOnly(field.value) ?? undefined}
                      isLoading={calendarLoading}
                      onDayClick={(date) => {
                        field.onChange(formatDate(date, "yyyy-MM-dd"))
                        if (!calendarLoading) {
                          setDeliveryDateOpen(false)
                        }
                      }}
                      modifiers={{
                        disabled: deliveryDateDisabled,
                      }}
                      startMonth={parseDateOnly(moveDate) ?? undefined}
                      defaultMonth={parseDateOnly(moveDate) ?? undefined}
                      showFooter
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        <Controller
          name="service_id"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Service type</FieldLabel>
              <Select
                value={field.value > 0 ? String(field.value) : ""}
                onValueChange={(v) => {
                  field.onChange(Number(v))
                  setValue(
                    "service_code",
                    services?.find((s) => s.id === Number(v))?.code
                  )
                }}
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
    </FormCard>
  )
}
