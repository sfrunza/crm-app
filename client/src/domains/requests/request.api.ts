import { api } from "@/lib/axios";
import type { StatusFilter } from "@/stores/use-table-requests-store";
import type {
  Request,
  RequestUpdatePayload,
  SearchResponseData,
  TableRequestParams,
  TableRequestResponse,
} from "./request.types";

const API_URL = '/requests';

export async function getRequests(params?: TableRequestParams): Promise<TableRequestResponse> {
  const queryParams = params ? {
    page: params.page,
    status_filter: params.statusFilter,
    date_filter: params.dateFilter,
    sort_by: params.sortBy,
    sort_order: params.sortOrder,
    filter: params.filter,
    per_page: params.per_page,
  } : {};

  const res = await api.get(API_URL, {
    params: queryParams,
  });
  return res.data;
}

export async function getRequestById(id: number): Promise<Request> {
  const response = await api.get<Request>(`${API_URL}/${id}`);
  return response.data;
};

export async function createRequest(data: Partial<Request>): Promise<Request> {
  const response = await api.post(API_URL, { request: data });
  return response.data;
};

export async function updateRequest(id: number, data: RequestUpdatePayload): Promise<Request> {
  const rest = { ...data };
  delete rest.move_size;
  const response = await api.patch(`${API_URL}/${id}`, { request: rest });
  return response.data;
};

export async function cloneRequest(id: number): Promise<Request> {
  const response = await api.post(`${API_URL}/${id}/clone`);
  return response.data;
};

export async function deleteRequest(id: number): Promise<void> {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

export async function getStatusCounts(): Promise<Record<StatusFilter, number>> {
  const response = await api.get(`${API_URL}/status_counts`);
  return response.data;
}

export interface BookingStats {
  booked_this_month: number;
  booked_last_month: number;
}

export async function getBookingStats(): Promise<BookingStats> {
  const response = await api.get<BookingStats>(`${API_URL}/booking_stats`);
  return response.data;
}

export async function pairRequests(requestId: number, pairedRequestId: number): Promise<Request> {
  const response = await api.post(`${API_URL}/${requestId}/pair`, {
    paired_request_id: pairedRequestId,
  });
  return response.data;
};

export async function unpairRequests(requestId: number, pairedRequestId: number): Promise<Request> {
  const response = await api.post(`${API_URL}/${requestId}/unpair`, {
    request_id: requestId,
    paired_request_id: pairedRequestId,
  });
  return response.data;
};

export async function searchRequests(query: string): Promise<SearchResponseData[]> {
  const response = await api.get('/search', {
    params: { query: encodeURIComponent(query) },
  });
  return response.data;
}

export async function attachSignature(requestId: number, signatureDataUrl: string): Promise<Request> {
  const response = await api.post(`${API_URL}/${requestId}/attach_signature`, {
    signature: signatureDataUrl,
  });
  return response.data;
}

export type CalculateRequestParams = Partial<Request> & {
  save?: boolean;
};

export async function calculateRequest(
  requestId: number,
  params: CalculateRequestParams = {}
): Promise<Request> {
  const response = await api.post<Request>(`${API_URL}/${requestId}/calculate`, params);
  return response.data;
}

export type CalculateRoutesParams = {
  save?: boolean;
  origin?: Request['origin'];
  destination?: Request['destination'];
  stops?: Request['stops'];
};

export async function calculateRoutes(
  requestId: number,
  params: CalculateRoutesParams = {}
): Promise<Request> {
  const response = await api.post<Request>(`${API_URL}/${requestId}/calculate_routes`, params);
  return response.data;
}
