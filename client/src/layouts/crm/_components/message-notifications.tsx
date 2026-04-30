import { buttonVariants } from "@/components/ui/button";
import { useGetTotalUnreadMessagesCount } from "@/hooks/api/use-messages";
import { cn } from "@/lib/utils";
import { MessageCircleMoreIcon } from "@/components/icons";
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router";
import { Badge } from "@/components/ui/badge";
import { useNotificationsSubscription } from "@/hooks/use-notifications-subscription";
import { NotificationSound } from "@/components/notification-sound";

export function MessageNotifications() {
  // Subscribe to per-user notifications channel for real-time count updates
  useNotificationsSubscription();

  const { data } = useGetTotalUnreadMessagesCount();
  const count = data?.count ?? 0;
  const prevCountRef = useRef(count);
  const location = useLocation();

  // Play sound only when unread count increases AND user is not on the chat page
  useEffect(() => {
    const isOnChatPage = /^\/crm\/messages\/\d+/.test(location.pathname);

    if (count > prevCountRef.current && !isOnChatPage) {
      NotificationSound()
        .play()
        .catch(() => {
          // Browser may block autoplay until user interacts with the page
        });
    }
    prevCountRef.current = count;
  }, [count, location.pathname]);

  return (
    <NavLink
      to="/crm/messages"
      className={({ isActive }) =>
        cn(
          buttonVariants({
            variant: isActive ? "secondary" : "outline",
            size: "icon",
            className: "relative",
          })
        )
      }
    >
      <MessageCircleMoreIcon />
      <span className="sr-only">Notifications</span>
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </NavLink>
  );
}
