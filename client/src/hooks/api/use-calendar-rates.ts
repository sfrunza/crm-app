import { createCalendarRate, getCalendarRates, updateCalendarRate } from "@/api/endpoints/calendar-rates";
import { extractError } from "@/lib/axios";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { CalendarRate, CalendarRateMap } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCalendarRates(
  options?: Omit<
    UseQueryOptions<CalendarRateMap, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.calendarRates.all,
    queryFn: getCalendarRates,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useCreateCalendarRate(mutationOptions?: Omit<
  UseMutationOptions<CalendarRate, Error, Partial<CalendarRate>>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createCalendarRate,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarRates.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCalendarRate(mutationOptions?: Omit<
  UseMutationOptions<CalendarRate, Error, { id: number; data: Partial<CalendarRate> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateCalendarRate(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarRates.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}