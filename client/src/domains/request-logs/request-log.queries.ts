import { useInfiniteQuery } from "@tanstack/react-query";
import { getRequestLogs } from "./request-log.api";
import { requestLogKeys } from "./request-log.keys";
import type { RequestLogsPage } from "./request-log.types";

export function useGetRequestLogs(requestId: number) {
  return useInfiniteQuery<RequestLogsPage>({
    queryKey: requestLogKeys.byRequest(requestId),
    queryFn: ({ pageParam }) => getRequestLogs(requestId, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    enabled: !!requestId,
  });
}
