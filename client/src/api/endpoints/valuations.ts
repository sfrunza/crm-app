import { api } from '@/lib/axios';
import type { Valuation } from '@/types/index';

const ENDPOINT = '/valuations';

export async function getValuations(): Promise<Valuation[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createValuation(valuation: Partial<Valuation>): Promise<Valuation> {
  const res = await api.post(ENDPOINT, { valuation: valuation });
  return res.data;
}

export async function updateValuation(id: number, data: Partial<Valuation>): Promise<Valuation> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { valuation: data });
  return res.data;
}

export async function deleteValuation(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
