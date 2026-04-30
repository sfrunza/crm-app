import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Message } from "@/types/index";
import type { Status } from "@/domains/requests/request.types";
import { useAuthStore } from "@/stores/auth-store";
import { MessageCircleIcon } from "@/components/icons";
import { useEffect, useRef } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "../ui/empty";
import { MessageBubble } from "./message-bubble";
import { groupMessagesByDate } from "./utils";

interface MessageListProps {
  messages: Message[];
  currentUserId?: number;
  status?: Status;
}

export function MessageList({
  messages,
  currentUserId,
  status,
}: MessageListProps) {
  const currentUserRole = useAuthStore((state) => state.user?.role);
  const viewerIsStaff =
    currentUserRole === "admin" || currentUserRole === "manager";
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Empty className="rounded-none bg-muted">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircleIcon />
          </EmptyMedia>
          <EmptyDescription>
            No messages yet. Start the conversation.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <ScrollArea className="min-h-0 flex-1 bg-muted">
      <div className="py-4">
        {grouped.map(([date, msgs]) => (
          <div key={date} className="px-4">
            <div className="my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                {date}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {msgs.map((message, index) => {
              const isStaffMessage = ["admin", "manager"].includes(
                message.user.role
              );
              const isOwn = viewerIsStaff ? isStaffMessage : !isStaffMessage;
              const showAvatar =
                index === 0 || msgs[index - 1].user_id !== message.user_id;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  currentUserId={currentUserId}
                  status={status}
                />
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
