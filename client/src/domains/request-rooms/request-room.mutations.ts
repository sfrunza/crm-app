import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  createRequestRoom,
  deleteRequestRoom,
  updateRequestRoom,
} from "./request-room.api";
import type {
  RequestRoom,
} from "./request-room.types";
import { queryClient } from "@/lib/query-client";
import { requestKeys } from "../requests/request.keys";
// import { requestKeys } from "@/domains/requests/request.keys";
// import { queryClient } from "@/lib/query-client";

export function useCreateRequestRoom(
  options?: Omit<UseMutationOptions<RequestRoom, Error, { requestId: number; data: Partial<RequestRoom> }>, "mutationFn">,
) {
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: ({ requestId, data }) => createRequestRoom(requestId, data),
    ...rest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId) });
      // onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateRequestRoom(
  options?: Omit<UseMutationOptions<RequestRoom, Error, { requestId: number; id: number; data: Partial<RequestRoom> }>, "mutationFn">,
) {
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: ({ requestId, id, data }) => updateRequestRoom(requestId, id, data),
    ...rest,
    // onSuccess: (data, variables, context) => {
    //   queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId) });
    //   onSuccess?.(data, variables, context);
    // },
  });
}

export function useDeleteRequestRoom(
  options?: Omit<UseMutationOptions<void, Error, { requestId: number; id: number }>, "mutationFn">,
) {
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: ({ requestId, id }) => deleteRequestRoom(requestId, id),
    ...rest,
    // onSuccess: (data, variables, context) => {
    //   queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId) });
    //   onSuccess?.(data, variables, context);
    // },
  });
}
