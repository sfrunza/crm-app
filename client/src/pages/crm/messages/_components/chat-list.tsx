import {
  ChatInfo,
  ChatInfoAction,
  ChatInfoAvatar,
  ChatInfoContent,
  ChatInfoDescription,
  ChatInfoHeader,
  ChatInfoTitle,
} from "@/components/chat-info/chat-info";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useGetConversations } from "@/hooks/api/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/index";
import { useNavigate, useParams } from "react-router";

const OBSERVER_OPTIONS: IntersectionObserverInit = { rootMargin: "100px" };

export function ChatList() {
  const { requestId } = useParams();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetConversations(10);

  const conversations = data?.pages.flatMap((page) => page.items) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    observerOptions: OBSERVER_OPTIONS,
  });

  return (
    <ScrollArea
      className={cn("overflow-hidden border-r border-border", {
        "hidden lg:block": requestId,
      })}
    >
      <div className="space-y-0.5 p-2 pb-10">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner className="size-5" />
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No conversations yet.
          </p>
        )}

        {conversations.map((conversation) => (
          <ChatItem
            key={conversation.id}
            conversation={conversation}
            activeChatId={requestId}
          />
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <Spinner className="size-4" />
          </div>
        )}

        {!hasNextPage && conversations.length > 0 && !isLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            End of the list
          </p>
        )}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

function ChatItem({
  conversation,
  activeChatId,
}: {
  conversation: Conversation;
  activeChatId: string | undefined;
}) {
  const navigate = useNavigate();
  const isActive = Number(activeChatId) === conversation.id;
  const hasUnread = conversation.unread_count > 0;

  function onChatClick() {
    navigate(`/crm/messages/${conversation.id}`);
  }

  const customerName = conversation.customer
    ? `${conversation.customer.first_name} ${conversation.customer.last_name}`
    : "No customer";

  const initials = conversation.customer
    ? `${conversation.customer.first_name[0]}${conversation.customer.last_name[0]}`
    : "?";

  return (
    <ChatInfo data-active={isActive} onClick={onChatClick}>
      <ChatInfoAvatar
        status={conversation.status}
        initials={initials}
        size="lg"
      />
      <ChatInfoContent>
        <ChatInfoHeader>
          <ChatInfoTitle>{customerName}</ChatInfoTitle>
          <ChatInfoDescription>Request #{conversation.id}</ChatInfoDescription>
          {conversation.last_message_at && (
            <ChatInfoAction>
              {formatDate(new Date(conversation.last_message_at), "dd MMM")}
            </ChatInfoAction>
          )}
        </ChatInfoHeader>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {conversation.last_message ?? "No messages"}
          </p>
          {hasUnread && (
            <Badge className="h-4 min-w-4 px-1 tabular-nums">
              {conversation.unread_count > 99
                ? "99+"
                : conversation.unread_count}
            </Badge>
          )}
        </div>
      </ChatInfoContent>
    </ChatInfo>
  );
}
