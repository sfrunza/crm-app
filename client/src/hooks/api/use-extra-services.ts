
import { createExtraService, deleteExtraService, getExtraServices, updateExtraService } from "@/api/endpoints/extra-services";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { ExtraService } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export function useExtraServices(
  options?: Omit<
    UseQueryOptions<ExtraService[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.extraServices.all,
    queryFn: getExtraServices,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateExtraService(mutationOptions?: Omit<
  UseMutationOptions<ExtraService, Error, { id: number; data: Partial<ExtraService> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateExtraService(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.extraServices.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreateExtraService(mutationOptions?: Omit<
  UseMutationOptions<ExtraService, Error, Pick<ExtraService, "name">>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createExtraService,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.extraServices.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteExtraService(mutationOptions?: Omit<
  UseMutationOptions<void, Error, { id: number }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id }) => deleteExtraService(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.extraServices.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

