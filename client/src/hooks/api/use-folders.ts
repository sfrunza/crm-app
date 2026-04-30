import { createFolder, deleteFolder, getFolders, updateFolder } from "@/api/endpoints/folders";
import { extractError } from "@/lib/axios";
import { STALE_TIME_CATALOG } from "@/lib/constants";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { Folder } from "@/types/index";
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export function useFolders(
  options?: Omit<
    UseQueryOptions<Folder[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.folders.all,
    queryFn: getFolders,
    staleTime: STALE_TIME_CATALOG,
    ...options,
  });
}

export function useUpdateFolder(mutationOptions?: Omit<
  UseMutationOptions<Folder, Error, { id: number; data: Partial<Folder> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateFolder(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useCreateFolder(mutationOptions?: Omit<
  UseMutationOptions<Folder, Error, Pick<Folder, "name">>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: createFolder,
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

export function useDeleteFolder(mutationOptions?: Omit<
  UseMutationOptions<void, Error, { id: number }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id }) => deleteFolder(id),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      toast.error(extractError(error));
      mutationOptions?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

