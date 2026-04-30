import { api } from '@/lib/axios'
import type {
  RequestItem,
} from "./request-item.types";

const ENDPOINT = "/requests";

export async function createRequestItem(
  requestId: number,
  requestRoomId: number,
  data: Partial<RequestItem>,
): Promise<RequestItem> {
  const response = await api.post<RequestItem>(
    `${ENDPOINT}/${requestId}/request_rooms/${requestRoomId}/request_items`,
    { request_item: data },
  );
  return response.data;
}

export async function updateRequestItem(
  requestId: number,
  requestRoomId: number,
  id: number,
  data: Partial<RequestItem>,
): Promise<RequestItem> {
  const response = await api.patch<RequestItem>(
    `${ENDPOINT}/${requestId}/request_rooms/${requestRoomId}/request_items/${id}`,
    { request_item: data },
  );
  return response.data;
}

export async function deleteRequestItem(
  requestId: number,
  requestRoomId: number,
  id: number,
): Promise<void> {
  await api.delete(
    `${ENDPOINT}/${requestId}/request_rooms/${requestRoomId}/request_items/${id}`,
  );
}
