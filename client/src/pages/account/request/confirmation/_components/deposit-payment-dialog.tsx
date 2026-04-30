import { PaymentCardForm } from "@/components/request/payment-card-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { requestKeys } from "@/domains/requests/request.keys";
import { useAttachSignature } from "@/domains/requests/request.mutations";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/icons";
import { Fragment, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { SignaturePad, type SignaturePadHandle } from "./signature-pad";

const DEPOSIT_STEPS = [
  { id: "signature" as const, label: "Signature" },
  { id: "payment" as const, label: "Payment" },
] as const;

type DepositStepId = (typeof DEPOSIT_STEPS)[number]["id"];

function DepositDialogStepper({
  steps,
  currentStepId,
}: {
  steps: readonly { id: string; label: string }[];
  currentStepId: string;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <Fragment key={step.id}>
            <div className="flex shrink-0 items-center gap-2">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isCompleted && "bg-muted text-muted-foreground",
                  isCurrent && "bg-primary text-primary-foreground",
                  isUpcoming && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <CheckIcon className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-foreground",
                  (isCompleted || isUpcoming) && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px min-w-[24px] flex-1",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

interface DepositPaymentDialogProps {
  disabled: boolean;
  requestId: number;
  deposit: number;
  signatureUrl: string | null;
}

export function DepositPaymentDialog({
  disabled,
  requestId,
  deposit,
  signatureUrl,
}: DepositPaymentDialogProps) {
  const navigate = useNavigate();
  const signaturePadRef = useRef<SignaturePadHandle>(null);
  const [step, setStep] = useState<DepositStepId>("signature");
  const [hasSignature, setHasSignature] = useState(signatureUrl != null);

  const invalidateRequest = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: requestKeys.detail(requestId),
    });
  }, [requestId]);

  const attachSignatureMutation = useAttachSignature({
    onSuccess: () => {
      invalidateRequest();
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="h-14 w-full text-base font-semibold"
          size="lg"
          disabled={disabled}
        >
          Confirm and Pay Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Reservation</DialogTitle>
          <DialogDescription>
            Sign to confirm your move plan, then pay the deposit.
          </DialogDescription>
        </DialogHeader>

        <DepositDialogStepper steps={DEPOSIT_STEPS} currentStepId={step} />

        <div className="bg-muted/30 min-h-[320px] rounded-lg border p-4">
          {step === "signature" && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Please sign to confirm your move plan and proceed to pay the
                deposit.
              </p>
              <SignaturePad
                ref={signaturePadRef}
                onSignatureChange={(isEmpty) => setHasSignature(!isEmpty)}
              />
            </div>
          )}
          {step === "payment" && (
            <div className="space-y-4">
              <PaymentCardForm
                requestId={requestId}
                amount={deposit}
                paymentType="deposit"
                saveCard={true}
                onSuccess={() => {
                  invalidateRequest();
                  navigate(`/account/requests/${requestId}/reservation`);
                }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "signature" && (
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="button"
                disabled={!hasSignature || attachSignatureMutation.isPending}
                onClick={async () => {
                  const dataUrl =
                    signaturePadRef.current?.getDataURL("image/png");
                  if (!dataUrl || signaturePadRef.current?.isEmpty()) return;

                  try {
                    await attachSignatureMutation.mutateAsync({
                      requestId,
                      signatureDataUrl: dataUrl,
                    });
                    setStep("payment");
                  } catch {
                    // Error is handled by mutation
                  }
                }}
              >
                <LoadingSwap isLoading={attachSignatureMutation.isPending}>
                  Continue to payment
                </LoadingSwap>
              </Button>
            </>
          )}
          {step === "payment" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("signature")}
            >
              Back
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
