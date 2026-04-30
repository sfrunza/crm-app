import { ChatInfoAvatar } from "@/components/chat-info/chat-info";
import type { Message } from "@/types/index";
import type { Status } from "@/domains/requests/request.types";
import { cn } from "@/lib/utils";
import { CheckCheckIcon, CheckIcon } from "@/components/icons";
import { formatTime } from "./utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId?: number;
  status?: Status;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  currentUserId,
  status,
}: MessageBubbleProps) {
  const initials = `${message.user?.first_name?.[0] ?? ""}${message.user?.last_name?.[0] ?? ""}`;
  const fullName =
    `${message.user?.first_name ?? ""} ${message.user?.last_name ?? ""}`.trim();
  const time = formatTime(message.created_at);

  const isFromCurrentUser = message.user_id === currentUserId;
  const isSeenByOther = isFromCurrentUser
    ? message.viewed_by.some((id: number) => id !== currentUserId)
    : false;

  return (
    <div
      className={cn(
        "flex gap-2",
        isOwn ? "flex-row-reverse" : "flex-row",
        showAvatar ? "mt-3" : "mt-0.5",
      )}
    >
      <div className="w-8 shrink-0">
        {showAvatar && !isOwn && (
          <ChatInfoAvatar status={status} initials={initials} />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[75%] min-w-0 flex-col",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {showAvatar && (
          <p
            className={cn(
              "mb-0.5 text-xs font-medium",
              isOwn ? "text-right" : "text-left",
            )}
          >
            <span className="text-foreground">{fullName}</span>
          </p>
        )}
        <div
          className={cn(
            "inline-block rounded-2xl px-3 py-2 text-sm leading-relaxed shadow",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-background text-foreground rounded-tl-md",
          )}
        >
          <p className="wrap-break-word whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div
          className={cn(
            "mt-0.5 flex items-center gap-1 text-[10px]",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <span className="text-muted-foreground">{time}</span>
          {isFromCurrentUser && (
            <span
              className={cn(
                isSeenByOther ? "text-primary" : "text-muted-foreground",
              )}
            >
              {isSeenByOther ? (
                <CheckCheckIcon className="size-3" />
              ) : (
                <CheckIcon className="size-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
