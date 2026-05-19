import { CheckCircle2Icon } from "lucide-react"

import { buildCrmAutoLoginUrl } from "@/lib/crm-app-url"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type BookingFormSuccessProps = {
  requestId: number
  magicLoginToken: string
}

export function BookingFormSuccess({
  requestId,
  magicLoginToken,
}: BookingFormSuccessProps) {
  const accountUrl = buildCrmAutoLoginUrl(requestId, magicLoginToken)

  return (
    <Card className="mx-auto w-full max-w-lg rounded-3xl shadow-md">
      <CardHeader className="text-center">
        <CheckCircle2Icon
          className="mx-auto mb-2 size-12 text-primary"
          aria-hidden
        />
        <CardTitle className="text-2xl">Thank you!</CardTitle>
        <CardDescription className="text-base">
          Your move request has been submitted. We&apos;ll be in touch soon.
          Your reference number is <strong>#{requestId}</strong>.
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center text-sm text-muted-foreground">
        View your request, complete your inventory, and manage your booking from
        your account.
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button asChild className="w-full sm:w-auto">
          <a href={accountUrl}>Go to my account</a>
        </Button>
      </CardFooter>
    </Card>
  )
}
