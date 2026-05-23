import { Controller, useFormContext } from "react-hook-form"

import { MailIcon, PhoneIcon, UserIcon } from "@/components/icons"
import { PhoneInput } from "@/components/inputs/phone-input"
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
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  autoComplete="given-name"
                  placeholder="First name"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="inline-start">
                  <UserIcon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
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
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  autoComplete="family-name"
                  placeholder="Last name"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="inline-start">
                  <UserIcon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
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
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="Your email address"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="inline-start">
                  <MailIcon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
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
              <InputGroup>
                <PhoneInput
                  {...field}
                  id={field.name}
                  value={formatPhone(field.value ?? "")}
                  handleValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="(000) 000-0000"
                  data-slot="input-group-control"
                  className="flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent"
                />
                <InputGroupAddon align="inline-start">
                  <PhoneIcon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </FormCard>
  )
}
