import { api } from '@/lib/axios'
import type { RequestLogsPage } from "./request-log.types";

export async function getRequestLogs(
  requestId: number,
  page: number = 1,
): Promise<RequestLogsPage> {
  const res = await api.get(`/requests/${requestId}/request_logs`, {
    params: { page, per_page: 25 },
  });
  return res.data;
}
