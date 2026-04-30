import { RequestDetails } from "@/components/request/request-details";
import { Card, CardContent } from "@/components/ui/card";
import type { Request } from "@/domains/requests/request.types";
import { DISCLAIMER_PARAGRAPHS } from "../_content/confirmation-content";

interface ConfirmationPrintContentProps {
  request: Request;
  companyLogoUrl: string;
}

export function ConfirmationPrintContent({
  request,
  companyLogoUrl,
}: ConfirmationPrintContentProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Header: status + logo */}
        <div className="mb-8 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase">Confirmation</h1>
            <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              {request.service?.name}
            </p>
          </div>
          <div className="flex h-auto w-36 justify-center">
            {companyLogoUrl && (
              <img
                src={companyLogoUrl}
                alt="Company Logo"
                className="size-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Request details */}
        <RequestDetails request={request} />

        {/* Pricing disclaimer */}
        <div className="space-y-2">
          {DISCLAIMER_PARAGRAPHS.map((paragraph, index) => (
            <p key={index}>
              {typeof paragraph === "string" ? (
                paragraph
              ) : (
                <>
                  <b>{paragraph.boldPrefix}</b> {paragraph.text}
                </>
              )}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
