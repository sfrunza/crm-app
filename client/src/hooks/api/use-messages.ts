import { createMessage, getMessages, getTotalUnreadMessagesCount, getUnreadCount, markAllAsViewed } from "@/api/endpoints/messages";
import { queryKeys } from "@/lib/query-keys";
import type { Message } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export function useMessages(
  requestId: number,
  options?: Omit<
    UseQueryOptions<Message[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.messages.byRequest(requestId),
    queryFn: () => getMessages(requestId),
    enabled: !!requestId,
    ...options,
  });
}

export function useGetUnreadCount(
  requestId: number,
  options?: Omit<
    UseQueryOptions<{ unread_count: number }>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.messages.unreadCount(requestId),
    queryFn: () => getUnreadCount(requestId),
    enabled: !!requestId,
    ...options,
  });
}

export function useGetTotalUnreadMessagesCount(
  options?: Omit<
    UseQueryOptions<{ count: number }>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.messages.totalUnread,
    queryFn: getTotalUnreadMessagesCount,
    refetchInterval: 60_000, // fallback poll every 60s
    ...options,
  });
}

export function useCreateMessage(
  mutationOptions?: Omit<
    UseMutationOptions<
      Message,
      Error,
      { requestId: number; content: string }
    >,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: ({ requestId, content }) => createMessage(requestId, content),
    ...mutationOptions,
  });
}

export function useMarkAllAsViewed(
  mutationOptions?: Omit<
    UseMutationOptions<void, Error, { requestId: number }>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: ({ requestId }) => markAllAsViewed(requestId),
    ...mutationOptions,
  });
}

