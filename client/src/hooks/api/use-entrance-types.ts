import { createEntranceType, deleteEntranceType, getEntranceTypes, updateEntranceType } from "@/api/endpoints/entrance-types";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { EntranceType } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export function useEntranceTypes(
  options?: Omit<
    UseQueryOptions<EntranceType[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.entranceTypes.all,
    queryFn: getEntranceTypes,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateEntranceType(mutationOptions?: Omit<
  UseMutationOptions<EntranceType, Error, { id: number; data: Partial<EntranceType> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateEntranceType(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entranceTypes.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreateEntranceType(mutationOptions?: Omit<
  UseMutationOptions<EntranceType, Error, Partial<EntranceType>>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createEntranceType,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entranceTypes.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteEntranceType(mutationOptions?: Omit<
  UseMutationOptions<void, Error, { id: number }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id }) => deleteEntranceType(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entranceTypes.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

