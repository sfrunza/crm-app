import { api } from '@/lib/axios'
import type {
  RequestRoom,
} from "./request-room.types";

const ENDPOINT = "/requests";

export async function createRequestRoom(
  requestId: number,
  data: Partial<RequestRoom>,
): Promise<RequestRoom> {
  const response = await api.post<RequestRoom>(`${ENDPOINT}/${requestId}/request_rooms`, {
    request_room: data,
  });
  return response.data;
}

export async function updateRequestRoom(
  requestId: number,
  id: number,
  data: Partial<RequestRoom>,
): Promise<RequestRoom> {
  const response = await api.patch<RequestRoom>(`${ENDPOINT}/${requestId}/request_rooms/${id}`, {
    request_room: data,
  });
  return response.data;
}

export async function deleteRequestRoom(requestId: number, id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${requestId}/request_rooms/${id}`);
}
