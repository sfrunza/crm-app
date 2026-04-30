import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { createItem, deleteItem, updateItem } from "./item.api";
import type { Item, ItemUpsertPayload } from "./item.types";

export function useCreateItem(
  options?: Omit<UseMutationOptions<Item, Error, ItemUpsertPayload>, "mutationFn">,
) {
  return useMutation({
    mutationFn: createItem,
    ...options,
  });
}

export function useUpdateItem(
  options?: Omit<UseMutationOptions<Item, Error, { id: number; data: Partial<ItemUpsertPayload> }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    ...options,
  });
}

export function useDeleteItem(
  options?: Omit<UseMutationOptions<void, Error, { id: number }>, "mutationFn">,
) {
  return useMutation({
    mutationFn: ({ id }) => deleteItem(id),
    ...options,
  });
}
