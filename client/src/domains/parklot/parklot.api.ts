import { api } from '@/lib/axios';
import type { Request, Status } from '@/domains/requests/request.types';

const ENDPOINT = '/parklot';

export async function getParklot(params: { date: string, status?: Status }): Promise<Record<number, Request[]>> {
  const res = await api.get(ENDPOINT, { params });
  return res.data;
}
