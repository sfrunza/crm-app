export type PaymentType = "deposit" | "charge" | "invoice_payment" | "cash" | "check" | "other";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type InvoiceStatus = "draft" | "open" | "paid" | "void";

export type InvoiceStatusFilter = InvoiceStatus | "all";

/** Row shape from GET /api/v1/invoices (InvoiceIndexSerializer) */
export type InvoiceListRow = {
  id: number;
  username: string;
  status: InvoiceStatus;
  amount: number;
  request_id: number;
  date: string;
};

export type InvoiceListResponse = {
  invoices: InvoiceListRow[];
  pagination: {
    total_pages: number;
    current_page: number;
    total_count: number;
  };
  /** Sum of `amount` (cents) for all invoices matching current filters (not paginated). */
  total_amount: number;
};

export type InvoiceSortField =
  | "id"
  | "amount"
  | "status"
  | "request_id"
  | "date"
  | "username";

export type AdminInvoiceListParams = {
  page?: number;
  per_page?: number;
  status?: InvoiceStatus;
  start_date?: string;
  end_date?: string;
  sort_by?: InvoiceSortField;
  sort_order?: "asc" | "desc";
};

/** GET /invoices/status_counts — keys match Invoice enum + all */
export type InvoiceStatusCounts = {
  all: number;
  draft: number;
  open: number;
  paid: number;
  void: number;
};

export type InvoiceStatusCountsParams = {
  start_date?: string;
  end_date?: string;
};

export type Payment = {
  id: number;
  request_id: number;
  user_id: number;
  payment_type: PaymentType;
  amount: number;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  card_brand: string | null;
  card_last_four: string | null;
  description: string | null;
  refunded_amount: number;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  position: number;
};

export type Invoice = {
  id: number;
  request_id: number;
  user_id: number;
  invoice_number: string | null;
  email: string | null;
  client_name: string | null;
  client_address: string | null;
  amount: number;
  subtotal: number;
  processing_fee_percent: number;
  processing_fee_amount: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  description: string | null;
  notes: string | null;
  paid_at: string | null;
  sent_at: string | null;
  public_url: string | null;
  invoice_items: InvoiceItem[];
  created_at: string;
  updated_at: string;
};

export type SavedPaymentMethod = {
  id: number;
  user_id: number;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last_four: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  created_at: string;
};

export type CreatePaymentParams = {
  amount: number;
  payment_type: "deposit" | "charge" | "cash" | "check" | "other" | "invoice_payment";
  payment_method_id?: string;
  description?: string;
  save_card?: boolean;
  check_number?: string;
  notes?: string;
  is_deposit?: boolean;
  invoice_id?: number;
};

export type CreatePaymentResponse = {
  payment: Payment;
  client_secret: string;
};

export type CreateInvoiceItemParams = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type CreateInvoiceParams = {
  email: string;
  client_name: string;
  client_address?: string;
  description?: string;
  notes?: string;
  due_date?: string;
  processing_fee_percent?: number;
  processing_fee_amount?: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_percent?: number;
  tax_amount?: number;
  items: CreateInvoiceItemParams[];
};

export type SetupIntentResponse = {
  client_secret: string;
};

export type StripeConfigResponse = {
  publishable_key: string;
};

export type PublicInvoiceResponse = {
  invoice: Invoice;
  company: { name: string; address: string; phone: string; email: string };
};
