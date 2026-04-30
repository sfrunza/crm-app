import type { InvoiceStatus } from "./payment.types";

export type InvoiceTabValue = InvoiceStatus | "all";

export const INVOICE_TAB_OPTIONS: { value: InvoiceTabValue; label: string }[] = [
  { value: "all", label: "All Invoices" },
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
];

export const INVOICE_STATUS_BG_COLOR: Record<InvoiceTabValue, string> = {
  all: "bg-neutral-900",
  draft: "bg-neutral-500",
  open: "bg-sky-500",
  paid: "bg-green-500",
  void: "bg-rose-500",
};

export const INVOICE_STATUS_BG_SOFT_COLOR: Record<InvoiceTabValue, string> = {
  all: "bg-neutral-900/12 dark:bg-neutral-50/12",
  draft: "bg-neutral-500/12 dark:bg-neutral-50/12",
  open: "bg-sky-500/12 dark:bg-sky-400/12",
  paid: "bg-green-500/12 dark:bg-green-400/12",
  void: "bg-rose-500/12 dark:bg-rose-400/12",
};

export const INVOICE_STATUS_TEXT_COLOR: Record<InvoiceTabValue, string> = {
  all: "text-neutral-900 dark:text-neutral-50",
  draft: "text-neutral-500 dark:text-neutral-50",
  open: "text-sky-500 dark:text-sky-400",
  paid: "text-green-500 dark:text-green-400",
  void: "text-rose-500 dark:text-rose-400",
};

