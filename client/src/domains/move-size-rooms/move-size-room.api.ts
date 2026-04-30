import { api } from '@/lib/axios'
import type {
  CreateMoveSizeRoomPayload,
  MoveSizeRoom,
  UpdateMoveSizeRoomPayload,
} from "./move-size-room.types";

const ENDPOINT = "/move_sizes";

export async function createMoveSizeRoom(
  moveSizeId: number,
  data: CreateMoveSizeRoomPayload,
): Promise<MoveSizeRoom> {
  const response = await api.post<MoveSizeRoom>(`${ENDPOINT}/${moveSizeId}/move_size_rooms`, {
    move_size_room: data,
  });
  return response.data;
}

export async function updateMoveSizeRoom(
  moveSizeId: number,
  id: number,
  data: UpdateMoveSizeRoomPayload,
): Promise<MoveSizeRoom> {
  const response = await api.patch<MoveSizeRoom>(
    `${ENDPOINT}/${moveSizeId}/move_size_rooms/${id}`,
    { move_size_room: data },
  );
  return response.data;
}

export async function deleteMoveSizeRoom(moveSizeId: number, id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${moveSizeId}/move_size_rooms/${id}`);
}
