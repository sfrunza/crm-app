import { api } from '@/lib/axios';
import type { ParklotSlot } from '@/domains/requests/request.types';

const ENDPOINT = '/dispatch';

export async function getDispatch(params: { date: string, with_filters?: boolean }): Promise<Record<number, ParklotSlot[]>> {
  const res = await api.get(ENDPOINT, { params });
  return res.data;
}

export async function getDispatchActiveDates(month: string): Promise<string[]> {
  const res = await api.get(`${ENDPOINT}/active_dates`, { params: { month } });
  return res.data;
}
