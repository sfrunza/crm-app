import {
  createPackingItem,
  deletePackingItem,
  getPackingItems,
  updatePackingItem,
} from "@/api/endpoints/packing-items"
import { extractError } from "@/lib/axios"
import { STALE_TIME_CATALOG } from "@/lib/constants"
import { queryClient } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import type { PackingItem } from "@/types/index"
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { toast } from "sonner"

export function usePackingItems(
  options?: Omit<UseQueryOptions<PackingItem[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.packingItems.all,
    queryFn: getPackingItems,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  })
}

export function useUpdatePackingItem(
  mutationOptions?: Omit<
    UseMutationOptions<
      PackingItem,
      Error,
      { id: number; data: Partial<PackingItem> }
    >,
    "mutationFn" | "mutationKey"
  >
) {
  return useMutation({
    mutationFn: ({ id, data }) => updatePackingItem(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packingItems.all })
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error))
      mutationOptions?.onError?.(error, variables, onMutateResult, context)
    },
  })
}

export function useCreatePackingItem(
  mutationOptions?: Omit<
    UseMutationOptions<PackingItem, Error, Partial<PackingItem>>,
    "mutationFn" | "mutationKey"
  >
) {
  return useMutation({
    mutationFn: createPackingItem,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packingItems.all })
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error))
      mutationOptions?.onError?.(error, variables, onMutateResult, context)
    },
  })
}

export function useDeletePackingItem(
  mutationOptions?: Omit<
    UseMutationOptions<void, Error, { id: number }>,
    "mutationFn" | "mutationKey"
  >
) {
  return useMutation({
    mutationFn: ({ id }) => deletePackingItem(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packingItems.all })
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error))
      mutationOptions?.onError?.(error, variables, onMutateResult, context)
    },
  })
}
