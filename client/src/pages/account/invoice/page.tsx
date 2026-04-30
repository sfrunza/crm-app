import { PrinterIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPublicInvoice } from "@/domains/payments/payment.queries";
import type { InvoiceItem } from "@/domains/payments/payment.types";
import { formatDate } from "@/lib/format-date";
import { formatPhone } from "@/lib/format-phone";
import { formatCentsToDollarsString } from "@/lib/helpers";
import { useRef } from "react";
import { useParams } from "react-router";
import { useReactToPrint } from "react-to-print";
import { InvoicePaymentDialog } from "./invoice-payment-dialog";
import type { InvoiceStatus } from "@/types/index";
import {
  INVOICE_STATUS_BG_COLOR,
  INVOICE_STATUS_TEXT_COLOR,
} from "@/domains/payments/invoice.constants";
import { cn } from "@/lib/utils";
import { Confetti } from "../request/reservation/_components/confetti";

// ─── Page wrapper ────────────────────────────────────────────────

function InvoicePage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError, error } = useGetPublicInvoice(token);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Invoice",
  });

  const invoice = data?.invoice ?? null;
  const company = data?.company ?? null;
  const loading = isLoading;
  const errorMessage = isError ? error?.message || "Invoice not found" : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner />
      </div>
    );
  }

  if (errorMessage || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-lg font-medium">Invoice Not Found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {errorMessage || "This invoice does not exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      {invoice.status === "paid" && <Confetti />}
      {/* Invoice Card */}
      <Card ref={printRef}>
        <CardHeader>
          <CardTitle>Invoice #{invoice.invoice_number}</CardTitle>
          <CardDescription>Due {formatDate(invoice.due_date)}</CardDescription>
          <CardAction>
            <InvoiceStatusBadge status={invoice.status} />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Bill To */}
          <div>
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Bill To
            </p>
            <p className="mt-1 font-medium">{invoice.client_name}</p>
            {invoice.client_address && (
              <p className="text-sm whitespace-pre-line text-muted-foreground">
                {invoice.client_address}
              </p>
            )}
          </div>
          <Separator />

          {/* Description */}
          {invoice.description && (
            <div>
              <p className="text-sm">{invoice.description}</p>
            </div>
          )}

          {/* Line Items */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.invoice_items?.map((item: InvoiceItem) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCentsToDollarsString(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentsToDollarsString(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right">
                  Subtotal
                </TableCell>
                <TableCell className="text-right">
                  {formatCentsToDollarsString(invoice.subtotal)}
                </TableCell>
              </TableRow>
              {invoice.processing_fee_amount > 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-right">
                    Processing Fee
                    {invoice.processing_fee_percent > 0 &&
                      ` (${invoice.processing_fee_percent}%)`}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentsToDollarsString(invoice.processing_fee_amount)}
                  </TableCell>
                </TableRow>
              )}
              {invoice.discount_amount > 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-right">
                    Discount
                    {invoice.discount_percent > 0 &&
                      ` (${invoice.discount_percent}%)`}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">
                      -{formatCentsToDollarsString(invoice.discount_amount)}
                    </span>
                  </TableCell>
                </TableRow>
              )}
              {invoice.tax_amount > 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-right">
                    Tax
                    {invoice.tax_percent > 0 && ` (${invoice.tax_percent}%)`}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentsToDollarsString(invoice.tax_amount)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCentsToDollarsString(invoice.amount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          {invoice.status === "open" && token && (
            <InvoicePaymentDialog
              disabled={false}
              requestId={invoice.request_id}
              amount={invoice.amount}
              invoiceId={invoice.id}
              invoiceToken={token}
            />
          )}

          {invoice.status === "paid" && (
            <Button
              variant="outline"
              className="print:hidden"
              onClick={handlePrint}
            >
              <PrinterIcon /> Print Invoice
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Footer */}
      {company && (
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            {company.name} &bull; {formatPhone(company.phone)} &bull;{" "}
            {company.email}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge
      className={cn(
        "h-8 px-3 text-base font-black",
        "relative overflow-hidden bg-transparent capitalize",
        INVOICE_STATUS_TEXT_COLOR[status]
      )}
    >
      <span
        className={`${INVOICE_STATUS_BG_COLOR[status]} absolute inset-0 opacity-15`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export const Component = InvoicePage;
