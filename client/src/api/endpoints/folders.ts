import { api } from '@/lib/axios';
import type { Folder } from '@/types/index';

const ENDPOINT = '/folders';

export async function getFolders(): Promise<Folder[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createFolder(folder: Pick<Folder, 'name'>): Promise<Folder> {
  const res = await api.post(ENDPOINT, { folder });
  return res.data;
}

export async function updateFolder(id: number, data: Partial<Folder>): Promise<Folder> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { folder: data });
  return res.data;
}

export async function deleteFolder(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}