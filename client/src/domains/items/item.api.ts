import { api } from '@/lib/axios'
import type { Item, ItemUpsertPayload } from "./item.types";

const ENDPOINT = "/items";

export async function getItems(): Promise<Item[]> {
  const response = await api.get<Item[]>(ENDPOINT);
  return response.data;
}

export async function createItem(data: ItemUpsertPayload): Promise<Item> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image" && value instanceof File) {
      formData.append("item[image]", value);
      return;
    }

    formData.append(`item[${key}]`, String(value));
  });

  const response = await api.post<Item>(ENDPOINT, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateItem(id: number, data: Partial<ItemUpsertPayload>): Promise<Item> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image" && value instanceof File) {
      formData.append("item[image]", value);
      return;
    }

    formData.append(`item[${key}]`, String(value));
  });

  const response = await api.patch<Item>(`${ENDPOINT}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteItem(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
