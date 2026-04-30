import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  getAdminInvoices,
  getInvoiceStatusCounts,
  getInvoices,
  getPaymentMethods,
  getPayments,
  getPublicInvoice,
  getStripeConfig,
} from "./payment.api";
import { paymentKeys } from "./payment.keys";
import type {
  AdminInvoiceListParams,
  Invoice,
  InvoiceListResponse,
  InvoiceStatusCounts,
  InvoiceStatusCountsParams,
  Payment,
  PublicInvoiceResponse,
  SavedPaymentMethod,
  StripeConfigResponse,
} from "./payment.types";

export function useGetPayments(
  requestId: number,
  queryOptions?: Omit<
    UseQueryOptions<Payment[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: paymentKeys.forRequest(requestId),
    queryFn: () => getPayments(requestId),
    ...queryOptions,
  });
}

export function useGetInvoices(
  requestId: number,
  queryOptions?: Omit<
    UseQueryOptions<Invoice[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: paymentKeys.invoicesForRequest(requestId),
    queryFn: () => getInvoices(requestId),
    ...queryOptions,
  });
}

export function useGetAdminInvoices(
  params: AdminInvoiceListParams,
  queryOptions?: Omit<
    UseQueryOptions<InvoiceListResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: paymentKeys.adminInvoiceList(params as Record<string, unknown>),
    queryFn: () => getAdminInvoices(params),
    ...queryOptions,
  });
}

export function useGetInvoiceStatusCounts(
  params: InvoiceStatusCountsParams,
  queryOptions?: Omit<
    UseQueryOptions<InvoiceStatusCounts, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: paymentKeys.invoiceStatusCounts(params),
    queryFn: () => getInvoiceStatusCounts(params),
    ...queryOptions,
  });
}

export function useGetPublicInvoice(
  token: string | undefined,
  queryOptions?: Omit<
    UseQueryOptions<PublicInvoiceResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: paymentKeys.publicInvoice(token ?? ""),
    queryFn: () => getPublicInvoice(token!),
    enabled: !!token,
    ...queryOptions,
  });
}

export function useGetPaymentMethods(
  userId: number,
  queryOptions?: Omit<
    UseQueryOptions<SavedPaymentMethod[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: paymentKeys.paymentMethodsForUser(userId),
    queryFn: () => getPaymentMethods(userId),
    ...queryOptions,
  });
}

export function useGetStripeConfig(
  queryOptions?: Omit<
    UseQueryOptions<StripeConfigResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: paymentKeys.stripeConfig,
    queryFn: getStripeConfig,
    staleTime: Infinity,
    ...queryOptions,
  });
}
