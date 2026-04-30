import { api } from '@/lib/axios';
import type { Rate } from '@/types/index';

const ENDPOINT = '/rates';

export async function getRates(): Promise<Rate[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function updateRate(id: number, data: Partial<Rate>): Promise<Rate> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { rate: data });
  return res.data;
}