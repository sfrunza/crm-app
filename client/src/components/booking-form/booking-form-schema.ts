import { isValidPhoneNumber } from "libphonenumber-js"
import { z } from "zod"

const usZip = z
  .string()
  .min(1, "ZIP code is required")
  .regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code")

export function createBookingFormSchema() {
  const positiveId = (label: string) =>
    z.number().int().positive(`${label} is required`)

  return z.object({
    moving_date: z.string().min(1, "Choose a moving date"),
    origin_zip: usZip,
    destination_zip: usZip,
    service_id: positiveId("Service type"),
    move_size_id: positiveId("Move size"),
    origin_floor_id: positiveId("Floors at origin"),
    destination_floor_id: positiveId("Floors at destination"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email_address: z.email("Enter a valid email address"),
    phone: z.string().refine((value) => isValidPhoneNumber(value, "US"), {
      message: "Enter a valid US phone number",
    }),
  })
}

export type BookingFormValues = z.infer<
  ReturnType<typeof createBookingFormSchema>
>

export const BOOKING_FORM_STEP_FIELDS = [
  [
    "moving_date",
    "origin_zip",
    "destination_zip",
    "service_id",
  ],
  ["move_size_id", "origin_floor_id", "destination_floor_id"],
  ["first_name", "last_name", "email_address", "phone"],
] as const satisfies readonly (readonly (keyof BookingFormValues)[])[]

export type BookingFormStepIndex = 0 | 1 | 2

export function createBookingFormStepSchema(step: BookingFormStepIndex) {
  const fields = BOOKING_FORM_STEP_FIELDS[step]
  return createBookingFormSchema().pick(
    Object.fromEntries(fields.map((key) => [key, true])) as {
      [K in (typeof fields)[number]]: true
    },
  )
}
