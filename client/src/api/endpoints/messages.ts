import { api } from '@/lib/axios'
import type { Message } from '@/types/index';

function endpoint(requestId: number) {
  return `/requests/${requestId}/messages`;
}

export async function getMessages(requestId: number): Promise<Message[]> {
  const res = await api.get(endpoint(requestId));
  return res.data;
}

export async function createMessage(
  requestId: number,
  content: string,
): Promise<Message> {
  const res = await api.post(endpoint(requestId), { message: { content } });
  return res.data;
}

export async function markAllAsViewed(requestId: number): Promise<void> {
  await api.post(`${endpoint(requestId)}/mark_all_as_viewed`);
}

export async function getUnreadCount(
  requestId: number,
): Promise<{ unread_count: number }> {
  const res = await api.get(`${endpoint(requestId)}/unread_count`);
  return res.data;
}

export async function getTotalUnreadMessagesCount(): Promise<{ count: number }> {
  const res = await api.get("/notifications/unread_messages_count");
  return res.data;
}
