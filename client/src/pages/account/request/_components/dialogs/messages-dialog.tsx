import { MessagesFeed } from "@/components/messages-feed";
import { NotificationSound } from "@/components/notification-sound";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Status } from "@/domains/requests/request.types";
import { useAuth } from "@/hooks/use-auth";
import { useMessagesSubscription } from "@/hooks/use-messages-subscription";
import { useNotificationsSubscription } from "@/hooks/use-notifications-subscription";
import { cn } from "@/lib/utils";
import { MessageCircleMoreIcon } from "@/components/icons";
import { useCallback, useRef, useState } from "react";
import { useGetUnreadCount } from "@/hooks/api/use-messages";
import type { CableMessageEvent } from "@/types/index";

export function MessagesDialog({
  requestId,
  status,
  isLarge = false,
}: {
  requestId: number;
  status?: Status;
  isLarge?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  const { user: currentUser } = useAuth();
  const { data } = useGetUnreadCount(requestId);

  const unreadCount = data?.unread_count ?? 0;

  const handleMessageReceived = useCallback(
    (data: CableMessageEvent) => {
      if (
        data.type === "new_message" &&
        data.message.user_id !== currentUser?.id &&
        !openRef.current
      ) {
        NotificationSound()
          .play()
          .catch(() => {
            // Browser may block autoplay until user interacts
          });
      }
    },
    [currentUser?.id, openRef]
  );

  useNotificationsSubscription(requestId);

  useMessagesSubscription({
    requestId,
    onReceived: handleMessageReceived,
    deps: [currentUser?.id],
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "relative size-11 rounded-full shadow-xl",
            isLarge && "size-15 shadow-xl/20"
          )}
        >
          <MessageCircleMoreIcon
            className={cn("size-6", isLarge && "size-9")}
          />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle>Messages</DialogTitle>
          <DialogDescription>
            Chat with your moving coordinator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid h-[70vh] grid-rows-[auto_max-content] overflow-hidden overflow-y-auto">
          {open && <MessagesFeed requestId={requestId} status={status} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
