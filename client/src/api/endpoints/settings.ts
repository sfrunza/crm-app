import { api } from '@/lib/axios';
import type { CompanySetting } from '@/types/index';

const ENDPOINT = '/settings';


export async function getSettings(): Promise<CompanySetting> {
  const res = await api.get<CompanySetting>(ENDPOINT);
  return res.data;
}

export async function updateSettings(data: Partial<CompanySetting> & { company_logo?: File | null }): Promise<CompanySetting> {
  const formData = new FormData();
  const settingsData: Record<string, any> = { ...data };

  const appendValue = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    // Rails supports nested params with bracket notation in multipart/form-data
    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
        appendValue(`${key}[${childKey}]`, childValue);
      });
      return;
    }

    formData.append(key, String(value));
  };

  if (data.company_logo) {
    formData.append("setting[company_logo]", data.company_logo);
    delete settingsData.company_logo;
  }

  Object.keys(settingsData).forEach((key) => {
    appendValue(`setting[${key}]`, settingsData[key]);
  });

  const res = await api.patch(ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}
