import { getConversations } from "@/api/endpoints/conversations";
import { queryKeys } from "@/lib/query-keys";
import type { ConversationsResponse } from '@/types/index';
import { useInfiniteQuery } from "@tanstack/react-query";

export function useGetConversations(perPage = 10) {
  return useInfiniteQuery<ConversationsResponse>({
    queryKey: queryKeys.conversations.list(),
    queryFn: ({ pageParam }) =>
      getConversations({ page: pageParam as number, per_page: perPage }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.meta;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });
}
