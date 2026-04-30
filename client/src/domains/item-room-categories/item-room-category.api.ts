import { api } from '@/lib/axios'
import type {
  CreateItemRoomCategoryPayload,
  ItemRoomCategory,
} from "./item-room-category.types";

const ENDPOINT = "/item_room_categories";

export async function getItemRoomCategories(): Promise<ItemRoomCategory[]> {
  const response = await api.get<ItemRoomCategory[]>(ENDPOINT);
  return response.data;
}

export async function createItemRoomCategory(
  data: CreateItemRoomCategoryPayload,
): Promise<ItemRoomCategory> {
  const response = await api.post<ItemRoomCategory>(ENDPOINT, {
    item_room_category: data,
  });
  return response.data;
}

export async function deleteItemRoomCategory(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
