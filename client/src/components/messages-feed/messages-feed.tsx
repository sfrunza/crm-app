import { Spinner } from "@/components/ui/spinner";
import type { Status } from "@/domains/requests/request.types";
import { useMessagesSubscription } from "@/hooks/use-messages-subscription";
import { queryClient } from "@/lib/query-client";
import { useEffect, useState } from "react";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query-keys";
import {
  useCreateMessage,
  useMarkAllAsViewed,
  useMessages,
} from "@/hooks/api/use-messages";

interface MessagesFeedProps {
  requestId: number;
  status?: Status;
}

export function MessagesFeed({ requestId, status }: MessagesFeedProps) {
  // Live updates via ActionCable
  useMessagesSubscription({
    requestId,
    onReceived: (data) => {
      if (data.message) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages.byRequest(requestId),
        });
      }
    },
    deps: [requestId],
  });

  const { user: currentUser } = useAuth();

  const {
    data: messages,
    isLoading,
    error,
  } = useMessages(requestId, { enabled: !!requestId });

  const { mutate: createMessage, isPending: isSending } = useCreateMessage({
    onSettled: (_, error) => {
      if (error) {
        queryClient.cancelQueries({
          queryKey: queryKeys.messages.byRequest(requestId),
        });
      }
      setInput("");
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byRequest(requestId),
      });
    },
  });

  const { mutate: markAllAsViewed } = useMarkAllAsViewed();

  const [input, setInput] = useState("");

  // Mark messages as viewed
  useEffect(() => {
    if (!requestId || !messages || !currentUser) return;

    const hasUnread = messages.some(
      (m) =>
        m.user_id !== currentUser.id && !m.viewed_by.includes(currentUser.id)
    );

    if (hasUnread) {
      markAllAsViewed({ requestId });
    }
  }, [requestId, messages, currentUser, markAllAsViewed]);

  // Send message
  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || !requestId) return;
    createMessage({ requestId, content: trimmed });
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <MessageList
        messages={messages ?? []}
        currentUserId={currentUser?.id}
        status={status}
      />
      <MessageInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  );
}
