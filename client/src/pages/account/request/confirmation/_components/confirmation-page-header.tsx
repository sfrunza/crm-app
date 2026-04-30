import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, PrinterIcon } from "@/components/icons";
import { useNavigate } from "react-router";

interface ConfirmationPageHeaderProps {
  requestId: number;
  onPrint: () => void;
}

export function ConfirmationPageHeader({
  requestId,
  onPrint,
}: ConfirmationPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex w-full items-center justify-between">
      <Button
        onClick={() => navigate(`/account/requests/${requestId}`)}
        variant="ghost"
        aria-label="Back to request"
      >
        <ChevronLeftIcon />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Confirmation Page</h1>
      <Button onClick={onPrint} variant="ghost" aria-label="Print confirmation">
        <PrinterIcon />
        Print
      </Button>
    </div>
  );
}
