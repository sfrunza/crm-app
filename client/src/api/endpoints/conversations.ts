import { api } from '@/lib/axios';
import type { ConversationsResponse } from '@/types/index';

const ENDPOINT = '/conversations';

export async function getConversations(params: {
  page: number;
  per_page?: number;
}): Promise<ConversationsResponse> {
  const res = await api.get(ENDPOINT, { params });
  return res.data;
}