import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  createMoveSizeRoom,
  deleteMoveSizeRoom,
  updateMoveSizeRoom,
} from "./move-size-room.api";
import type {
  CreateMoveSizeRoomPayload,
  MoveSizeRoom,
  UpdateMoveSizeRoomPayload,
} from "./move-size-room.types";

export function useCreateMoveSizeRoom(
  options?: Omit<UseMutationOptions<MoveSizeRoom, Error, { moveSizeId: number; data: CreateMoveSizeRoomPayload }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ moveSizeId, data }) => createMoveSizeRoom(moveSizeId, data),
    ...options,
  });
}

export function useUpdateMoveSizeRoom(
  options?: Omit<UseMutationOptions<MoveSizeRoom, Error, { moveSizeId: number; id: number; data: UpdateMoveSizeRoomPayload }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ moveSizeId, id, data }) => updateMoveSizeRoom(moveSizeId, id, data),
    ...options,
  });
}

export function useDeleteMoveSizeRoom(
  options?: Omit<UseMutationOptions<void, Error, { moveSizeId: number; id: number }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ moveSizeId, id }) => deleteMoveSizeRoom(moveSizeId, id),
    ...options,
  });
}
