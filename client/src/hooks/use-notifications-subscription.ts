import { useContext, useEffect, useRef } from "react"
import { queryClient } from "@/lib/query-client"
import { CableContext } from "@/providers/action-cable-provider"
import { queryKeys } from "@/lib/query-keys";

type NotificationEvent = {
  type: typeof UNREAD_MESSAGES_CHANGED_EVENT;
};

const UNREAD_MESSAGES_CHANGED_EVENT = "unread_messages_changed";

export function useNotificationsSubscription(requestId?: number): void {
  const { consumer } = useContext(CableContext)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!consumer) return

    // Prevent duplicate subscriptions
    if (subscriptionRef.current) return

    subscriptionRef.current = consumer.subscriptions.create(
      { channel: "NotificationsChannel" },
      {
        received: (event: NotificationEvent) => {
          // console.info("NotificationsChannel received:", event)
          if (event.type === UNREAD_MESSAGES_CHANGED_EVENT) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.messages.totalUnread,
            });
            queryClient.invalidateQueries({
              queryKey: queryKeys.conversations.all,
            });

            if (requestId) {
              queryClient.invalidateQueries({
                queryKey: queryKeys.messages.unreadCount(requestId),
              });
            }
          }
        },
      }
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [consumer, requestId])
}
