import { api } from '@/lib/axios';
import type { Truck } from '@/types/index';

const ENDPOINT = '/trucks';

export async function getTrucks(): Promise<Truck[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createTruck(truck: Pick<Truck, 'name'>): Promise<Truck> {
  const res = await api.post(ENDPOINT, { truck });
  return res.data;
}

export async function updateTruck(id: number, data: Partial<Truck>): Promise<Truck> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { truck: data });
  return res.data;
}
