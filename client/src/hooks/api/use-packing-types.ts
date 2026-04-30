import { createPackingType, deletePackingType, getPackingTypes, updatePackingType } from "@/api/endpoints/packing-types";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { PackingType } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export function usePackingTypes(
  options?: Omit<
    UseQueryOptions<PackingType[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.packingTypes.all,
    queryFn: getPackingTypes,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdatePackingType(mutationOptions?: Omit<
  UseMutationOptions<PackingType, Error, { id: number; data: Partial<PackingType> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updatePackingType(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packingTypes.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreatePackingType(mutationOptions?: Omit<
  UseMutationOptions<PackingType, Error, Partial<PackingType>>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createPackingType,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packingTypes.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeletePackingType(mutationOptions?: Omit<
  UseMutationOptions<void, Error, { id: number }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id }) => deletePackingType(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packingTypes.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

