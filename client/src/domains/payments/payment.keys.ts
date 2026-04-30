export const paymentKeys = {
  all: ["payments"] as const,

  forRequest: (requestId: number) =>
    [...paymentKeys.all, "request", requestId] as const,

  invoices: ["invoices"] as const,

  invoicesForRequest: (requestId: number) =>
    [...paymentKeys.invoices, "request", requestId] as const,

  adminInvoiceList: (params: Record<string, unknown>) =>
    [...paymentKeys.invoices, "admin", params] as const,

  invoiceStatusCounts: (params: { start_date?: string; end_date?: string }) =>
    [
      ...paymentKeys.invoices,
      "statusCounts",
      params.start_date ?? "",
      params.end_date ?? "",
    ] as const,

  publicInvoice: (token: string) =>
    [...paymentKeys.invoices, "public", token] as const,

  paymentMethods: ["paymentMethods"] as const,

  paymentMethodsForUser: (userId: number) =>
    [...paymentKeys.paymentMethods, "user", userId] as const,

  stripeConfig: ["stripeConfig"] as const,
};
