import { getUserById, getUsers, updateUser } from "@/api/endpoints/users";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { User } from '@/types/index';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export function useUsers(options?: Omit<
  UseQueryOptions<User[], Error>,
  'queryKey' | 'queryFn'
>) {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: getUsers,
    ...options,
  });
}

export function useUser(id: number, options?: Omit<
  UseQueryOptions<User, Error>,
  'queryFn' | 'queryKey'
>) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUserById(id),
    ...options,
  });
}

export function useUpdateUser(mutationOptions?: Omit<
  UseMutationOptions<User, Error, { id: number; data: Partial<User> }>,
  'mutationFn' | 'mutationKey'
>) {
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    ...mutationOptions,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });

      mutationOptions?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}