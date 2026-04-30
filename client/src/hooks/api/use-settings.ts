import { getSettings, updateSettings } from "@/api/endpoints/settings";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { CompanySetting } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export function useSettings(
  options?: Omit<
    UseQueryOptions<CompanySetting, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: getSettings,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateSettings(mutationOptions?: Omit<
  UseMutationOptions<CompanySetting, Error, Partial<CompanySetting> & { company_logo?: File | null }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: (data) => updateSettings(data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
