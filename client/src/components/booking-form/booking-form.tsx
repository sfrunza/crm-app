import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { extractError } from "@/lib/axios"
import { buildCrmLoginUrl } from "@/lib/crm-app-url"

import { formSchema, type FormSchema } from "./booking-form-schema"
import {
  submitBookingRequest,
  type BookingSubmitResult,
} from "./booking-form-submit"
import { BookingFormSuccess } from "./booking-form-success"
import { BookingStepContact } from "./steps/booking-step-contact"
import { BookingStepMoveDetails } from "./steps/booking-step-move-details"
import { BookingStepMoveSize } from "./steps/booking-step-move-size"
import type { Service } from "@/types"
import { useServices } from "@/hooks/api/use-services"
import { queryClient } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import { getMoveSizes } from "@/api/endpoints/move-sizes"
import { getEntranceTypes } from "@/api/endpoints/entrance-types"

function buildDefaults(services: Service[]): FormSchema {
  const defaultService = services.find(
    (service) => service.code === "local_move"
  )
  return {
    moving_date: null,
    origin: {
      street: "",
      zip: "",
      city: "",
      state: "",
      floor_id: null,
    },
    destination: {
      street: "",
      zip: "",
      city: "",
      state: "",
      floor_id: null,
    },
    delivery_date: null,
    service_id: defaultService?.id ?? 0,
    service_code: defaultService?.code,
    move_size_id: 0,
    first_name: "",
    last_name: "",
    email_address: "",
    phone: "",
  }
}

export const stepFields = {
  1: [
    "moving_date",
    "delivery_date",
    "service_id",
    "origin.zip",
    "destination.zip",
  ],
  2: ["move_size_id", "origin.floor_id", "destination.floor_id"],
  3: ["first_name", "last_name", "email_address", "phone"],
} as const satisfies Record<number, readonly FieldPath<FormSchema>[]>

export function BookingForm() {
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.moveSizes.all,
      queryFn: getMoveSizes,
    })
    queryClient.prefetchQuery({
      queryKey: queryKeys.entranceTypes.all,
      queryFn: getEntranceTypes,
    })
  }, [])

  const { data: services } = useServices({
    select: (rows) => rows.filter((s) => s.active),
  })
  const animationRef = useRef(null)

  const [direction, setDirection] = useState(1)
  const [step, setStep] = useState(1)
  const [submission, setSubmission] = useState<BookingSubmitResult | null>(null)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    values: buildDefaults(services ?? []),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const { mutateAsync: submitBooking, isPending } = useMutation({
    mutationFn: (values: FormSchema) => submitBookingRequest(values),
    onSuccess: (result) => {
      setSubmission(result)
    },
    onError: (error: unknown) => {
      toast.error(extractError(error))
    },
  })

  async function goNext() {
    const fieldsToValidate = stepFields[step as keyof typeof stepFields]
    const isValid = await form.trigger([...fieldsToValidate])

    if (!isValid) return

    if (step === 3) {
      await submitBooking(form.getValues())
      return
    }

    setStep((s) => s + 1)
    setDirection(1)
  }

  function goBack() {
    setStep((s) => (s > 1 ? s - 1 : s))
    setDirection(-1)
  }

  const getCurrentForm = () => {
    switch (step) {
      case 1:
        return <BookingStepMoveDetails goNext={goNext} />
      case 2:
        return <BookingStepMoveSize goNext={goNext} goBack={goBack} />
      case 3:
        return (
          <BookingStepContact
            goNext={goNext}
            goBack={goBack}
            isSubmitting={isPending}
          />
        )
      default:
        return null
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -200 : 200,
      opacity: 0,
    }),
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

  if (!services) return null

  return (
    <FormProvider {...form}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          ref={animationRef}
          key={step}
          variants={variants}
          custom={direction}
          initial={animationRef.current ? "enter" : false}
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {getCurrentForm()}
        </motion.div>
      </AnimatePresence>
    </FormProvider>
  )
}
