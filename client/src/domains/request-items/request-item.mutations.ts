import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  createRequestItem,
  deleteRequestItem,
  updateRequestItem,
} from "./request-item.api";
import type {
  RequestItem,
} from "./request-item.types";
import { queryClient } from "@/lib/query-client";
import { requestKeys } from "../requests/request.keys";
// import { requestKeys } from "@/domains/requests/request.keys";
// import { queryClient } from "@/lib/query-client";

export function useCreateRequestItem(
  options?: Omit<
    UseMutationOptions<
      RequestItem,
      Error,
      { requestId: number; requestRoomId: number; data: Partial<RequestItem> }
    >,
    "mutationFn"
  >,
) {
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: ({ requestId, requestRoomId, data }) =>
      createRequestItem(requestId, requestRoomId, data),
    ...rest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId) });
      // onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateRequestItem(
  options?: Omit<
    UseMutationOptions<
      RequestItem,
      Error,
      {
        requestId: number;
        requestRoomId: number;
        id: number;
        data: Partial<RequestItem>;
      }
    >,
    "mutationFn"
  >,
) {
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: ({ requestId, requestRoomId, id, data }) =>
      updateRequestItem(requestId, requestRoomId, id, data),
    ...rest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId) });
      // onSuccess?.(data, variables, context);
    },
  });
}

export function useDeleteRequestItem(
  options?: Omit<
    UseMutationOptions<
      void,
      Error,
      { requestId: number; requestRoomId: number; id: number }
    >,
    "mutationFn"
  >,
) {
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: ({ requestId, requestRoomId, id }) =>
      deleteRequestItem(requestId, requestRoomId, id),
    ...rest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId) });
      // onSuccess?.(data, variables, context);
    },
  });
}
