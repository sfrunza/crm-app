import { AmountInput } from "@/components/inputs/amount-input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { useRefundPayment } from "@/domains/payments/payment.mutations"
import { paymentKeys } from "@/domains/payments/payment.keys"
import { requestKeys } from "@/domains/requests/request.keys"
import type {
  Invoice,
  Payment,
  SavedPaymentMethod,
} from "@/domains/payments/payment.types"
import { formatCentsToDollarsString } from "@/lib/helpers"
import {
  CreditCardIcon,
  FileTextIcon,
  BanknoteIcon,
  WalletIcon,
  RotateCcwIcon,
} from "@/components/icons"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { paymentStatusVariant, paymentTypeLabel, parseCents } from "./utils"
import { formatDate } from "@/lib/format-date"

// ─── Payments List View ──────────────────────────────────────────

export function PaymentsListView({
  requestId,
  payments,
  invoices,
  savedCards,
  onAddPayment,
  onAddInvoice,
  onAddReservation,
}: {
  requestId: number
  payments: Payment[]
  invoices: Invoice[]
  savedCards: SavedPaymentMethod[]
  onAddPayment: () => void
  onAddInvoice: () => void
  onAddReservation: () => void
}) {
  return (
    <div className="space-y-4 px-6">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onAddInvoice}
        >
          <FileTextIcon className="mr-1 size-3" />
          Send Invoice
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onAddPayment}
        >
          <BanknoteIcon className="mr-1 size-3" />
          Add Payment
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onAddReservation}
        >
          <WalletIcon className="mr-1 size-3" />
          Add Reservation
        </Button>
      </div>

      {/* Payments accordion */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Payments</h4>
        {payments.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            No payments recorded yet.
          </p>
        ) : (
          <Accordion type="single" collapsible className="space-y-1">
            {payments.map((p) => (
              <AccordionItem
                key={p.id}
                value={`payment-${p.id}`}
                className="rounded-md border px-3 not-last:border-b"
              >
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex flex-1 items-center justify-between pr-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={paymentStatusVariant(p.status)}>
                        {p.status}
                      </Badge>
                      <span className="text-muted-foreground">
                        {paymentTypeLabel(p.payment_type)}
                      </span>
                      {p.card_brand && p.card_last_four && (
                        <span className="text-xs text-muted-foreground">
                          {p.card_brand} •••• {p.card_last_four}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {formatCentsToDollarsString(p.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(p.created_at)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="h-auto">
                  <PaymentDetails payment={p} requestId={requestId} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Invoices list */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Invoices</h4>
        {invoices.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            No invoices sent yet.
          </p>
        ) : (
          <div className="space-y-1">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={paymentStatusVariant(inv.status)}>
                    {inv.status}
                  </Badge>
                  <span className="text-xs font-medium">
                    {inv.invoice_number || `#${inv.id}`}
                  </span>
                  <span className="max-w-[200px] truncate text-muted-foreground">
                    {inv.client_name || inv.description || "Invoice"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {formatCentsToDollarsString(inv.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Due {formatDate(inv.due_date)}
                  </span>
                  {inv.public_url && (
                    <a
                      href={inv.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline"
                    >
                      Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cards on file */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Cards on File</h4>
        {savedCards.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">No cards saved.</p>
        ) : (
          <div className="space-y-1">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="size-4 text-muted-foreground" />
                  <span className="capitalize">{card.card_brand}</span>
                  <span>**** {card.card_last_four}</span>
                  {card.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Exp {card.card_exp_month}/{card.card_exp_year}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Payment Details (accordion content) ─────────────────────────

function PaymentDetails({
  payment,
  requestId,
}: {
  payment: Payment
  requestId: number
}) {
  const isStripePayment = !!payment.stripe_payment_intent_id
  const refundable = payment.amount - payment.refunded_amount
  const canRefund =
    isStripePayment &&
    (payment.status === "succeeded" ||
      (payment.status === "refunded" && refundable > 0))

  return (
    <div className="space-y-3 pt-1 pb-1">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-md bg-muted/50 px-3 py-2.5 text-sm">
        <div>
          <span className="text-xs text-muted-foreground">Type</span>
          <p className="font-medium">
            {paymentTypeLabel(payment.payment_type)}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Status</span>
          <p>
            <Badge variant={paymentStatusVariant(payment.status)}>
              {payment.status}
            </Badge>
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Amount</span>
          <p className="font-medium">
            {formatCentsToDollarsString(payment.amount)}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Date</span>
          <p>{formatDate(payment.created_at, "PPp")}</p>
        </div>

        {payment.card_brand && payment.card_last_four && (
          <div>
            <span className="text-xs text-muted-foreground">Card</span>
            <p className="capitalize">
              {payment.card_brand} •••• {payment.card_last_four}
            </p>
          </div>
        )}

        {payment.description && (
          <div>
            <span className="text-xs text-muted-foreground">Description</span>
            <p>{payment.description}</p>
          </div>
        )}

        {payment.metadata?.check_number && (
          <div>
            <span className="text-xs text-muted-foreground">Check #</span>
            <p>{payment.metadata.check_number}</p>
          </div>
        )}

        {payment.metadata?.notes && (
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground">Notes</span>
            <p>{payment.metadata.notes}</p>
          </div>
        )}

        {payment.refunded_amount > 0 && (
          <div>
            <span className="text-xs text-muted-foreground">Refunded</span>
            <p className="font-medium text-destructive">
              -{formatCentsToDollarsString(payment.refunded_amount)}
            </p>
          </div>
        )}

        {isStripePayment && (
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground">Stripe ID</span>
            <p className="font-mono text-xs">
              {payment.stripe_payment_intent_id}
            </p>
          </div>
        )}
      </div>

      {canRefund && (
        <RefundForm
          requestId={requestId}
          payment={payment}
          maxRefundable={refundable}
        />
      )}
    </div>
  )
}

// ─── Refund Form ─────────────────────────────────────────────────

function RefundForm({
  requestId,
  payment,
  maxRefundable,
}: {
  requestId: number
  payment: Payment
  maxRefundable: number
}) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [refundAmount, setRefundAmount] = useState(
    (maxRefundable / 100).toString()
  )
  const [error, setError] = useState<string | null>(null)

  const refundMutation = useRefundPayment({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.forRequest(requestId),
      })
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      })
      setShowForm(false)
      setError(null)
    },
    onError: (err) => setError(err.message || "Refund failed"),
  })

  if (!showForm) {
    return (
      <Button
        variant="outline"
        type="button"
        onClick={() => setShowForm(true)}
        className="text-destructive hover:text-destructive"
      >
        <RotateCcwIcon className="mr-1 size-3" />
        Refund
      </Button>
    )
  }

  function handleRefund(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const cents = parseCents(refundAmount)
    if (cents === null) {
      setError("Please enter a valid amount")
      return
    }
    if (cents > maxRefundable) {
      setError(
        `Maximum refundable is ${formatCentsToDollarsString(maxRefundable)}`
      )
      return
    }

    refundMutation.mutate({
      requestId,
      paymentId: payment.id,
      amount: cents,
    })
  }

  return (
    <form onSubmit={handleRefund} className="space-y-2">
      <div className="flex items-end gap-2">
        <Field className="flex-1">
          <FieldLabel className="text-xs">
            Refund Amount (max {formatCentsToDollarsString(maxRefundable)})
          </FieldLabel>
          <AmountInput
            value={refundAmount}
            onChange={(value) => setRefundAmount(value)}
          />
        </Field>
        <Button
          type="submit"
          variant="destructive"
          disabled={refundMutation.isPending}
        >
          {refundMutation.isPending ? "Refunding..." : "Confirm Refund"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowForm(false)
            setError(null)
          }}
        >
          Cancel
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
