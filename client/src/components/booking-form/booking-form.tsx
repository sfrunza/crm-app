import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ChevronLeftIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { FormProvider, useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { extractError } from "@/lib/axios"
import { buildCrmLoginUrl } from "@/lib/crm-app-url"

import {
  BOOKING_FORM_STEP_FIELDS,
  createBookingFormSchema,
  createBookingFormStepSchema,
  type BookingFormStepIndex,
  type BookingFormValues,
} from "./booking-form-schema"
import {
  submitBookingRequest,
  type BookingSubmitResult,
} from "./booking-form-submit"
import { BookingFormSuccess } from "./booking-form-success"
import { BookingStepContact } from "./steps/booking-step-contact"
import { BookingStepMoveDetails } from "./steps/booking-step-move-details"
import { BookingStepMoveSize } from "./steps/booking-step-move-size"

function buildDefaults(): BookingFormValues {
  return {
    moving_date: "",
    origin_zip: "",
    destination_zip: "",
    service_id: 1,
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
  const [submission, setSubmission] = useState<BookingSubmitResult | null>(null)

  const schema = useMemo(() => createBookingFormSchema(), [])

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const { mutateAsync: submitBooking, isPending } = useMutation({
    mutationFn: (values: BookingFormValues) => submitBookingRequest(values),
    onSuccess: (result) => {
      setSubmission(result)
    },
    onError: (error: unknown) => {
      toast.error(extractError(error))
    },
  })

  function goNext() {
    const fields = BOOKING_FORM_STEP_FIELDS[step]
    const stepSchema = createBookingFormStepSchema(step)
    const result = stepSchema.safeParse(form.getValues())

    if (!result.success) {
      form.clearErrors(fields as unknown as FieldPath<BookingFormValues>[])
      for (const issue of result.error.issues) {
        const name = issue.path[0]
        if (typeof name === "string") {
          form.setError(name as FieldPath<BookingFormValues>, {
            message: issue.message,
          })
        }
      }
      return
    }

    const nextStep = (step + 1) as BookingFormStepIndex
    form.clearErrors(
      BOOKING_FORM_STEP_FIELDS[
        nextStep
      ] as unknown as FieldPath<BookingFormValues>[]
    )
    setStep(nextStep)
  }

  function goBack() {
    setStep((s) => (s > 0 ? ((s - 1) as BookingFormStepIndex) : s))
  }

  if (submission) {
    if (!submission.magicLoginToken) {
      return (
        <Card className="mx-auto w-full max-w-lg rounded-3xl p-6 text-center shadow-md">
          <p className="text-sm text-muted-foreground">
            Your request was submitted (reference #{submission.request.id}), but
            we couldn&apos;t start your account session. Please sign in with
            your email to view it.
          </p>
          <Button asChild className="mt-4">
            <a href={buildCrmLoginUrl()}>Sign in</a>
          </Button>
        </Card>
      )
    }

    return (
      <BookingFormSuccess
        requestId={submission.request.id}
        magicLoginToken={submission.magicLoginToken}
      />
    )
  }

  return (
    <Card className="mx-auto w-full max-w-sm rounded-3xl shadow-md">
      <CardHeader>
        <CardTitle>Get instant online quote</CardTitle>
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

          <CardFooter className="flex justify-between gap-4">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={step === 0 || isPending}
                onClick={goBack}
                className="flex-1"
                size="lg"
              >
                <ChevronLeftIcon />
                Back
              </Button>
            )}

            {step < 2 ? (
              <Button
                type="button"
                size="lg"
                className="flex-1"
                onClick={goNext}
                disabled={isPending}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isPending}
              >
                <LoadingSwap isLoading={isPending}>Submit booking</LoadingSwap>
              </Button>
            )}
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  )
}
