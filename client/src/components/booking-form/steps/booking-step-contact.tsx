import { Controller, useFormContext } from "react-hook-form"

import { PhoneInput } from "@/components/inputs/phone-input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatPhone } from "@/lib/format-phone"
import type { BookingFormValues } from "../booking-form-schema"

export function BookingStepContact() {
  const form = useFormContext<BookingFormValues>()

  return (
    <FieldGroup className="gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          name="first_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>First name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="given-name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="last_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="family-name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </div>

      <Controller
        name="email_address"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              autoComplete="email"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
            <PhoneInput
              {...field}
              id={field.name}
              value={formatPhone(field.value ?? "")}
              handleValueChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    </FieldGroup>
  )
}
