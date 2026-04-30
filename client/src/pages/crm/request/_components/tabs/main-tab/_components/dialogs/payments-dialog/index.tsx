import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useGetInvoices,
  useGetPaymentMethods,
  useGetPayments,
} from "@/domains/payments/payment.queries";
import { useRequest } from "@/hooks/use-request";
import { ChevronLeftIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { AddInvoiceForm } from "./add-invoice-form";
import { PaymentsListView } from "./payments-list-view";
import { TabbedPaymentForm } from "./tabbed-payment-form";

type SubView = "list" | "add-payment" | "add-invoice" | "add-reservation";

export function PaymentsDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [subView, setSubView] = useState<SubView>("list");
  const { draft } = useRequest();

  const requestId = draft?.id;
  const customerId = draft?.customer_id;

  const { data: payments = [] } = useGetPayments(requestId!, {
    enabled: !!requestId && isOpen,
  });
  const { data: invoices = [] } = useGetInvoices(requestId!, {
    enabled: !!requestId && isOpen,
  });
  const { data: savedCards = [] } = useGetPaymentMethods(customerId!, {
    enabled: !!customerId && isOpen,
  });

  useEffect(() => {
    const editParam = searchParams.get("edit_payments");
    if (editParam) {
      setIsOpen(true);
    }
  }, [searchParams]);

  function handleClose() {
    setSubView("list");
    setIsOpen(false);
    setSearchParams();
  }

  if (!requestId) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="w-full! px-0 data-[size=default]:max-w-[96vw] sm:min-w-2xl">
        <AlertDialogHeader className="px-6">
          <AlertDialogTitle>
            {subView === "list" && "Payments & Invoices"}
            {subView === "add-payment" && "Add Payment"}
            {subView === "add-invoice" && "Send Invoice"}
            {subView === "add-reservation" && "Add Reservation"}
          </AlertDialogTitle>
          <AlertDialogDescription className="hidden" />
        </AlertDialogHeader>

        <ScrollArea className="max-h-[calc(100vh-14rem)]">
          {subView === "list" && (
            <PaymentsListView
              requestId={requestId}
              payments={payments}
              invoices={invoices}
              savedCards={savedCards}
              onAddPayment={() => setSubView("add-payment")}
              onAddInvoice={() => setSubView("add-invoice")}
              onAddReservation={() => setSubView("add-reservation")}
            />
          )}

          {subView === "add-payment" && (
            <TabbedPaymentForm
              requestId={requestId}
              paymentType="charge"
              savedCards={savedCards}
              onSuccess={() => setSubView("list")}
            />
          )}

          {subView === "add-invoice" && (
            <AddInvoiceForm
              requestId={requestId}
              draft={draft}
              onSuccess={() => setSubView("list")}
            />
          )}

          {subView === "add-reservation" && (
            <TabbedPaymentForm
              requestId={requestId}
              savedCards={savedCards}
              paymentType="deposit"
              defaultAmount={draft?.deposit ?? 0}
              onSuccess={() => setSubView("list")}
            />
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <AlertDialogFooter className="px-6">
          {subView !== "list" ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setSubView("list")}
            >
              <ChevronLeftIcon />
              Back
            </Button>
          ) : (
            <AlertDialogCancel asChild>
              <Button variant="outline" type="button">
                Close
              </Button>
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
