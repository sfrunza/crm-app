import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { createRoom, deleteRoom, updateRoom } from "./room.api";
import type { Room, RoomUpsertPayload } from "./room.types";

export function useCreateRoom(
  options?: Omit<UseMutationOptions<Room, Error, RoomUpsertPayload>, "mutationFn">,
) {
  return useMutation({
    mutationFn: createRoom,
    ...options,
  });
}

export function useUpdateRoom(
  options?: Omit<UseMutationOptions<Room, Error, { id: number; data: Partial<RoomUpsertPayload> }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ id, data }) => updateRoom(id, data),
    ...options,
  });
}

export function useDeleteRoom(
  options?: Omit<UseMutationOptions<void, Error, { id: number }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ id }) => deleteRoom(id),
    ...options,
  });
}
