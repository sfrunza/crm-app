// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useCreatePayment } from "@/domains/payments/payment.mutations";
// import { useGetStripeConfig } from "@/domains/payments/payment.queries";
// import { paymentKeys } from "@/domains/payments/payment.keys";
// import { requestKeys } from "@/domains/requests/request.keys";
// import { formatCentsToDollarsString } from "@/lib/helpers";
// import { getStripe } from "@/lib/stripe";
// import {
//   Elements,
//   PaymentElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import type { Stripe } from "@stripe/stripe-js";
// import { useQueryClient } from "@tanstack/react-query";
// import {
//   CheckCircle2Icon,
//   CreditCardIcon,
//   ShieldCheckIcon,
// } from "@/components/icons";
// import { useCallback, useEffect, useState } from "react";

// // ─── Deposit Payment Card (outer wrapper) ──────────────────────────

// export function DepositPaymentCard({
//   requestId,
//   depositAmount,
//   isDepositAccepted,
// }: {
//   requestId: number;
//   depositAmount: number;
//   isDepositAccepted: boolean;
// }) {
//   const { data: stripeConfig } = useGetStripeConfig();
//   const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);

//   useEffect(() => {
//     if (stripeConfig?.publishable_key) {
//       getStripe(stripeConfig.publishable_key).then(setStripeInstance);
//     }
//   }, [stripeConfig?.publishable_key]);

//   // Already paid
//   if (isDepositAccepted) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CheckCircle2Icon className="size-5 text-green-600" />
//             Deposit Paid
//           </CardTitle>
//           <CardDescription>
//             Your reservation deposit of{" "}
//             {formatCentsToDollarsString(depositAmount)} has been received.
//           </CardDescription>
//         </CardHeader>
//       </Card>
//     );
//   }

//   // No deposit required
//   if (depositAmount <= 0) return null;

//   // Stripe not loaded yet
//   if (!stripeInstance) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CreditCardIcon className="size-5" />
//             Pay Deposit
//           </CardTitle>
//           <CardDescription>Loading payment form...</CardDescription>
//         </CardHeader>
//       </Card>
//     );
//   }

//   return (
//     <DepositPaymentFormWrapper
//       stripeInstance={stripeInstance}
//       requestId={requestId}
//       depositAmount={depositAmount}
//     />
//   );
// }

// // ─── Wrapper that creates PaymentIntent then renders form ──────────

// function DepositPaymentFormWrapper({
//   stripeInstance,
//   requestId,
//   depositAmount,
// }: {
//   stripeInstance: Stripe;
//   requestId: number;
//   depositAmount: number;
// }) {
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const createPayment = useCreatePayment({
//     onSuccess: (data) => {
//       setClientSecret(data.client_secret);
//     },
//     onError: (err) => {
//       setError(err.message || "Failed to initialize payment");
//     },
//   });

//   useEffect(() => {
//     createPayment.mutate({
//       requestId,
//       params: {
//         amount: depositAmount,
//         payment_type: "deposit",
//         description: "Reservation deposit",
//         save_card: true,
//       },
//     });
//     // Only run once on mount
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CreditCardIcon className="size-5" />
//             Pay Deposit
//           </CardTitle>
//           <CardDescription className="text-destructive">
//             {error}
//           </CardDescription>
//         </CardHeader>
//       </Card>
//     );
//   }

//   if (!clientSecret) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CreditCardIcon className="size-5" />
//             Pay Deposit
//           </CardTitle>
//           <CardDescription>Preparing secure payment...</CardDescription>
//         </CardHeader>
//       </Card>
//     );
//   }

//   return (
//     <Elements
//       stripe={stripeInstance}
//       options={{
//         clientSecret,
//         appearance: {
//           theme: "stripe",
//           variables: {
//             borderRadius: "8px",
//           },
//         },
//       }}
//     >
//       <DepositPaymentForm requestId={requestId} depositAmount={depositAmount} />
//     </Elements>
//   );
// }

// // ─── Inner form with Stripe Elements ───────────────────────────────

// function DepositPaymentForm({
//   requestId,
//   depositAmount,
// }: {
//   requestId: number;
//   depositAmount: number;
// }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const queryClient = useQueryClient();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState<
//     "idle" | "processing" | "succeeded" | "failed"
//   >("idle");
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();

//       if (!stripe || !elements) return;

//       setIsProcessing(true);
//       setPaymentStatus("processing");
//       setErrorMessage(null);

//       const { error } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: window.location.origin + `/account/requests/${requestId}`,
//         },
//         redirect: "if_required",
//       });

//       if (error) {
//         setErrorMessage(error.message ?? "Payment failed");
//         setPaymentStatus("failed");
//         setIsProcessing(false);
//       } else {
//         setPaymentStatus("succeeded");
//         setIsProcessing(false);
//         // Invalidate queries to refresh data
//         queryClient.invalidateQueries({
//           queryKey: paymentKeys.forRequest(requestId),
//         });
//         queryClient.invalidateQueries({
//           queryKey: requestKeys.detail(requestId),
//         });
//       }
//     },
//     [stripe, elements, requestId, queryClient],
//   );

//   if (paymentStatus === "succeeded") {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-green-600">
//             <CheckCircle2Icon className="size-5" />
//             Payment Successful
//           </CardTitle>
//           <CardDescription>
//             Your deposit of {formatCentsToDollarsString(depositAmount)} has been
//             received. Your reservation is confirmed!
//           </CardDescription>
//         </CardHeader>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <CreditCardIcon className="size-5" />
//           Pay Deposit
//         </CardTitle>
//         <CardDescription>
//           Pay {formatCentsToDollarsString(depositAmount)} to confirm your
//           reservation. Your card will be saved for future payments.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <PaymentElement
//             options={{
//               layout: "tabs",
//             }}
//           />

//           {errorMessage && (
//             <p className="text-destructive text-sm">{errorMessage}</p>
//           )}

//           <Button
//             type="submit"
//             disabled={!stripe || isProcessing}
//             className="w-full"
//             size="lg"
//           >
//             {isProcessing
//               ? "Processing..."
//               : `Pay ${formatCentsToDollarsString(depositAmount)}`}
//           </Button>

//           <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
//             <ShieldCheckIcon className="size-3.5" />
//             Secured by Stripe. Your payment info is encrypted.
//           </p>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }
