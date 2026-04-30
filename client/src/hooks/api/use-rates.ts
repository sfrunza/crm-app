import { getRates, updateRate } from "@/api/endpoints/rates";
import { extractError } from "@/lib/axios";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { Rate } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRates(
  options?: Omit<
    UseQueryOptions<Rate[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.rates.all,
    queryFn: getRates,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateRate(mutationOptions?: Omit<
  UseMutationOptions<Rate, Error, { id: number; data: Partial<Rate> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateRate(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarRates.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}