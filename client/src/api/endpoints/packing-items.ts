import { api } from '@/lib/axios';
import type { PackingItem } from '@/types/index';

const ENDPOINT = '/packing_items';

export async function getPackingItems(): Promise<PackingItem[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createPackingItem(packingItem: Partial<PackingItem>): Promise<PackingItem> {
  const res = await api.post(ENDPOINT, { packing_item: packingItem });
  return res.data;
}

export async function updatePackingItem(id: number, data: Partial<PackingItem>): Promise<PackingItem> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { packing_item: data });
  return res.data;
}

export async function deletePackingItem(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
