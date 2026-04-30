import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getBookingStats, getRequestById, getRequests, type BookingStats } from "./request.api";
import { requestKeys } from "./request.keys";
import type { Request, TableRequestParams, TableRequestResponse } from "./request.types";

export function useGetRequests(
  params?: TableRequestParams,
  queryOptions?: Omit<UseQueryOptions<TableRequestResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: requestKeys.list(params ?? {}),
    queryFn: () => getRequests(params),
    ...queryOptions,
  });
}

export function useGetRequestById(
  requestId: number,
  queryOptions?: Omit<UseQueryOptions<Request, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: requestKeys.detail(requestId),
    queryFn: () => getRequestById(requestId),
    staleTime: 2 * 60 * 1000,
    ...queryOptions,
  });
}

export function useGetBookingStats(
  queryOptions?: Omit<UseQueryOptions<BookingStats, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: requestKeys.bookingStats(),
    queryFn: getBookingStats,
    ...queryOptions,
  });
}
