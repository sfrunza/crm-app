import { api } from '@/lib/axios';
import type { EntranceType } from '@/types/index';

const ENDPOINT = '/entrance_types';

export async function getEntranceTypes(): Promise<EntranceType[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createEntranceType(entranceType: Partial<EntranceType>): Promise<EntranceType> {
  const res = await api.post(ENDPOINT, { entrance_type: entranceType });
  return res.data;
}

export async function updateEntranceType(id: number, data: Partial<EntranceType>): Promise<EntranceType> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { entrance_type: data });
  return res.data;
}

export async function deleteEntranceType(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}