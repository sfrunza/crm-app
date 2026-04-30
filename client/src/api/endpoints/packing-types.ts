import { api } from '@/lib/axios';
import type { PackingType } from '@/types/index';

const ENDPOINT = '/packing_types';

export async function getPackingTypes(): Promise<PackingType[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createPackingType(packingType: Partial<PackingType>): Promise<PackingType> {
  const res = await api.post(ENDPOINT, { packing_type: packingType });
  return res.data;
}

export async function updatePackingType(id: number, data: Partial<PackingType>): Promise<PackingType> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { packing_type: data });
  return res.data;
}

export async function deletePackingType(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
