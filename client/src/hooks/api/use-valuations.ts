import { createValuation, deleteValuation, getValuations, updateValuation } from "@/api/endpoints/valuations";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { Valuation } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export function useValuations(
  options?: Omit<
    UseQueryOptions<Valuation[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.valuations.all,
    queryFn: getValuations,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateValuation(mutationOptions?: Omit<
  UseMutationOptions<Valuation, Error, { id: number; data: Partial<Valuation> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateValuation(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.valuations.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreateValuation(mutationOptions?: Omit<
  UseMutationOptions<Valuation, Error, Partial<Valuation>>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createValuation,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.valuations.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteValuation(mutationOptions?: Omit<
  UseMutationOptions<void, Error, { id: number }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id }) => deleteValuation(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.valuations.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

