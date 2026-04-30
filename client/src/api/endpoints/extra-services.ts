import type { ExtraService } from '@/types/index';
import { api } from '@/lib/axios';

const ENDPOINT = '/extra_services';

export async function getExtraServices(): Promise<ExtraService[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createExtraService(extraService: Pick<ExtraService, 'name'>): Promise<ExtraService> {
  const res = await api.post(ENDPOINT, { extra_service: extraService });
  return res.data;
}

export async function updateExtraService(id: number, data: Partial<ExtraService>): Promise<ExtraService> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { extra_service: data });
  return res.data;
}

export async function deleteExtraService(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
