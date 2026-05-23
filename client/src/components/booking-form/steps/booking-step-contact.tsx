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
import type { FormSchema } from "../booking-form-schema"
import { FormCard } from "../form-card"

interface BookingStepContactProps {
  goNext: () => void
  goBack: () => void
  isSubmitting?: boolean
}

export function BookingStepContact({
  goNext,
  goBack,
  isSubmitting = false,
}: BookingStepContactProps) {
  const { control } = useFormContext<FormSchema>()

  return (
    <FormCard
      title="Contact information"
      handleNext={goNext}
      handleBack={goBack}
      nextLabel="Submit request"
      isSubmitting={isSubmitting}
    >
      <FieldGroup>
        <Controller
          name="first_name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>First name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="given-name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="last_name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="family-name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email_address"
          control={control}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={control}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </FormCard>
  )
}
