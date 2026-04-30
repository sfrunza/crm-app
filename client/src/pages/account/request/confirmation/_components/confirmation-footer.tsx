import { formatCentsToDollarsString } from "@/lib/helpers";
import { formatDate } from "@/lib/format-date";
import type { Request, Status } from "@/domains/requests/request.types";
import { DepositPaymentDialog } from "./deposit-payment-dialog";
import { PolicySheet } from "./policy-sheet";
import {
  CANCELLATION_POLICY_ITEMS,
  TERMS_AND_CONDITIONS_TEXT,
} from "../_content/confirmation-content";

const ALLOWED_STATUSES: Status[] = ["not_confirmed"];

interface ConfirmationFooterProps {
  request: Request;
}

function CancellationPolicySheet() {
  return (
    <PolicySheet title="Cancellation Policy" trigger="Cancellation Policy">
      <ol className="list-inside list-decimal space-y-2">
        {CANCELLATION_POLICY_ITEMS.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    </PolicySheet>
  );
}

function TermsAndConditionsSheet() {
  return (
    <PolicySheet title="Terms & Conditions" trigger="Terms & Conditions">
      <p>{TERMS_AND_CONDITIONS_TEXT}</p>
    </PolicySheet>
  );
}

export function ConfirmationFooter({ request }: ConfirmationFooterProps) {
  const showSignature =
    request.customer_signature_url &&
    request.signed_at &&
    request.is_deposit_accepted;

  const isDepositAccepted = request.is_deposit_accepted;

  return (
    <div className="space-y-4 p-6">
      {/* Deposit section */}
      <div className="grid grid-cols-[auto_max-content] items-center gap-2">
        <div>
          <p>Reservation deposit</p>
          <p className="text-muted-foreground text-sm">
            Reservation will be deducted from the move cost
          </p>
        </div>
        <p className="text-3xl font-black">
          {isDepositAccepted
            ? "Accepted"
            : formatCentsToDollarsString(request.deposit)}
        </p>
      </div>

      {/* Policy links */}
      <div>
        <div className="space-x-1 text-sm">
          <span>By confirming, you agree to our</span>
          <CancellationPolicySheet />
          <span>
            and <TermsAndConditionsSheet />
          </span>
        </div>
      </div>

      {/* Signature display */}
      {showSignature && (
        <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg border p-4">
          <img
            src={request.customer_signature_url ?? ""}
            alt="Customer signature"
            className="max-h-24 w-auto object-contain"
          />
          <p className="text-muted-foreground text-sm">
            {`${request.customer?.first_name} ${request.customer?.last_name}`}
          </p>
          <p className="text-muted-foreground text-sm">
            {formatDate(request.signed_at, "PPPpp")}
          </p>
        </div>
      )}

      {/* Deposit payment CTA */}
      {!showSignature && (
        <div>
          <DepositPaymentDialog
            disabled={!ALLOWED_STATUSES.includes(request.status)}
            requestId={request.id}
            deposit={request.deposit}
            signatureUrl={request.customer_signature_url}
          />
        </div>
      )}
    </div>
  );
}
