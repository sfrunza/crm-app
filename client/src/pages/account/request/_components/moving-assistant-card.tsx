import {
  ChatInfo,
  ChatInfoAvatar,
  ChatInfoContent,
  ChatInfoDescription,
  ChatInfoHeader,
  ChatInfoTitle,
} from "@/components/chat-info/chat-info"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import type { Status } from "@/domains/requests/request.types"
import { formatPhone } from "@/lib/format-phone"
import type { ReactNode } from "react"
import { Link } from "react-router"
import { MessagesDialog } from "./dialogs/messages-dialog"
import { useSettings } from "@/hooks/api/use-settings"

const ALLOWED_STATUSES: Status[] = ["confirmed", "not_confirmed", "reserved"]

const STATUS_MESSAGES: Record<Status, ReactNode> = {
  pending: (
    <>
      <p>Thank you for submitting your moving request!</p>
      <p>
        We're reviewing your details and will get back to you shortly with a
        quote.
      </p>
    </>
  ),
  pending_info: (
    <>
      <p>We need a bit more information to finalize your quote.</p>
      <p>Please check your email or messages for details on what's needed.</p>
    </>
  ),
  pending_date: (
    <>
      <p>Your request is almost ready!</p>
      <p>We just need you to confirm your preferred moving date to proceed.</p>
    </>
  ),
  hold: (
    <>
      <p>Your request is currently on hold.</p>
      <p>If you have any questions, feel free to send us a message.</p>
    </>
  ),
  not_confirmed: (
    <>
      <p>Great news — your quote is ready!</p>
      <p>Please review it and proceed to confirmation when you're ready.</p>
    </>
  ),
  confirmed: (
    <>
      <p>Your move is confirmed!</p>
      <p>We're all set for your moving day. Reach out if anything changes.</p>
    </>
  ),
  reserved: (
    <>
      <p>Your spot has been reserved.</p>
      <p>Please complete the confirmation to lock in your date.</p>
    </>
  ),
  not_available: (
    <>
      <p>Unfortunately, we're not available for your requested date.</p>
      <p>Please reach out and we'll help find an alternative.</p>
    </>
  ),
  completed: (
    <>
      <p>Your move is complete!</p>
      <p>Thank you for choosing us. We'd love to hear your feedback.</p>
    </>
  ),
  canceled: (
    <>
      <p>This request has been canceled.</p>
      <p>
        If you'd like to reschedule, feel free to submit a new request anytime.
      </p>
    </>
  ),
  refused: (
    <>
      <p>This request was declined.</p>
      <p>
        If you have questions or would like to discuss alternatives, please
        reach out.
      </p>
    </>
  ),
  spam: (
    <>
      <p>This request has been flagged.</p>
      <p>If you believe this is an error, please contact us.</p>
    </>
  ),
  closed: (
    <>
      <p>This request has been closed.</p>
      <p>If you need further assistance, don't hesitate to get in touch.</p>
    </>
  ),
  expired: (
    <>
      <p>This request has expired.</p>
      <p>
        If you're still planning a move, you can submit a new request anytime.
      </p>
    </>
  ),
  archived: (
    <>
      <p>This request has been archived.</p>
      <p>You can always reach out if you need anything in the future.</p>
    </>
  ),
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="prose prose-sm rounded-xl rounded-tl-sm bg-muted px-4 py-2.5 leading-relaxed text-foreground">
      {children}
    </div>
  )
}

export function MovingAssistantCard({
  requestId,
  status,
  initials,
}: {
  requestId: number
  status: Status
  initials: string
}) {
  const { data: settings } = useSettings()
  const showConfirmationButton = ["confirmed", "reserved"].includes(status)

  return (
    <Card>
      <CardHeader>
        <ChatInfo className="p-0">
          <ChatInfoAvatar initials={initials} size="lg" />
          <ChatInfoContent>
            <ChatInfoHeader>
              <ChatInfoTitle>
                {settings?.company_name ?? "Your moving assistant"}
              </ChatInfoTitle>
              <ChatInfoDescription>
                <p>Moving assistant</p>
                <p>{formatPhone(settings?.company_phone)}</p>
              </ChatInfoDescription>
            </ChatInfoHeader>
          </ChatInfoContent>
        </ChatInfo>
        <CardAction>
          <MessagesDialog requestId={requestId} status={status} />
        </CardAction>
      </CardHeader>

      <CardContent>
        <AssistantBubble>{STATUS_MESSAGES[status]}</AssistantBubble>
      </CardContent>

      {ALLOWED_STATUSES.includes(status) && (
        <CardFooter>
          <Button
            size="lg"
            className="w-full"
            // variant={showConfirmationButton ? "outline" : "default"}
            asChild
          >
            <Link to={`/account/requests/${requestId}/confirmation`}>
              {showConfirmationButton
                ? "View confirmation page"
                : "Proceed to confirmation"}
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
