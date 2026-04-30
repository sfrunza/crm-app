import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ParklotSlot } from "@/domains/requests/request.types";
import { dispatchKeys } from "./dispatch.keys";
import { getDispatch, getDispatchActiveDates } from "./dispatch.api";


export function useGetDispatch(
  params: { date: string, with_filters?: boolean },
  options?: Omit<UseQueryOptions<Record<number, ParklotSlot[]>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: dispatchKeys.withParams(params.date, params.with_filters),
    queryFn: () => getDispatch(params),
    ...options,
  });
}


export function useGetDispatchActiveDates(month: string, options?: Omit<UseQueryOptions<string[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: dispatchKeys.activeDates(month),
    queryFn: () => getDispatchActiveDates(month),
    ...options,
  });
}
