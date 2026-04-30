import { api } from '@/lib/axios';
import type { Service } from '@/types/index';

const ENDPOINT = '/services';

export async function getServices(): Promise<Service[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createService(service: Pick<Service, 'name'>): Promise<Service> {
  const res = await api.post(ENDPOINT, { service });
  return res.data;
}

export async function updateService(id: number, data: Partial<Service>): Promise<Service> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { service: data });
  return res.data;
}

export async function deleteService(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}