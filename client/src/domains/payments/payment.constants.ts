import type { PaymentStatus } from "./payment.types"

export type PaymentTabValue = PaymentStatus | "all"

export const PAYMENT_TAB_OPTIONS: { value: PaymentTabValue; label: string }[] =
  [
    { value: "all", label: "All Payments" },
    { value: "pending", label: "Pending" },
    { value: "succeeded", label: "Succeeded" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "abandoned", label: "Abandoned" },
  ]

export const PAYMENT_STATUS_BG_COLOR: Record<PaymentTabValue, string> = {
  all: "bg-neutral-900",
  pending: "bg-amber-500",
  succeeded: "bg-green-500",
  failed: "bg-rose-500",
  refunded: "bg-violet-500",
  abandoned: "bg-slate-500",
}

export const PAYMENT_STATUS_TEXT_COLOR: Record<PaymentTabValue, string> = {
  all: "text-neutral-900 dark:text-neutral-50",
  pending: "text-amber-600 dark:text-amber-400",
  succeeded: "text-green-600 dark:text-green-400",
  failed: "text-rose-600 dark:text-rose-400",
  refunded: "text-violet-600 dark:text-violet-400",
  abandoned: "text-slate-600 dark:text-slate-400",
}
