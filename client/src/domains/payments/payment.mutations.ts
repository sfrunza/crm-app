import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  confirmPayment,
  createInvoice,
  createPayment,
  createSetupIntent,
  deletePaymentMethod,
  refundPayment,
  voidInvoice,
} from "./payment.api";
import type {
  CreateInvoiceParams,
  CreatePaymentParams,
  CreatePaymentResponse,
  Invoice,
  Payment,
  SetupIntentResponse,
} from "./payment.types";

export function useCreatePayment(
  mutationOptions?: Omit<
    UseMutationOptions<
      CreatePaymentResponse,
      Error,
      { requestId: number; params: CreatePaymentParams }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ requestId, params }) => createPayment(requestId, params),
    ...mutationOptions,
  });
}

export function useConfirmPayment(
  mutationOptions?: Omit<
    UseMutationOptions<
      Payment,
      Error,
      { requestId: number; paymentId: number }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ requestId, paymentId }) =>
      confirmPayment(requestId, paymentId),
    ...mutationOptions,
  });
}

export function useRefundPayment(
  mutationOptions?: Omit<
    UseMutationOptions<
      Payment,
      Error,
      { requestId: number; paymentId: number; amount?: number }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ requestId, paymentId, amount }) =>
      refundPayment(requestId, paymentId, amount),
    ...mutationOptions,
  });
}

export function useCreateInvoice(
  mutationOptions?: Omit<
    UseMutationOptions<
      Invoice,
      Error,
      { requestId: number; params: CreateInvoiceParams }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ requestId, params }) => createInvoice(requestId, params),
    ...mutationOptions,
  });
}

export function useVoidInvoice(
  mutationOptions?: Omit<
    UseMutationOptions<
      Invoice,
      Error,
      { requestId: number; invoiceId: number }
    >,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ requestId, invoiceId }) =>
      voidInvoice(requestId, invoiceId),
    ...mutationOptions,
  });
}

export function useCreateSetupIntent(
  mutationOptions?: Omit<
    UseMutationOptions<SetupIntentResponse, Error, { userId?: number }>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ userId }) => createSetupIntent(userId),
    ...mutationOptions,
  });
}

export function useDeletePaymentMethod(
  mutationOptions?: Omit<
    UseMutationOptions<void, Error, { id: number }>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: ({ id }) => deletePaymentMethod(id),
    ...mutationOptions,
  });
}
