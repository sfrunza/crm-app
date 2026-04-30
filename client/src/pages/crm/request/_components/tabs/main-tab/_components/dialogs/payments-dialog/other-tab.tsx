import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePayment } from "@/domains/payments/payment.mutations";
import { paymentKeys } from "@/domains/payments/payment.keys";
import { requestKeys } from "@/domains/requests/request.keys";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseCents } from "./utils";
import { AmountField } from "./amount-field";
import type { PaymentType } from "@/domains/payments/payment.types";

export function OtherTab({
  requestId,
  paymentType,
  defaultAmount,
  onSuccess,
}: {
  requestId: number;
  paymentType: PaymentType;
  defaultAmount: number;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(
    defaultAmount > 0 ? (defaultAmount / 100).toString() : "",
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDeposit = paymentType === "deposit";

  const createPayment = useCreatePayment({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.forRequest(requestId),
      });
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      });
      if (isDeposit) {
        queryClient.invalidateQueries({
          queryKey: requestKeys.bookingStats(),
        });
      }
      onSuccess();
    },
    onError: (err) => setError(err.message || "Failed to record payment"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cents = parseCents(amount);
    if (cents === null) {
      setError("Please enter a valid amount");
      return;
    }

    createPayment.mutate({
      requestId,
      params: {
        amount: cents,
        payment_type: "other",
        notes: notes || undefined,
        description: notes || "Other payment",
        is_deposit: isDeposit || undefined,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <AmountField amount={amount} setAmount={setAmount} />

        <Field>
          <FieldLabel htmlFor="other-notes">Notes (optional)</FieldLabel>
          <Textarea
            id="other-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe this payment"
            rows={2}
          />
        </Field>
      </FieldGroup>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={createPayment.isPending}
        className="w-full"
      >
        {createPayment.isPending ? "Saving..." : "Record Payment"}
      </Button>
    </form>
  );
}
