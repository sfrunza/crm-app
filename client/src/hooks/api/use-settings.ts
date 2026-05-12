import { getSettings, updateSettings } from "@/api/endpoints/settings"
import { extractError } from "@/lib/axios"
import { STALE_TIME_CATALOG } from "@/lib/constants"
import { queryClient } from "@/lib/query-client"
import { queryKeys } from "@/lib/query-keys"
import type { CompanySetting } from "@/types/index"
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { toast } from "sonner"

export function useSettings(
  options?: Omit<UseQueryOptions<CompanySetting, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: getSettings,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  })
}

export function useUpdateSettings(
  mutationOptions?: Omit<
    UseMutationOptions<
      CompanySetting,
      Error,
      Partial<CompanySetting> & { company_logo?: File | null }
    >,
    "mutationFn" | "mutationKey"
  >
) {
  return useMutation({
    mutationFn: (data) => updateSettings(data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all })
      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context)
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error))
      mutationOptions?.onError?.(error, variables, onMutateResult, context)
    },
  })
}
