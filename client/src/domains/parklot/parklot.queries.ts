import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { parklotKeys } from "./parklot.keys";
import { getParklot } from "./parklot.api";
import type { Request, Status } from "@/domains/requests/request.types";


export function useGetParklot(
  params: { date: string, status?: Status },
  options?: Omit<UseQueryOptions<Record<number, Request[]>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: parklotKeys.all(params.date, params.status),
    queryFn: () => getParklot(params),
    // staleTime: 1000 * 60 * 60, // 1 hour — since Rails caches heavily
    ...options,
  });
}