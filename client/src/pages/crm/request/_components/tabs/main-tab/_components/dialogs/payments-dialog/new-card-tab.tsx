import { PaymentCardForm } from "@/components/request/payment-card-form";
import { FieldGroup } from "@/components/ui/field";
import type { PaymentType } from "@/domains/payments/payment.types";
import { useState } from "react";
import { AmountField } from "./amount-field";

// const stripeElementStyle = {
//   base: {
//     fontSize: "14px",
//     color: "#09090b",
//     fontFamily: "inherit",
//     "::placeholder": { color: "#a1a1aa" },
//   },
//   invalid: { color: "#ef4444" },
// };

// ─── New Card Tab ────────────────────────────────────────────────

export function NewCardTab({
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
  const [amount, setAmount] = useState(defaultAmount.toString());
  return (
    <div className="space-y-4">
      <FieldGroup>
        <AmountField
          amount={(Number(amount) / 100).toString()}
          setAmount={(value) => {
            setAmount((Number(value) * 100).toString());
          }}
        />
      </FieldGroup>
      <PaymentCardForm
        requestId={requestId}
        amount={Number(amount)}
        saveCard={paymentType === "deposit"}
        paymentType={paymentType}
        onSuccess={onSuccess}
      />
    </div>
  );
}

// ─── Card Fields Form (inside Elements) ──────────────────────────

// export function CardFieldsForm({
//   requestId,
//   amount,
//   paymentType,
//   invoiceId,
//   onSuccess,
// }: {
//   requestId: number;
//   amount: number;
//   paymentType: PaymentType;
//   invoiceId?: number;
//   onSuccess: () => void;
// }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const queryClient = useQueryClient();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [zip, setZip] = useState("");
//   const [cardComplete, setCardComplete] = useState({
//     number: false,
//     expiry: false,
//     cvc: false,
//   });

//   const createPayment = useCreatePayment();

//   const confirmPaymentMutation = useConfirmPayment();

//   const isComplete =
//     cardComplete.number &&
//     cardComplete.expiry &&
//     cardComplete.cvc &&
//     zip.length >= 3;

//   const isDeposit = paymentType === "deposit";

//   const handleSubmit = useCallback(
//     async (e: React.SubmitEvent) => {
//       e.preventDefault();
//       if (!stripe || !elements) return;

//       const cardNumber = elements.getElement(CardNumberElement);
//       if (!cardNumber) return;

//       setIsProcessing(true);
//       setError(null);

//       try {
//         // 1. Create PaymentIntent
//         const res = await createPayment.mutateAsync({
//           requestId,
//           params: {
//             amount: Number(amount),
//             payment_type: paymentType,
//             save_card: true,
//             is_deposit: isDeposit || undefined,
//             invoice_id: invoiceId,
//           },
//         });

//         const clientSecret = res.client_secret;
//         const paymentId = res.payment.id;

//         if (!clientSecret) throw new Error("Missing client secret");

//         // 2. Confirm payment with Stripe
//         const { error: stripeError } = await stripe.confirmCardPayment(
//           clientSecret,
//           {
//             payment_method: {
//               card: cardNumber,
//               billing_details: {
//                 address: { postal_code: zip },
//               },
//             },
//           },
//         );

//         if (stripeError) {
//           throw new Error(stripeError.message || "Payment failed");
//         }

//         // 3. Sync backend immediately (webhook still fallback)
//         try {
//           await confirmPaymentMutation.mutateAsync({ requestId, paymentId });
//         } catch {
//           // webhook handles final state if this fails
//         }

//         // 4. Refresh UI
//         await Promise.all([
//           queryClient.invalidateQueries({
//             queryKey: paymentKeys.forRequest(requestId),
//           }),
//           queryClient.invalidateQueries({
//             queryKey: requestKeys.detail(requestId),
//           }),
//           isDeposit
//             ? queryClient.invalidateQueries({
//                 queryKey: requestKeys.bookingStats(),
//               })
//             : Promise.resolve(),
//         ]);

//         onSuccess();
//       } catch (err: any) {
//         setError(err.message ?? "Payment failed");
//       } finally {
//         setIsProcessing(false);
//       }
//     },
//     [
//       stripe,
//       elements,
//       zip,
//       requestId,
//       amount,
//       paymentType,
//       queryClient,
//       onSuccess,
//       confirmPaymentMutation,
//       createPayment,
//     ],
//   );

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="bg-muted rounded-md px-3 py-2 text-sm">
//         Charging{" "}
//         <span className="font-semibold">
//           {formatCentsToDollarsString(amount ?? 0)}
//         </span>
//       </div>

//       <FieldGroup>
//         <Field>
//           <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
//           <div className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 file:text-foreground placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-[3px] md:text-sm">
//             <CardNumberElement
//               id="card-number"
//               options={{
//                 showIcon: true,
//                 disableLink: true,
//               }}
//               onChange={(e) =>
//                 setCardComplete((p) => ({ ...p, number: e.complete }))
//               }
//             />
//           </div>
//         </Field>

//         <div className="grid grid-cols-3 gap-3">
//           <Field>
//             <FieldLabel>Expiration</FieldLabel>
//             <div className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 file:text-foreground placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-[3px] md:text-sm">
//               <CardExpiryElement
//                 onChange={(e) =>
//                   setCardComplete((p) => ({ ...p, expiry: e.complete }))
//                 }
//               />
//             </div>
//           </Field>

//           <Field>
//             <FieldLabel htmlFor="cvc">CVC</FieldLabel>
//             <div className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 file:text-foreground placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-[3px] md:text-sm">
//               <CardCvcElement
//                 id="cvc"
//                 onChange={(e) =>
//                   setCardComplete((p) => ({ ...p, cvc: e.complete }))
//                 }
//               />
//             </div>
//           </Field>

//           <Field>
//             <FieldLabel htmlFor="zip">ZIP Code</FieldLabel>
//             <Input
//               name="zip"
//               id="zip"
//               value={zip}
//               onChange={(e) => setZip(e.target.value)}
//               placeholder="12345"
//               maxLength={5}
//             />
//           </Field>
//         </div>
//       </FieldGroup>

//       {error && <p className="text-destructive text-sm">{error}</p>}

//       <div className="bg-muted/30 mt-6 rounded-md border px-4 py-3">
//         <div className="flex items-center justify-center">
//           <img
//             src="/images/powered-by-stripe.png"
//             alt="Stripe"
//             className="h-24 w-auto"
//           />
//         </div>
//       </div>
//       <Button
//         type="submit"
//         disabled={!stripe || !isComplete || isProcessing}
//         className="w-full"
//       >
//         {isProcessing ? "Processing..." : isDeposit ? "Pay Deposit" : "Pay Now"}
//       </Button>
//     </form>
//   );
// }
