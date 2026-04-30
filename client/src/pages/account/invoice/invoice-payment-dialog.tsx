import { PaymentCardForm } from "@/components/request/payment-card-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { paymentKeys } from "@/domains/payments/payment.keys";
import { queryClient } from "@/lib/query-client";
import { useState } from "react";

interface InvoicePaymentDialogProps {
  disabled: boolean;
  requestId: number;
  invoiceId: number;
  invoiceToken: string;
  amount: number;
}

export function InvoicePaymentDialog({
  disabled,
  requestId,
  invoiceId,
  invoiceToken,
  amount,
}: InvoicePaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: paymentKeys.publicInvoice(invoiceToken),
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-14 w-full text-base font-semibold"
          size="lg"
          disabled={disabled}
        >
          Pay Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
        </DialogHeader>
        <div className="bg-muted/30 min-h-[320px] rounded-lg border p-4">
          <div className="space-y-4">
            {requestId != null && (
              <PaymentCardForm
                requestId={requestId}
                amount={amount}
                paymentType="invoice_payment"
                invoiceId={invoiceId}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
