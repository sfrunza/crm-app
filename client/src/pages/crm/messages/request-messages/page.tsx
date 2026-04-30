import {
  ChatInfo,
  ChatInfoAvatar,
  ChatInfoContent,
  ChatInfoDescription,
  ChatInfoHeader,
  ChatInfoTitle,
} from "@/components/chat-info/chat-info"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useGetRequestById } from "@/domains/requests/request.queries"
import { MessagesFeed } from "@/components/messages-feed"
import { useNavigate, useParams } from "react-router"
import { openRequest } from "@/stores/use-open-requests-store"
import { ChevronLeftIcon } from "@/components/icons"

function RequestMessagePage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const id = Number(requestId)

  const { data: request, isLoading } = useGetRequestById(id, {
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Request not found.</p>
      </div>
    )
  }

  const customerName = request.customer
    ? `${request.customer.first_name} ${request.customer.last_name}`
    : "No customer"

  const initials = request.customer
    ? `${request.customer.first_name[0]}${request.customer.last_name[0]}`
    : "?"

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="shrink-0 bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => navigate("/crm/messages")}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <ChatInfo className="flex-1 p-0">
            <ChatInfoAvatar status={request.status} initials={initials} />
            <ChatInfoContent>
              <ChatInfoHeader>
                <ChatInfoTitle>{customerName}</ChatInfoTitle>
                <ChatInfoDescription>Request #{request.id}</ChatInfoDescription>
              </ChatInfoHeader>
            </ChatInfoContent>
          </ChatInfo>
          <Button className="shrink-0" onClick={() => openRequest(request.id)}>
            Open Request
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 pb-10">
        <MessagesFeed requestId={id} status={request.status} />
      </div>
    </div>
  )
}

export const Component = RequestMessagePage
