import { api } from '@/lib/axios'
import type { Room, RoomUpsertPayload } from "./room.types";

const ENDPOINT = "/rooms";

export async function getRooms(): Promise<Room[]> {
  const response = await api.get<Room[]>(ENDPOINT);
  return response.data;
}

export async function createRoom(data: RoomUpsertPayload): Promise<Room> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image" && value instanceof File) {
      formData.append("room[image]", value);
      return;
    }

    formData.append(`room[${key}]`, String(value));
  });

  const response = await api.post<Room>(ENDPOINT, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateRoom(id: number, data: Partial<RoomUpsertPayload>): Promise<Room> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image" && value instanceof File) {
      formData.append("room[image]", value);
      return;
    }

    formData.append(`room[${key}]`, String(value));
  });

  const response = await api.patch<Room>(`${ENDPOINT}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteRoom(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
