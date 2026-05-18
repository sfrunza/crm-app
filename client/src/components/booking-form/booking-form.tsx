import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { FormProvider, useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { extractError } from "@/lib/axios"

import {
  BOOKING_FORM_STEP_FIELDS,
  createBookingFormSchema,
  type BookingFormStepIndex,
  type BookingFormValues,
} from "./booking-form-schema"
import { submitBookingRequest } from "./booking-form-submit"
import { BookingStepContact } from "./steps/booking-step-contact"
import { BookingStepMoveDetails } from "./steps/booking-step-move-details"
import { BookingStepMoveSize } from "./steps/booking-step-move-size"

const STEP_LABELS = ["Move basics", "Move size & access", "Contact"]

function buildDefaults(): BookingFormValues {
  return {
    moving_date: "",
    origin_zip: "",
    destination_zip: "",
    service_id: 0,
    packing_type_id: 0,
    move_size_id: 0,
    origin_floor_id: 0,
    destination_floor_id: 0,
    first_name: "",
    last_name: "",
    email_address: "",
    phone: "",
  }
}

export function BookingForm() {
  const [step, setStep] = useState<BookingFormStepIndex>(0)

  const schema = useMemo(() => createBookingFormSchema(), [])

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(),
    mode: "onTouched",
  })

  const { mutateAsync: submitBooking, isPending } = useMutation({
    mutationFn: (values: BookingFormValues) => submitBookingRequest(values),
    onSuccess: async (created) => {
      toast.success(`Booking submitted — request #${created.id}`)
      form.reset(buildDefaults())
      setStep(0)
    },
    onError: (error: unknown) => {
      toast.error(extractError(error))
    },
  })

  async function goNext() {
    const fields = BOOKING_FORM_STEP_FIELDS[
      step
    ] as unknown as FieldPath<BookingFormValues>[]
    const ok = await form.trigger(fields)
    if (!ok) return
    setStep((s) => (s < 2 ? ((s + 1) as BookingFormStepIndex) : s))
  }

  function goBack() {
    setStep((s) => (s > 0 ? ((s - 1) as BookingFormStepIndex) : s))
  }

  return (
    <div className="mx-auto max-w-7xl py-10">
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>Book a move</CardTitle>
          <CardDescription>
            Step {step + 1} of 3 — {STEP_LABELS[step]}
          </CardDescription>
          <ol className="mt-4 flex gap-2 text-xs font-medium text-muted-foreground">
            {STEP_LABELS.map((label, index) => (
              <li
                key={label}
                className={
                  index === step
                    ? "rounded-md bg-primary/10 px-2 py-1 text-primary"
                    : "rounded-md px-2 py-1"
                }
              >
                {index + 1}. {label}
              </li>
            ))}
          </ol>
        </CardHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit((values) => submitBooking(values))}
            className="contents"
          >
            <CardContent className="space-y-6">
              {step === 0 ? <BookingStepMoveDetails /> : null}
              {step === 1 ? <BookingStepMoveSize /> : null}
              {step === 2 ? <BookingStepContact /> : null}
            </CardContent>

            <CardFooter className="flex flex-wrap justify-between gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0 || isPending}
                onClick={goBack}
              >
                <ChevronLeftIcon />
                Back
              </Button>

              {step < 2 ? (
                <Button type="button" onClick={goNext} disabled={isPending}>
                  Next
                  <ChevronRightIcon />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  <LoadingSwap isLoading={isPending}>
                    Submit booking
                  </LoadingSwap>
                </Button>
              )}
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  )
}
