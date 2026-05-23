import { buildCrmAutoLoginUrl } from "@/lib/crm-app-url"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckIcon, CheckCircle2Icon } from "@/components/icons"

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
    <Card className="mx-auto max-w-md rounded-3xl shadow-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2Icon className="size-6 text-green-600" />
        </div>

        <CardTitle>Request Submitted Successfully</CardTitle>

        <CardDescription>
          Thanks for choosing us. Your move request has been received and is
          being reviewed.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/40 p-4 text-center">
          <p className="text-sm text-muted-foreground">Request Number</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">#{requestId}</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">You can now:</p>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-600" />
              View your request details
            </li>

            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-600" />
              Complete your inventory
            </li>

            <li className="flex items-center gap-2">
              <CheckIcon className="size-4 text-green-600" />
              Manage your booking
            </li>
          </ul>
        </div>
        <Button asChild className="w-full" size="lg">
          <a href={accountUrl}>Go to Request Page</a>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          We'll be in touch soon with the next steps.
        </p>
      </CardContent>
    </Card>
  )
}
