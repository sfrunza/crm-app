import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  PaymentType,
  SavedPaymentMethod,
} from "@/domains/payments/payment.types";
import {
  WalletIcon,
  CreditCardIcon,
  BanknoteIcon,
  ReceiptIcon,
  CircleEllipsisIcon,
} from "@/components/icons";
import { CardOnFileTab } from "./card-on-file-tab";
import { NewCardTab } from "./new-card-tab";
import { CashTab } from "./cash-tab";
import { CheckTab } from "./check-tab";
import { OtherTab } from "./other-tab";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function TabbedPaymentForm({
  requestId,
  savedCards,
  paymentType = "deposit",
  defaultAmount = 0,
  onSuccess,
}: {
  requestId: number;
  savedCards: SavedPaymentMethod[];
  paymentType: PaymentType;
  defaultAmount?: number;
  onSuccess: () => void;
}) {
  return (
    <Tabs defaultValue="card_on_file" className="px-6">
      <ScrollArea>
        <div className="relative h-10 w-full">
          <TabsList className="absolute flex w-auto">
            <TabsTrigger value="card_on_file">
              <WalletIcon className="size-3" />
              Card on File
            </TabsTrigger>
            <TabsTrigger value="card">
              <CreditCardIcon className="size-3" />
              Card
            </TabsTrigger>
            <TabsTrigger value="cash">
              <BanknoteIcon className="size-3" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="check">
              <ReceiptIcon className="size-3" />
              Check
            </TabsTrigger>
            <TabsTrigger value="other">
              <CircleEllipsisIcon className="size-3" />
              Other
            </TabsTrigger>
          </TabsList>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="card_on_file" className="pt-4">
        <CardOnFileTab
          requestId={requestId}
          savedCards={savedCards}
          paymentType={paymentType}
          defaultAmount={defaultAmount}
          onSuccess={onSuccess}
        />
      </TabsContent>

      <TabsContent value="card" className="pt-4">
        <NewCardTab
          requestId={requestId}
          paymentType={paymentType}
          defaultAmount={defaultAmount}
          onSuccess={onSuccess}
        />
      </TabsContent>

      <TabsContent value="cash" className="pt-4">
        <CashTab
          requestId={requestId}
          paymentType="cash"
          defaultAmount={defaultAmount}
          onSuccess={onSuccess}
        />
      </TabsContent>

      <TabsContent value="check" className="pt-4">
        <CheckTab
          requestId={requestId}
          paymentType="check"
          defaultAmount={defaultAmount}
          onSuccess={onSuccess}
        />
      </TabsContent>

      <TabsContent value="other" className="pt-4">
        <OtherTab
          requestId={requestId}
          paymentType="other"
          defaultAmount={defaultAmount}
          onSuccess={onSuccess}
        />
      </TabsContent>
    </Tabs>
  );
}
