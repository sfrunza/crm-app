import { getOnlineCustomers } from "@/api/endpoints/online-customers"
import { queryKeys } from "@/lib/query-keys"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import type { OnlineCustomersResponse } from "@/types/api"

export function useOnlineCustomers(
  options?: Omit<
    UseQueryOptions<OnlineCustomersResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.onlineCustomers.all,
    queryFn: getOnlineCustomers,
    refetchInterval: 10_000, // 10 seconds
    ...options,
  })
}
