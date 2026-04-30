import { createService, deleteService, getServices, updateService } from "@/api/endpoints/services";
import { extractError } from "@/lib/axios";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { Service } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export function useServices(
  options?: Omit<
    UseQueryOptions<Service[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.services.all,
    queryFn: getServices,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateService(mutationOptions?: Omit<
  UseMutationOptions<Service, Error, { id: number; data: Partial<Service> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateService(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useCreateService(mutationOptions?: Omit<
  UseMutationOptions<Service, Error, Pick<Service, "name">>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createService,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteService(mutationOptions?: Omit<
  UseMutationOptions<void, Error, { id: number }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id }) => deleteService(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

