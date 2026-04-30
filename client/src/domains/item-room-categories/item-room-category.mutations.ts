import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  createItemRoomCategory,
  deleteItemRoomCategory,
} from "./item-room-category.api";
import type {
  CreateItemRoomCategoryPayload,
  ItemRoomCategory,
} from "./item-room-category.types";

export function useCreateItemRoomCategory(
  options?: Omit<UseMutationOptions<ItemRoomCategory, Error, CreateItemRoomCategoryPayload>, "mutationFn">,
) {
  return useMutation({
    mutationFn: createItemRoomCategory,
    ...options,
  });
}

export function useDeleteItemRoomCategory(
  options?: Omit<UseMutationOptions<void, Error, { id: number }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ id }) => deleteItemRoomCategory(id),
    ...options,
  });
}
