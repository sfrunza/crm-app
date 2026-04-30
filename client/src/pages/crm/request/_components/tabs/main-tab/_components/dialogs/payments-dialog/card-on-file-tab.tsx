import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  useConfirmPayment,
  useCreatePayment,
} from "@/domains/payments/payment.mutations";
import { paymentKeys } from "@/domains/payments/payment.keys";
import { requestKeys } from "@/domains/requests/request.keys";
import type {
  PaymentType,
  SavedPaymentMethod,
} from "@/domains/payments/payment.types";
import { CreditCardIcon } from "@/components/icons";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseCents } from "./utils";
import { AmountField } from "./amount-field";
import { LoadingSwap } from "@/components/ui/loading-swap";

export function CardOnFileTab({
  requestId,
  savedCards,
  paymentType,
  defaultAmount,
  onSuccess,
}: {
  requestId: number;
  savedCards: SavedPaymentMethod[];
  paymentType: PaymentType;
  defaultAmount: number;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(
    defaultAmount > 0 ? (defaultAmount / 100).toString() : "",
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmPaymentMutation = useConfirmPayment();

  const isDeposit = paymentType === "deposit";

  const createPayment = useCreatePayment({
    onSuccess: async (data) => {
      if (data.payment.status !== "succeeded") {
        try {
          await confirmPaymentMutation.mutateAsync({
            requestId,
            paymentId: data.payment.id,
          });
        } catch {
          // Webhook will handle it as fallback
        }
      }

      await queryClient.invalidateQueries({
        queryKey: paymentKeys.forRequest(requestId),
      });
      await queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      });
      if (isDeposit) {
        await queryClient.invalidateQueries({
          queryKey: requestKeys.bookingStats(),
        });
      }
      onSuccess();
    },
    onError: (err) => {
      setError(err.message || "Payment failed");
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);

    const cents = parseCents(amount);
    if (cents === null) {
      setError("Please enter a valid amount");
      return;
    }
    if (!selectedCardId) {
      setError("Please select a card");
      return;
    }

    createPayment.mutate({
      requestId,
      params: {
        amount: cents,
        payment_type: isDeposit ? "deposit" : "charge",
        payment_method_id: selectedCardId,
        is_deposit: isDeposit || undefined,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <AmountField amount={amount} setAmount={setAmount} />

        <Field>
          <FieldLabel>Select Card</FieldLabel>
          {savedCards.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No saved cards. The customer needs to pay with a card first.
            </p>
          ) : (
            <div className="space-y-1">
              {savedCards.map((card) => (
                <label
                  key={card.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                    selectedCardId === card.stripe_payment_method_id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="card"
                    className="accent-primary"
                    value={card.stripe_payment_method_id}
                    checked={selectedCardId === card.stripe_payment_method_id}
                    onChange={() =>
                      setSelectedCardId(card.stripe_payment_method_id)
                    }
                  />
                  <CreditCardIcon className="text-muted-foreground size-4" />
                  <span className="capitalize">{card.card_brand}</span>
                  <span>**** {card.card_last_four}</span>
                  <span className="text-muted-foreground ml-auto text-xs">
                    Exp {card.card_exp_month}/{card.card_exp_year}
                  </span>
                </label>
              ))}
            </div>
          )}
        </Field>
      </FieldGroup>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={createPayment.isPending || savedCards.length === 0}
        className="w-full"
      >
        <LoadingSwap isLoading={createPayment.isPending}>
          {isDeposit ? "Charge deposit" : "Charge card"}
        </LoadingSwap>
      </Button>
    </form>
  );
}
