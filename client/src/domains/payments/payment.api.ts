import { api } from '@/lib/axios'
import type {
  AdminInvoiceListParams,
  CreateInvoiceParams,
  CreatePaymentParams,
  CreatePaymentResponse,
  Invoice,
  InvoiceListResponse,
  InvoiceStatusCounts,
  InvoiceStatusCountsParams,
  Payment,
  SavedPaymentMethod,
  SetupIntentResponse,
  StripeConfigResponse,
} from "./payment.types";

// ─── Payments ──────────────────────────────────────────────────────

export async function getPayments(requestId: number): Promise<Payment[]> {
  const res = await api.get(`/requests/${requestId}/payments`);
  return res.data;
}

export async function createPayment(
  requestId: number,
  params: CreatePaymentParams
): Promise<CreatePaymentResponse> {
  const res = await api.post(`/requests/${requestId}/payments`, {
    payment: params,
  });
  return res.data;
}

export async function confirmPayment(
  requestId: number,
  paymentId: number
): Promise<Payment> {
  const res = await api.post(
    `/requests/${requestId}/payments/${paymentId}/confirm`
  );
  return res.data;
}

export async function refundPayment(
  requestId: number,
  paymentId: number,
  amount?: number
): Promise<Payment> {
  const res = await api.post(
    `/requests/${requestId}/payments/${paymentId}/refund`,
    amount ? { amount } : {}
  );
  return res.data;
}

// ─── Invoices ──────────────────────────────────────────────────────

export async function getInvoices(requestId: number): Promise<Invoice[]> {
  const res = await api.get(`/requests/${requestId}/invoices`);
  return res.data;
}

export async function getAdminInvoices(
  params: AdminInvoiceListParams,
): Promise<InvoiceListResponse> {
  const query: Record<string, string | number> = {};
  if (params.page != null) query.page = params.page;
  if (params.per_page != null) query.per_page = params.per_page;
  if (params.status) query.status = params.status;
  if (params.start_date) query.start_date = params.start_date;
  if (params.end_date) query.end_date = params.end_date;
  if (params.sort_by) query.sort_by = params.sort_by;
  if (params.sort_order) query.sort_order = params.sort_order;

  const res = await api.get<InvoiceListResponse>("/invoices", { params: query });
  return res.data;
}

export async function getInvoiceStatusCounts(
  params?: InvoiceStatusCountsParams,
): Promise<InvoiceStatusCounts> {
  const query: Record<string, string> = {};
  if (params?.start_date) query.start_date = params.start_date;
  if (params?.end_date) query.end_date = params.end_date;
  const res = await api.get<InvoiceStatusCounts>("/invoices/status_counts", {
    params: query,
  });
  return res.data;
}

export async function createInvoice(
  requestId: number,
  params: CreateInvoiceParams
): Promise<Invoice> {
  const res = await api.post(`/requests/${requestId}/invoices`, {
    invoice: params,
  });
  return res.data;
}

export async function voidInvoice(
  requestId: number,
  invoiceId: number
): Promise<Invoice> {
  const res = await api.post(
    `/requests/${requestId}/invoices/${invoiceId}/void`
  );
  return res.data;
}

// ─── Payment Methods ───────────────────────────────────────────────

export async function getPaymentMethods(
  userId?: number
): Promise<SavedPaymentMethod[]> {
  const res = await api.get("/payment_methods", {
    params: userId ? { user_id: userId } : {},
  });
  return res.data;
}

export async function createSetupIntent(
  userId?: number
): Promise<SetupIntentResponse> {
  const res = await api.post("/payment_methods", {
    ...(userId ? { user_id: userId } : {}),
  });
  return res.data;
}

export async function deletePaymentMethod(id: number): Promise<void> {
  await api.delete(`/payment_methods/${id}`);
}

// ─── Public Invoice ─────────────────────────────────────────────

export async function getPublicInvoice(token: string): Promise<{
  invoice: Invoice;
  company: { name: string; address: string; phone: string; email: string };
}> {
  const res = await api.get(`/invoices/${token}`);
  return res.data;
}

export async function payPublicInvoice(token: string): Promise<{
  client_secret: string;
  payment_id: number;
}> {
  const res = await api.post(`/invoices/${token}/pay`);
  return res.data;
}

// ─── Config ────────────────────────────────────────────────────────

export async function getStripeConfig(): Promise<StripeConfigResponse> {
  const res = await api.get("/config/stripe");
  return res.data;
}
