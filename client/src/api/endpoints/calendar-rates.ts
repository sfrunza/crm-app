import { api } from '@/lib/axios';
import type { CalendarRate, CalendarRateMap } from '@/types/index';

const ENDPOINT = '/calendar_rates';

export async function getCalendarRates(): Promise<CalendarRateMap> {
  const res = await api.get(ENDPOINT);
  return res.data
}

export async function createCalendarRate(data: Partial<CalendarRate>): Promise<CalendarRate> {
  const res = await api.post(ENDPOINT, { calendar_rate: data });
  return res.data
}

export async function updateCalendarRate(id: number, data: Partial<CalendarRate>): Promise<CalendarRate> {
  const res = await api.patch(`${ENDPOINT}/${id}`, { calendar_rate: data });
  return res.data
}
