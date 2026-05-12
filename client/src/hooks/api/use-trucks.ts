import { createTruck, getTrucks, updateTruck } from "@/api/endpoints/trucks"
import { extractError } from "@/lib/axios"
import { STALE_TIME_CATALOG } from "@/lib/constants"
import { queryClient } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import type { Truck } from "@/types/index"
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { toast } from "sonner"

export function useTrucks(
  options?: Omit<UseQueryOptions<Truck[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.trucks.all,
    queryFn: getTrucks,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  })
}

export function useUpdateTruck(
  mutationOptions?: Omit<
    UseMutationOptions<Truck, Error, { id: number; data: Partial<Truck> }>,
    "mutationFn" | "mutationKey"
  >
) {
  return useMutation({
    mutationFn: ({ id, data }) => updateTruck(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all })
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error))
      mutationOptions?.onError?.(error, variables, onMutateResult, context)
    },
  })
}

export function useCreateTruck(
  mutationOptions?: Omit<
    UseMutationOptions<Truck, Error, Pick<Truck, "name">>,
    "mutationFn" | "mutationKey"
  >
) {
  return useMutation({
    mutationFn: createTruck,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all })
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error))
      mutationOptions?.onError?.(error, variables, onMutateResult, context)
    },
  })
}
