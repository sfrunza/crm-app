import { api } from '@/lib/axios';
import type { MoveSize } from '@/types/index';

const ENDPOINT = '/move_sizes';

export async function getMoveSizes(): Promise<MoveSize[]> {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createMoveSize(moveSize: Partial<MoveSize> & { image?: File | null }): Promise<MoveSize> {
  const formData = new FormData();
  const moveSizeData: Record<string, any> = { ...moveSize };

  if (moveSize.image) {
    formData.append("move_size[image]", moveSize.image);
    delete moveSizeData.image;
  }

  Object.keys(moveSizeData).forEach((key) => {
    const value = moveSizeData[key];
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(`move_size[${key}]`, JSON.stringify(value));
      } else {
        formData.append(`move_size[${key}]`, String(value));
      }
    }
  });

  const res = await api.post(ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function updateMoveSize(id: number, moveSize: Partial<MoveSize> & { image?: File | null; remove_image?: boolean }): Promise<MoveSize> {
  const formData = new FormData();
  const moveSizeData: Record<string, any> = { ...moveSize };

  if (moveSize.image) {
    formData.append("move_size[image]", moveSize.image);
    delete moveSizeData.image;
  }

  Object.keys(moveSizeData).forEach((key) => {
    const value = moveSizeData[key];
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(`move_size[${key}]`, JSON.stringify(value));
      } else {
        formData.append(`move_size[${key}]`, String(value));
      }
    }
  });

  const res = await api.patch(`${ENDPOINT}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function deleteMoveSize(id: number): Promise<void> {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}
